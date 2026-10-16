import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Users,
  Flame,
  Sun,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Info,
  Shield,
  Layers,
  Edit3,
  MapPin,
  Camera,
  BatteryCharging
} from 'lucide-react';
import { formatINR, formatKw, sounds } from '../../lib/utils.js';
import TraceMode from './TraceMode.jsx';
import defaultHotspots from '../../config/campus-hotspots.json';

export default function CampusMap2D({
  activeOverlay = 'HEATMAP',
  telemetry,
  onSelectBuilding
}) {
  const [hotspots, setHotspots] = useState(defaultHotspots.buildings || []);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Pan & Zoom Viewport Transform
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Admin Trace Mode State (Fix 3.1)
  const [isTraceMode, setIsTraceMode] = useState(false);
  const [traceBuildingId, setTraceBuildingId] = useState(defaultHotspots.buildings[0]?.id || 'dsatm-main');

  // Handle Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setTransform((prev) => {
      const nextScale = Math.min(Math.max(prev.scale * zoomFactor, 0.75), 4.0);
      return { ...prev, scale: nextScale };
    });
  };

  // Mouse Drag to Pan
  const handleMouseDown = (e) => {
    if (isTraceMode) return; // Don't pan while tracing
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset View
  const handleResetView = () => {
    setTransform({ scale: 1, x: 0, y: 0 });
    sounds.playChime('bubble');
  };

  // Trace Mode Click Handler (Fix 3.1)
  const handleImageClick = (e) => {
    if (!isTraceMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2));
    const yPct = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2));

    setHotspots((prev) =>
      prev.map((b) => {
        if (b.id === traceBuildingId) {
          const currentPts = b.percentagePolygon || [];
          return { ...b, percentagePolygon: [...currentPts, [xPct, yPct]] };
        }
        return b;
      })
    );
    sounds.playChime('bubble');
  };

  // Helper: Get Building Live Data from Telemetry
  const getBuildingTelemetry = (id) => {
    let fromTel = null;
    if (telemetry?.buildings) {
      if (Array.isArray(telemetry.buildings)) {
        fromTel = telemetry.buildings.find((b) => b.id === id || b.buildingId === id);
      } else if (typeof telemetry.buildings === 'object') {
        fromTel = telemetry.buildings[id] || Object.values(telemetry.buildings).find((b) => b?.id === id || b?.buildingId === id);
      }
    }
    const base = hotspots.find((b) => b.id === id);
    const realKw = fromTel?.realKw || base?.baselineKw || 40;
    const ghostKw = fromTel?.ghostKw || (base?.baselineKw ? base.baselineKw * 0.75 : 30);
    const wasteGapKw = Math.max(0, Number((realKw - ghostKw).toFixed(1)));
    const occupants = fromTel?.occupants ?? fromTel?.occupancy ?? 120;
    const hasAnomaly = (telemetry?.ghostAnomalies || []).some((a) => a.roomId?.startsWith(id) || id === 'dsatm-main');

    return {
      realKw,
      ghostKw,
      wasteGapKw,
      occupants,
      hasAnomaly,
      costRsPerHour: Math.round(realKw * 8.25),
      co2KgPerHour: Number((realKw * 0.71).toFixed(1))
    };
  };

  // Helper: Compute Heat Color for Building Polygon
  const getPolygonStyle = (building) => {
    const data = getBuildingTelemetry(building.id);
    const isHovered = hoveredBuilding?.id === building.id;

    if (activeOverlay === 'HEATMAP') {
      const ratio = data.realKw / (data.ghostKw || 1);
      let fillColor = 'rgba(16, 185, 129, 0.45)'; // emerald
      let strokeColor = '#10b981';
      if (ratio > 1.35) {
        fillColor = 'rgba(244, 63, 94, 0.65)'; // rose
        strokeColor = '#f43f5e';
      } else if (ratio > 1.1) {
        fillColor = 'rgba(245, 158, 11, 0.55)'; // amber
        strokeColor = '#f59e0b';
      }
      return {
        fill: isHovered ? fillColor.replace(/[\d\.]+\)$/, '0.85)') : fillColor,
        stroke: strokeColor,
        strokeWidth: isHovered ? 4 : 2
      };
    }

    if (activeOverlay === 'SOLAR') {
      return {
        fill: building.solarCapacityKw > 0 ? 'rgba(251, 191, 36, 0.5)' : 'rgba(30, 41, 59, 0.4)',
        stroke: building.solarCapacityKw > 0 ? '#f59e0b' : '#64748b',
        strokeWidth: isHovered ? 3 : 1.5
      };
    }

    if (activeOverlay === 'OCCUPANCY') {
      const occ = data.occupants;
      const alpha = Math.min(0.8, Math.max(0.2, occ / 400));
      return {
        fill: `rgba(6, 182, 212, ${alpha})`,
        stroke: '#06b6d4',
        strokeWidth: isHovered ? 3 : 1.5
      };
    }

    // Default neutral blueprint styling
    return {
      fill: isHovered ? 'rgba(56, 189, 248, 0.5)' : 'rgba(56, 189, 248, 0.25)',
      stroke: '#38bdf8',
      strokeWidth: isHovered ? 3 : 2
    };
  };

  // Convert percentage polygon points to SVG points string
  const formatPolygonPoints = (pts) => {
    if (!pts || pts.length === 0) return '';
    return pts.map(([x, y]) => `${x * 16},${y * 10}`).join(' ');
  };

  // Calculate polygon centroid for overlay badge placement
  const getPolygonCentroid = (pts) => {
    if (!pts || pts.length === 0) return { x: 50, y: 50 };
    const sum = pts.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
    return {
      x: sum[0] / pts.length,
      y: sum[1] / pts.length
    };
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full bg-[#070B14] overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      {/* Zoom Controls & Admin Trace Mode Toggle */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2">
        <button
          onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.25, 4.0) }))}
          className="p-2.5 rounded-xl glass-panel bg-black/60 hover:bg-black/90 text-white border border-white/15 transition shadow-xl"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.75) }))}
          className="p-2.5 rounded-xl glass-panel bg-black/60 hover:bg-black/90 text-white border border-white/15 transition shadow-xl"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2.5 rounded-xl glass-panel bg-black/60 hover:bg-black/90 text-white border border-white/15 transition shadow-xl"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
        <button
          onClick={() => {
            setIsTraceMode(!isTraceMode);
            sounds.playChime('chime');
          }}
          className={`p-2.5 rounded-xl border transition shadow-xl ${
            isTraceMode
              ? 'bg-cyan-500 text-black border-cyan-400 shadow-cyan-500/30'
              : 'glass-panel bg-black/60 hover:bg-black/90 text-slate-300 border-white/15'
          }`}
          title="Toggle Admin Trace Mode"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Admin Trace Mode Panel */}
      <TraceMode
        isActive={isTraceMode}
        onClose={() => setIsTraceMode(false)}
        buildings={hotspots}
        activeBuildingId={traceBuildingId}
        setActiveBuildingId={setTraceBuildingId}
      />

      {/* Interactive Map Transform Canvas */}
      <div
        className="relative origin-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          width: '1600px',
          height: '1000px',
          margin: 'auto'
        }}
        onClick={handleImageClick}
      >
        {/* Base Layer: Real DSATM Map Graphic (Fix 3.1) */}
        <img
          src="/dsatm-map.png"
          alt="Dayananda Sagar Academy of Technology and Management Campus Map"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-3xl shadow-2xl"
          onError={(e) => {
            // Fallback SVG if image not yet loaded
            e.target.style.display = 'none';
          }}
        />

        {/* SVG Polygon Overlay Layer (Fix 3.1 & 3.2) */}
        <svg
          viewBox="0 0 1600 1000"
          className="absolute inset-0 w-full h-full pointer-events-auto"
        >
          {hotspots.map((building) => {
            const style = getPolygonStyle(building);
            const data = getBuildingTelemetry(building.id);
            const pts = formatPolygonPoints(building.percentagePolygon);

            return (
              <g
                key={building.id}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={(e) => {
                  setHoveredBuilding(building);
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                  sounds.playChime('bubble');
                }}
                onMouseMove={(e) => {
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredBuilding(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playChime('success');
                  if (onSelectBuilding) onSelectBuilding(building);
                }}
              >
                {/* Clickable Building Footprint Polygon */}
                <polygon
                  points={pts}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  className="filter drop-shadow-md transition-all duration-200 hover:filter-none"
                />

                {/* Pulsating Red Ring on Ghost-Gap Anomaly (Fix 3.2) */}
                {data.hasAnomaly && (
                  <polygon
                    points={pts}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth={4}
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* HTML Badges & Icons Overlay Layer (Fix 3.2 & 3.4) */}
        {hotspots.map((building) => {
          const centroid = getPolygonCentroid(building.percentagePolygon);
          const data = getBuildingTelemetry(building.id);

          return (
            <div
              key={`badge-${building.id}`}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center select-none"
              style={{ left: `${centroid.x}%`, top: `${centroid.y}%` }}
            >
              {/* Building Label Tag (Fix 3.4) */}
              <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-lg whitespace-nowrap flex items-center gap-1">
                <span>{building.shortName || building.name}</span>
                {building.assumedLocation && (
                  <span className="text-[9px] text-amber-400 font-mono">(Assumed)</span>
                )}
              </div>

              {/* Dynamic Overlay Badges */}
              <div className="flex items-center gap-1 mt-1">
                {activeOverlay === 'HEATMAP' && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    data.wasteGapKw > 10
                      ? 'bg-rose-500/80 text-white'
                      : data.wasteGapKw > 5
                      ? 'bg-amber-500/80 text-black'
                      : 'bg-emerald-500/80 text-black'
                  }`}>
                    {data.realKw} kW
                  </span>
                )}

                {activeOverlay === 'OCCUPANCY' && (
                  <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/80 text-black text-[10px] font-mono font-bold flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    <span>{data.occupants}</span>
                  </span>
                )}

                {activeOverlay === 'SOLAR' && building.solarCapacityKw > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/80 text-black text-[10px] font-mono font-bold flex items-center gap-1">
                    <Sun className="w-2.5 h-2.5" />
                    <span>{building.solarCapacityKw} kW</span>
                  </span>
                )}

                {/* Ghost Waste Warning Badge */}
                {data.wasteGapKw > 0 && activeOverlay === 'HEATMAP' && (
                  <span className="px-1 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[9px] font-mono animate-pulse">
                    +{data.wasteGapKw} kW waste
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Tooltip (Fix 3.2) */}
      {hoveredBuilding && (
        <div
          className="fixed z-40 pointer-events-none p-3.5 rounded-2xl bg-[#0B101D]/95 border border-white/20 text-xs text-white shadow-2xl backdrop-blur-xl space-y-1.5 min-w-[220px]"
          style={{
            left: Math.min(tooltipPos.x + 15, window.innerWidth - 260),
            top: Math.min(tooltipPos.y + 15, window.innerHeight - 200)
          }}
        >
          <div className="font-bold text-sm text-cyan-400">
            {hoveredBuilding.label || hoveredBuilding.name}
          </div>
          <div className="text-[10px] text-slate-400">
            {hoveredBuilding.department} • {hoveredBuilding.floors} Floors
          </div>

          <div className="border-t border-white/10 pt-2 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Real Power:</span>
              <span className="font-bold text-white">
                {getBuildingTelemetry(hoveredBuilding.id).realKw} kW
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Ghost Gap:</span>
              <span className={`font-bold ${getBuildingTelemetry(hoveredBuilding.id).wasteGapKw > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {getBuildingTelemetry(hoveredBuilding.id).wasteGapKw} kW
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Hourly Cost:</span>
              <span className="font-bold text-amber-400">
                ₹{getBuildingTelemetry(hoveredBuilding.id).costRsPerHour}/hr
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Occupants:</span>
              <span className="font-bold text-cyan-300">
                {getBuildingTelemetry(hoveredBuilding.id).occupants}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic pt-1">
            Click building footprint to inspect circuits & devices
          </div>
        </div>
      )}
    </div>
  );
}
