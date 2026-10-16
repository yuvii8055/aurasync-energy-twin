import React, { useState } from 'react';
import {
  Info,
  MapPin,
  Users,
  Award,
  Zap,
  CheckCircle2,
  Building,
  ArrowRight,
  Globe,
  Sparkles
} from 'lucide-react';
import institutionData from '../config/institution.json';

export default function AboutPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newSanctionedKva, setNewSanctionedKva] = useState(500);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl glass-panel bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-cyan-950/30 border border-white/10 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>Developed by O(1) Outlaws: AIML Engineers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          AuraSync Energy Twin
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Pioneering Campus Digital Twin Architecture for {institutionData.institutionName}.
          Engineered for institutional scale, real-time energy telemetry, and transparent ESG governance.
        </p>
      </div>

      {/* Institution Background: Dayananda Sagar Institutions */}
      <section className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Dayananda Sagar Institutions</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {institutionData.statements[0]} Located along the IT corridor of Kanakapura Road in South Bengaluru, DSATM is an epicenter of technological innovation, AI research, and green infrastructure initiatives.
        </p>

        {/* Statements Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {institutionData.statements.slice(1, 7).map((stmt, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{stmt}</span>
            </div>
          ))}
        </div>
      </section>

      {/* The O(1) Outlaws Team Card */}
      <section className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">The Engineering Team: O(1) Outlaws</h2>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/40">
            AIML Department • DSATM
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          O(1) Outlaws comprises senior AIML engineers from Dayananda Sagar Academy of Technology and Management. Specializing in computer vision edge inferencing, distributed IoT data pipelines, and Three.js 3D spatial twins.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
            <div className="font-bold text-white">3D Spatial Twin</div>
            <div className="text-[11px] text-slate-400 mt-1">Procedural React Three Fiber DSATM Architecture</div>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
            <div className="font-bold text-white">Synthetic IoT Engine</div>
            <div className="text-[11px] text-slate-400 mt-1">Agent-based college population & ghost loads</div>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
            <div className="font-bold text-white">Aura AI Coach</div>
            <div className="text-[11px] text-slate-400 mt-1">Quantified Indian Rupee (₹) & Carbon strategies</div>
          </div>
        </div>
      </section>

      {/* Multi-Campus Switcher & Onboarding Blueprint */}
      <section className="p-6 rounded-3xl glass-panel bg-emerald-950/20 border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Adopt AuraSync for Your College Campus
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Config-driven architecture via campus.json enables plug-and-play adoption across any university.
            </p>
          </div>
          <button
            onClick={() => setShowWizard(!showWizard)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
          >
            {showWizard ? 'Hide Wizard' : 'Launch College Onboarding'}
          </button>
        </div>

        {showWizard && (
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Institution Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dayananda Sagar University (DSU)"
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Sanctioned kVA Demand</label>
                <input
                  type="number"
                  value={newSanctionedKva}
                  onChange={(e) => setNewSanctionedKva(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Blueprint generated for ${newCollegeName || 'Your College'}! Download /server/data/campus.json template to deploy.`);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-xs"
            >
              Generate Campus Config Blueprint
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
