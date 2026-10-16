import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart, ShieldCheck, MapPin, Globe } from 'lucide-react';
import institutionData from '../../config/institution.json';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 glass-panel mt-16 py-10 px-6 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Team */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <span className="font-extrabold text-base text-white">AuraSync Energy Twin</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI-driven Campus Digital Twin for real-time microgrid telemetry, computer vision occupancy optimization, and transparent carbon accounting.
          </p>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
            Developed by <span className="font-bold text-white">O(1) Outlaws: AIML Engineers of DSATM</span>
          </div>
        </div>

        {/* Col 2: Institution Tie-In */}
        <div className="space-y-2 md:col-span-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Institution & Campus
          </h4>
          <p className="text-xs text-slate-400 font-medium">
            {institutionData.institutionName}
          </p>
          <p className="text-[11px] text-slate-400">
            {institutionData.location} • PIN: {institutionData.pincode}
          </p>
          <div className="pt-2 text-[11px] text-slate-400 italic">
            "{institutionData.statements[1]}"
          </div>
        </div>

        {/* Col 3: Quick Navigation */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick Modules</h4>
          <ul className="text-xs space-y-1.5 text-slate-400">
            <li><Link to="/campus" className="hover:text-emerald-400 transition">3D DSATM Campus Twin</Link></li>
            <li><Link to="/vision" className="hover:text-emerald-400 transition">Computer Vision Lab</Link></li>
            <li><Link to="/control" className="hover:text-emerald-400 transition">Control & Campus Master Switch</Link></li>
            <li><Link to="/carbon" className="hover:text-emerald-400 transition">Carbon ESG & Net-Zero Center</Link></li>
            <li><Link to="/helpdesk" className="hover:text-emerald-400 transition">Campus Helpdesk & Worker App</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400 transition">About O(1) Outlaws & DSATM</Link></li>
          </ul>
        </div>

        {/* Col 4: Problem Statement & Assumptions */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Assumptions & Standards
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All currency in Indian Rupees (₹) via en-IN. Default India grid emission factor: 0.71 kg CO₂e/kWh. BESCOM HT tariff assumed at ₹8.25/kWh (editable in Settings).
          </p>
          <p className="text-[10px] text-slate-400">
            © 2026 O(1) Outlaws. Built for DSATM and every sustainable campus that follows.
          </p>
        </div>
      </div>
    </footer>
  );
}
