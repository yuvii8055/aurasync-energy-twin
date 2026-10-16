import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Smartphone,
  Copy,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Wifi,
  Globe,
  Radio,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../../lib/utils.js';

export default function PairingPanel({
  roomId = 'main-204',
  phoneConnected,
  phoneDeviceName,
  onOpenDoctor
}) {
  const [netInfo, setNetInfo] = useState(null);
  const [selectedIp, setSelectedIp] = useState('');
  const [publicBaseUrlInput, setPublicBaseUrlInput] = useState('');
  const [activeBaseUrl, setActiveBaseUrl] = useState('');
  const [pairData, setPairData] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Fetch Network Info from Server on Mount
  const fetchNetworkInfo = async () => {
    try {
      const res = await fetch('/api/network/info');
      const json = await res.json();
      if (json.success) {
        setNetInfo(json.data);
        const bestIp = json.data.defaultIp || '127.0.0.1';
        setSelectedIp(bestIp);
        if (json.data.tunnelUrl) {
          setPublicBaseUrlInput(json.data.tunnelUrl);
        }
        return json.data;
      }
    } catch (e) {
      console.warn('Network discovery error:', e);
    }
    return null;
  };

  // Generate / Regenerate Pairing Token from Server
  const generatePairing = async (ipToUse, tunnelToUse) => {
    setQrLoading(true);
    setQrError(null);
    try {
      const body = {
        roomId,
        selectedIp: ipToUse || selectedIp,
        publicBaseUrl: tunnelToUse !== undefined ? tunnelToUse : publicBaseUrlInput
      };

      const res = await fetch('/api/camera/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setPairData(data);
        setActiveBaseUrl(data.baseUrl || '');
        const expiresSeconds = Math.max(0, Math.round((data.expiresAt - Date.now()) / 1000));
        setTimeLeft(expiresSeconds);

        // Generate QR Code with qrcode package as primary renderer
        try {
          const generatedQr = await QRCode.toDataURL(data.url, {
            width: 320,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: { dark: '#000000', light: '#ffffff' }
          });
          setQrDataUrl(generatedQr);
        } catch (qErr) {
          console.warn('Client QRCode render error:', qErr);
          if (data.qrDataUrl) {
            setQrDataUrl(data.qrDataUrl); // Use server-rendered fallback
          } else {
            setQrError(qErr.message || 'Failed to render QR Code');
          }
        }
      } else {
        setQrError(data.error || 'Server rejected pairing request');
      }
    } catch (err) {
      setQrError(err.message || 'Network error generating pairing token');
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkInfo().then((info) => {
      if (info) {
        generatePairing(info.defaultIp, info.tunnelUrl || '');
      } else {
        generatePairing('127.0.0.1', '');
      }
    });
  }, [roomId]);

  // Expiry Countdown Timer
  useEffect(() => {
    if (!pairData || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pairData, timeLeft]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyUrl = () => {
    if (pairData?.url) {
      navigator.clipboard.writeText(pairData.url);
      setCopiedUrl(true);
      sounds.playChime('bubble');
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (pairData?.shortCode) {
      navigator.clipboard.writeText(pairData.shortCode);
      setCopiedCode(true);
      sounds.playChime('bubble');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const isLocalhostOnly = netInfo?.isLocalhostOnly || selectedIp === '127.0.0.1';

  return (
    <div className="p-6 rounded-3xl glass-panel bg-gradient-to-tr from-[#090E1A] via-[#0C1427] to-[#070B14] border border-white/15 shadow-2xl space-y-6">
      {/* Top Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Phone Camera QR Pairing
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                HTTPS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Streams Edge AI camera feed securely from any smartphone into Lab 204
            </p>
          </div>
        </div>

        {/* Live Pairing Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-2xl border text-xs font-mono font-semibold flex items-center gap-2 ${
              phoneConnected
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : timeLeft > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                phoneConnected
                  ? 'bg-emerald-400 animate-pulse'
                  : timeLeft > 0
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span>
              {phoneConnected
                ? `Phone Connected (${phoneDeviceName || 'Mobile'})`
                : timeLeft > 0
                ? 'Waiting for Phone...'
                : 'Token Expired'}
            </span>
          </div>

          <button
            onClick={() => generatePairing(selectedIp, publicBaseUrlInput)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
            title="Regenerate Pairing Token"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: QR Viewport on Left, Details & Network Controls on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* QR Code Container (Primary: QRCode.toDataURL in <img>, Fallback: QRCodeSVG) */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative p-4 rounded-3xl bg-white shadow-2xl border-4 border-emerald-400 flex flex-col items-center justify-center min-w-[240px] min-h-[240px]">
            {qrLoading ? (
              <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-500 font-mono text-xs space-y-2">
                <RotateCcw className="w-8 h-8 animate-spin text-emerald-600" />
                <span>Generating QR...</span>
              </div>
            ) : qrError ? (
              <div className="w-56 h-56 p-4 flex flex-col items-center justify-center text-center text-rose-600 space-y-2">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
                <span className="text-xs font-bold">QR Generation Error</span>
                <span className="text-[10px] text-slate-600 font-mono">{qrError}</span>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Phone Camera Pairing QR Code"
                className="w-56 h-56 object-contain rounded-xl select-none"
              />
            ) : (
              // Fallback Renderer: QRCodeSVG
              <QRCodeSVG
                value={pairData?.url || ''}
                size={220}
                level="M"
                includeMargin={true}
              />
            )}

            <div className="mt-2 text-[10px] font-mono text-slate-800 font-bold tracking-tight">
              AuraSync Secure QR • 320px
            </div>
          </div>

          {/* Countdown & Expiry Warning */}
          <div className="mt-3 flex items-center gap-2 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Token validity:</span>
            <span className={`font-bold ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {formatCountdown(timeLeft)}
            </span>
          </div>
        </div>

        {/* Pairing Details, 6-Digit Fallback Code, Network Config */}
        <div className="md:col-span-7 space-y-4">
          {/* NO-QR FALLBACK: 6-Digit Code Box (Section B.4 & B.5) */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                No-QR Fallback: 6-Digit Code
              </span>
              <button
                onClick={handleCopyCode}
                className="text-cyan-300 hover:text-white text-[11px] font-mono flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-xl border border-white/10">
              <div className="font-mono text-2xl font-black tracking-widest text-white">
                {pairData?.shortCode ? (
                  <>
                    <span className="text-cyan-400">{pairData.shortCode.slice(0, 3)}</span>{' '}
                    <span className="text-emerald-400">{pairData.shortCode.slice(3)}</span>
                  </>
                ) : (
                  '------'
                )}
              </div>
              <a
                href="/pair"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 underline font-semibold"
              >
                <span>Open /pair page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[11px] text-slate-300">
              On your phone browser, open <code className="text-cyan-300 font-mono font-bold">/pair</code> and type this 6-digit code.
            </p>
          </div>

          {/* Direct Clickable Pairing URL */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Pairing URL (HTTPS):</span>
              <button
                onClick={handleCopyUrl}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] font-mono flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedUrl ? 'Copied URL!' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-2 text-xs font-mono overflow-hidden">
              <span className="truncate text-slate-200">{pairData?.url || 'Generating pairing link...'}</span>
              <a
                href={pairData?.url}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-lg hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition shrink-0"
                title="Test Pairing in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-emerald-400 flex items-center justify-between">
                <span>📱 Phone Camera Connection Helper:</span>
              </div>
              <p>
                1. <strong>Phone (Same Wi-Fi):</strong> Open camera, scan QR or go to <code className="text-emerald-300 font-mono">/pair</code> and type code <strong className="text-cyan-300 font-mono">{pairData?.shortCode || '------'}</strong>.
              </p>
              <p>
                2. If browser displays <em>"Your connection is not private"</em>, click <strong>Advanced</strong> → <strong>Proceed to site</strong>.
              </p>
              <div className="pt-1.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (pairData?.url) {
                      window.open(pairData.url, 'AuraSyncPhoneStream', 'width=420,height=780,scrollbars=yes');
                      sounds.playChime('success');
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs shadow-md hover:scale-[1.01] active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Mobile Stream in Test Popup (Laptop Camera Test)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Network Interface & Tunnel Selectors (Section B.3 Priority) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* 1. LAN IP Dropdown */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400" />
                LAN Interface (Wi-Fi):
              </span>
              <select
                value={selectedIp}
                onChange={(e) => {
                  setSelectedIp(e.target.value);
                  generatePairing(e.target.value, publicBaseUrlInput);
                }}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-hidden"
              >
                {(netInfo?.lanInterfaces || []).map((iface) => (
                  <option key={iface.ip} value={iface.ip}>
                    {iface.interface} ({iface.ip})
                  </option>
                ))}
                {(!netInfo?.lanInterfaces || netInfo.lanInterfaces.length === 0) && (
                  <option value="127.0.0.1">Localhost (127.0.0.1)</option>
                )}
              </select>
            </div>

            {/* 2. Public Base URL (Tunnel) Input */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                Public Base URL (Tunnel):
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="https://xyz.ngrok-free.app"
                  value={publicBaseUrlInput}
                  onChange={(e) => setPublicBaseUrlInput(e.target.value)}
                  onBlur={() => generatePairing(selectedIp, publicBaseUrlInput)}
                  className="flex-1 bg-black/80 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-slate-600 focus:border-cyan-400 focus:outline-hidden"
                />
                <button
                  onClick={() => generatePairing(selectedIp, publicBaseUrlInput)}
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Warning Chip if only localhost is available (Section B.3) */}
          {isLocalhostOnly && !publicBaseUrlInput && (
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> Phone cannot reach localhost. Choose a LAN IP from the dropdown or start a tunnel (<code className="text-amber-200 font-mono">npm run tunnel:cf</code>).
              </span>
            </div>
          )}

          {/* Connection Doctor Trigger Button (Section D.5) */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">Troubleshooting connectivity?</span>
            <button
              onClick={onOpenDoctor}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-semibold flex items-center gap-1.5 transition"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Connection Doctor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
