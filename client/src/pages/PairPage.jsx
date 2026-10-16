import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Smartphone,
  KeyRound,
  ArrowRight,
  Zap,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../lib/utils.js';

export default function PairPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResolveCode = async (e) => {
    e?.preventDefault();
    if (code.trim().length !== 6) {
      setError('Please enter a complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/camera/resolve-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortCode: code.trim() })
      });

      const data = await res.json();
      if (data.success && data.token) {
        sounds.playChime('success');
        navigate(`/camera/${data.token}`);
      } else {
        setError(data.error || 'Invalid or expired 6-digit pairing code.');
        sounds.playChime('alert');
      }
    } catch (err) {
      setError('Network error contacting twin server.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
    setError('');
    if (val.length === 6) {
      setTimeout(() => {
        // Auto submit on 6 digits
        fetch('/api/camera/resolve-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shortCode: val })
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.token) {
              sounds.playChime('success');
              navigate(`/camera/${data.token}`);
            } else {
              setError(data.error || 'Invalid or expired 6-digit pairing code.');
            }
          })
          .catch(() => setError('Server unreachable'));
      }, 200);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-3xl glass-panel bg-[#0B101D] border border-white/15 shadow-2xl space-y-6 text-center">
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#080C14] rounded-[22px] flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-black text-white">Enter 6-Digit Pairing Code</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Type the 6-digit code shown on the desktop AuraSync Vision Lab screen to stream camera video.
          </p>
        </div>

        {/* 6-Digit Code Input */}
        <form onSubmit={handleResolveCode} className="space-y-4">
          <div className="flex justify-center">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={handleInputChange}
              placeholder="••••••"
              autoFocus
              className="w-full max-w-xs tracking-[0.5em] text-center text-3xl font-black font-mono py-3 rounded-2xl bg-black/60 border-2 border-cyan-500/40 focus:border-cyan-400 text-white placeholder:text-slate-600 focus:outline-hidden transition shadow-inner"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={code.length !== 6 || loading}
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
              code.length === 6 && !loading
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-emerald-500/20'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Validating Code...</span>
              </>
            ) : (
              <>
                <span>Connect Camera Stream</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400">
          Want to scan the QR code instead?{' '}
          <Link to="/vision" className="text-cyan-400 hover:underline font-semibold">
            Open Vision Lab
          </Link>
        </div>
      </div>
    </div>
  );
}
