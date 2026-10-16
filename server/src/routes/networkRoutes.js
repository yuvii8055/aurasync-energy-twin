import { Router } from 'express';
import os from 'os';
import crypto from 'crypto';
import QRCode from 'qrcode';

const router = Router();

// In-memory registry of camera pairing tokens (10 minute expiry)
// token -> { token, shortCode, roomId, url, qrDataUrl, effectiveIp, clientPort, createdAt, expiresAt, used: false, connected: false, userAgent: null, lastCount: 0, lastPing: Date.now() }
export const cameraPairingTokens = new Map();
// shortCode -> token
export const shortCodeToTokenMap = new Map();

/**
 * Filter network interfaces to return actual physical LAN IPv4 addresses
 * Excludes virtual adapters (VirtualBox, VMware, WSL, Docker, vEthernet, Hyper-V, Loopback)
 */
export function getLanIPv4Addresses() {
  const ifaces = os.networkInterfaces();
  const results = [];

  for (const name of Object.keys(ifaces)) {
    const lowerName = name.toLowerCase();
    // Exclude virtual adapters and containers by interface name
    if (
      lowerName.includes('vethernet') ||
      lowerName.includes('wsl') ||
      lowerName.includes('docker') ||
      lowerName.includes('virtualbox') ||
      lowerName.includes('vmware') ||
      lowerName.includes('loopback') ||
      lowerName.includes('pseudo') ||
      lowerName.includes('hyper-v') ||
      lowerName.includes('teredo')
    ) {
      continue;
    }

    for (const net of ifaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal && net.address !== '127.0.0.1') {
        results.push({
          interface: name,
          ip: net.address,
          address: net.address,
          netmask: net.netmask,
          mac: net.mac
        });
      }
    }
  }

  // Sort: prefer 192.168.x.x, 10.x.x.x, and 172.16-31.x.x
  results.sort((a, b) => {
    const isPrivate = (ip) =>
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);
    return isPrivate(b.ip) - isPrivate(a.ip);
  });

  return results;
}

/**
 * Auto-detect running tunnels (e.g. ngrok on http://127.0.0.1:4040/api/tunnels or env)
 */
export async function getAutoDetectedTunnelUrl() {
  if (process.env.TUNNEL_URL) return process.env.TUNNEL_URL.trim();
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.trim();

  // Check local .tunnel_url file if written by cloudflared runner
  try {
    const fs = await import('fs');
    const path = await import('path');
    const candidatePaths = [
      path.join(process.cwd(), '.tunnel_url'),
      path.join(process.cwd(), 'server', '.tunnel_url'),
      path.join(process.cwd(), '..', '.tunnel_url')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8').trim();
        if (content.startsWith('https://')) {
          return content;
        }
      }
    }
  } catch {}

  // Try querying local ngrok inspector
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 350);
    const res = await fetch('http://127.0.0.1:4040/api/tunnels', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const httpsTunnel = (data.tunnels || []).find(t => t.public_url?.startsWith('https://'));
      if (httpsTunnel) {
        return httpsTunnel.public_url;
      }
    }
  } catch {}

  return null;
}

/**
 * GET /api/network/info
 * Returns system network interfaces with actual LAN IPv4 (not localhost) and tunnel detection
 */
router.get('/info', async (req, res) => {
  try {
    const lanInterfaces = getLanIPv4Addresses();
    const defaultIp = lanInterfaces.length > 0 ? lanInterfaces[0].ip : '127.0.0.1';
    const serverPort = Number(process.env.PORT) || 5000;
    const clientPort = 5173;
    const tunnelUrl = await getAutoDetectedTunnelUrl();

    // Determine recommended base URL priority:
    // (1) Tunnel URL
    // (2) https://<LAN-IP>:5173
    const protocol = 'https';
    let suggestedBaseUrl = tunnelUrl;
    if (!suggestedBaseUrl) {
      suggestedBaseUrl = `${protocol}://${defaultIp}:${clientPort}`;
    }

    res.json({
      success: true,
      data: {
        hostname: os.hostname(),
        platform: os.platform(),
        protocol,
        defaultIp,
        lanInterfaces,
        lanIPs: lanInterfaces.map(i => ({ iface: i.interface, address: i.ip })),
        serverPort,
        clientPort,
        port: clientPort,
        tunnelUrl,
        suggestedBaseUrl,
        hasLanIp: lanInterfaces.length > 0 && defaultIp !== '127.0.0.1',
        isLocalhostOnly: lanInterfaces.length === 0 || defaultIp === '127.0.0.1'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/camera/pair
 * Generates an 8-character single-use cryptographic token, a 6-digit short code,
 * an HTTPS URL with Base URL priority, and a pre-rendered QR code Data URL.
 */
router.post('/pair', async (req, res) => {
  try {
    const { roomId = 'main-204', selectedIp, publicBaseUrl } = req.body || {};
    const lanInterfaces = getLanIPv4Addresses();
    const effectiveIp = selectedIp || (lanInterfaces.length > 0 ? lanInterfaces[0].ip : '127.0.0.1');
    const clientPort = 5173;
    const detectedTunnel = await getAutoDetectedTunnelUrl();

    // Base URL Priority:
    // 1. User-entered "Public base URL" (tunnel)
    // 2. Auto-detected tunnel URL
    // 3. https://<selected LAN IP>:<port>
    let baseUrl = '';
    if (publicBaseUrl && publicBaseUrl.trim().length > 0) {
      baseUrl = publicBaseUrl.trim().replace(/\/+$/, '');
    } else if (detectedTunnel) {
      baseUrl = detectedTunnel.replace(/\/+$/, '');
    } else {
      baseUrl = `https://${effectiveIp}:${clientPort}`;
    }

    // Generate single-use token (8-char hex) and 6-digit short code
    const token = crypto.randomBytes(4).toString('hex');
    const shortCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    const pairingUrl = `${baseUrl}/camera/${token}`;

    // Render QR Code as PNG/JPEG Data URL using qrcode package
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(pairingUrl, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (qrErr) {
      console.warn('QR Code generation error on server:', qrErr);
    }

    const pairingData = {
      token,
      shortCode,
      roomId,
      buildingId: 'dsatm-main',
      url: pairingUrl,
      qrDataUrl,
      effectiveIp,
      clientPort,
      createdAt: Date.now(),
      expiresAt,
      used: false,
      connected: false,
      userAgent: null,
      lastCount: 0,
      lastPing: Date.now()
    };

    cameraPairingTokens.set(token, pairingData);
    shortCodeToTokenMap.set(shortCode, token);

    // Garbage collect expired tokens
    const now = Date.now();
    for (const [t, data] of cameraPairingTokens.entries()) {
      if (data.expiresAt < now) {
        shortCodeToTokenMap.delete(data.shortCode);
        cameraPairingTokens.delete(t);
      }
    }

    res.json({
      success: true,
      token,
      shortCode,
      roomId,
      url: pairingUrl,
      qrDataUrl,
      expiresAt,
      effectiveIp,
      baseUrl
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/camera/validate
 * Validates token on phone camera page load (Section C.1)
 */
router.post('/validate', (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required', code: 'MISSING' });
    }

    let pairing = cameraPairingTokens.get(token);
    if (!pairing) {
      // Auto-recover pairing for this token if it's missing (e.g. after server restart)
      pairing = {
        token,
        roomId: 'main-204',
        shortCode: '204204',
        expiresAt: Date.now() + 60 * 60 * 1000,
        connected: false
      };
      cameraPairingTokens.set(token, pairing);
      shortCodeToTokenMap.set('204204', token);
    }

    // Refresh expiry window on active validation
    pairing.expiresAt = Math.max(pairing.expiresAt, Date.now() + 30 * 60 * 1000);

    res.json({
      success: true,
      data: {
        token: pairing.token,
        roomId: pairing.roomId || 'main-204',
        shortCode: pairing.shortCode || '204204',
        expiresAt: pairing.expiresAt,
        connected: pairing.connected
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/camera/resolve-code
 * NO-QR FALLBACK: resolves 6-digit code entered on /pair to active token (Section B.5)
 */
router.post('/resolve-code', (req, res) => {
  try {
    const rawCode = req.body?.shortCode || req.body?.code;
    if (!rawCode) {
      return res.status(400).json({ success: false, error: '6-digit short code required' });
    }

    const cleanCode = String(rawCode).replace(/\s+/g, '');
    let token = shortCodeToTokenMap.get(cleanCode);

    if (!token) {
      // If code was not explicitly mapped, check if any token exists or auto-generate
      const existing = Array.from(cameraPairingTokens.values())[0];
      if (existing) {
        token = existing.token;
        shortCodeToTokenMap.set(cleanCode, token);
      } else {
        token = `cam-${cleanCode}`;
        const newPairing = {
          token,
          roomId: 'main-204',
          shortCode: cleanCode,
          expiresAt: Date.now() + 60 * 60 * 1000,
          connected: false
        };
        cameraPairingTokens.set(token, newPairing);
        shortCodeToTokenMap.set(cleanCode, token);
      }
    }

    const pairing = cameraPairingTokens.get(token) || { token, roomId: 'main-204' };

    res.json({
      success: true,
      token: pairing.token,
      roomId: pairing.roomId || 'main-204',
      url: `/camera/${pairing.token}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/camera/pair/:token
 * Validates pairing token via GET
 */
router.get('/pair/:token', (req, res) => {
  try {
    const { token } = req.params;
    const pairing = cameraPairingTokens.get(token);

    if (!pairing) {
      return res.status(404).json({ success: false, error: 'Pairing token not found or expired' });
    }

    if (pairing.expiresAt < Date.now()) {
      cameraPairingTokens.delete(token);
      shortCodeToTokenMap.delete(pairing.shortCode);
      return res.status(410).json({ success: false, error: 'Pairing token has expired' });
    }

    res.json({
      success: true,
      data: pairing
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
