import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  FileText,
  Lock,
  Cookie,
  CreditCard,
  Trash2,
  HelpCircle,
  Calendar,
  Building
} from 'lucide-react';
import CopyButton from './CopyButton.jsx';
import institutionData from '../../config/institution.json';

export default function Footer() {
  const lastUpdatedFormatted = 'November 13, 2026';

  return (
    <footer className="w-full border-t border-white/10 glass-panel mt-16 py-12 px-4 sm:px-6 lg:px-8 backdrop-blur-2xl print:hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Team */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20">
                <div className="w-full h-full bg-[#080C14] rounded-[10px] flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
                </div>
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">AuraSync Energy Twin</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-driven Campus Digital Twin for microgrid telemetry, edge computer vision occupancy optimization, and transparent Scope 2 carbon accounting.
            </p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
              Developed by <strong className="text-white">O(1) Outlaws: AIML Engineers</strong> at Dayananda Sagar Academy of Technology & Management.
            </div>
          </div>

          {/* Col 2: Institutional Business Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              Institutional Details
            </h4>
            <div className="text-xs text-slate-300 space-y-1 font-medium">
              <div>{institutionData.institutionName}</div>
              <div className="text-[11px] text-slate-400 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{institutionData.location} • PIN: {institutionData.pincode}</span>
              </div>
            </div>

            <div className="pt-1 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-emerald-400" />
                  energy-twin@dsatm.edu.in
                </span>
                <CopyButton text="energy-twin@dsatm.edu.in" label="Copy" iconOnly />
              </div>
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-cyan-400" />
                  +91 80 2843 2999
                </span>
                <CopyButton text="+918028432999" label="Copy" iconOnly />
              </div>
            </div>
          </div>

          {/* Col 3: Navigation & Quick Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Campus Modules</h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition">Telemetry Command Center</Link></li>
              <li><Link to="/campus" className="hover:text-emerald-400 transition">3D DSATM Campus Twin</Link></li>
              <li><Link to="/vision" className="hover:text-emerald-400 transition">Computer Vision Lab (Edge AI)</Link></li>
              <li><Link to="/control" className="hover:text-emerald-400 transition">Control & Master Eco Switch</Link></li>
              <li><Link to="/carbon" className="hover:text-emerald-400 transition">Carbon ESG & Green Passport</Link></li>
              <li><Link to="/simulate" className="hover:text-emerald-400 transition">Tariff & What-If Simulator</Link></li>
              <li><Link to="/helpdesk" className="hover:text-emerald-400 transition">Campus Helpdesk & Worker App</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition">About O(1) Outlaws & Faculty</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust, Compliance, Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Trust, Policies & Ethics
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li><Link to="/legal?tab=privacy" className="hover:text-emerald-400 transition">Privacy Policy (DPDP & GDPR)</Link></li>
              <li><Link to="/legal?tab=terms" className="hover:text-emerald-400 transition">Terms of Service</Link></li>
              <li><Link to="/legal?tab=refund" className="hover:text-emerald-400 transition">Refund & Fee Transparency (₹0 Free)</Link></li>
              <li><Link to="/legal?tab=cookies" className="hover:text-emerald-400 transition">Cookie Policy & Preferences</Link></li>
              <li><Link to="/legal?tab=minimization" className="hover:text-emerald-400 transition">Data Minimization Charter</Link></li>
              <li><Link to="/legal?tab=sdks" className="hover:text-emerald-400 transition">Audited Third-Party SDKs</Link></li>
              <li><Link to="/legal?tab=transparency" className="hover:text-emerald-400 transition">Anti-Dark Patterns Guarantee</Link></li>
              <li><Link to="/legal?tab=age-consent" className="hover:text-emerald-400 transition">Children's Age Consent (18+)</Link></li>
              <li><Link to="/legal?tab=deletion" className="hover:text-rose-400 transition flex items-center gap-1">
                <Trash2 className="w-3 h-3 text-rose-400" />
                Data Deletion Requests
              </Link></li>
              <li><Link to="/legal?tab=unsubscribe" className="hover:text-cyan-400 transition">Email Unsubscribe Manager</Link></li>
              <li><Link to="/legal?tab=faq" className="hover:text-emerald-400 transition flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-emerald-400" />
                Campus FAQs
              </Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Open Source Licenses, Last Updated */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2026 Dayananda Sagar Academy of Technology & Management (DSATM).</span>
            <span>•</span>
            <span>Licensed Fonts (Inter/Geist - SIL OFL) & Lucide Icons (ISC)</span>
            <span>•</span>
            <span className="text-emerald-400">MIT Open Educational License</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Charter Last Updated: <strong className="text-slate-300">{lastUpdatedFormatted}</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
