import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, Activity, User, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore.js';

export default function MorphismLoadingScreen({ onComplete }) {
  const { user, setDemoRole } = useAuthStore();
  const [progress, setProgress] = useState(12);
  const [statusMessage, setStatusMessage] = useState('Booting AuraSync Digital Twin Core...');
  const [isReady, setIsReady] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || 'hod');

  const roleOptions = [
    { role: 'hod', name: 'Dr. Sandhya V.', label: 'HOD AIML (Default)' },
    { role: 'admin', name: 'Dr. M. Ravishankar', label: 'Principal' },
    { role: 'staff', name: 'Prof. Ananya Rao', label: 'Faculty' },
    { role: 'student', name: 'Nikhil Sharma', label: 'Student' },
    { role: 'worker', name: 'Manjunath Gowda', label: 'Technician' }
  ];

  useEffect(() => {
    const steps = [
      { at: 25, msg: 'Calibrating DSATM Solar Inverters & Microgrid Telemetry...' },
      { at: 55, msg: 'Initializing Edge Computer Vision Nodes (Classrooms & Labs)...' },
      { at: 80, msg: 'Synchronizing Net-Zero Carbon Ledgers & BESCOM Tariff Engine...' },
      { at: 96, msg: 'Establishing Pre-Authenticated Session for Dr. Sandhya V....' },
      { at: 100, msg: 'Campus Twin Live & Ready!' }
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        const next = Math.min(prev + Math.floor(Math.random() * 12) + 8, 100);
        const currentStep = steps.slice().reverse().find((s) => next >= s.at);
        if (currentStep) {
          setStatusMessage(currentStep.msg);
        }
        return next;
      });
    }, 130);

    return () => clearInterval(timer);
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setDemoRole(role);
  };

  const handleEnter = () => {
    if (onComplete) onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-[#05070E] overflow-hidden select-none"
    >
      {/* Background Animated Aurora Morphism Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #10B981 1px, transparent 0)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* Main Glassmorphism / Neumorphism Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 relative backdrop-blur-2xl bg-gradient-to-b from-[#0F172A]/80 via-[#0B1120]/90 to-[#070B14]/95 border border-emerald-500/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] overflow-hidden text-center"
      >
        {/* Specular Top Ambient Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        {/* Holographic Logo with Glow-Morphism Pulse */}
        <div className="relative mx-auto w-20 h-20 mb-5">
          {/* Neumorphic ring shadow */}
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-md animate-ping" style={{ animationDuration: '3s' }} />
          <div className="relative w-full h-full rounded-2xl p-[2px] bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_10px_25px_rgba(16,185,129,0.3)]">
            <div className="w-full h-full bg-[#080C14] rounded-[14px] flex items-center justify-center">
              <Zap className="w-10 h-10 text-emerald-400 fill-emerald-400/30" />
            </div>
          </div>
        </div>

        {/* Institution & Title */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>DAYANANDA SAGAR ACADEMY OF TECHNOLOGY & MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white pt-2">
            AuraSync <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Energy Twin</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-Time Campus Telemetry • Vision AI • ESG Carbon Dashboard
          </p>
        </div>

        {/* Progress Bar (Neumorphism recessed groove with liquid emerald fill) */}
        <div className="space-y-2 mb-6 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-mono flex items-center gap-1.5 truncate max-w-[340px]">
              <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
              {statusMessage}
            </span>
            <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">
              {progress}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#04070D] p-[1px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>
        </div>

        {/* Pre-login Account Selector & Status Badge */}
        <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Pre-Logged In Account:
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Auto-Authenticated
            </span>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-900 text-sm shrink-0">
              SV
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">
                {roleOptions.find(r => r.role === selectedRole)?.name || 'Dr. Sandhya V.'}
              </div>
              <div className="text-xs text-emerald-300/80 truncate">
                Department of Computer Science & Engineering (AIML)
              </div>
            </div>
          </div>

          {/* Quick 1-Click Role Switcher */}
          <div>
            <div className="text-[10px] text-slate-400 mb-1.5 font-medium">Or switch profile before entering:</div>
            <div className="flex flex-wrap gap-1.5">
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => handleRoleChange(opt.role)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    selectedRole === opt.role
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/60 font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enter Button */}
        <button
          type="button"
          onClick={handleEnter}
          disabled={!isReady && progress < 80}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            isReady || progress >= 80
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          <span>{isReady ? 'Launch Campus Twin' : 'Initializing Campus Twin...'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Footnote Compliance Statement */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/70" />
          <span>Zero Dark Patterns • 100% Free Open Educational Twin • DPDP & GDPR Compliant</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
