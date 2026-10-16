import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Zap,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { sounds } from '../lib/utils.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setDemoRole } = useAuthStore();
  const [email, setEmail] = useState('hod.aiml@aurasync.demo');
  const [password, setPassword] = useState('Hod@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo accounts array for quick 1-click testing
  const demoAccounts = [
    { label: 'Admin (Dr. M. Ravishankar)', email: 'admin@aurasync.demo', pass: 'Admin@12345', role: 'admin' },
    { label: 'HOD (Dr. Sandhya V.)', email: 'hod.aiml@aurasync.demo', pass: 'Hod@12345', role: 'hod' },
    { label: 'Faculty (Prof. Rao)', email: 'faculty@aurasync.demo', pass: 'Faculty@12345', role: 'staff' },
    { label: 'Student (Nikhil)', email: 'student@aurasync.demo', pass: 'Student@12345', role: 'student' },
    { label: 'Worker (Technician)', email: 'worker@aurasync.demo', pass: 'Worker@12345', role: 'worker' }
  ];

  const handleDemoSelect = (account) => {
    setEmail(account.email);
    setPassword(account.pass);
    setError(null);
    sounds.playChime('bubble');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      sounds.playChime('success');
      navigate('/dashboard');
    } else {
      sounds.playChime('alert');
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative">
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl glass-panel bg-[#0B0F19]/90 border border-white/20 p-8 shadow-2xl relative z-10 overflow-hidden">
        {/* Specular Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#080C14] rounded-[14px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/30" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">AuraSync Energy Twin</h2>
          <p className="text-xs text-slate-400 mt-1">Dayananda Sagar Academy of Technology & Management</p>
        </div>

        {/* Demo Credentials Fast Chip Selector */}
        <div className="mb-5 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              1-Click Demo Accounts & Credentials
            </span>
            <span className="text-[10px] text-slate-500 font-mono">DSATM Hackathon</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleDemoSelect(acc)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition ${
                  email === acc.email
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                    : 'bg-black/30 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>

          {/* Prominently visible credential details for currently selected demo account */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Selected Email:</span>
              <span className="text-emerald-300 font-bold select-all">{email}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Password:</span>
              <span className="text-cyan-300 font-bold select-all">{password}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hod.aiml@aurasync.demo"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
          >
            {isLoading ? 'Authenticating with JWT...' : 'Sign In to Command Center'}
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-slate-500">
          Developed by <span className="text-slate-300 font-semibold">O(1) Outlaws: AIML Engineers</span> of DSATM
        </div>
      </div>
    </div>
  );
}
