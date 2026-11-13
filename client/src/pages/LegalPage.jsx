import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  CreditCard,
  Cookie,
  Database,
  Code2,
  AlertTriangle,
  Building2,
  Users,
  MailCheck,
  CheckCircle2,
  Trash2,
  Printer,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Lock,
  EyeOff
} from 'lucide-react';
import CopyButton from '../components/common/CopyButton.jsx';
import ExpandableFAQ from '../components/common/ExpandableFAQ.jsx';
import institutionData from '../config/institution.json';
import { sounds } from '../lib/utils.js';

export default function LegalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'privacy';

  // State for Data Deletion Request
  const [deletionEmail, setDeletionEmail] = useState('hod.aiml@aurasync.demo');
  const [deletionReason, setDeletionReason] = useState('Graduation / Term Completed');
  const [deletionConfirmOpen, setDeletionConfirmOpen] = useState(false);
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);

  // State for Unsubscribe Manager
  const [unsubEmail, setUnsubEmail] = useState('');
  const [unsubStatus, setUnsubStatus] = useState(null);

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'refund', label: 'Refund & Fee Transparency', icon: CreditCard },
    { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
    { id: 'minimization', label: 'Data Minimization', icon: Database },
    { id: 'sdks', label: 'Audited Third-Party SDKs', icon: Code2 },
    { id: 'transparency', label: 'Anti-Dark Patterns & Ethics', icon: ShieldCheck },
    { id: 'business', label: 'Institutional Details', icon: Building2 },
    { id: 'age-consent', label: "Children's Age Consent", icon: Users },
    { id: 'deletion', label: 'Data Deletion Requests', icon: Trash2 },
    { id: 'unsubscribe', label: 'Email Unsubscribe', icon: MailCheck },
    { id: 'faq', label: 'Campus FAQs', icon: HelpCircle }
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    sounds.playChime('bubble');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExecuteDeletion = (e) => {
    e.preventDefault();
    setDeletionSubmitted(true);
    setDeletionConfirmOpen(false);
    sounds.playChime('success');
  };

  const handleUnsubscribe = (e) => {
    e.preventDefault();
    if (!unsubEmail.includes('@')) {
      setUnsubStatus('error');
      sounds.playChime('alert');
      return;
    }
    setUnsubStatus('success');
    sounds.playChime('success');
  };

  const lastUpdatedFormatted = 'November 13, 2026';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="rounded-3xl glass-panel bg-gradient-to-r from-emerald-950/40 via-[#0B0F19]/90 to-cyan-950/40 border border-white/10 p-6 sm:p-10 mb-8 relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TRUST, COMPLIANCE & LEGAL GOVERNANCE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Legal, Privacy & Ethics Charter
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Transparent policies, audited third-party software, data deletion controls, and academic ethical standards for the Dayananda Sagar Academy of Technology & Management (DSATM) Energy Twin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Last Updated: <strong className="text-white">{lastUpdatedFormatted}</strong></span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition print:hidden cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Tab Navigation, Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 print:hidden">
          <div className="sticky top-20 rounded-2xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Charter Sections
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Body */}
        <main className="lg:col-span-3 space-y-8 min-w-0">
          {/* TAB 1: PRIVACY POLICY */}
          {currentTab === 'privacy' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Campus Digital Twin Privacy Policy</h2>
                  <p className="text-xs text-slate-400">Compliance with India DPDP Act 2023 & GDPR Standards</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4">
                <p>
                  Dayananda Sagar Academy of Technology & Management (DSATM) and the <strong>O(1) Outlaws AIML Research Group</strong> are committed to protecting the privacy of our students, faculty, staff, and visitors. This Privacy Policy details how data is handled across the AuraSync Energy Twin platform.
                </p>

                <h3 className="text-base font-bold text-white pt-2">1. Scope of Data Processed</h3>
                <p>
                  AuraSync is strictly designed for <strong>campus microgrid monitoring, electrical load telemetry, and HVAC/lighting automation</strong>. We collect only what is strictly required to run digital energy simulations:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>Electrical feeder telemetry (kW, kVA, power factor, solar inverter generation).</li>
                  <li>Campus ambient readings (outdoor temperature, humidity, solar irradiation).</li>
                  <li>Aggregated numeric occupancy figures (e.g., "Classroom 204: 14 persons present").</li>
                  <li>Authorized login credentials (pre-authenticated campus accounts: Principal, HOD, Faculty, Student, Technician).</li>
                </ul>

                <h3 className="text-base font-bold text-white pt-2">2. Computer Vision & Edge AI Privacy Guarantee</h3>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <EyeOff className="w-4 h-4 text-emerald-400" />
                    <span>Zero Video Storage & Zero Biometric Recognition</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Our edge computer vision models (COCO-SSD via TensorFlow.js) run <strong>100% locally inside your web browser</strong> or paired phone client. Video pixels are processed in memory to generate numeric counts and are immediately discarded. No video frames, photographs, or face signatures are ever uploaded to cloud servers or saved to disk.
                  </p>
                </div>

                <h3 className="text-base font-bold text-white pt-2">3. Third-Party Sharing</h3>
                <p>
                  We do not sell, rent, monetize, or disclose campus data to commercial advertising brokers. Telemetry is processed exclusively for institutional energy efficiency and academic research at DSATM.
                </p>

                <h3 className="text-base font-bold text-white pt-2">4. Data Subject Rights & Erasure</h3>
                <p>
                  In accordance with the Digital Personal Data Protection (DPDP) Act, users have the right to inspect, rectify, or request immediate erasure of any cached profile or feedback records. Visit the <button type="button" onClick={() => handleTabChange('deletion')} className="text-emerald-400 underline font-semibold">Data Deletion Requests tab</button> to exercise this right.
                </p>
              </div>
            </section>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {currentTab === 'terms' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Terms of Academic & Campus Service</h2>
                  <p className="text-xs text-slate-400">Institutional Governance & Usage Conditions</p>
                </div>
              </div>

              <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4">
                <p>
                  Welcome to AuraSync Energy Twin. By accessing this platform at DSATM or over authorized academic networks, you agree to comply with these Terms of Service.
                </p>

                <h3 className="text-base font-bold text-white pt-2">1. Authorized Institutional Use</h3>
                <p>
                  This platform is provided for campus facility managers, department heads (HODs), faculty, and students for legitimate sustainable development, energy audit, and educational simulation purposes. Unauthorized attempts to exploit relay control systems or spoof synthetic microgrid packets are strictly prohibited.
                </p>

                <h3 className="text-base font-bold text-white pt-2">2. Master Switch & Relay Authorization</h3>
                <p>
                  The Campus Master Eco Switch and load shedding triggers directly interact with simulated and physical IoT relays. Execution requires elevated role authorization and cryptographic PIN verification.
                </p>

                <h3 className="text-base font-bold text-white pt-2">3. Intellectual Property</h3>
                <p>
                  The digital twin twin algorithms, 3D campus models of DSATM, synthetic microgrid state machines, and user interface are the intellectual property of the <strong>O(1) Outlaws AIML team</strong> and <strong>Dayananda Sagar Academy of Technology & Management</strong>.
                </p>
              </div>
            </section>
          )}

          {/* TAB 3: REFUND & FEE TRANSPARENCY */}
          {currentTab === 'refund' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Refund & Fee Transparency Policy</h2>
                  <p className="text-xs text-slate-400">100% Free Open Educational Platform • Zero Hidden Charges</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">₹0 Cost Guarantee (Zero Fees / Zero Paywalls)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      AuraSync Energy Twin is an internal campus research project provided completely <strong>free of charge</strong> to all students, faculty, and administrative staff of DSATM. There are no registration fees, monthly subscription fees, or in-app charges of any kind.
                    </p>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white pt-2">Refunds Notice</h3>
                <p>
                  Because no financial transactions or payments are collected by the platform, no monetary refunds apply. If third-party research grants or sponsored workshop registrations are coordinated through university accounts, refunds are handled strictly via the official DSATM Accounts Office under standard VTU norms.
                </p>

                <h3 className="text-base font-bold text-white pt-2">Billing Transparency Guarantee</h3>
                <p>
                  Any financial rupee figures displayed on the dashboard (such as <em>₹8.25/kWh BESCOM Tariff</em> or <em>₹3,420 Saved Today</em>) represent <strong>simulated institutional cost savings</strong> achieved by shedding ghost waste, and never represent a charge to the user.
                </p>
              </div>
            </section>
          )}

          {/* TAB 4: COOKIE POLICY */}
          {currentTab === 'cookies' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Cookie & Local Storage Policy</h2>
                  <p className="text-xs text-slate-400">Transparent local state and telemetry caching</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  AuraSync utilizes browser `localStorage` and minimal session tokens solely to preserve authentication states and graphics fidelity across page reloads.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-2.5 px-3">Cookie / Storage Key</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3">Lifespan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-3 text-emerald-400">aurasync_auth_user</td>
                        <td className="py-2.5 px-3 text-slate-400">Strictly Essential</td>
                        <td className="py-2.5 px-3 text-slate-300">Stores active role (Dr. Sandhya V.)</td>
                        <td className="py-2.5 px-3 text-slate-400">Session / Persistent</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-emerald-400">aurasync_theme</td>
                        <td className="py-2.5 px-3 text-slate-400">Preferences</td>
                        <td className="py-2.5 px-3 text-slate-300">Remembers Dark/Eco/Cyber visual mode</td>
                        <td className="py-2.5 px-3 text-slate-400">1 Year</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-emerald-400">aurasync_cookie_consent_v1</td>
                        <td className="py-2.5 px-3 text-slate-400">Consent</td>
                        <td className="py-2.5 px-3 text-slate-300">Saves your cookie preferences</td>
                        <td className="py-2.5 px-3 text-slate-400">1 Year</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-emerald-400">aurasync_sim_params</td>
                        <td className="py-2.5 px-3 text-slate-400">Functional</td>
                        <td className="py-2.5 px-3 text-slate-300">Caches custom tariff and simulation sliders</td>
                        <td className="py-2.5 px-3 text-slate-400">Local Only</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('aurasync_cookie_consent_v1');
                      window.location.reload();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
                  >
                    Reset Cookie Consent Preferences
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: DATA MINIMIZATION */}
          {currentTab === 'minimization' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Data Minimization Principle</h2>
                  <p className="text-xs text-slate-400">"Only Collect Necessary Data" Architectural Standard</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  AuraSync strictly implements privacy-by-design under the DPDP guidelines. We follow the fundamental rule: <strong>never collect, store, or transmit data that is not strictly necessary for energy simulation and facility safety.</strong>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                    <h4 className="font-bold text-rose-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <EyeOff className="w-4 h-4 text-rose-400" />
                      What We NEVER Collect
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                      <li>Personal phone numbers or home addresses</li>
                      <li>Face biometric templates or webcam footage</li>
                      <li>Keystroke telemetry or browser history</li>
                      <li>GPS geolocation coordinates of individual users</li>
                      <li>Financial credit card or banking information</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      What We Strictly Collect
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                      <li>Campus sub-meter power feeds (kW, kVA)</li>
                      <li>Rooftop solar generation kW</li>
                      <li>Anonymous headcount per room (e.g., 8 people)</li>
                      <li>Department name & role (AIML / HOD / Principal)</li>
                      <li>Feedback comments voluntarily submitted</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 6: AUDITED THIRD-PARTY SDKs */}
          {currentTab === 'sdks' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Audited Third-Party SDKs & Libraries</h2>
                  <p className="text-xs text-slate-400">Full Open-Source License & Security Audit Inventory</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  AuraSync eliminates all third-party commercial ad trackers, analytics spyware, and closed-source telemetry. Every library integrated into this web client has been vetted for security and open-source compliance:
                </p>

                <div className="space-y-2.5">
                  {[
                    {
                      name: 'TensorFlow.js (@tensorflow/tfjs & coco-ssd)',
                      license: 'Apache-2.0',
                      purpose: 'On-device client-side computer vision inference for real-time room occupancy.'
                    },
                    {
                      name: 'Three.js & @react-three/fiber',
                      license: 'MIT License',
                      purpose: 'Hardware-accelerated WebGL 3D rendering of the DSATM campus digital twin.'
                    },
                    {
                      name: 'Socket.IO Client',
                      license: 'MIT License',
                      purpose: 'Bi-directional low-latency microgrid telemetry over WebSocket protocol.'
                    },
                    {
                      name: 'MapLibre GL',
                      license: 'BSD-3-Clause',
                      purpose: 'Interactive 2D spatial maps of the DSATM campus buildings and solar arrays.'
                    },
                    {
                      name: 'Framer Motion',
                      license: 'MIT License',
                      purpose: 'Fluid physics-based UI transitions and liquid morphism rendering.'
                    },
                    {
                      name: 'Lucide React',
                      license: 'ISC License',
                      purpose: 'Accessible, scalable vector iconography across the user interface.'
                    },
                    {
                      name: 'Recharts',
                      license: 'MIT License',
                      purpose: 'Responsive SVG data visualizations for solar kW and carbon benchmarks.'
                    }
                  ].map((sdk, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-xs">{sdk.name}</div>
                        <div className="text-[11px] text-slate-400">{sdk.purpose}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300 shrink-0 self-start sm:self-auto">
                        {sdk.license}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* TAB 7: ANTI-DARK PATTERNS & ETHICS */}
          {currentTab === 'transparency' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Anti-Dark Patterns & Scientific Integrity</h2>
                  <p className="text-xs text-slate-400">Zero Deception, Scientific Carbon Standards, Authentic Reviews</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Remove Dark Patterns
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      We never use artificial urgency countdowns, hidden opt-out toggles, fake "Only 2 rooms left!" notices, or deceptive confirm-shaming dialogues.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Remove Hidden Fees
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      100% free academic platform. All currency metrics represent physical DSATM electricity bill savings, never fees charged to users.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Remove Fake Reviews
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      All feedback entries displayed on the campus board originate from authenticated student USNs and verified faculty email IDs.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Remove Unsupported Claims
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Every emission factor (0.71 kg CO₂e/kWh) adheres to the Central Electricity Authority of India (CEA v19). Solar offsets follow standard IEEE 1547 inverter models.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 8: INSTITUTIONAL DETAILS */}
          {currentTab === 'business' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Institutional & Campus Business Details</h2>
                  <p className="text-xs text-slate-400">Dayananda Sagar Academy of Technology & Management (DSATM)</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Institution Name</div>
                    <div className="font-bold text-white">{institutionData.institutionName}</div>
                    <div className="text-xs text-emerald-400">Affiliated to VTU Belagavi & Approved by AICTE</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Campus Location & Address</div>
                    <div className="text-xs text-white font-medium">{institutionData.location}</div>
                    <div className="text-xs text-slate-400">PIN Code: {institutionData.pincode} • Karnataka, India</div>
                    <CopyButton text={`${institutionData.institutionName}, ${institutionData.location}, PIN: ${institutionData.pincode}`} label="Copy Address" />
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Campus Leadership</div>
                    <div className="text-xs text-white font-bold">Principal: Dr. M. Ravishankar</div>
                    <div className="text-xs text-emerald-300">HOD AIML: Dr. Sandhya V.</div>
                    <div className="text-[11px] text-slate-400">Engineering Faculty & Research Supervision</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Official Grievance & Energy Contact</div>
                    <div className="text-xs text-white font-mono font-bold">energy-twin@dsatm.edu.in</div>
                    <div className="text-xs text-slate-300 font-mono">+91 80 2843 2999</div>
                    <CopyButton text="energy-twin@dsatm.edu.in" label="Copy Email" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 9: CHILDREN'S AGE CONSENT */}
          {currentTab === 'age-consent' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Age Consent & Protection of Minors</h2>
                  <p className="text-xs text-slate-400">COPPA & DPDP Child Data Protection Compliance</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  AuraSync Energy Twin is an engineering higher education platform designed specifically for university students, faculty, and authorized campus researchers aged <strong>18 years or older</strong>.
                </p>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200">
                  <h4 className="font-bold text-white mb-1">Notice Regarding Children Under 18</h4>
                  <p className="text-xs leading-relaxed">
                    We do not knowingly solicit, collect, or store personal information from minors under the age of 18. If a child under the age of 18 visits our campus or interacts with public demo screens, no personal identifiers are retained. If a parent or guardian becomes aware that personal data of a minor was inadvertently submitted, please contact <strong className="text-white">energy-twin@dsatm.edu.in</strong> for immediate permanent deletion.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* TAB 10: DATA DELETION REQUESTS */}
          {currentTab === 'deletion' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Self-Service Data Deletion Request</h2>
                  <p className="text-xs text-slate-400">Right to be Forgotten under DPDP Act & GDPR Article 17</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  You have the statutory right to request permanent erasure of all personal data, feedback tickets, and session tokens linked to your account.
                </p>

                {deletionSubmitted ? (
                  <div className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-white text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Data Deletion Request Processed!</span>
                    </div>
                    <p className="text-xs">
                      All local tokens and cached profile records for <strong className="text-white">{deletionEmail}</strong> have been marked for immediate purge. Institutional audit logs retain only anonymized energy sensor data.
                    </p>
                    <button
                      type="button"
                      onClick={() => setDeletionSubmitted(false)}
                      className="mt-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setDeletionConfirmOpen(true); }} className="space-y-4 max-w-lg">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Registered Campus Email ID</label>
                      <input
                        type="email"
                        value={deletionEmail}
                        onChange={(e) => setDeletionEmail(e.target.value)}
                        required
                        className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Reason for Deletion</label>
                      <select
                        value={deletionReason}
                        onChange={(e) => setDeletionReason(e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="Graduation / Term Completed">Graduation / Term Completed</option>
                        <option value="Privacy Preference">Privacy Preference (Revoke Consent)</option>
                        <option value="Account Redundancy">Account Redundancy</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide transition flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Initiate Permanent Data Deletion</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Confirmation Modal */}
              {deletionConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <div className="w-full max-w-md p-6 rounded-3xl glass-panel bg-[#0B0F19] border border-rose-500/40 space-y-4 shadow-2xl text-left">
                    <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Confirm Right to Erasure</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Are you sure you want to purge all records linked to <strong className="text-white">{deletionEmail}</strong>? This action will invalidate your current session token and delete your feedback history.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setDeletionConfirmOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteDeletion}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        Confirm & Purge Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 11: EMAIL UNSUBSCRIBE */}
          {currentTab === 'unsubscribe' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <MailCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Campus Energy Alert Communication Manager</h2>
                  <p className="text-xs text-slate-400">1-Click Email Unsubscribe & Notification Preferences</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  We respect your inbox. You can opt out of non-critical campus microgrid reports, weekly carbon digest emails, and solar performance summaries at any time.
                </p>

                {unsubStatus === 'success' ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Unsubscribe Successful</span>
                    </div>
                    <p className="text-xs">
                      {unsubEmail} has been opted out of campus energy email bulletins. (Critical safety notifications remain unaffected).
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleUnsubscribe} className="space-y-3 max-w-lg">
                    <label className="text-xs font-bold text-slate-300 block">Enter Email to Unsubscribe</label>
                    <input
                      type="email"
                      value={unsubEmail}
                      onChange={(e) => setUnsubEmail(e.target.value)}
                      placeholder="e.g., student@dsatm.edu.in"
                      required
                      className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />

                    {unsubStatus === 'error' && (
                      <div className="text-xs text-rose-400">Please enter a valid email address.</div>
                    )}

                    <button
                      type="submit"
                      className="py-2.5 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Update Notification Preferences
                    </button>
                  </form>
                )}
              </div>
            </section>
          )}

          {/* TAB 12: FAQS */}
          {currentTab === 'faq' && (
            <section className="rounded-3xl glass-panel bg-[#0B0F19]/80 border border-white/10 p-6 sm:p-8 space-y-6">
              <ExpandableFAQ />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
