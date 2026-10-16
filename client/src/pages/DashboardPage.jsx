import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Activity,
  Layers,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Sun,
  ShieldCheck,
  LifeBuoy,
  Users,
  Compass,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Clock,
  Map,
  Box,
  RotateCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useCampusStore } from '../store/useCampusStore.js';
import { useIslandStore } from '../store/useIslandStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { formatINR, formatKw, formatCo2, formatNumberIN, sounds } from '../lib/utils.js';
import CampusMap2D from '../components/campus/CampusMap2D.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import campusConfig from '../config/campus.json';

const CampusTwin3D = lazy(() => import('../components/campus3d/CampusTwin3D.jsx'));

export default function DashboardPage({ onOpenMasterSwitch, onOpenReportModal }) {
  const { user } = useAuthStore();
  const { telemetry, activeOverlay, setOverlay } = useCampusStore();
  const { pushEvent } = useIslandStore();
  const [historyData, setHistoryData] = useState([]);
  const [twinMode, setTwinMode] = useState('2D'); // '2D' (default) | '3D'

  // Fetch real-time telemetry history for charts
  useEffect(() => {
    fetch('/api/telemetry/history')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setHistoryData(json.data);
      })
      .catch(() => {});
  }, []);

  const campus = telemetry?.campus || {
    totalRealKw: 154.2,
    totalGhostKw: 118.6,
    ghostGapKw: 35.6,
    solarGenerationKw: 78.4,
    netGridImportKw: 75.8,
    carbonIntensityKgPerHr: 53.8,
    currentCostRsPerHr: 625.3,
    demandUtilizationPct: 20.5
  };

  const population = telemetry?.population || {
    studentsPresent: 650,
    totalCampusOccupancy: 885
  };

  const anomalies = telemetry?.ghostAnomalies || [];
  const savings = telemetry?.savingsTracker || { savedTodayRs: 4850, savedTodayKwh: 588, savedTodayCo2Kg: 417 };

  const handleBustGhost = async (anomaly) => {
    try {
      await fetch('/api/control/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: anomaly.deviceId, state: 'off' })
      });
      pushEvent({
        type: 'AUTO_CONTROL',
        title: 'Ghost Load Busted!',
        message: `Turned off ${anomaly.title}. Saved ${anomaly.wasteRsPerHour} Rs/hr.`,
        severity: 'info'
      });
      sounds.playChime('success');
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Top Header / Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-cyan-950/30 border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Microgrid Twin Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            DSATM Energy Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Udayapura, Kanakapura Main Road, Bengaluru • Powered by O(1) Outlaws AIML
          </p>
        </div>

        {/* Quick Master Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenMasterSwitch}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Campus Eco Switch</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/15 backdrop-blur-md flex items-center gap-1.5 transition"
          >
            <LifeBuoy className="w-4 h-4 text-rose-400" />
            <span>Report Waste</span>
          </button>
          <Link
            to="/coach"
            className="px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold text-xs border border-purple-500/30 flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Ask Aura AI</span>
          </Link>
        </div>
      </div>

      {/* Active Session Credentials Status Card (Guarantees visible login info) */}
      <div className="p-3.5 rounded-2xl glass-panel bg-emerald-950/20 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-sm shrink-0">
            <div className="w-full h-full bg-[#080C14] rounded-[10px] flex items-center justify-center font-bold text-emerald-300 text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs">{user?.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-500/30">
                {user?.role || 'HOD'}
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-mono truncate">
              ✉️ {user?.email} • 🏛️ {user?.department}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
          <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Session Verified</span>
          </span>
        </div>
      </div>

      {/* KPI Telemetry Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Real Draw */}
        <div className="p-4 rounded-2xl glass-panel bg-white/5 border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Real Draw</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1.5">
            {formatKw(campus.totalRealKw)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Grid + Solar Combined</div>
        </div>

        {/* Ghost Ideal */}
        <div className="p-4 rounded-2xl glass-panel bg-white/5 border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Ghost Ideal</span>
            <Compass className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-bold text-blue-400 mt-1.5">
            {formatKw(campus.totalGhostKw)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Occupancy Baseline</div>
        </div>

        {/* Waste Gap */}
        <div className="p-4 rounded-2xl glass-panel bg-rose-500/5 border border-rose-500/20">
          <div className="text-[11px] font-medium text-rose-300 flex items-center justify-between">
            <span>Waste Gap</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-mono font-bold text-rose-400 mt-1.5">
            {formatKw(campus.ghostGapKw)}
          </div>
          <div className="text-[10px] text-rose-300/70 mt-1 font-mono">
            {formatINR(Math.round(campus.ghostGapKw * 8.25))}/h loss
          </div>
        </div>

        {/* Rooftop Solar */}
        <div className="p-4 rounded-2xl glass-panel bg-amber-500/5 border border-amber-500/20">
          <div className="text-[11px] font-medium text-amber-300 flex items-center justify-between">
            <span>Rooftop Solar</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1.5">
            {formatKw(campus.solarGenerationKw)}
          </div>
          <div className="text-[10px] text-amber-300/70 mt-1">3 Campus Arrays</div>
        </div>

        {/* Hourly Cost */}
        <div className="p-4 rounded-2xl glass-panel bg-white/5 border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Current Cost</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1.5">
            {formatINR(campus.currentCostRsPerHr)}/h
          </div>
          <div className="text-[10px] text-slate-500 mt-1">BESCOM HT-2 Tariff</div>
        </div>

        {/* Carbon Intensity */}
        <div className="p-4 rounded-2xl glass-panel bg-white/5 border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Carbon Rate</span>
            <Flame className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-mono font-bold text-purple-300 mt-1.5">
            {campus.carbonIntensityKgPerHr} <span className="text-xs font-normal">kg/h</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">0.71 kg CO₂e/kWh</div>
        </div>
      </div>

      {/* Main Split Grid: Interactive Campus Twin (Left) & Real vs Ghost Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Campus Twin Interactive View with 2D / 3D Toggle */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                DSATM Digital Twin
              </h3>
              {/* 2D vs 3D Switcher */}
              <div className="flex items-center bg-white/5 p-0.5 rounded-xl border border-white/10 ml-2">
                <button
                  onClick={() => { setTwinMode('2D'); sounds.playChime('bubble'); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                    twinMode === '2D'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Map className="w-3 h-3" />
                  <span>2D Map</span>
                </button>
                <button
                  onClick={() => { setTwinMode('3D'); sounds.playChime('bubble'); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                    twinMode === '3D'
                      ? 'bg-cyan-500 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  <span>3D View</span>
                </button>
              </div>
            </div>

            <Link
              to="/campus"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Full Screen Twin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-[430px] w-full rounded-3xl overflow-hidden glass-panel border border-white/15 relative">
            <ErrorBoundary
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#070B14]">
                  <p className="text-xs text-amber-300 font-medium">3D view requires WebGL. Showing 2D Map Twin.</p>
                  <button
                    onClick={() => setTwinMode('2D')}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Switch to 2D Map
                  </button>
                </div>
              }
            >
              {twinMode === '2D' ? (
                <CampusMap2D activeOverlay={activeOverlay} />
              ) : (
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center bg-[#070B14] text-xs text-slate-400 gap-2">
                      <RotateCw className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Loading 3D Campus Scene...</span>
                    </div>
                  }
                >
                  <CampusTwin3D />
                </Suspense>
              )}
            </ErrorBoundary>
          </div>
        </div>

        {/* Right: Real vs Ghost Telemetry Chart & Ghosts List */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Real vs Ghost 14-Day Recharts Curve */}
          <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-white">Real vs Ideal Ghost Twin</h3>
                <p className="text-[10px] text-slate-400">14-Day Microgrid Telemetry (kWh)</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Real
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Ideal Ghost
                </span>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGhost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="dayLabel" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#ffffff20', borderRadius: '12px' }}
                    formatter={(val) => [`${formatNumberIN(val)} kWh`]}
                  />
                  <Area type="monotone" dataKey="realKwh" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorReal)" />
                  <Area type="monotone" dataKey="ghostKwh" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorGhost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Energy Ghosts Detected */}
          <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Active Energy Ghosts ({anomalies.length})
              </h3>
              <span className="text-[10px] text-slate-400">Automated CV & Telemetry</span>
            </div>

            <div className="space-y-2">
              {anomalies.slice(0, 2).map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-rose-300 truncate">{anomaly.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Wasting: {anomaly.wasteWatts}W • {formatINR(anomaly.wasteRsPerHour)}/h
                    </p>
                  </div>
                  <button
                    onClick={() => handleBustGhost(anomaly)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow transition active:scale-95 shrink-0"
                  >
                    Bust Ghost
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Buildings Telemetry Cards Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Campus Blocks Breakdown
          </h3>
          <span className="text-xs text-slate-400">Total Sanctioned: 750 kVA BESCOM HT</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {campusConfig.campus.buildings.slice(0, 4).map((b) => {
            const bData = telemetry?.buildings?.[b.id] || { realKw: 32, gapKw: 4, occupancy: 120 };
            return (
              <div
                key={b.id}
                className="p-4 rounded-3xl glass-panel bg-white/5 border border-white/10 hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[150px]">{b.shortCode || b.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    bData.gapKw > 10 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {bData.gapKw > 10 ? 'Waste Alert' : 'Normal'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-black/40">
                    <div className="text-[10px] text-slate-400 font-sans">Power Draw</div>
                    <div className="font-bold text-white mt-0.5">{bData.realKw} kW</div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40">
                    <div className="text-[10px] text-slate-400 font-sans">Occupancy</div>
                    <div className="font-bold text-cyan-400 mt-0.5">{bData.occupancy} people</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
