import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  Layers,
  Camera,
  Sliders,
  TrendingDown,
  LifeBuoy,
  Sparkles,
  ShieldAlert,
  Building,
  Sun,
  Moon,
  HelpCircle,
  Shield,
  Palette,
  Monitor,
  Move,
  RotateCcw,
  CheckCircle2,
  CornerDownLeft,
  X
} from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useIslandStore } from '../../store/useIslandStore.js';
import { sounds } from '../../lib/utils.js';

export default function CommandPalette({ isOpen, onClose, onOpenMasterSwitch, onOpenReportModal }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const navigate = useNavigate();
  const { setOverlay, selectBuilding } = useCampusStore();
  const { theme, setTheme, setDisplayScale } = useThemeStore();
  const { resetIsland } = useIslandStore();

  // Focus input automatically whenever palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands = [
    // Navigation
    { id: 'c-dash', title: 'Open Command Dashboard', cat: 'Navigation', icon: Zap, action: () => { navigate('/dashboard'); onClose(); } },
    { id: 'c-twin', title: 'Open 3D DSATM Campus Twin', cat: 'Navigation', icon: Layers, action: () => { navigate('/campus'); onClose(); } },
    { id: 'c-vision', title: 'Launch Computer Vision Lab & Phone Stream', cat: 'Navigation', icon: Camera, action: () => { navigate('/vision'); onClose(); } },
    { id: 'c-control', title: 'Open Control Center & Relays', cat: 'Navigation', icon: Sliders, action: () => { navigate('/control'); onClose(); } },
    { id: 'c-whatif', title: 'Open What-If Energy Simulator', cat: 'Navigation', icon: TrendingDown, action: () => { navigate('/simulate'); onClose(); } },
    { id: 'c-carbon', title: 'Open Carbon & ESG Center', cat: 'Navigation', icon: Zap, action: () => { navigate('/carbon'); onClose(); } },
    { id: 'c-helpdesk', title: 'Open Campus Helpdesk & Incident Board', cat: 'Navigation', icon: LifeBuoy, action: () => { navigate('/helpdesk'); onClose(); } },
    { id: 'c-coach', title: 'Ask Aura AI Gemini Energy Coach', cat: 'Navigation', icon: Sparkles, action: () => { navigate('/coach'); onClose(); } },
    { id: 'c-admin', title: 'Open Admin & HOD Governance Console', cat: 'Navigation', icon: Shield, action: () => { navigate('/admin'); onClose(); } },
    { id: 'c-settings', title: 'Open System Settings & Display Sizing', cat: 'Navigation', icon: Sliders, action: () => { navigate('/settings'); onClose(); } },

    // HOD & Emergency Actions
    { id: 'c-master', title: 'Trigger Campus Eco Master Switch', cat: 'HOD Actions', icon: Sliders, action: () => { onOpenMasterSwitch(); onClose(); } },
    { id: 'c-report', title: 'Report an Energy Waste / Maintenance Issue', cat: 'Actions', icon: LifeBuoy, action: () => { onOpenReportModal(); onClose(); } },
    { id: 'c-gap', title: 'Toggle Energy Ghost GAP Overlay', cat: 'Campus Overlays', icon: Layers, action: () => { setOverlay('GAP'); navigate('/campus'); onClose(); } },
    { id: 'c-solar', title: 'Toggle Rooftop Solar Generation Overlay', cat: 'Campus Overlays', icon: Sun, action: () => { setOverlay('SOLAR'); navigate('/campus'); onClose(); } },

    // Campus Navigation
    { id: 'c-b-main', title: 'Jump to DSATM Main Academic Block', cat: 'Campus', icon: Building, action: () => { selectBuilding('dsatm-main'); navigate('/campus'); onClose(); } },
    { id: 'c-b-dsba', title: 'Jump to Dayananda Sagar Business Academy (DSBA)', cat: 'Campus', icon: Building, action: () => { selectBuilding('dsba-block'); navigate('/campus'); onClose(); } },
    { id: 'c-b-mech', title: 'Jump to Mechanical & Civil Block', cat: 'Campus', icon: Building, action: () => { selectBuilding('mech-civil'); navigate('/campus'); onClose(); } },

    // Themes & Display Sizing
    { id: 'c-th-midnight', title: 'Theme: Midnight Cyber (Default)', cat: 'Appearance', icon: Palette, action: () => { setTheme('midnight'); onClose(); } },
    { id: 'c-th-obsidian', title: 'Theme: Obsidian OLED Black', cat: 'Appearance', icon: Palette, action: () => { setTheme('obsidian'); onClose(); } },
    { id: 'c-th-eco', title: 'Theme: Emerald Forest (Eco)', cat: 'Appearance', icon: Palette, action: () => { setTheme('eco'); onClose(); } },
    { id: 'c-th-light', title: 'Theme: Clean Daylight Light', cat: 'Appearance', icon: Sun, action: () => { setTheme('eco-light'); onClose(); } },
    { id: 'c-sc-compact', title: 'Display Scale: Compact 1080p (88%)', cat: 'Display Size', icon: Monitor, action: () => { setDisplayScale('compact'); onClose(); } },
    { id: 'c-sc-normal', title: 'Display Scale: Standard (100%)', cat: 'Display Size', icon: Monitor, action: () => { setDisplayScale('normal'); onClose(); } },
    { id: 'c-sc-large', title: 'Display Scale: Large 1440p (112%)', cat: 'Display Size', icon: Monitor, action: () => { setDisplayScale('large'); onClose(); } },
    { id: 'c-sc-kiosk', title: 'Display Scale: 4K Kiosk / Video Wall (124%)', cat: 'Display Size', icon: Monitor, action: () => { setDisplayScale('kiosk'); onClose(); } },
    { id: 'c-rst-island', title: 'Reset Dynamic Island Position', cat: 'Actions', icon: Move, action: () => { resetIsland(); onClose(); } }
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.cat.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation inside open palette (Up/Down/Enter/Escape)
  useEffect(() => {
    if (!isOpen && !showCheatSheet) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showCheatSheet) {
          setShowCheatSheet(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(filtered.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          sounds.playChime('bubble');
          filtered[selectedIndex].action();
        }
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        setShowCheatSheet((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showCheatSheet, filtered, selectedIndex, onClose]);

  // Keep selected item scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen && !showCheatSheet) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99999999] flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl rounded-3xl glass-panel bg-[#0B0F19]/95 border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        {showCheatSheet ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Keyboard Shortcuts Cheat-Sheet
              </h3>
              <button
                onClick={() => setShowCheatSheet(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                <span>Command Palette</span>
                <kbd className="px-2 py-0.5 rounded bg-black/50 text-cyan-400 font-mono">Ctrl/Cmd + K</kbd>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                <span>Navigate List</span>
                <kbd className="px-2 py-0.5 rounded bg-black/50 text-cyan-400 font-mono">↑ / ↓</kbd>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                <span>Execute Command</span>
                <kbd className="px-2 py-0.5 rounded bg-black/50 text-emerald-400 font-mono">Enter ↵</kbd>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                <span>Close Window</span>
                <kbd className="px-2 py-0.5 rounded bg-black/50 text-slate-400 font-mono">Esc</kbd>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                <span>Move Dynamic Island</span>
                <kbd className="px-2 py-0.5 rounded bg-black/50 text-cyan-400 font-mono">M key</kbd>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                <span>Sim Debug Drawer</span>
                <kbd className="px-2 py-0.5 rounded bg-black/50 text-cyan-400 font-mono">Ctrl+Shift+D</kbd>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command, page, theme, building or action..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 font-medium"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                  ↑↓ Navigate
                </span>
                <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold">
                  ↵ Select
                </span>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div ref={listRef} className="max-h-84 overflow-y-auto p-2 space-y-1">
              {filtered.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playChime('bubble');
                      item.action();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left text-xs transition ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-white shadow-md'
                        : 'hover:bg-white/5 border border-transparent text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl transition shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                          : 'bg-white/5 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase px-2 py-0.5 rounded bg-black/40 border border-white/5">
                        {item.cat}
                      </span>
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-10 text-xs text-slate-500 space-y-1">
                  <div>No matching commands found for "{query}".</div>
                  <div className="text-[10px] text-slate-600">Try searching for "admin", "theme", "twin", or "vision".</div>
                </div>
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="p-2.5 px-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>DSATM AuraSync Quick Navigator</span>
              <button
                onClick={() => setShowCheatSheet(true)}
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Shortcuts (?)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
