import { create } from 'zustand';

const SAVED_ANCHOR_KEY = 'aurasync_island_anchor';
const SAVED_POS_KEY = 'aurasync_island_pos';

export const useIslandStore = create((set, get) => {
  // Default to bottom-center dock so the top navigation bar is 100% visible and unobstructed
  let initialAnchor = 'bottom-center';
  let initialPos = { x: 0, y: 0 };
  try {
    const savedAnchor = localStorage.getItem(SAVED_ANCHOR_KEY);
    const savedPos = localStorage.getItem(SAVED_POS_KEY);
    // Auto-migrate any legacy 'top-center' to 'bottom-center' to avoid blocking top navbar links
    if (savedAnchor && savedAnchor !== 'top-center') {
      initialAnchor = savedAnchor;
    } else {
      localStorage.setItem(SAVED_ANCHOR_KEY, 'bottom-center');
    }
    if (savedPos) initialPos = JSON.parse(savedPos);
  } catch {}

  return {
    anchor: initialAnchor, // 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right' | 'free'
    position: initialPos, // for free drag
    isDragging: false,
    isExpanded: false,
    isMuted: false,
    activeEvent: null, // null = IDLE state
    eventQueue: [],
    statementIndex: 0,

    setAnchor: (newAnchor) => {
      try {
        localStorage.setItem(SAVED_ANCHOR_KEY, newAnchor);
      } catch {}
      set({ anchor: newAnchor });
    },

    setPosition: (pos) => {
      try {
        localStorage.setItem(SAVED_POS_KEY, JSON.stringify(pos));
      } catch {}
      set({ position: pos, anchor: 'free' });
    },

    setIsDragging: (isDragging) => set({ isDragging }),
    toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
    setExpanded: (expanded) => set({ isExpanded: expanded }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

    pushEvent: (event) => {
      const { activeEvent, eventQueue } = get();
      if (!activeEvent) {
        set({ activeEvent: event });
      } else {
        // High priority (critical) goes to front
        if (event.severity === 'critical') {
          set({ activeEvent: event, eventQueue: [activeEvent, ...eventQueue] });
        } else {
          set({ eventQueue: [...eventQueue, event] });
        }
      }
    },

    nextEvent: () => {
      const { eventQueue } = get();
      if (eventQueue.length > 0) {
        const [next, ...rest] = eventQueue;
        set({ activeEvent: next, eventQueue: rest });
      } else {
        set({ activeEvent: null });
      }
    },

    dismissCurrentEvent: () => {
      get().nextEvent();
    },

    nextStatement: (totalStatements) => {
      set((state) => ({
        statementIndex: (state.statementIndex + 1) % totalStatements
      }));
    },

    resetIsland: () => {
      try {
        localStorage.setItem(SAVED_ANCHOR_KEY, 'bottom-center');
        localStorage.removeItem(SAVED_POS_KEY);
      } catch {}
      set({ anchor: 'bottom-center', position: { x: 0, y: 0 }, isExpanded: false });
    }
  };
});
