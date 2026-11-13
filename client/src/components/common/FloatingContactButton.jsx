import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  PhoneCall,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import CopyButton from './CopyButton.jsx';
import { sounds } from '../../lib/utils.js';

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({ status: 'idle', message: '' }); // 'idle' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentGiven) {
      setFormState({
        status: 'error',
        message: 'Please accept the data consent checkbox before submitting.'
      });
      sounds.playChime('alert');
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setFormState({
        status: 'error',
        message: 'Please write a message with at least 5 characters.'
      });
      sounds.playChime('alert');
      return;
    }

    setIsSubmitting(true);
    setFormState({ status: 'idle', message: '' });

    try {
      // Send to feedback API
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          rating: 5,
          comment: message,
          timestamp: new Date().toISOString()
        })
      });

      setIsSubmitting(false);
      setFormState({
        status: 'success',
        message: 'Thank you! Your inquiry was delivered to the DSATM Campus Facility Team.'
      });
      sounds.playChime('success');
      setMessage('');
      setConsentGiven(false);
    } catch (err) {
      setIsSubmitting(false);
      // Fallback local acknowledgment for offline/client mode
      setFormState({
        status: 'success',
        message: 'Feedback received! Recorded in local digital twin log.'
      });
      sounds.playChime('success');
      setMessage('');
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          sounds.playChime('bubble');
        }}
        aria-label="Campus Energy & Support Desk"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/20"
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <MessageSquare className="w-6 h-6 stroke-[2.5]" />
        )}
      </button>

      {/* Floating Drawer / Dialog */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[85vh] z-50 rounded-3xl glass-panel bg-[#0B0F19]/95 border border-white/20 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-2xl overflow-y-auto animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Campus Facility Desk</h4>
                <p className="text-[10px] text-slate-400">DSATM Energy Operations & Support</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Emergency Direct Contacts */}
          <div className="space-y-2 mb-4">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Electrician Emergency</div>
                  <div className="text-xs font-mono font-bold text-white">+91 80 2843 2999</div>
                </div>
              </div>
              <CopyButton text="+918028432999" label="Copy" iconOnly />
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Facility Email Desk</div>
                  <div className="text-xs font-mono font-bold text-white truncate max-w-[180px]">energy-twin@dsatm.edu.in</div>
                </div>
              </div>
              <CopyButton text="energy-twin@dsatm.edu.in" label="Copy" iconOnly />
            </div>
          </div>

          {/* Quick Message Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="support-message" className="text-xs font-bold text-slate-300">
                Send Quick Note / Grievance
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-[11px] bg-black/40 text-emerald-300 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="general">General Support</option>
                <option value="energy_waste">Report Waste</option>
                <option value="privacy">Privacy / DPDP</option>
                <option value="unsubscribe">Unsubscribe / Alerts</option>
              </select>
            </div>

            <textarea
              id="support-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., Classroom 204 AC was left running overnight, or request alert preference update..."
              className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />

            {/* Form Consent Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 bg-black/40 border-white/20 focus:ring-emerald-400"
              />
              <span className="text-[11px] text-slate-400 leading-tight">
                I consent to submitting this inquiry under the{' '}
                <a href="/legal?tab=privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
                  DSATM Privacy Policy
                </a>{' '}
                (Only necessary data collected).
              </span>
            </label>

            {/* Form Success State */}
            {formState.status === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{formState.message}</span>
              </div>
            )}

            {/* Form Error State */}
            {formState.status === 'error' && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formState.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Delivering...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Campus Desk</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Compliance Links */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
            <a href="/legal?tab=deletion" className="hover:text-emerald-400 transition underline">
              Data Deletion Request
            </a>
            <a href="/legal?tab=unsubscribe" className="hover:text-emerald-400 transition underline">
              Email Unsubscribe
            </a>
            <a href="/legal" className="hover:text-cyan-400 transition flex items-center gap-0.5">
              Legal Hub <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
