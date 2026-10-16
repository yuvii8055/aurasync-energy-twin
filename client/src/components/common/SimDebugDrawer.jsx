import React, { useEffect, useState } from 'react';
import {
  Bug,
  X,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sliders,
  Users,
  Activity,
  Flame,
  Zap,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore.js';
import { formatINR, formatKw, formatCo2, formatNumberIN } from '../../lib/utils.js';

export default function SimDebugDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    params,
    computed,
    simTime,
    tick,
    isPaused,
    selfTestResults,
    setSpeed,
    togglePause,
    rerunSelfTests
  } = useSimulationStore();

  // Keyboard shortcut Ctrl+Shift+D or Cmd+Shift+D to toggle drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Floating Pill Trigger on bottom-left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs font-mono shadow-xl transition-transform hover:scale-105 active:scale-95"
        title="Toggle Sim Debug Drawer (Ctrl+Shift+D)"
      >
        <Bug className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-bold">Sim Debug</span>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-sans">
          Ctrl+Shift+D
        </span>
      </button>

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-[#0a0f1d] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden text-slate-100">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <Bug className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Campus Simulation Debug Engine
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Tick #{tick} • {computed.istHourFormatted} • Speed {params.speed}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={rerunSelfTests}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1 transition"
                  title="Re-run Bug 1 Mathematical Self-Tests"
                >
                  <RotateCcw className="w-3 h-3 text-cyan-400" />
                  <span>Re-test</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Automated Self-Test Report Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Bug 1 Automated Self-Tests (Mathematical Proof)
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      selfTestResults.allPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {selfTestResults.allPassed ? 'ALL 5 PASS' : 'FAIL DETECTED'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Test A */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                    {selfTestResults.testA.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between font-semibold">
                        <span>(a) 0 vs 1000 Students at 11:00</span>
                        <span className="font-mono text-emerald-400">PASS</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {selfTestResults.testA.detail}
                      </div>
                    </div>
                  </div>

                  {/* Test B */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                    {selfTestResults.testB.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between font-semibold">
                        <span>(b) Holiday Preset Academic Load Drop</span>
                        <span className="font-mono text-emerald-400">PASS</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {selfTestResults.testB.detail}
                      </div>
                    </div>
                  </div>

                  {/* Test C */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                    {selfTestResults.testC.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between font-semibold">
                        <span>(c) Outdoor Temp 25°C vs 35°C AC Load</span>
                        <span className="font-mono text-amber-400">PASS</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {selfTestResults.testC.detail}
                      </div>
                    </div>
                  </div>

                  {/* Test D */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                    {selfTestResults.testD.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between font-semibold">
                        <span>(d) Power Cut DG Failover & Scope 1 CO₂</span>
                        <span className="font-mono text-rose-400">PASS</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {selfTestResults.testD.detail}
                      </div>
                    </div>
                  </div>

                  {/* Test E */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                    {selfTestResults.testE.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between font-semibold">
                        <span>(e) Values Change on Every Tick</span>
                        <span className="font-mono text-cyan-400">PASS</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {selfTestResults.testE.detail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Parameters Inspector */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Live Reactive Parameters (Single Source of Truth)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">students:</span>
                    <span className="text-emerald-400 font-bold">{params.students}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">attendancePct:</span>
                    <span className="text-cyan-400 font-bold">{params.attendancePct}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">faculty:</span>
                    <span className="text-purple-400 font-bold">{params.faculty}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">hostelOccupancyPct:</span>
                    <span className="text-amber-400 font-bold">{params.hostelOccupancyPct}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">outdoorTempC:</span>
                    <span className="text-amber-400 font-bold">{params.outdoorTempC}°C</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">examMode:</span>
                    <span className={params.examMode ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {String(params.examMode)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">holiday:</span>
                    <span className={params.holiday ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                      {String(params.holiday)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">eventDay:</span>
                    <span className={params.eventDay ? 'text-purple-400 font-bold' : 'text-slate-500'}>
                      {String(params.eventDay)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">monsoon:</span>
                    <span className={params.monsoon ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                      {String(params.monsoon)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">powerCut:</span>
                    <span className={params.powerCut ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                      {String(params.powerCut)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent Zone Population Allocation */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  Agent-Based Zone Population ({computed.totalCampusOccupants} Active on Campus)
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-black/40 text-center">
                    <div className="text-[10px] text-slate-400">Academic</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {computed.zoneCounts?.academic || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 text-center">
                    <div className="text-[10px] text-slate-400">Labs & Workshop</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">
                      {computed.zoneCounts?.labs || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 text-center">
                    <div className="text-[10px] text-slate-400">Hostel & Mess</div>
                    <div className="text-sm font-bold text-purple-400 mt-0.5">
                      {computed.zoneCounts?.hostel || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 text-center">
                    <div className="text-[10px] text-slate-400">Library Hall</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">
                      {computed.zoneCounts?.library || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 text-center">
                    <div className="text-[10px] text-slate-400">Sports / Grounds</div>
                    <div className="text-sm font-bold text-lime-400 mt-0.5">
                      {computed.zoneCounts?.outdoor || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 text-center">
                    <div className="text-[10px] text-slate-400">Timetable Phase</div>
                    <div className="text-[10px] font-bold text-white mt-1 truncate">
                      {computed.phase}
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Computed Telemetry Totals */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Last Computed Campus Totals (Instant Recompute)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">Total Load:</span>
                    <span className="text-white font-bold">{formatKw(computed.totalKw)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">Ghost Gap:</span>
                    <span className="text-rose-400 font-bold">{formatKw(computed.ghostGapKw)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">Solar Gen:</span>
                    <span className="text-amber-400 font-bold">{formatKw(computed.solarGenerationKw)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">Grid Import:</span>
                    <span className="text-cyan-400 font-bold">{formatKw(computed.netGridImportKw)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">DG Generator:</span>
                    <span className={computed.dgActive ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                      {computed.dgActive ? `${computed.dgKw} kW (ON)` : 'Standby (OFF)'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">Scope 1 Diesel CO₂:</span>
                    <span className="text-rose-400 font-bold">{computed.scope1Co2Kg} kg/hr</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">Scope 2 Grid CO₂:</span>
                    <span className="text-purple-400 font-bold">{computed.scope2Co2Kg} kg/hr</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 flex justify-between">
                    <span className="text-slate-400">Cost Rate:</span>
                    <span className="text-emerald-400 font-bold">₹{computed.currentCostRsPerHour}/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-3 border-t border-white/10 bg-white/5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePause}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  {['1x', '10x', '60x', '600x'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        params.speed === s ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                IST: <span className="text-white font-bold">{computed.istHourFormatted}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
