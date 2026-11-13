import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollEnhancements() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
          const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrollPercent = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
          setScrollProgress(scrollPercent);
          setShowBackToTop(totalScroll > 280);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Scroll Progress Bar at the Very Top */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[999999] pointer-events-none transition-all duration-100 ease-out print:hidden"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #10B981, #14B8A6, #06B6D4)',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.7), 0 0 5px rgba(6, 182, 212, 0.5)'
        }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-6 right-22 sm:right-24 z-40 p-3 rounded-full glass-panel bg-[#0B0F19]/90 border border-white/20 text-emerald-400 hover:text-white hover:bg-emerald-600/30 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 print:hidden"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </>
  );
}
