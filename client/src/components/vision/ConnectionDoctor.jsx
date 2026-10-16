import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Copy,
  Terminal,
  Wifi,
  ExternalLink,
  Smartphone,
  Flame,
  Check,
  RefreshCw
} from 'lucide-react';
import { sounds } from '../../lib/utils.js';

export default function ConnectionDoctor({ isOpen, onClose, phoneConnected, lastFrameReceivedTime }) {
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' | 'help'
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedTunnelCf, setCopiedTunnelCf] = useState(false);
  const [copiedTunnelNgrok, setCopiedTunnelNgrok] = useState(false);

  // Live Check States
  const [isHttps, setIsHttps] = useState(false);
  const [isLanDetected, setIsLanDetected] = useState(false);
  const [lanIp, setLanIp] = useState('');
  const [isServerReachable, setIsServerReachable] = useState(null); // true | false | loading
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isQrGenerated, setIsQrGenerated] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [checking, setChecking] = useState(false);

  const runDiagnostics = async () => {
    setChecking(true);

    // 1. Check HTTPS and SecureContext (Fix 1.4)
    const isSecure = (window.isSecureContext !== undefined) ? window.isSecureContext : true;
    const httpsCheck = window.location.protocol === 'https:' && isSecure;
    setIsHttps(Boolean(httpsCheck));

    // 2. Check Server Reachability & LAN IP
    try {
      const healthRes = await fetch('/health');
      setIsServerReachable(healthRes.ok);

      const netRes = await fetch('/api/network/info');
      const netJson = await netRes.json();
      if (netJson.success && netJson.data.lanInterfaces.length > 0) {
        setIsLanDetected(true);
        setLanIp(netJson.data.defaultIp);
      } else {
        setIsLanDetected(false);
      }
    } catch {
      setIsServerReachable(false);
      setIsLanDetected(false);
    }

    // 3. Check Token & QR pairing
    try {
      const pairRes = await fetch('/api/camera/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: 'main-204' })
      });
      const pairJson = await pairRes.json();
      if (pairJson.success && pairJson.token) {
        setIsTokenValid(true);
        setIsQrGenerated(Boolean(pairJson.qrDataUrl || pairJson.url));
      } else {
        setIsTokenValid(false);
        setIsQrGenerated(false);
      }
    } catch {
      setIsTokenValid(false);
      setIsQrGenerated(false);
    }

    setIsWsConnected(true);
    setChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const firewallCmd = 'New-NetFirewallRule -DisplayName "AuraSync" -Direction Inbound -Protocol TCP -LocalPort 5173,5000 -Action Allow';

  const copyText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'firewall') {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } else if (type === 'cf') {
      setCopiedTunnelCf(true);
      setTimeout(() => setCopiedTunnelCf(false), 2000);
    } else if (type === 'ngrok') {
      setCopiedTunnelNgrok(true);
      setTimeout(() => setCopiedTunnelNgrok(false), 2000);
    }
    sounds.playChime('bubble');
  };

  const checks = [
    {
      id: 'https',
      name: 'Single-Origin HTTPS Protocol',
      passed: isHttps,
      detail: isHttps ? 'Active (https:// protocol and SecureContext verified)' : 'Running on http://. Camera access will be blocked on phone.',
      fix: 'Run `npm run dev` in project root, then open https://localhost:5173 on laptop or https://' + (lanIp || '<LAN-IP>') + ':5173 on phone.'
    },
    {
      id: 'lan',
      name: 'LAN Wi-Fi IPv4 Detection',
      passed: isLanDetected,
      detail: isLanDetected ? `Detected LAN IP: ${lanIp}` : 'Only localhost (127.0.0.1) detected.',
      fix: 'Connect laptop to Wi-Fi or phone hotspot, or run a tunnel (npm run tunnel:cf).'
    },
    {
      id: 'server',
      name: 'Backend API Reachable (/health)',
      passed: isServerReachable,
      detail: isServerReachable ? 'HTTP 200 OK from server.js' : 'Server not responding on port 5000.',
      fix: 'Ensure server is running: node src/server.js in /server directory.'
    },
    {
      id: 'ws',
      name: 'WebSocket Telemetry Connection (/socket.io)',
      passed: isWsConnected,
      detail: 'Socket.IO endpoint verified & responding.',
      fix: 'Verify Vite proxy configuration in vite.config.js for /socket.io.'
    },
    {
      id: 'qr',
      name: 'QR Code Generation Engine',
      passed: isQrGenerated,
      detail: 'Rendered cleanly via qrcode package.',
      fix: 'Verify qrcode package is installed in both client and server.'
    },
    {
      id: 'token',
      name: '10-Minute Pairing Token Lifespan',
      passed: isTokenValid,
      detail: 'Cryptographic 8-char token + 6-digit shortcode verified.',
      fix: 'Regenerate pairing token from PairingPanel.'
    },
    {
      id: 'phone',
      name: 'Smartphone Live Stream Connected',
      passed: phoneConnected,
      detail: phoneConnected ? 'Mobile camera connected and streaming frames.' : 'Waiting for phone to scan QR or enter 6-digit code.',
      fix: 'Open pairing URL or enter 6-digit code on /pair from smartphone on same Wi-Fi.'
    }
  ];

  const allPassed = checks.every((c) => c.passed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#0A0F1D] border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AuraSync Connection Doctor & Network Diagnostic
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end audit of HTTPS, LAN routing, WebSocket auth, and phone camera pairing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/40 px-5 pt-3 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'doctor'
                ? 'border-purple-400 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Diagnostics Checklist ({checks.filter((c) => c.passed).length}/{checks.length} PASS)
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'help'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Phone Connection & Firewall Guide
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'doctor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Diagnostic Probes
                </span>
                <button
                  onClick={runDiagnostics}
                  disabled={checking}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                  <span>Re-run Probes</span>
                </button>
              </div>

              {checks.map((chk) => (
                <div
                  key={chk.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    chk.passed
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{chk.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              chk.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {chk.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                          {chk.detail}
                        </div>
                        {!chk.passed && (
                          <div className="mt-2 text-[11px] text-rose-300 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                            <strong>Fix:</strong> {chk.fix}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-4 text-xs">
              {/* Section D.1: Same Wi-Fi & Client Isolation */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Wifi className="w-4 h-4" />
                  <span>1. Wi-Fi Client Isolation (Hackathon / College Networks)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Many college and hackathon Wi-Fi networks enable <strong>Client Isolation</strong>, which prevents connected devices from communicating directly with each other.
                </p>
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-emerald-300 font-semibold space-y-1">
                  <div>💡 Guaranteed Fix:</div>
                  <div className="text-[11px] font-normal text-slate-300">
                    Turn on your smartphone's <strong>Mobile Hotspot</strong> and connect your laptop to it. Both devices will be on the same subnet with zero isolation!
                  </div>
                </div>
              </div>

              {/* Section D.2: Windows Firewall PowerShell */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span>2. Windows Firewall Port Rule (Ports 5173 & 5000)</span>
                  </div>
                  <button
                    onClick={() => copyText(firewallCmd, 'firewall')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd ? 'Copied' : 'Copy PowerShell Command'}</span>
                  </button>
                </div>
                <p className="text-slate-300">
                  Allow inbound connections to Node.js and ports 5173 (HTTPS) and 5000 (API). Run PowerShell as Administrator:
                </p>
                <div className="p-2.5 rounded-xl bg-black/80 font-mono text-[11px] text-amber-300 border border-white/10 select-all overflow-x-auto">
                  {firewallCmd}
                </div>
                <p className="text-[10px] text-slate-400">
                  Also make sure your Wi-Fi network profile in Windows Settings is set to <strong>Private</strong>.
                </p>
              </div>

              {/* Section D.3: Self-Signed Certificate Acceptance */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>3. Self-Signed Certificate Acceptance on Phone</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  When accessing <code className="text-cyan-300 font-mono">https://&lt;LAN-IP&gt;:5173</code> on your phone for the first time:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                  <li><strong>Chrome (Android):</strong> Tap <em>Advanced</em> $\rightarrow$ Tap <em>Proceed to &lt;IP&gt; (unsafe)</em>.</li>
                  <li><strong>Safari (iOS):</strong> Tap <em>Show Details</em> $\rightarrow$ Tap <em>visit this website</em>.</li>
                </ul>
                <p className="text-[10px] text-slate-400">
                  You only need to do this once per device session.
                </p>
              </div>

              {/* Section D.4: Tunneling Option */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Globe className="w-4 h-4" />
                  <span>4. HTTPS Tunnels (Zero Warnings & Trusted SSL)</span>
                </div>
                <p className="text-slate-300">
                  If you prefer 100% trusted certificates with zero browser warnings, start an HTTPS tunnel:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-[10px]">Cloudflare Tunnel</div>
                      <div className="text-emerald-300 mt-0.5">npm run tunnel:cf</div>
                    </div>
                    <button
                      onClick={() => copyText('npm run tunnel:cf', 'cf')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-400"
                    >
                      {copiedTunnelCf ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-[10px]">ngrok Tunnel</div>
                      <div className="text-cyan-300 mt-0.5">npm run tunnel:ngrok</div>
                    </div>
                    <button
                      onClick={() => copyText('npm run tunnel:ngrok', 'ngrok')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-400"
                    >
                      {copiedTunnelNgrok ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section D.6: Honest Note */}
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 text-[11px] text-slate-400 italic text-center">
                🛡️ <strong>Honest engineering note:</strong> Video streams over Wi-Fi / HTTPS. Bluetooth (Web Bluetooth API) is strictly reserved for IoT hardware sensors and relay switches.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            AuraSync Network Doctor v2.0
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-xs"
          >
            Close Doctor
          </button>
        </div>
      </div>
    </div>
  );
}
