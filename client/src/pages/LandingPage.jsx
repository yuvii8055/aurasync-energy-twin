import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Layers,
  Sparkles,
  TrendingDown,
  Activity,
  ArrowRight,
  Compass,
  CheckCircle2,
  Camera,
  Sliders,
  LifeBuoy,
  Shield,
  Info
} from 'lucide-react';
import { formatINR, formatCo2 } from '../lib/utils.js';
import institutionData from '../config/institution.json';

export default function LandingPage() {
  const modules = [
    {
      to: '/dashboard',
      label: 'Command Center',
      tag: 'Live Telemetry',
      icon: Activity,
      color: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      desc: 'Real-time 142 kW microgrid draw, solar generation, and ghost gap monitoring.'
    },
    {
      to: '/campus',
      label: 'DSATM Digital Twin',
      tag: '2D & 3D Map',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      desc: 'Interactive 8-building twin with thermal heatmaps and device controls.'
    },
    {
      to: '/vision',
      label: 'Vision Lab',
      tag: 'Edge AI & Phone',
      icon: Camera,
      color: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      desc: 'COCO-SSD occupancy inference with phone camera wireless pairing.'
    },
    {
      to: '/control',
      label: 'Automation & Control',
      tag: 'Zero Latency',
      icon: Sliders,
      color: 'from-amber-500/20 to-orange-500/20',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      desc: 'Campus Eco switch, load shedding, and 60-second safety undo window.'
    },
    {
      to: '/simulate',
      label: 'What-If Simulator',
      tag: 'Zustand Engine',
      icon: TrendingDown,
      color: 'from-blue-500/20 to-indigo-500/20',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      desc: '1,000+ student agents timetable simulation, weather, and tariff models.'
    },
    {
      to: '/carbon',
      label: 'Carbon ESG Passport',
      tag: 'Green Audit',
      icon: Zap,
      color: 'from-teal-500/20 to-emerald-500/20',
      border: 'border-teal-500/30',
      iconColor: 'text-teal-400',
      desc: 'Scope 2 emission tracker, green badges, and 1-click PDF ESG export.'
    },
    {
      to: '/coach',
      label: 'Aura AI Energy Coach',
      tag: 'Google Gemini',
      icon: Sparkles,
      color: 'from-rose-500/20 to-purple-500/20',
      border: 'border-rose-500/30',
      iconColor: 'text-rose-400',
      desc: 'Ground truth campus telemetry conversational AI with actionable fixes.'
    },
    {
      to: '/helpdesk',
      label: 'Incident Helpdesk',
      tag: 'Crowdsourced',
      icon: LifeBuoy,
      color: 'from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      desc: 'Student & faculty ticket routing with photo proofs and technician board.'
    },
    {
      to: '/admin',
      label: 'Governance & Admin',
      tag: 'Role Security',
      icon: Shield,
      color: 'from-indigo-500/20 to-violet-500/20',
      border: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
      desc: 'Audit logs, passkey management, and role-based permissions console.'
    },
    {
      to: '/about',
      label: 'About DSATM & Team',
      tag: 'O(1) Outlaws',
      icon: Info,
      color: 'from-slate-500/20 to-zinc-500/20',
      border: 'border-slate-500/30',
      iconColor: 'text-slate-300',
      desc: 'Institutional vision, engineering roadmap, and white-label setup.'
    }
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Ambient Radial Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[500px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 pt-8 pb-16 max-w-6xl mx-auto relative z-10">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DSATM Hackathon 2026 • AI-Powered Campus Microgrid Digital Twin</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white max-w-4xl">
          Sustainable Energy.
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Reimagined in Real-Time 3D.
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          AuraSync creates a living digital twin of <span className="text-white font-semibold">{institutionData.institutionName}</span>.
          Uniting computer vision occupancy, synthetic IoT telemetry, and GenAI coaching to bust energy ghosts campus-wide.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            to="/campus"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/15 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Explore 3D DSATM Twin</span>
          </Link>
          <Link
            to="/coach"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-sm border border-purple-500/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Ask Aura AI</span>
          </Link>
        </div>

        {/* Projected Campus Impact Counters */}
        <div className="mt-14 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
              {formatINR(1250000)}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Annual Projected Savings</div>
          </div>
          <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-400">
              {formatCo2(94200)}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">CO₂ Avoided Yearly</div>
          </div>
          <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-mono font-black text-purple-400">
              260 kWp
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Rooftop Solar Modeled</div>
          </div>
          <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
              84 / 100
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Green Campus Score</div>
          </div>
        </div>
      </section>

      {/* Complete Module Launcher Grid: Direct 1-Click Access to All 10 Modules */}
      <section className="py-14 max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Interactive Modules</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Explore All Campus Energy Twin Systems
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Click any module below to open its dedicated view with live simulated telemetry and controls.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.to}
                to={m.to}
                className={`p-4 rounded-3xl glass-panel bg-white/5 border ${m.border} hover:scale-105 hover:bg-white/10 transition-all flex flex-col justify-between group shadow-lg`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${m.iconColor} group-hover:scale-110 transition`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                      {m.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                    {m.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Institution Tie-In & Statement Strip */}
      <section className="py-12 border-y border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Dayananda Sagar Institutions
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              Fostering Sustainable Educational Ecosystems
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl glass-panel bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                "{institutionData.statements[0]}"
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 mb-2" />
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                "{institutionData.statements[1]}"
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                "{institutionData.statements[3]}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Core Innovations</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            Engineered for Campus Net-Zero Goals
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Fully simulated with progressive hardware support for physical smart meters, relays, and IP cameras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/campus"
            className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 hover:border-emerald-500/40 transition group block"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition">Full-Scale DSATM Twin</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Procedurally models DSATM Main, DSBA, Mechanical & Civil, Basketball court, Boys Hostel 1 and ElectricPe EV charging point.
            </p>
            <span className="text-xs text-emerald-400 font-bold mt-4 inline-flex items-center gap-1">
              Launch 3D Twin <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/control"
            className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 hover:border-cyan-500/40 transition group block"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition">Ghost Twin Technology</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Compares Real vs Ghost ideal consumption to isolate 8 deterministic energy ghosts: empty room ACs, continuous geysers, and idling projectors.
            </p>
            <span className="text-xs text-cyan-400 font-bold mt-4 inline-flex items-center gap-1">
              Open Control Center <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/coach"
            className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 hover:border-purple-500/40 transition group block"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition">Aura AI Energy Coach</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Google Gemini-backed advisor with offline fallback generating ranked quantified advice in Indian Rupees (₹) and kg CO₂ across CFO, Eco, and Student personas.
            </p>
            <span className="text-xs text-purple-400 font-bold mt-4 inline-flex items-center gap-1">
              Chat with Aura AI <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Credit Banner */}
      <section className="py-8 bg-gradient-to-r from-emerald-950/40 via-slate-900/40 to-cyan-950/40 border-t border-white/10 text-center px-4">
        <p className="text-xs text-slate-300 font-medium">
          Built with ❤️ by <span className="font-bold text-white">O(1) Outlaws: AIML Engineers of DSATM</span> • Kanakapura Road, Bengaluru
        </p>
      </section>
    </div>
  );
}
