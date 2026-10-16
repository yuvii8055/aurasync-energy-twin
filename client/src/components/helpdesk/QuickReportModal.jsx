import React, { useState } from 'react';
import {
  X,
  Trash2,
  Sparkles,
  Zap,
  Droplet,
  ArrowUpCircle,
  Wind,
  ShieldAlert,
  Camera,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useIslandStore } from '../../store/useIslandStore.js';
import { sounds } from '../../lib/utils.js';

const CATEGORIES = [
  { id: 'Garbage and Waste', label: 'Waste / Bin', icon: Trash2, color: 'text-amber-400' },
  { id: 'Energy Waste', label: 'Energy Ghost', icon: Zap, color: 'text-rose-400' },
  { id: 'Lifts and Elevators', label: 'Elevator', icon: ArrowUpCircle, color: 'text-cyan-400' },
  { id: 'Plumbing and Water', label: 'Water Leak', icon: Droplet, color: 'text-blue-400' },
  { id: 'Electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-400' },
  { id: 'Cleanliness', label: 'Cleaning', icon: Sparkles, color: 'text-emerald-400' },
  { id: 'Safety and Security', label: 'Safety Hazard', icon: ShieldAlert, color: 'text-red-400' }
];

export default function QuickReportModal({ isOpen, onClose }) {
  const [category, setCategory] = useState('Garbage and Waste');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buildingId, setBuildingId] = useState('dsatm-main');
  const [urgency, setUrgency] = useState('normal');
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pushEvent } = useIslandStore();

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          description,
          locationRef: { buildingId, floor: 1, roomId: 'Campus Spot' },
          urgency,
          media: imagePreview ? [{ url: imagePreview, type: 'image' }] : []
        })
      });

      sounds.playChime('success');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });

      pushEvent({
        type: urgency === 'emergency' ? 'SECURITY' : 'ACHIEVEMENT',
        title: 'Report Submitted Successfully',
        message: `${title} logged in Helpdesk with SLA timer active.`,
        severity: urgency === 'emergency' ? 'critical' : 'info'
      });

      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl glass-panel bg-[#0B0F19]/95 border border-white/20 p-6 shadow-2xl relative overflow-hidden">
        {/* Specular Edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">3-Tap Campus Quick Report</h3>
            <p className="text-xs text-slate-400">DSATM Smart Helpdesk • Resolving issues in minutes</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Step 1: Category Tiles */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
              1. Tap Category
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 text-center transition border ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                    <span className="text-[10px] font-semibold truncate w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Issue Title & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Campus Location
              </label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="dsatm-main" className="bg-slate-900">DSATM Main Academic Block</option>
                <option value="dsba-block" className="bg-slate-900">Dayananda Sagar Business Academy</option>
                <option value="mech-civil" className="bg-slate-900">DSATM Mechanical & Civil Block</option>
                <option value="block-c" className="bg-slate-900">Block-C Complex</option>
                <option value="boys-hostel-1" className="bg-slate-900">Boys Hostel 1</option>
                <option value="basketball-court" className="bg-slate-900">DSATM Basketball Court</option>
                <option value="ev-station" className="bg-slate-900">ElectricPe EV Hub</option>
                <option value="green-belt" className="bg-slate-900">Green Belt & Pond</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="low" className="bg-slate-900">Low (Within 48h)</option>
                <option value="normal" className="bg-slate-900">Normal (Within 24h)</option>
                <option value="high" className="bg-slate-900">High (Within 4h)</option>
                <option value="emergency" className="bg-slate-900">🚨 EMERGENCY (Immediate)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Issue Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Overflowing dry-waste bin near canteen courtyard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Photo Proof Upload / Camera */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Photo Evidence (Camera or Gallery)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Snap / Upload Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-500">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 text-[8px]"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !title}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Dispatching to HOD & Cloud...' : 'Submit Campus Report (Under 20s)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
