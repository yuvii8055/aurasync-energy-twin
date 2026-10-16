import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Server,
  Sliders,
  Sparkles,
  Palette,
  Monitor,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  Zap,
  Power,
  Lock,
  Layers,
  Thermometer,
  Cpu,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useThemeStore } from '../store/useThemeStore.js';
import { useIslandStore } from '../store/useIslandStore.js';
import { sounds } from '../lib/utils.js';

export default function AdminPage() {
  const { user, token, setDemoRole } = useAuthStore();
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    displayScale,
    setDisplayScale,
    containerWidth,
    setContainerWidth,
    glassBlur,
    setGlassBlur,
    soundEnabled,
    setSoundEnabled,
    resetAllSettings
  } = useThemeStore();
  const { resetIsland, pushEvent } = useIslandStore();

  const [activeTab, setActiveTab] = useState('hod'); // 'hod' | 'theme' | 'users' | 'health'
  const [users, setUsers] = useState([
    {
      id: 'usr-admin-1',
      name: 'Dr. M. Ravishankar',
      email: 'admin@aurasync.demo',
      role: 'admin',
      department: 'Campus Administration (Principal)',
      twoFAEnabled: true,
      approvalStatus: 'approved'
    },
    {
      id: 'usr-hod-1',
      name: 'Dr. Sandhya V.',
      email: 'hod.aiml@aurasync.demo',
      role: 'hod',
      department: 'CSE (Artificial Intelligence & ML)',
      twoFAEnabled: true,
      approvalStatus: 'approved'
    },
    {
      id: 'usr-staff-1',
      name: 'Prof. Ananya Rao',
      email: 'faculty@aurasync.demo',
      role: 'staff',
      department: 'CSE (Artificial Intelligence & ML)',
      twoFAEnabled: false,
      approvalStatus: 'approved'
    },
    {
      id: 'usr-student-1',
      name: 'Nikhil Sharma (1DT23AI045)',
      email: 'student@aurasync.demo',
      role: 'student',
      department: 'CSE (Artificial Intelligence & ML)',
      twoFAEnabled: false,
      approvalStatus: 'approved'
    },
    {
      id: 'usr-worker-1',
      name: 'Manjunath Gowda',
      email: 'worker@aurasync.demo',
      role: 'worker',
      department: 'Campus Facilities & Maintenance',
      twoFAEnabled: false,
      approvalStatus: 'approved'
    }
  ]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // HOD Control State
  const [lab204Relay, setLab204Relay] = useState(true);
  const [thermostatCapC, setThermostatCapC] = useState(24);
  const [autoShedEvening, setAutoShedEvening] = useState(true);
  const [facultyRemoteAllowed, setFacultyRemoteAllowed] = useState(true);
  const [sanctionedDemandCapKw, setSanctionedDemandCapKw] = useState(720);
  const [emergencyCutActive, setEmergencyCutActive] = useState(false);

  // Fetch users & logs with auth token
  useEffect(() => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch('/api/users', { headers })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.length) {
          setUsers(json.data);
        }
      })
      .catch(() => {});

    fetch('/api/users/audit-logs', { headers })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setAuditLogs(json.data);
        }
      })
      .catch(() => {});
  }, [token]);

  const showToast = (msg) => {
    setToastMessage(msg);
    sounds.playChime('bubble');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleApprove = async (userId) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await fetch(`/api/users/${userId}/approve`, { method: 'PATCH', headers });
      const data = await res.json();
      if (data.success) {
        sounds.playChime('success');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'approved' } : u));
        showToast('User account successfully approved!');
      }
    } catch {
      // Local fallback
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'approved' } : u));
      showToast('User account approved!');
    }
  };

  const handleLab204Toggle = () => {
    const next = !lab204Relay;
    setLab204Relay(next);
    sounds.playChime(next ? 'success' : 'alert');
    pushEvent({
      type: 'AUTO_CONTROL',
      title: next ? 'Lab 204 Relays Energized' : 'Lab 204 Isolated by HOD',
      message: next ? 'Power restored to AI Workstations & Lighting.' : 'Idle ghost power isolated by HOD override.',
      severity: next ? 'info' : 'warning'
    });
    showToast(next ? 'Lab 204 Power Active' : 'Lab 204 Power Cut (Isolated)');
  };

  const handleEmergencyCut = () => {
    const next = !emergencyCutActive;
    setEmergencyCutActive(next);
    sounds.playChime('alert');
    pushEvent({
      type: 'SECURITY',
      title: next ? '🚨 HOD EMERGENCY POWER SHED ACTIVE' : 'Power Shed Restored',
      message: next ? 'Shedding 45 kW of non-essential departmental loads.' : 'Normal grid distribution resumed.',
      severity: next ? 'critical' : 'info'
    });
    showToast(next ? 'Emergency Shedding Triggered (-45 kW)' : 'Normal Power Resumed');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500/90 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-300/40 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Admin & HOD Governance Console
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Role: {user?.role?.toUpperCase() || 'HOD'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            DSATM Infrastructure & Display Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Department of CSE (AIML) • Master Power Governance, Theme Styling & Multi-Display Scaling
          </p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex flex-wrap p-1 rounded-2xl glass-panel bg-black/40 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('hod')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              activeTab === 'hod' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>HOD Control</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              activeTab === 'theme' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Display Size</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              activeTab === 'users' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Approvals ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              activeTab === 'health' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>System Health</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HOD CONTROL */}
      {activeTab === 'hod' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lab 204 Relay Override */}
            <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Lab 204 Main Relay</h3>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  lab204Relay ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {lab204Relay ? 'ENERGIZED' : 'ISOLATED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct solid-state relay interlock controlling 30 AI Workstations, GPU Rig & Overhead lighting in Lab 204.
              </p>
              <button
                onClick={handleLab204Toggle}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                  lab204Relay
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{lab204Relay ? 'Isolate Lab 204 Power' : 'Restore Lab 204 Power'}</span>
              </button>
            </div>

            {/* AC Thermostat Ceiling */}
            <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">HVAC Thermostat Cap</h3>
                </div>
                <span className="text-lg font-mono font-bold text-cyan-400">{thermostatCapC}°C</span>
              </div>
              <p className="text-xs text-slate-400">
                Mandatory BEE Energy Conservation limit. Prevents classroom split ACs from dropping below setpoint.
              </p>
              <div className="space-y-1">
                <input
                  type="range"
                  min="22"
                  max="28"
                  step="1"
                  value={thermostatCapC}
                  onChange={(e) => {
                    setThermostatCapC(Number(e.target.value));
                    showToast(`Thermostat cap set to ${e.target.value}°C`);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>22°C (Cold)</span>
                  <span>24°C (BEE Standard)</span>
                  <span>28°C (Eco)</span>
                </div>
              </div>
            </div>

            {/* Emergency Department Shed */}
            <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Emergency Power Shed</h3>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  emergencyCutActive ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {emergencyCutActive ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sheds all non-critical corridor lights, seminar audio amps, and vacant labs instantly during BESCOM peak tariff.
              </p>
              <button
                onClick={handleEmergencyCut}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  emergencyCutActive
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{emergencyCutActive ? 'Resume Normal Load' : 'Trigger 45 kW Load Shed'}</span>
              </button>
            </div>
          </div>

          {/* Department Policies Grid */}
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Department Automation Policies & Safeguards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">After-Hours Auto Shutdown (17:30 IST)</div>
                  <div className="text-[11px] text-slate-400">Automatically isolate idle lab circuits after classes end.</div>
                </div>
                <button
                  onClick={() => {
                    setAutoShedEvening(!autoShedEvening);
                    showToast(!autoShedEvening ? 'Auto-Shutdown Activated' : 'Auto-Shutdown Disabled');
                  }}
                  className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                    autoShedEvening ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Faculty Remote Web Relay Access</div>
                  <div className="text-[11px] text-slate-400">Allow department professors to toggle classroom ACs remotely.</div>
                </div>
                <button
                  onClick={() => {
                    setFacultyRemoteAllowed(!facultyRemoteAllowed);
                    showToast(!facultyRemoteAllowed ? 'Faculty Remote Allowed' : 'Faculty Remote Restricted');
                  }}
                  className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                    facultyRemoteAllowed ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>

            {/* Sanctioned Demand Cap */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Campus Sanctioned Demand Cap:</span>
                <span className="font-mono text-emerald-400 font-bold">{sanctionedDemandCapKw} kVA</span>
              </div>
              <input
                type="range"
                min="500"
                max="850"
                step="10"
                value={sanctionedDemandCapKw}
                onChange={(e) => setSanctionedDemandCapKw(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>500 kVA (Minimum Baseline)</span>
                <span>720 kVA (Target DSATM Budget)</span>
                <span>850 kVA (BESCOM Penalty Limit)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEME & DESKTOP SIZE STUDIO */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          {/* Theme Palette Selection */}
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  Visual Theme Style
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Select color palette and ambient background mode.</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-bold">Active: {theme}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: 'midnight', name: 'Midnight Cyber', desc: 'Dark Navy & Neon Glass', bg: '#080C14', border: '#10B981' },
                { id: 'obsidian', name: 'Obsidian Black', desc: 'Pure Pitch OLED Black', bg: '#000000', border: '#71717A' },
                { id: 'cyber', name: 'Cyberpunk Purple', desc: 'Deep Violet & Cyber Glow', bg: '#050510', border: '#A855F7' },
                { id: 'eco', name: 'Emerald Forest', desc: 'Dark Green Bio-Digital', bg: '#04140D', border: '#10B981' },
                { id: 'eco-light', name: 'Clean Light', desc: 'Daylight High-Contrast', bg: '#F1F5F9', border: '#059669' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    sounds.playChime('bubble');
                    showToast(`Theme switched to ${t.name}`);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition group relative overflow-hidden ${
                    theme === t.id
                      ? 'border-emerald-400 bg-white/10 ring-2 ring-emerald-400/30 shadow-lg'
                      : 'border-white/10 bg-black/40 hover:border-white/20'
                  }`}
                  style={{ backgroundColor: t.bg }}
                >
                  <div className="w-4 h-4 rounded-full border mb-2" style={{ borderColor: t.border, backgroundColor: t.border }} />
                  <div className="font-bold text-xs text-white group-hover:text-emerald-300">{t.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color Palette */}
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Accent Glow Color
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'emerald', label: 'Emerald Green', hex: '#10B981' },
                { id: 'cyan', label: 'Cyan Electric', hex: '#06B6D4' },
                { id: 'purple', label: 'Violet Aurora', hex: '#8B5CF6' },
                { id: 'amber', label: 'Amber Solar', hex: '#F59E0B' },
                { id: 'rose', label: 'Rose Energy', hex: '#F43F5E' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setAccentColor(c.id);
                    sounds.playChime('bubble');
                    showToast(`Accent set to ${c.label}`);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
                    accentColor === c.id
                      ? 'bg-white/15 text-white border-white/40 shadow-md'
                      : 'bg-black/40 text-slate-300 border-white/5 hover:bg-white/5'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: c.hex }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Display Size & Scaling */}
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  Desktop Display Sizing & UI Scale
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Optimized for laptops (1080p), large external monitors (1440p) or TV Wall / Kiosk command centers.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Scale: {displayScale}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'compact', label: 'Compact (88%)', desc: '13" Laptops & Dense Data' },
                { id: 'normal', label: 'Standard (100%)', desc: 'Default Balanced UI' },
                { id: 'large', label: 'Large (112%)', desc: '1440p & 27" Monitors' },
                { id: 'kiosk', label: '4K Kiosk (124%)', desc: 'Wall TV & Projectors' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setDisplayScale(s.id);
                    sounds.playChime('bubble');
                    showToast(`Display scale set to ${s.label}`);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    displayScale === s.id
                      ? 'bg-emerald-600/20 border-emerald-400 text-white ring-1 ring-emerald-400/40 shadow'
                      : 'bg-black/40 border-white/10 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="font-bold text-xs">{s.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Container Width & Glass Effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Container Max Width */}
            <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                Container Layout Width
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', label: 'Standard (1280px)' },
                  { id: 'wide', label: 'Wide (1720px)' },
                  { id: 'fluid', label: 'Fluid (100%)' }
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setContainerWidth(w.id);
                      sounds.playChime('bubble');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-center text-xs font-semibold transition border ${
                      containerWidth === w.id
                        ? 'bg-cyan-600/20 border-cyan-400 text-cyan-200'
                        : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Glassmorphism Blur */}
            <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Glassmorphism Backdrop Blur
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'subtle', label: 'Subtle (8px)' },
                  { id: 'medium', label: 'Standard (20px)' },
                  { id: 'heavy', label: 'Ultra Frosted (36px)' }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setGlassBlur(b.id);
                      sounds.playChime('bubble');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-center text-xs font-semibold transition border ${
                      glassBlur === b.id
                        ? 'bg-purple-600/20 border-purple-400 text-purple-200'
                        : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Chimes & Dynamic Island Reset */}
          <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  showToast(!soundEnabled ? 'Audio Chimes Enabled' : 'Audio Chimes Muted');
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition ${
                  soundEnabled
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-white/10 text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundEnabled ? 'Audio Feedback Active' : 'Sound Muted'}</span>
              </button>

              <button
                onClick={() => {
                  resetIsland();
                  sounds.playChime('bubble');
                  showToast('Dynamic Island Reset to Center Anchor');
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>Reset Dynamic Island Position</span>
              </button>
            </div>

            <button
              onClick={() => {
                resetAllSettings();
                showToast('All Display & Theme Settings Reset to Defaults');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold"
            >
              Reset Theme & Display to Factory Default
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: USER ACCOUNTS & APPROVALS */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Campus Institutional Accounts</h3>
              <p className="text-xs text-slate-400 mt-0.5">Role-Based Access Control (RBAC) approvals for DSATM staff & students.</p>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold">{users.length} Active Accounts</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5">User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>2FA</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-semibold text-white">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td>
                      <span className="uppercase font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="text-slate-300">{u.department}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        u.twoFAEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {u.twoFAEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.approvalStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300 animate-pulse'
                      }`}>
                        {u.approvalStatus}
                      </span>
                    </td>
                    <td className="text-right space-x-1.5">
                      {u.approvalStatus !== 'approved' ? (
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setDemoRole(u.role);
                            showToast(`Switched active view to ${u.name}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-[10px] border border-white/10"
                        >
                          Assume View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH & AUDIT LOGS */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">IoT Tick Cadence</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-400">2000 ms</div>
              <p className="text-[10px] text-slate-400">WebSocket broadcast nominal</p>
            </div>

            <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Aura AI Model</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-lg font-mono font-bold text-cyan-300 truncate">gemini-3.5-flash</div>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live Google GenAI streaming
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">WebGL Graphics</span>
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-purple-300">60.0 FPS</div>
              <p className="text-[10px] text-slate-400">Three.js hardware acceleration active</p>
            </div>

            <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">HTTPS Protocol</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-400">SECURE</div>
              <p className="text-[10px] text-slate-400">Single-origin proxy active</p>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white">System Governance & Action Audit Trail</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{log.action}</div>
                      <div className="text-[10px] text-slate-400">By {log.userName} ({log.userRole})</div>
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No critical security incidents recorded. System running normally.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
