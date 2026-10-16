import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Lock, CheckCircle, X, KeyRound, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatINR, formatKw, formatCo2, sounds } from '../../lib/utils.js';

export default function PasskeyModal({ isOpen, onClose, onAuthorized, title, predictedImpact }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      sounds.playChime('bubble');
      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(null);
  };

  const verifyPin = async (enteredPin) => {
    setIsVerifying(true);
    // Demo PIN is 123456
    setTimeout(() => {
      if (enteredPin === '123456') {
        sounds.playChime('success');
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setIsVerifying(false);
        onAuthorized(enteredPin);
        onClose();
      } else {
        setIsVerifying(false);
        setError('Invalid Passkey PIN. Hint: demo PIN is 123456');
        sounds.playChime('alert');
        setPin('');
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl glass-panel bg-[#0B0F19]/95 border border-white/20 p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Specular Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title || 'Campus Master Switch Authorization'}</h3>
            <p className="text-xs text-slate-400">Layered Security Check: HOD / Admin Passkey Required</p>
          </div>
        </div>

        {/* Predicted Impact Card */}
        {predictedImpact && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Predicted Realtime Impact
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-black/40">
                <div className="text-[10px] text-slate-400">Demand Drop</div>
                <div className="text-xs font-mono font-bold text-emerald-300 mt-0.5">
                  -{formatKw(predictedImpact.kwDrop || 48)}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-black/40">
                <div className="text-[10px] text-slate-400">Hourly Savings</div>
                <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                  +{formatINR(predictedImpact.savingsPerHourRs || 396)}/h
                </div>
              </div>
              <div className="p-2 rounded-xl bg-black/40">
                <div className="text-[10px] text-slate-400">CO₂ Avoided</div>
                <div className="text-xs font-mono font-bold text-purple-300 mt-0.5">
                  {formatCo2(predictedImpact.co2AvoidedKg || 34.1)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PIN Dots Indicator */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                pin.length > idx
                  ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.8)] scale-110'
                  : 'bg-white/5 border-white/20'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs text-rose-400 mb-3 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto my-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-cyan-500/20 border border-white/10 text-lg font-mono font-semibold text-white transition active:scale-95 shadow"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPin('123456')}
            className="h-12 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30"
            title="Auto-fill Demo PIN"
          >
            Demo
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-cyan-500/20 border border-white/10 text-lg font-mono font-semibold text-white transition active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold border border-white/10"
          >
            ⌫
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-4">
          Demo Passkey PIN: <span className="font-mono text-cyan-400 font-bold">123456</span>
        </p>
      </motion.div>
    </div>
  );
}
