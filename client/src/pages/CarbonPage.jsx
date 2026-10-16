import React, { useState, useEffect } from 'react';
import {
  Zap,
  Flame,
  Leaf,
  Sun,
  Award,
  Download,
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatINR, formatCo2, formatNumberIN, sounds } from '../lib/utils.js';
import institutionData from '../config/institution.json';

export default function CarbonPage() {
  const [carbonData, setCarbonData] = useState(null);
  const [passport, setPassport] = useState(null);
  const [pledgeInput, setPledgeInput] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    fetch('/api/carbon/summary')
      .then(res => res.json())
      .then(json => { if (json.success) setCarbonData(json.data); })
      .catch(() => {});

    fetch('/api/carbon/passport')
      .then(res => res.json())
      .then(json => { if (json.success) setPassport(json.data); })
      .catch(() => {});
  }, []);

  const [pledgeFeedback, setPledgeFeedback] = useState(null);

  const handlePledge = async (e) => {
    e.preventDefault();
    if (!pledgeInput) return;
    setPledgeFeedback(null);
    try {
      const res = await fetch('/api/carbon/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pledgeText: pledgeInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playChime('success');
        setPledgeFeedback({ type: 'success', message: data.message });
        setPledgeInput('');
        // Refresh passport to show updated points and pledge
        fetch('/api/carbon/passport')
          .then(r => r.json())
          .then(json => { if (json.success) setPassport(json.data); })
          .catch(() => {});
      } else {
        sounds.playChime('alert');
        setPledgeFeedback({
          type: 'error',
          message: data.error || 'Pledge rejected: Please enter a genuine sustainability action for DSATM.'
        });
      }
    } catch (err) {
      setPledgeFeedback({ type: 'error', message: 'Network error submitting pledge. Please retry.' });
    }
  };

  // Generate Green Audit PDF Report with jsPDF
  const generateEsgPdf = () => {
    setIsGeneratingPdf(true);
    sounds.playChime('bubble');

    setTimeout(() => {
      try {
        const doc = new jsPDF();

        // Header Title
        doc.setFontSize(18);
        doc.setTextColor(16, 185, 129);
        doc.text("DSATM CAMPUS SUSTAINABILITY & ESG REPORT", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text("Dayananda Sagar Academy of Technology and Management, Bengaluru", 14, 27);
        doc.text("Developed by O(1) Outlaws: AIML Engineers • October 2026", 14, 33);

        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 37, 196, 37);

        // Summary Highlights
        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20);
        doc.text("1. Executive Summary & KPIs", 14, 46);

        doc.autoTable({
          startY: 50,
          head: [['Metric', 'Value', 'Benchmark Notes']],
          body: [
            ['Total Monthly Emissions', '84,210 kg CO2e', 'Within target allocation'],
            ['Avoided via Solar & Optimization', '18,450 kg CO2e', '21.9% reduction'],
            ['Total Cost Savings', 'Rs 1,52,210', 'Calculated at BESCOM HT Rs 8.25/kWh'],
            ['Green Campus Score', '84 / 100', 'Top 5% among technical campuses in Karnataka'],
            ['Grid Baseline Factor', '0.71 kg CO2e/kWh', 'CEA National Grid Standard']
          ],
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129] }
        });

        // Scope 1, 2, 3 Breakdown Table
        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20);
        doc.text("2. Greenhouse Gas Protocol Accounting (Scope 1, 2 & 3)", 14, doc.lastAutoTable.finalY + 12);

        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 16,
          head: [['Scope Category', 'Emissions (kg CO2e)', 'Share (%)', 'Key Primary Sources']],
          body: [
            ['Scope 1 (Direct)', '9,400 kg', '11.2%', 'Diesel DG Backup Sets, Mess Canteen LPG'],
            ['Scope 2 (Indirect Grid)', '58,600 kg', '69.6%', 'BESCOM 11kV Grid Electricity Imports'],
            ['Scope 3 (Other Indirect)', '16,210 kg', '19.2%', 'Student Bus Commute, Municipal Water, Waste']
          ],
          theme: 'grid',
          headStyles: { fillColor: [6, 182, 212] }
        });

        // Disclaimer Note
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(
          "Notice: Internal Sustainability Audit Template. Tariff & emission assumptions based on BESCOM schedules.",
          14,
          doc.lastAutoTable.finalY + 15
        );

        doc.save("DSATM_AuraSync_ESG_Sustainability_Report_2026.pdf");
        setIsGeneratingPdf(false);
        sounds.playChime('success');
      } catch (err) {
        setIsGeneratingPdf(false);
        alert('Failed to generate PDF: ' + err.message);
      }
    }, 600);
  };

  const scope = carbonData?.scopeBreakdown;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Campus ESG & Carbon Accounting Center
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Scope 1, 2, 3 Emissions & Net-Zero 2030 Pathway
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aligned with GHG Protocol • Realtime BESCOM Grid Factor 0.71 kg CO₂e/kWh
          </p>
        </div>

        {/* PDF Export Button */}
        <button
          onClick={generateEsgPdf}
          disabled={isGeneratingPdf}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-xs shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isGeneratingPdf ? 'Compiling PDF Report...' : 'Download Green Audit PDF'}</span>
        </button>
      </div>

      {/* Scope 1, Scope 2, Scope 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Scope 1 */}
        <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scope 1 (Direct)</span>
            <span className="text-xs font-mono font-bold text-amber-400">{scope?.scope1?.pct || 11.2}%</span>
          </div>
          <div className="text-2xl font-mono font-black text-white">
            {formatCo2(scope?.scope1?.totalKg || 9400)}
          </div>
          <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
            {scope?.scope1?.sources.map((s, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="text-slate-400 truncate max-w-[160px]">{s.name}</span>
                <span className="font-mono text-amber-300">{s.kg} kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scope 2 */}
        <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scope 2 (Grid Electricity)</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{scope?.scope2?.pct || 69.6}%</span>
          </div>
          <div className="text-2xl font-mono font-black text-white">
            {formatCo2(scope?.scope2?.totalKg || 58600)}
          </div>
          <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
            {scope?.scope2?.sources.map((s, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="text-slate-400 truncate max-w-[160px]">{s.name}</span>
                <span className="font-mono text-cyan-300">{s.kg} kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scope 3 */}
        <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scope 3 (Commute & Waste)</span>
            <span className="text-xs font-mono font-bold text-purple-400">{scope?.scope3?.pct || 19.2}%</span>
          </div>
          <div className="text-2xl font-mono font-black text-white">
            {formatCo2(scope?.scope3?.totalKg || 16210)}
          </div>
          <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
            {scope?.scope3?.sources.map((s, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="text-slate-400 truncate max-w-[160px]">{s.name}</span>
                <span className="font-mono text-purple-300">{s.kg} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carbon-Aware Hourly Scheduling Banner */}
      <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Carbon-Aware Load Shifting Schedule
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Shift flexible loads (ElectricPe EV hub, STP pumps, hostel geysers) to green solar hours
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
            ☀️ Cleanest Window: 11:00 - 14:30 IST
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {carbonData?.carbonAwareHourSchedule?.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${
                item.status === 'cleanest'
                  ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-black/30 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{item.hour}</span>
                <span className="font-mono">{item.intensityKgKwh} kg/kWh</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">{item.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Carbon Passport & Pledge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Your Personal Carbon Passport
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
              {passport?.ecoScorePoints || 420} Eco Points
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-400 font-sans">Monthly Footprint</div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">{passport?.monthlyFootprintKg || 18.4} kg CO₂e</div>
              <div className="text-[9px] text-slate-500 font-sans mt-0.5">Campus Avg: 24.8 kg</div>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-400 font-sans">Green Streak</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">{passport?.streakDays || 19} Days Active</div>
              <div className="text-[9px] text-slate-500 font-sans mt-0.5">Top 10% in AIML Dept</div>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-300">Earned Badges</div>
            <div className="flex flex-wrap gap-2">
              {passport?.badges?.map((b) => (
                <div key={b.id} className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center gap-2">
                  <span className="text-base">🏅</span>
                  <div>
                    <div className="font-bold text-white text-[11px]">{b.name}</div>
                    <div className="text-[9px] text-slate-400">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Eco Pledge */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Take an Eco Pledge for DSATM
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Verified Eco AI (+25 Pts)
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Submit a verified energy-saving action (e.g., turning off empty classroom AC, taking stairs, unplugging idle chargers) to earn Green Points. Non-environmental or random inputs will be rejected.
          </p>

          {/* Quick Verified Eco Pledges */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Quick Verified Commitments:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Switched off classroom lights and fans when leaving Lab 204',
                'Took the stairs instead of the elevator to 3rd floor',
                'Reported dripping washroom tap for water conservation',
                'Unplugged laptop charger from socket after 100% full charge'
              ].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => {
                    setPledgeInput(quick);
                    setPledgeFeedback(null);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-[11px] text-slate-300 hover:text-emerald-300 text-left transition"
                >
                  🌱 {quick}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Banner */}
          {pledgeFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in duration-150 ${
                pledgeFeedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              <span className="text-sm">{pledgeFeedback.type === 'success' ? '✅' : '❌'}</span>
              <span className="leading-relaxed font-medium">{pledgeFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handlePledge} className="space-y-3">
            <input
              type="text"
              required
              placeholder="e.g. Switched off Classroom 103 lights and fans after lab session"
              value={pledgeInput}
              onChange={(e) => {
                setPledgeInput(e.target.value);
                if (pledgeFeedback) setPledgeFeedback(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              Commit Eco Pledge (+25 Points)
            </button>
          </form>

          <div className="text-[11px] text-slate-400 italic pt-1">
            "{institutionData.statements[2]}"
          </div>
        </div>
      </div>
    </div>
  );
}
