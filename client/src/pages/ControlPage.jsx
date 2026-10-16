import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Zap,
  ShieldCheck,
  RotateCcw,
  Power,
  Lock,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { formatINR, formatKw, sounds } from '../lib/utils.js';

export default function ControlPage({ onOpenMasterSwitch }) {
  const { telemetry } = useCampusStore();
  const { user } = useAuthStore();
  const [optimizerMode, setOptimizerMode] = useState('Balanced');
  const [auditLogs, setAuditLogs] = useState([]);
  const [undoStatus, setUndoStatus] = useState(null);

  useEffect(() => {
    fetch('/api/control/actions')
      .then(res => res.json())
      .then(json => {
        if (json.success) setAuditLogs(json.data);
      })
      .catch(() => {});
  }, []);

  const handleModeChange = (mode) => {
    setOptimizerMode(mode);
    sounds.playChime('bubble');
  };

  const handleUndo = async (actionId) => {
    try {
      const res = await fetch('/api/control/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId })
      });
      const data = await res.json();
      if (data.success) {
        sounds.playChime('success');
        setUndoStatus('Action successfully undone within 60s window.');
        setTimeout(() => setUndoStatus(null), 4000);
      } else {
        alert(data.error);
      }
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel bg-white/5 border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Campus Control Center
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Autonomous Optimization & Hierarchical Actuation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Software digital relays behind DeviceAdapter interface • Passkey PIN enforced
          </p>
        </div>

        {/* Master Campus Eco Switch Trigger */}
        <button
          onClick={onOpenMasterSwitch}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition hover:scale-105 active:scale-95"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Launch Campus Eco Switch</span>
        </button>
      </div>

      {undoStatus && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{undoStatus}</span>
        </div>
      )}

      {/* Grid: Auto-Optimizer Profile & Master Switches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Auto-Optimizer Tuning */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Auto-Optimizer Aggressiveness</h3>
                <p className="text-xs text-slate-400 mt-0.5">Controls thermostat sweet spot and idle thresholds</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                {optimizerMode} Mode
              </span>
            </div>

            {/* Profile Selector */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Gentle', desc: 'Comfort priority, 20m delay, 24°C', color: 'border-blue-500/30' },
                { name: 'Balanced', desc: 'BEE sweet spot, 15m delay, 24-25°C', color: 'border-emerald-500/40' },
                { name: 'Aggressive', desc: 'Max savings, 8m delay, 26°C peak shed', color: 'border-amber-500/40' }
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleModeChange(p.name)}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    optimizerMode === p.name
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Safety Whitelist */}
            <div className="pt-2 border-t border-white/10">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Protected Critical Loads (Immune from Auto-Cut)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">Central Server Racks</div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">Precision CRAC ACs</div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">Elevator Cabins & Safety</div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">Fire & Emergency Lights</div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">Water Supply Booster</div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">Research Lab Refrigeration</div>
              </div>
            </div>
          </div>

          {/* Manual Bulk Profiles */}
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white">Campus-Wide Operational Presets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={onOpenMasterSwitch}
                className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-left transition"
              >
                <Zap className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-xs font-bold">Eco Mode</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Shed idle circuits</div>
              </button>

              <button
                onClick={onOpenMasterSwitch}
                className="p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-left transition"
              >
                <Clock className="w-5 h-5 text-indigo-400 mb-2" />
                <div className="text-xs font-bold">Night Shutdown</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Corridor lighting only</div>
              </button>

              <button
                onClick={onOpenMasterSwitch}
                className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-left transition"
              >
                <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-xs font-bold">Event Override</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Auditorium fest power</div>
              </button>

              <button
                onClick={onOpenMasterSwitch}
                className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-left transition"
              >
                <AlertTriangle className="w-5 h-5 text-rose-400 mb-2" />
                <div className="text-xs font-bold">Emergency Cut</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Isolate non-critical</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Immutable Audit Trail */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Control Action Audit Trail
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Immutable Log</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">{log.userRole}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>By: {log.userName}</span>
                    <span className="font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.canUndoUntil && !log.undone && (
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleUndo(log.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] font-semibold text-amber-300 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Undo Action (60s)</span>
                      </button>
                    </div>
                  )}
                  {log.undone && (
                    <div className="text-[10px] text-slate-500 italic text-right pt-0.5">
                      (Action Undone)
                    </div>
                  )}
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No manual overrides recorded today.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
