import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, Check, X, Settings2, Lock } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    telemetry: true,
    theme: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('aurasync_cookie_consent_v1');
    if (!saved) {
      // Short delay so it slides in cleanly
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'aurasync_cookie_consent_v1',
      JSON.stringify({ essential: true, telemetry: true, theme: true, timestamp: new Date().toISOString() })
    );
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem(
      'aurasync_cookie_consent_v1',
      JSON.stringify({ essential: true, telemetry: false, theme: true, timestamp: new Date().toISOString() })
    );
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem(
      'aurasync_cookie_consent_v1',
      JSON.stringify({ ...preferences, essential: true, timestamp: new Date().toISOString() })
    );
    setShowCustomize(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-[99999] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl glass-panel bg-[#0B0F19]/95 border border-white/20 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.15)] text-left backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
            <Cookie className="w-5 h-5 fill-emerald-400/20" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Campus Cookie & Privacy Notice
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Data Minimization
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
              AuraSync uses strictly essential local cookies and microgrid session storage to remember your role (<span className="text-emerald-300 font-semibold">Dr. Sandhya V.</span>), theme preferences, and campus telemetry. <span className="text-white font-medium">We do not sell personal data or track you across other websites.</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-white/10 text-[11px] text-slate-400">
              <Link to="/legal?tab=cookies" className="text-emerald-400 hover:underline">
                Read Cookie Policy
              </Link>
              <span>•</span>
              <Link to="/legal?tab=privacy" className="text-emerald-400 hover:underline">
                Privacy Policy
              </Link>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowCustomize(!showCustomize)}
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Settings2 className="w-3 h-3" />
                Customize
              </button>
            </div>

            {/* Customization Drawer */}
            {showCustomize && (
              <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      Essential Cookies
                    </div>
                    <div className="text-[10px] text-slate-400">Required for security, role auth & single sign-on</div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Always Active</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div>
                    <div className="font-semibold text-white">Campus Telemetry Cache</div>
                    <div className="text-[10px] text-slate-400">Caches solar kW & energy benchmarks locally</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.telemetry}
                    onChange={(e) => setPreferences({ ...preferences, telemetry: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-white/20"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div>
                    <div className="font-semibold text-white">Theme & UI Preferences</div>
                    <div className="text-[10px] text-slate-400">Saves dark mode and 3D campus graphics fidelity</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-white/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Save Custom Preferences
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3.5">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All</span>
              </button>

              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs border border-white/10 transition cursor-pointer"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
