/**
 * AuraSync Utility Library
 * DSATM - O(1) Outlaws: AIML Engineers
 */

// Formatter for Indian Rupees with Indian digit grouping
export function formatINR(value) {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  const num = Math.round(Number(value));
  return '₹' + new Intl.NumberFormat('en-IN').format(num);
}

// Indian number grouping without currency symbol
export function formatNumberIN(value, decimals = 0) {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Number(value));
}

export function formatKw(kw) {
  return `${formatNumberIN(kw, 1)} kW`;
}

export function formatKwh(kwh) {
  return `${formatNumberIN(kwh, 0)} kWh`;
}

export function formatCo2(kg) {
  if (kg >= 1000) {
    return `${formatNumberIN(kg / 1000, 2)} tonnes CO₂e`;
  }
  return `${formatNumberIN(kg, 1)} kg CO₂e`;
}

// Web Audio API Soft Chime Generator for Dynamic Island and UI cues
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playChime(type = 'bubble') {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      if (type === 'bubble') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.1); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Soft fail if audio blocked by browser policy
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

export const sounds = new SoundManager();
