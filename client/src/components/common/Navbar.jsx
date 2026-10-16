import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Zap,
  Activity,
  Layers,
  Camera,
  Sliders,
  TrendingDown,
  LifeBuoy,
  Sparkles,
  Shield,
  Info,
  Sun,
  Moon,
  Command,
  PlusCircle,
  UserCheck,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Mail,
  Building,
  Key,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useCampusStore } from '../../store/useCampusStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatINR, formatKw } from '../../lib/utils.js';

export default function Navbar({ onOpenCommandPalette, onOpenReportModal }) {
  const location = useLocation();
  const { user, setDemoRole, token } = useAuthStore();
  const { telemetry } = useCampusStore();
  const { theme, setTheme } = useThemeStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const navLinks = [
    { to: '/dashboard', label: 'Command', icon: Activity, desc: 'Real-time telemetry' },
    { to: '/campus', label: '3D Twin', icon: Layers, desc: 'DSATM 2D & 3D digital campus' },
    { to: '/vision', label: 'Vision Lab', icon: Camera, desc: 'Computer vision occupancy AI' },
    { to: '/control', label: 'Control', icon: Sliders, desc: 'Automated relay & shed controls' },
    { to: '/simulate', label: 'What-If', icon: TrendingDown, desc: 'Population & tariff simulator' },
    { to: '/carbon', label: 'Carbon ESG', icon: Zap, desc: 'Green passport & CO2 auditing' },
    { to: '/helpdesk', label: 'Helpdesk', icon: LifeBuoy, desc: 'Incident reporting & work orders' },
    { to: '/coach', label: 'Aura AI', icon: Sparkles, desc: 'Gemini energy coach' },
    { to: '/admin', label: 'Admin', icon: Shield, desc: 'Governance & user roles' },
    { to: '/about', label: 'About', icon: Info, desc: 'DSATM & O(1) Outlaws team' }
  ];

  const roleLabels = {
    admin: { title: 'Principal (Dr. M. Ravishankar)', color: 'from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-500/40' },
    hod: { title: 'HOD (Dr. Sandhya V.)', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40' },
    staff: { title: 'Faculty / Staff', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40' },
    student: { title: 'Student (AIML)', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40' },
    worker: { title: 'Technician / Worker', color: 'from-orange-500/20 to-yellow-500/20 text-orange-300 border-orange-500/40' }
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const userRoleKey = user?.role?.toLowerCase() || 'hod';
  const roleStyle = roleLabels[userRoleKey] || roleLabels.hod;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-3 sm:px-6 py-2 backdrop-blur-xl">
      <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-2 lg:gap-4">
        {/* Logo and Institution Badge */}
        <Link to="/" onClick={closeMobile} className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080C14] rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/30" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AuraSync
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                DSATM
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium hidden sm:inline">Energy Twin • O(1) Outlaws</span>
          </div>
        </Link>

        {/* Navigation Items (Responsive Horizontal Bar) */}
        <nav className="hidden xl:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-[650px] 2xl:max-w-none">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Campus Telemetry Pill (Desktop) */}
        <div className="hidden 2xl:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs shrink-0">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">{formatKw(telemetry?.campus?.totalRealKw || 142)}</span>
          </div>
          <span className="text-slate-500">|</span>
          <div className="text-[11px] text-emerald-400 font-mono font-semibold">
            {formatINR(telemetry?.savingsTracker?.savedTodayRs || 4850)} saved
          </div>
        </div>

        {/* Right Section: Actions & ALWAYS-VISIBLE User Credentials */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Report Issue Button */}
          <button
            onClick={onOpenReportModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/80 to-amber-500/80 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-rose-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Waste</span>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition"
            title="Command Palette (Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] bg-white/10 px-1 py-0.2 rounded">⌘K</span>
          </button>

          {/* Theme Selector */}
          <button
            onClick={() => {
              const themes = ['midnight', 'eco-light', 'neon-cyber'];
              const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
              setTheme(themes[nextIndex]);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
            title={`Current Theme: ${theme}. Click to switch theme`}
          >
            {theme === 'eco-light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* =========================================================================
              ALWAYS VISIBLE USER CREDENTIALS BADGE & DROPDOWN
              Guarantees the user can ALWAYS see who is logged in across all screen sizes
             ========================================================================= */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-left transition group"
              title="Click to view credentials and session details"
            >
              {/* User Avatar Circle */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-sm shrink-0">
                <div className="w-full h-full bg-[#080C14] rounded-[6px] flex items-center justify-center font-bold text-white text-[10px]">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
                </div>
              </div>

              {/* User Name & Role Pill */}
              <div className="flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white truncate max-w-[110px] sm:max-w-[150px]">
                    {user?.name || 'Dr. Sandhya V.'}
                  </span>
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase font-extrabold ${roleStyle.color}`}>
                    {user?.role || 'HOD'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] sm:max-w-[180px] hidden sm:block">
                  {user?.email || 'hod.aiml@aurasync.demo'}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition shrink-0" />
            </button>

            {/* Comprehensive Credentials Card Modal / Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel bg-[#0B0F19]/98 border border-white/20 p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header: Verified Session */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Logged In Session</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    DSATM Campus
                  </span>
                </div>

                {/* Full Credentials Box */}
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Name:</span>
                    <span className="font-bold text-white text-xs block">{user?.name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">College Email:</span>
                    <div className="flex items-center justify-between gap-1 font-mono text-[11px] text-cyan-300">
                      <span className="truncate">{user?.email}</span>
                      <button
                        onClick={() => handleCopy(user?.email, 'email')}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
                        title="Copy email"
                      >
                        {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Department:</span>
                    <span className="text-slate-300 text-[11px] block">{user?.department}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Current Role:</span>
                    <span className={`px-1.5 py-0.5 rounded border uppercase font-bold ${roleStyle.color}`}>
                      {roleLabels[userRoleKey]?.title || user?.role}
                    </span>
                  </div>
                </div>

                {/* 1-Click Role Switcher */}
                <div className="mt-2.5 pt-2 border-t border-white/10">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-1 mb-1.5 flex items-center justify-between">
                    <span>Switch Role (Instant):</span>
                    <span className="text-[9px] text-slate-500 font-mono">Demo Mode</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    {Object.keys(roleLabels).map((rKey) => {
                      const isSelected = userRoleKey === rKey;
                      const rInfo = roleLabels[rKey];
                      return (
                        <button
                          key={rKey}
                          onClick={() => {
                            setDemoRole(rKey);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{rInfo.title}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Link to Login with Credentials */}
                <div className="mt-2.5 pt-2 border-t border-white/10">
                  <Link
                    to="/login"
                    onClick={() => setShowRoleMenu(false)}
                    className="w-full text-center px-2 py-1.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <LogOut className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Login with Another Account</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Responsive Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition flex items-center justify-center shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-3 pt-3 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Prominent Logged-In User Card in Mobile Drawer */}
          <div className="p-3 mb-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border border-emerald-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300 text-xs shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-xs">{user?.name}</span>
                <span className="text-[10px] text-cyan-300 font-mono truncate max-w-[200px]">{user?.email}</span>
                <span className="text-[9px] text-slate-400">{user?.department}</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${roleStyle.color} shrink-0`}>
              {user?.role}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  className={`flex flex-col p-2.5 rounded-xl text-xs font-semibold transition border ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border-emerald-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.desc}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Telemetry Status */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-xs font-mono mt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold">{formatKw(telemetry?.campus?.totalRealKw || 142)} live</span>
            </div>
            <div className="text-emerald-400 font-semibold">
              {formatINR(telemetry?.savingsTracker?.savedTodayRs || 4850)} saved today
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
