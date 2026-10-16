import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  AlertTriangle,
  Users,
  Sparkles,
  ShieldAlert,
  Award,
  Video,
  ChevronRight,
  ChevronLeft,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  Sun,
  Moon,
  Move,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useIslandStore } from '../../store/useIslandStore.js';
import { useCampusStore } from '../../store/useCampusStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatINR, formatKw, sounds } from '../../lib/utils.js';
import institutionData from '../../config/institution.json';

const ANCHOR_STYLES = {
  'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)' },
  'top-left': { top: 16, left: 24, transform: 'none' },
  'top-right': { top: 16, right: 24, left: 'auto', transform: 'none' },
  'bottom-center': { bottom: 20, top: 'auto', left: '50%', transform: 'translateX(-50%)' },
  'bottom-left': { bottom: 20, top: 'auto', left: 24, transform: 'none' },
  'bottom-right': { bottom: 20, top: 'auto', right: 24, left: 'auto', transform: 'none' },
  'free': {}
};

export default function DynamicIsland({ onOpenMasterSwitch, onOpenAiCoach }) {
  const {
    anchor,
    position,
    setAnchor,
    setPosition,
    isExpanded,
    toggleExpanded,
    setExpanded,
    activeEvent,
    eventQueue,
    nextEvent,
    dismissCurrentEvent,
    isMuted,
    toggleMute,
    statementIndex,
    nextStatement,
    resetIsland
  } = useIslandStore();

  const { telemetry } = useCampusStore();
  const { theme, setTheme } = useThemeStore();

  const [isLifted, setIsLifted] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showMiniControl, setShowMiniControl] = useState(false);
  const rightClickTimerRef = useRef(null);
  const leftClickTimerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const islandRef = useRef(null);

  // Rotating Dayananda Sagar statement timer
  useEffect(() => {
    const timer = setInterval(() => {
      nextStatement(institutionData.statements.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [nextStatement]);

  // Audio Cue on Event Change
  useEffect(() => {
    if (activeEvent) {
      if (activeEvent.severity === 'critical') {
        sounds.playChime('alert');
      } else if (activeEvent.type === 'ACHIEVEMENT') {
        sounds.playChime('success');
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.1 } });
      } else {
        sounds.playChime('bubble');
      }
    }
  }, [activeEvent]);

  // Keyboard navigation ('M' for move, Esc to cancel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'm' || e.key === 'M') {
        if (!e.target.matches('input, textarea')) {
          setIsLifted((prev) => !prev);
        }
      } else if (e.key === 'Escape') {
        setIsLifted(false);
        setExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setExpanded]);

  // Double-click to reset position
  const handleDoubleClick = () => {
    resetIsland();
    sounds.playChime('bubble');
  };

  // Right-click and hold logic to pick up the island
  const handleContextMenu = (e) => {
    e.preventDefault(); // Suppress browser context menu
  };

  const handlePointerDown = (e) => {
    // If right-click (button 2)
    if (e.button === 2) {
      e.preventDefault();
      rightClickTimerRef.current = setTimeout(() => {
        setIsLifted(true);
        isDraggingRef.current = true;
        sounds.playChime('bubble');
        if (islandRef.current) {
          islandRef.current.setPointerCapture(e.pointerId);
        }
      }, 300); // 300ms hold to lift
    } else if (e.button === 0) {
      // Left button long press opens mini control center
      leftClickTimerRef.current = setTimeout(() => {
        setShowMiniControl(true);
      }, 500);
    }
  };

  const handlePointerMove = (e) => {
    if (isLifted && isDraggingRef.current) {
      // Free drag mode
      setPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = (e) => {
    if (rightClickTimerRef.current) clearTimeout(rightClickTimerRef.current);
    if (leftClickTimerRef.current) clearTimeout(leftClickTimerRef.current);

    if (isLifted && isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsLifted(false);

      // Snap to nearest anchor
      const { innerWidth: w, innerHeight: h } = window;
      const x = e.clientX;
      const y = e.clientY;

      if (y < h * 0.35) {
        if (x < w * 0.3) setAnchor('top-left');
        else if (x > w * 0.7) setAnchor('top-right');
        else setAnchor('top-center');
      } else if (y > h * 0.65) {
        if (x < w * 0.3) setAnchor('bottom-left');
        else if (x > w * 0.7) setAnchor('bottom-right');
        else setAnchor('bottom-center');
      } else {
        setAnchor('free');
      }
      sounds.playChime('bubble');
    }
  };

  const handleClick = (e) => {
    if (isDraggingRef.current || isLifted) return;
    toggleExpanded();
    sounds.playChime('bubble');
  };

  // Determine current active state
  const currentState = activeEvent?.type || 'IDLE';
  const statement = institutionData.statements[statementIndex] || institutionData.statements[0];

  const anchorPositionStyle = anchor === 'free'
    ? { position: 'fixed', left: position.x - 160, top: position.y - 25 }
    : { position: 'fixed', ...ANCHOR_STYLES[anchor] };

  // Render via React Portal into document.body to ensure zero transform/filter hierarchy interference
  return createPortal(
    <div
      ref={islandRef}
      style={{
        ...anchorPositionStyle,
        zIndex: 99999,
        touchAction: 'none',
        userSelect: 'none'
      }}
      className={`transition-shadow duration-300 ${isLifted ? 'cursor-grab scale-105 glow-cyan' : ''}`}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Ghost Drop Zone Indicators when Lifted */}
      {isLifted && (
        <div className="fixed inset-0 pointer-events-none z-[-1] flex flex-col justify-between p-6">
          <div className="flex justify-between">
            <div className="w-32 h-12 border-2 border-dashed border-emerald-500/50 rounded-full flex items-center justify-center text-xs text-emerald-400 bg-emerald-950/20">Top Left</div>
            <div className="w-48 h-12 border-2 border-dashed border-cyan-500/50 rounded-full flex items-center justify-center text-xs text-cyan-400 bg-cyan-950/20">Top Center (Default)</div>
            <div className="w-32 h-12 border-2 border-dashed border-emerald-500/50 rounded-full flex items-center justify-center text-xs text-emerald-400 bg-emerald-950/20">Top Right</div>
          </div>
          <div className="flex justify-between">
            <div className="w-32 h-12 border-2 border-dashed border-slate-500/50 rounded-full flex items-center justify-center text-xs text-slate-400 bg-slate-950/20">Bottom Left</div>
            <div className="w-48 h-12 border-2 border-dashed border-slate-500/50 rounded-full flex items-center justify-center text-xs text-slate-400 bg-slate-950/20">Bottom Center</div>
            <div className="w-32 h-12 border-2 border-dashed border-slate-500/50 rounded-full flex items-center justify-center text-xs text-slate-400 bg-slate-950/20">Bottom Right</div>
          </div>
        </div>
      )}

      {/* Layer 2: Inner Morphing Container */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={handleClick}
        className={`relative overflow-hidden rounded-[26px] bg-[#0A0E17]/90 text-white border border-white/20 backdrop-blur-2xl shadow-2xl transition-all duration-300 ${
          isLifted ? 'ring-2 ring-cyan-400 shadow-cyan-500/30' : ''
        } ${
          activeEvent?.severity === 'critical' ? 'border-rose-500/80 shadow-rose-500/30' : ''
        }`}
        style={{
          minWidth: isExpanded ? 380 : 320,
          maxWidth: 460
        }}
      >
        {/* Specular Highlight Strip */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        <div className="p-3 px-4">
          {/* STATE 1: IDLE */}
          {currentState === 'IDLE' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
                  <Zap className="w-4 h-4 fill-emerald-400 relative z-10" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
                    DSATM Campus
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {formatKw(telemetry?.campus?.totalRealKw || 142)}
                  </span>
                </div>
              </div>

              {/* Rotating Statement marquee/pill */}
              <div className="flex-1 max-w-[170px] overflow-hidden text-right">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statementIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-[10px] text-slate-300 truncate"
                    title={statement}
                  >
                    {statement}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40">
                  Gap: {telemetry?.campus?.ghostGapKw || 34}kW
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAiCoach?.();
                  }}
                  className="p-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 transition"
                  title="Ask Aura AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: ENERGY ALERT */}
          {currentState === 'ENERGY_ALERT' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300">{activeEvent.title}</h4>
                  <p className="text-[10px] text-slate-300 truncate max-w-[200px]">{activeEvent.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); dismissCurrentEvent(); }}
                  className="px-2 py-1 text-[10px] rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: CV OCCUPANCY */}
          {currentState === 'CV_OCCUPANCY' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Users className="w-4 h-4" />
                <div>
                  <h4 className="text-xs font-semibold text-cyan-200">{activeEvent.title || 'Occupancy Updated'}</h4>
                  <p className="text-[10px] text-slate-300">{activeEvent.message}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">CV Verified</span>
            </div>
          )}

          {/* STATE 4: GENAI INSIGHT */}
          {currentState === 'GENAI_INSIGHT' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="w-4 h-4 animate-spin text-purple-300" />
                <div className="max-w-[220px]">
                  <h4 className="text-xs font-semibold text-purple-200">{activeEvent.title}</h4>
                  <p className="text-[10px] text-slate-300 truncate">{activeEvent.message}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismissCurrentEvent(); }}
                className="text-[10px] text-purple-300 hover:text-white"
              >
                Done
              </button>
            </div>
          )}

          {/* STATE 5: AUTO CONTROL */}
          {currentState === 'AUTO_CONTROL' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="w-4 h-4" />
                <div>
                  <h4 className="text-xs font-semibold text-emerald-300">{activeEvent.title}</h4>
                  <p className="text-[10px] text-slate-300">{activeEvent.message}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismissCurrentEvent(); }}
                className="text-[10px] px-2 py-0.5 bg-emerald-600/30 text-emerald-300 rounded border border-emerald-500/40"
              >
                OK
              </button>
            </div>
          )}

          {/* STATE 6: SECURITY / LIFT EMERGENCY */}
          {currentState === 'SECURITY' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300">{activeEvent.title}</h4>
                  <p className="text-[10px] text-slate-300 truncate max-w-[200px]">{activeEvent.message}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismissCurrentEvent(); }}
                className="text-[10px] px-2 py-1 bg-rose-600 text-white rounded font-bold"
              >
                Acknowledge
              </button>
            </div>
          )}

          {/* STATE 7: ACHIEVEMENT */}
          {currentState === 'ACHIEVEMENT' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Award className="w-5 h-5 fill-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-amber-200">{activeEvent.title}</h4>
                  <p className="text-[10px] text-slate-300">{activeEvent.message}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismissCurrentEvent(); }}
                className="text-[10px] text-amber-300"
              >
                Close
              </button>
            </div>
          )}

          {/* Expanded Detail Panel */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-white/10 text-xs space-y-2.5"
            >
              <div className="flex items-center justify-between text-slate-300">
                <span>Sanctioned kVA: 750 kVA</span>
                <span className="text-emerald-400 font-mono">Today's Savings: {formatINR(telemetry?.savingsTracker?.savedTodayRs || 4850)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-slate-400 text-[10px]">Real Campus Draw</div>
                  <div className="font-mono text-sm font-bold text-white mt-0.5">{formatKw(telemetry?.campus?.totalRealKw || 142)}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-slate-400 text-[10px]">Ghost Waste Gap</div>
                  <div className="font-mono text-sm font-bold text-rose-400 mt-0.5">{formatKw(telemetry?.campus?.ghostGapKw || 34)}</div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenMasterSwitch) onOpenMasterSwitch();
                  }}
                  className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold text-[11px] shadow"
                >
                  Campus Eco Switch
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                  className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); resetIsland(); }}
                  className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
                  title="Reset Position to Top Center"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[9px] text-center text-slate-400 pt-1">
                💡 Tip: Right-click & hold (300ms) to drag island anywhere on screen!
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
