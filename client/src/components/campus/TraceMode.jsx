import React, { useState } from 'react';
import { Edit3, Check, Copy, Trash2, Plus, RotateCcw } from 'lucide-react';
import { sounds } from '../../lib/utils.js';

export default function TraceMode({
  isActive,
  onClose,
  buildings,
  activeBuildingId,
  setActiveBuildingId,
  onSaveHotspots
}) {
  if (!isActive) return null;

  const [copied, setCopied] = useState(false);
  const currentBuilding = buildings.find((b) => b.id === activeBuildingId);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(buildings, null, 2));
    setCopied(true);
    sounds.playChime('bubble');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-20 right-6 z-30 w-80 bg-[#0B101D]/95 border border-cyan-500/50 rounded-2xl shadow-2xl p-4 text-xs text-slate-200 backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-cyan-400">
          <Edit3 className="w-4 h-4" />
          <span>Polygon Trace Mode (Admin)</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed">
        Click on the DSATM map to place polygon points (percentage coordinates). Click first point to close polygon.
      </p>

      {/* Building selector */}
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 uppercase font-mono">Select Building</label>
        <select
          value={activeBuildingId}
          onChange={(e) => setActiveBuildingId(e.target.value)}
          className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.shortName || b.name} ({b.percentagePolygon?.length || 0} pts)
            </option>
          ))}
        </select>
      </div>

      {currentBuilding && (
        <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/10 font-mono text-[10px]">
          <div className="text-cyan-300 font-bold">Points ({currentBuilding.percentagePolygon?.length || 0}):</div>
          <div className="max-h-24 overflow-y-auto text-slate-400">
            {currentBuilding.percentagePolygon?.map(([x, y], idx) => (
              <div key={idx}>
                {idx + 1}: [{x}%, {y}%]
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleCopyJson}
          className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold flex items-center justify-center gap-1 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied JSON!' : 'Copy Config'}</span>
        </button>

        {onSaveHotspots && (
          <button
            onClick={() => onSaveHotspots(buildings)}
            className="py-1.5 px-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}
