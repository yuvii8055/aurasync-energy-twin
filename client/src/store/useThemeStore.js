import { create } from 'zustand';

const SETTINGS_KEY = 'aurasync_theme_settings_v2';

const SCALE_MAP = {
  compact: '88%',
  normal: '100%',
  large: '112%',
  kiosk: '124%'
};

function applyAllSettingsToDOM(settings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  // 1. Theme
  root.setAttribute('data-theme', settings.theme || 'midnight');
  if (settings.theme === 'eco-light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }

  // 2. Accent Color
  root.setAttribute('data-accent', settings.accentColor || 'emerald');

  // 3. Desktop UI Scaling
  const scalePercent = SCALE_MAP[settings.displayScale] || '100%';
  root.style.fontSize = scalePercent;
  root.setAttribute('data-scale', settings.displayScale || 'normal');

  // 4. Glass Blur Intensity
  root.setAttribute('data-glass-blur', settings.glassBlur || 'medium');

  // 5. Container Layout
  root.setAttribute('data-container-width', settings.containerWidth || 'standard');
}

export const useThemeStore = create((set, get) => {
  let initial = {
    theme: 'midnight', // 'midnight' | 'obsidian' | 'eco' | 'cyber' | 'eco-light'
    accentColor: 'emerald', // 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose'
    displayScale: 'normal', // 'compact' | 'normal' | 'large' | 'kiosk'
    containerWidth: 'standard', // 'standard' | 'wide' | 'fluid'
    glassBlur: 'medium', // 'subtle' | 'medium' | 'heavy'
    soundEnabled: true
  };

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      initial = { ...initial, ...JSON.parse(saved) };
    }
  } catch {}

  // Apply immediately on initialization
  applyAllSettingsToDOM(initial);

  return {
    ...initial,

    setTheme: (newTheme) => {
      const next = { ...get(), theme: newTheme };
      applyAllSettingsToDOM(next);
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
      set({ theme: newTheme });
    },

    setAccentColor: (color) => {
      const next = { ...get(), accentColor: color };
      applyAllSettingsToDOM(next);
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
      set({ accentColor: color });
    },

    setDisplayScale: (scale) => {
      const next = { ...get(), displayScale: scale };
      applyAllSettingsToDOM(next);
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
      set({ displayScale: scale });
    },

    setContainerWidth: (width) => {
      const next = { ...get(), containerWidth: width };
      applyAllSettingsToDOM(next);
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
      set({ containerWidth: width });
    },

    setGlassBlur: (blur) => {
      const next = { ...get(), glassBlur: blur };
      applyAllSettingsToDOM(next);
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
      set({ glassBlur: blur });
    },

    setSoundEnabled: (enabled) => {
      const next = { ...get(), soundEnabled: enabled };
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
      set({ soundEnabled: enabled });
    },

    resetAllSettings: () => {
      const defaults = {
        theme: 'midnight',
        accentColor: 'emerald',
        displayScale: 'normal',
        containerWidth: 'standard',
        glassBlur: 'medium',
        soundEnabled: true
      };
      applyAllSettingsToDOM(defaults);
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults)); } catch {}
      set(defaults);
    }
  };
});
