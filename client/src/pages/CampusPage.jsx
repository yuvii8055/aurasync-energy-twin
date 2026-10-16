import React, { useState, Suspense, lazy } from 'react';
import {
  Layers,
  Map,
  Box,
  Compass,
  Zap,
  Flame,
  Sun,
  Users,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  ChevronRight,
  X,
  Power,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import CampusMap2D from '../components/campus/CampusMap2D.jsx';
import { useCampusStore } from '../store/useCampusStore.js';
import { useSimulationStore } from '../store/useSimulationStore.js';
import { formatINR, formatKw, sounds } from '../lib/utils.js';

// Lazy-load MapLibre 3D and Legacy 3D for zero performance penalty on load (Fix 3.6)
const CampusMap3D = lazy(() => import('../components/campus/CampusMap3D.jsx'));
const CampusTwin3D = lazy(() => import('../components/campus3d/CampusTwin3D.jsx'));

export default function CampusPage() {
  const {
    activeOverlay,
    setOverlay,
    telemetry
  } = useCampusStore();

  const simulationStore = useSimulationStore();

  // View Mode: '2D' (default) | '3D_MAP' | '3D_LEGACY' (Fix 3.1 & 3.5)
  const [viewMode, setViewMode] = useState('2D');
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const overlays = [
    { id: 'HEATMAP', label: 'Live Power Heatmap', color: 'text-rose-400' },
    { id: 'OCCUPANCY', label: 'Occupancy Flow', color: 'text-cyan-400' },
    { id: 'SOLAR', label: 'Solar Rooftops', color: 'text-amber-400' }
  ];

  const handleDeviceToggle = async (deviceId, currentState) => {
    const nextState = currentState === 'on' ? 'off' : 'on';
    sounds.playChime('bubble');
    try {
      await fetch('/api/control/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, state: nextState })
      });

      if (selectedBuilding && selectedBuilding.devices) {
        selectedBuilding.devices.forEach((d) => {
          if (d.id === deviceId) d.state = nextState;
        });
        setSelectedBuilding({ ...selectedBuilding });
      }
      sounds.playChime('success');
    } catch {}
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden flex flex-col bg-[#070B14]">
      {/* Top Floating Controls Strip: View Modes & Active Overlays */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {/* View Mode Toggle: 2D (Default) vs 3D Map vs Abstract 3D (Fix 3.1 & 3.5) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl glass-panel bg-[#0B0F19]/90 border border-white/20 backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => {
              setViewMode('2D');
              sounds.playChime('bubble');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === '2D'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>2D Map Twin (Default)</span>
          </button>

          <button
            onClick={() => {
              setViewMode('3D_MAP');
              sounds.playChime('bubble');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === '3D_MAP'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D MapLibre (Real Coordinates)</span>
          </button>

          <button
            onClick={() => {
              setViewMode('3D_LEGACY');
              sounds.playChime('bubble');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === '3D_LEGACY'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Abstract 3D</span>
          </button>
        </div>

        {/* Overlay Layers Selector */}
        {viewMode === '2D' && (
          <div className="flex items-center gap-1 p-1 rounded-2xl glass-panel bg-[#0B0F19]/90 border border-white/20 backdrop-blur-xl shadow-2xl">
            {overlays.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setOverlay(o.id);
                  sounds.playChime('bubble');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeOverlay === o.id
                    ? 'bg-white/15 border border-white/20 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={o.color}>{o.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 w-full h-full relative">
        {viewMode === '2D' && (
          <CampusMap2D
            activeOverlay={activeOverlay}
            telemetry={telemetry}
            onSelectBuilding={(b) => setSelectedBuilding(b)}
          />
        )}

        {viewMode === '3D_MAP' && (
          <Suspense
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center space-y-3 text-cyan-400 font-mono text-xs">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Initializing MapLibre GL 3D Extrusion Engine...</span>
              </div>
            }
          >
            <CampusMap3D
              telemetry={telemetry}
              onSelectBuilding={(b) => setSelectedBuilding(b)}
            />
          </Suspense>
        )}

        {viewMode === '3D_LEGACY' && (
          <Suspense
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center space-y-3 text-purple-400 font-mono text-xs">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading Abstract 3D Canvas...</span>
              </div>
            }
          >
            <CampusTwin3D onSelectBuilding={(b) => setSelectedBuilding(b)} />
          </Suspense>
        )}
      </div>

      {/* Building Drill-Down Slide-over / Modal (Fix 3.2) */}
      {selectedBuilding && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[#0B101D]/95 border-l border-white/20 shadow-2xl backdrop-blur-2xl p-6 flex flex-col overflow-y-auto text-slate-100 animate-slideLeft">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Building Inspection
              </span>
              <h2 className="text-base font-bold text-white leading-tight">
                {selectedBuilding.label || selectedBuilding.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedBuilding.department} • {selectedBuilding.floors} Floors
              </p>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400">Baseline Load</span>
              <div className="text-base font-bold font-mono text-white">
                {selectedBuilding.baselineKw || 45} kW
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="text-[10px] text-amber-300">Rooftop Solar</span>
              <div className="text-base font-bold font-mono text-amber-400">
                {selectedBuilding.solarCapacityKw || 0} kW
              </div>
            </div>
          </div>

          {/* Device & Circuit Control List */}
          <div className="space-y-3 flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Connected Circuits & Sub-Meters</span>
              <span className="text-[10px] font-mono text-cyan-400">
                {selectedBuilding.devices?.length || 0} Circuits
              </span>
            </h3>

            <div className="space-y-2">
              {(selectedBuilding.devices || []).map((dev) => (
                <div
                  key={dev.id}
                  className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{dev.name}</span>
                      {dev.anomaly && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">
                          Ghost Waste
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {dev.type} • {dev.kw} kW draw
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeviceToggle(dev.id, dev.state)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                      dev.state === 'on'
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{dev.state === 'on' ? 'ACTIVE' : 'OFF'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-center">
            <button
              onClick={() => setSelectedBuilding(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs transition"
            >
              Done Inspecting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
