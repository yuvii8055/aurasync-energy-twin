import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Zap, Lock, Leaf, Eye, Server } from 'lucide-react';

export default function ExpandableFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      icon: Zap,
      q: 'How does AuraSync calculate "Ghost Gap" and campus energy waste?',
      a: 'The Ghost Gap is the difference between real-time facility electricity consumption and the ideal thermodynamic baseline required for actual room occupancy. Using synthetic microgrid feeds, BESCOM tariff slabs (₹8.25/kWh), and edge vision occupancy counters, AuraSync isolates unutilized AC compressors, empty lab lighting, and elevator idling.'
    },
    {
      icon: Eye,
      q: 'Does the Phone Camera / Computer Vision feature compromise student or staff privacy?',
      a: 'Absolutely not. AuraSync runs local client-side computer vision inference inside the web browser using lightweight TensorFlow.js. Only numeric counts (e.g., personCount: 4, lightCount: 8, acCount: 2) and anonymized bounding boxes are processed. No video streams, photographs, or biometric facial signatures are ever recorded, stored, or transmitted to any server.'
    },
    {
      icon: Leaf,
      q: 'What standard is used for DSATM Net-Zero carbon accounting?',
      a: 'We strictly follow the Central Electricity Authority (CEA) India grid emission baseline of 0.71 kg CO₂e per kWh of purchased electricity. Solar offsets from our 78 kW rooftop solar PV array are deducted in real-time to compute Scope 2 greenhouse gas emissions.'
    },
    {
      icon: Lock,
      q: 'Who has authority to execute the Campus Master Eco Switch?',
      a: 'The Campus Master Eco Switch requires an authorized cryptographic passkey. Institutional leadership—Principal Dr. M. Ravishankar and HOD Dr. Sandhya V.—have administrative oversight. Automated relay overrides are logged in immutable audit records.'
    },
    {
      icon: Server,
      q: 'How can I exercise my Right to Data Deletion under DPDP / GDPR?',
      a: 'Under our Data Minimization commitment, you can initiate a data erasure request at any time via our Legal & Compliance Hub (/legal?tab=deletion) or contact the campus data grievance officer at energy-twin@dsatm.edu.in. All local session tokens and cached feedback will be immediately expunged.'
    },
    {
      icon: ShieldCheck,
      q: 'Are there any hidden fees, subscription costs, or dark patterns?',
      a: 'None. AuraSync Energy Twin is a 100% free, open educational and research digital twin built by the O(1) Outlaws AIML team for Dayananda Sagar Academy of Technology & Management (DSATM). There are zero paywalls, zero misleading countdowns, and zero commercial upsells.'
    }
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 ml-auto">
          DSATM Energy Twin Guide
        </span>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const IconComponent = faq.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white/[0.05] border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition select-none cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      isOpen
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-white tracking-tight">
                    {faq.q}
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                  <p className="pl-11">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
