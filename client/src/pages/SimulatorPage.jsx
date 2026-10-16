import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingDown,
  Sun,
  CloudRain,
  Zap,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Layers,
  Activity,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore.js';
import { formatINR, formatKw, formatCo2, formatNumberIN, sounds } from '../lib/utils.js';

export default function SimulatorPage() {
  const {
    params,
    computed,
    simTime,
    tick,
    isPaused,
    baselineSnapshot,
    setParam,
    setPreset,
    setSpeed,
    togglePause,
    snapshotBaseline
  } = useSimulationStore();

  const [activePreset, setActivePreset] = useState('Normal Weekday');
  const [maxStudentCap, setMaxStudentCap] = useState(1000); // toggle to 5000 for macro simulations

  // What-If Retrofit Interventions
  const [solarAdditionKwp, setSolarAdditionKwp] = useState(50);
  const [acRetrofitFiveStar, setAcRetrofitFiveStar] = useState(false);
  const [occupancyLightingSensors, setOccupancyLightingSensors] = useState(true);

  const presets = [
    'Normal Weekday',
    'Exam Week',
    'Weekend',
    'Fest Day (Events)'
  ];

  const handlePresetSelect = (presetName) => {
    setActivePreset(presetName);
    sounds.playChime('bubble');
    setPreset(presetName);

    // Sync with server if online
    fetch('/api/telemetry/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: presetName })
    }).catch(() => {});
  };

  const handleSliderUpdate = (key, value) => {
    setParam(key, value);
    // Sync with server if online
    fetch('/api/telemetry/slider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    }).catch(() => {});
  };

  // Deltas against baseline snapshot
  const deltaKw = parseFloat((computed.totalKw - baselineSnapshot.totalKw).toFixed(2));
  const deltaKwh = computed.kwhToday - baselineSnapshot.kwhToday;
  const deltaCostRs = computed.costRs - baselineSnapshot.costRs;
  const deltaCo2Kg = computed.co2Kg - baselineSnapshot.co2Kg;

  // What-If Retrofit Intervention Savings Calculations derived from current simulated load
  let retrofitSavingsKwh = 0;
  if (solarAdditionKwp > 0) retrofitSavingsKwh += solarAdditionKwp * 4.2;
  if (acRetrofitFiveStar) retrofitSavingsKwh += Math.round(computed.totalKw * 0.16 * 8);
  if (occupancyLightingSensors) retrofitSavingsKwh += Math.round(computed.ghostGapKw * 0.45 * 8);

  const retrofitSavingsRs = Math.round(retrofitSavingsKwh * 8.25);
  const retrofitCo2Avoided = Math.round(retrofitSavingsKwh * 0.71);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header with Live Simulation Clock */}
      <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Campus Population & What-If Simulator
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Agent-Based College Schedule & Energy Modeling
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Timetable periods, classroom occupancy dynamics, and macro retrofit forecasting
          </p>
        </div>

        {/* Clock & Speed Controller */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/50 border border-white/10">
            <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono leading-none">Simulation IST</span>
              <span className="font-mono text-xs font-bold text-white mt-0.5">
                {computed.istHourFormatted}
              </span>
            </div>
          </div>

          <button
            onClick={togglePause}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
            {['1x', '10x', '60x', '600x'].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono transition ${
                  params.speed === spd
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>

          <button
            onClick={snapshotBaseline}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Snapshot current state as baseline for comparison"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Scenario Presets Pill Row */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl glass-panel bg-white/5 border border-white/10">
        <span className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          Presets:
        </span>
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => handlePresetSelect(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activePreset === p
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Real-time Timetable Phase Banner */}
      <div className="px-4 py-2.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300">Timetable Period:</span>
          <span className="text-cyan-300 font-bold uppercase">{computed.phase}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Active Agents: <strong className="text-white">{computed.totalCampusOccupants}</strong></span>
          <span>Classrooms: <strong className="text-emerald-400">{computed.zoneCounts?.academic || 0}</strong></span>
          <span>Labs: <strong className="text-cyan-400">{computed.zoneCounts?.labs || 0}</strong></span>
          <span>Hostel: <strong className="text-purple-400">{computed.zoneCounts?.hostel || 0}</strong></span>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Before vs After & Retrofits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Population and Weather Dynamic Sliders */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Dynamic Population & Environmental Drivers
              </h3>

              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-slate-400">Cap:</span>
                <button
                  onClick={() => setMaxStudentCap(1000)}
                  className={`px-2 py-0.5 rounded ${maxStudentCap === 1000 ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-500'}`}
                >
                  1K
                </button>
                <button
                  onClick={() => setMaxStudentCap(5000)}
                  className={`px-2 py-0.5 rounded ${maxStudentCap === 5000 ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-500'}`}
                >
                  5K
                </button>
              </div>
            </div>

            {/* Students Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Students Present on Campus</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {formatNumberIN(params.students)} Students
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={maxStudentCap}
                step={maxStudentCap > 1000 ? '50' : '25'}
                value={params.students}
                onChange={(e) => handleSliderUpdate('students', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (Vacation)</span>
                <span>{formatNumberIN(maxStudentCap / 2)} (Half Day)</span>
                <span>{formatNumberIN(maxStudentCap)} (Full Campus)</span>
              </div>
            </div>

            {/* Attendance % */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Lecture Attendance Ratio</span>
                <span className="font-mono text-cyan-400 font-bold">{params.attendancePct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={params.attendancePct}
                onChange={(e) => handleSliderUpdate('attendancePct', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Faculty & Staff Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Faculty & Staff Present</span>
                <span className="font-mono text-purple-400 font-bold">{params.faculty}</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={params.faculty}
                onChange={(e) => handleSliderUpdate('faculty', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Hostel Occupancy % */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Boys & Girls Hostel Occupancy</span>
                <span className="font-mono text-indigo-400 font-bold">{params.hostelOccupancyPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={params.hostelOccupancyPct}
                onChange={(e) => handleSliderUpdate('hostelOccupancyPct', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Ambient Outdoor Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Bengaluru Ambient Temperature</span>
                <span className="font-mono text-amber-400 font-bold">{params.outdoorTempC}°C</span>
              </div>
              <input
                type="range"
                min="15"
                max="40"
                step="0.5"
                value={params.outdoorTempC}
                onChange={(e) => handleSliderUpdate('outdoorTempC', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>15°C (Morning)</span>
                <span>27°C (Bengaluru Mean)</span>
                <span>38°C (Peak Afternoon)</span>
              </div>
            </div>

            {/* Operational Toggles: Exam Mode & Campus Event */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleSliderUpdate('examMode', !params.examMode)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition ${
                  params.examMode
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>Exam Mode</span>
                <span className={`w-2 h-2 rounded-full ${params.examMode ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}`} />
              </button>

              <button
                onClick={() => handleSliderUpdate('eventDay', !params.eventDay)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition ${
                  params.eventDay
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>Fest / Event Mode</span>
                <span className={`w-2 h-2 rounded-full ${params.eventDay ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Visible Before vs After Panel & What-If Interventions */}
        <div className="lg:col-span-6 space-y-4">
          {/* HARD REQUIREMENT 8: Visible Before vs After Panel */}
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Before vs After Delta Comparison
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Baseline Snapshot Active
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Live variance as parameters change against the snapshotted baseline.
            </p>

            {/* Delta KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-mono">
              {/* Load kW Delta */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-sans">Active Load</span>
                <div className="text-base font-bold text-white mt-1">
                  {formatKw(computed.totalKw)}
                </div>
                <div
                  className={`text-[11px] font-bold mt-1 ${
                    deltaKw > 0 ? 'text-amber-400' : deltaKw < 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {deltaKw > 0 ? `+${deltaKw}` : deltaKw} kW
                </div>
              </div>

              {/* Energy kWh Today Delta */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-sans">Energy Today</span>
                <div className="text-base font-bold text-cyan-400 mt-1">
                  {computed.kwhToday} kWh
                </div>
                <div
                  className={`text-[11px] font-bold mt-1 ${
                    deltaKwh > 0 ? 'text-amber-400' : deltaKwh < 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {deltaKwh > 0 ? `+${deltaKwh}` : deltaKwh} kWh
                </div>
              </div>

              {/* Cost Rs Delta */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-sans">Cost (BESCOM)</span>
                <div className="text-base font-bold text-emerald-400 mt-1">
                  {formatINR(computed.costRs)}
                </div>
                <div
                  className={`text-[11px] font-bold mt-1 ${
                    deltaCostRs > 0 ? 'text-amber-400' : deltaCostRs < 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {deltaCostRs > 0 ? `+₹${deltaCostRs}` : deltaCostRs}
                </div>
              </div>

              {/* CO2 Delta */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-sans">Carbon Total</span>
                <div className="text-base font-bold text-purple-400 mt-1">
                  {computed.co2Kg} kg
                </div>
                <div
                  className={`text-[11px] font-bold mt-1 ${
                    deltaCo2Kg > 0 ? 'text-amber-400' : deltaCo2Kg < 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {deltaCo2Kg > 0 ? `+${deltaCo2Kg}` : deltaCo2Kg} kg
                </div>
              </div>
            </div>

            {/* Grid vs DG Failover Status Indicator */}
            {computed.dgActive ? (
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
                  <span>
                    <strong>DG Failover Engaged:</strong> 500 kVA Diesel Generator supplying {computed.dgKw} kW.
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-200">
                  {computed.dieselLitersPerHour} L/hr (Scope 1: {computed.scope1Co2Kg} kg CO₂/hr)
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>BESCOM Grid Normal:</strong> Net import is {computed.netGridImportKw} kW (Tariff: ₹8.25/kWh).
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-200">
                  Solar Offset: {computed.solarGenerationKw} kW
                </span>
              </div>
            )}
          </div>

          {/* What-If Retrofit Interventions */}
          <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              What-If Energy Retrofit Interventions
            </h3>

            {/* Slider: Add Solar Capacity */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Additional Rooftop Solar PV</span>
                <span className="font-mono text-amber-400 font-bold">+{solarAdditionKwp} kWp</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="10"
                value={solarAdditionKwp}
                onChange={(e) => setSolarAdditionKwp(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Toggle: 5-Star Inverter AC Upgrade */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5">
              <div>
                <div className="text-xs font-semibold text-white">Upgrade Labs to 5-Star Inverter ACs</div>
                <div className="text-[10px] text-slate-400">Replaces fixed-speed 2.0T units with high-ISEER VRF</div>
              </div>
              <input
                type="checkbox"
                checked={acRetrofitFiveStar}
                onChange={(e) => setAcRetrofitFiveStar(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Toggle: Occupancy PIR Sensors */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5">
              <div>
                <div className="text-xs font-semibold text-white">Install Smart Room Occupancy Relays</div>
                <div className="text-[10px] text-slate-400">Automated cut on 10 min zero occupancy in classrooms</div>
              </div>
              <input
                type="checkbox"
                checked={occupancyLightingSensors}
                onChange={(e) => setOccupancyLightingSensors(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Retrofit Outcome Card */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 mt-4">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>Intervention Daily Savings Potential</span>
                <span className="font-mono font-bold text-white">BESCOM: ₹8.25/kWh</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-black/50">
                  <div className="text-[10px] text-slate-400 font-sans">Daily Savings</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {formatINR(retrofitSavingsRs)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50">
                  <div className="text-[10px] text-slate-400 font-sans">Power Avoided</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">
                    {retrofitSavingsKwh} kWh
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50">
                  <div className="text-[10px] text-slate-400 font-sans">CO₂ Offset</div>
                  <div className="text-sm font-bold text-purple-400 mt-0.5">
                    {retrofitCo2Avoided} kg
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Building-by-Building Dynamic Energy Breakdown */}
      <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Building Telemetry Grid ({computed.totalKw} kW Total)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Ghost Gap Total: <strong className="text-rose-400">{computed.ghostGapKw} kW</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(computed.perBuildingKw || {}).map((b) => (
            <div
              key={b.buildingId}
              className={`p-4 rounded-2xl border transition-all ${
                b.alert === 'warning'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-black/30 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{b.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Occupants: <strong className="text-emerald-400">{b.occupancy}</strong> • Temp: {b.thermalC}°C
                  </p>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    b.gapKw > 2.0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {formatKw(b.realKw)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono pt-2 border-t border-white/5">
                <span className="text-slate-400">Ideal Baseline: {formatKw(b.ghostKw)}</span>
                <span className={`font-bold ${b.gapKw > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                  Waste Gap: {formatKw(b.gapKw)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
