import { create } from "zustand";

export type WindowId = "term" | "exp" | "app" | "doc";
export type DocId = "about" | "skills" | "contact";
export type ThemeName = "default" | "midnight" | "retro" | "vaporwave" | "terminal";

export const THEMES: ThemeName[] = [
  "default",
  "midnight",
  "retro",
  "vaporwave",
  "terminal",
];

type WindowState = {
  open: boolean;
  minimized: boolean;
};

export type SnapGhostRect = {
  left: string;
  top: string;
  width: string;
  height: string;
} | null;

export type Store = {
  /** Stacking order of windows that have ever been opened this session; last = frontmost. */
  windowOrder: WindowId[];
  windows: Record<WindowId, WindowState>;
  activeProject?: string;
  activeDoc?: DocId;
  theme: ThemeName;
  snapGhost: SnapGhostRect;
  /** One-time first-boot tip balloon — dismissed, never shown again this session. */
  balloonDismissed: boolean;

  openWindow: (w: WindowId) => void;
  closeWindow: (w: WindowId) => void;
  minimizeWindow: (w: WindowId) => void;
  toggleWindow: (w: WindowId) => void;
  focusWindow: (w: WindowId) => void;
  isFront: (w: WindowId) => boolean;

  openProject: (id: string) => void;
  openDoc: (id: DocId) => void;

  setTheme: (t: ThemeName) => void;
  cycleTheme: () => void;

  setSnapGhost: (g: SnapGhostRect) => void;
  dismissBalloon: () => void;
};

const initialWindows: Record<WindowId, WindowState> = {
  term: { open: false, minimized: false },
  exp: { open: false, minimized: false },
  app: { open: false, minimized: false },
  doc: { open: false, minimized: false },
};

export const useStore = create<Store>((set, get) => ({
  windowOrder: [],
  windows: initialWindows,
  activeProject: undefined,
  activeDoc: undefined,
  theme: "default",
  snapGhost: null,
  balloonDismissed: false,

  openWindow: (w) =>
    set((s) => ({
      windowOrder: s.windowOrder.includes(w)
        ? [...s.windowOrder.filter((x) => x !== w), w]
        : [...s.windowOrder, w],
      windows: { ...s.windows, [w]: { open: true, minimized: false } },
    })),

  closeWindow: (w) =>
    set((s) => ({
      windows: { ...s.windows, [w]: { open: false, minimized: false } },
    })),

  minimizeWindow: (w) =>
    set((s) => ({
      windows: { ...s.windows, [w]: { ...s.windows[w], open: false, minimized: true } },
    })),

  toggleWindow: (w) => {
    const st = get().windows[w];
    if (st.open && !st.minimized) get().minimizeWindow(w);
    else get().openWindow(w);
  },

  focusWindow: (w) =>
    set((s) => ({
      windowOrder: s.windowOrder.includes(w)
        ? [...s.windowOrder.filter((x) => x !== w), w]
        : [...s.windowOrder, w],
    })),

  isFront: (w) => {
    const s = get();
    const openStack = s.windowOrder.filter((x) => s.windows[x].open);
    return openStack.length > 0 && openStack[openStack.length - 1] === w;
  },

  openProject: (id) =>
    set((s) => ({
      activeProject: id,
      windowOrder: s.windowOrder.includes("app")
        ? [...s.windowOrder.filter((x) => x !== "app"), "app"]
        : [...s.windowOrder, "app"],
      windows: { ...s.windows, app: { open: true, minimized: false } },
    })),

  openDoc: (id) =>
    set((s) => ({
      activeDoc: id,
      windowOrder: s.windowOrder.includes("doc")
        ? [...s.windowOrder.filter((x) => x !== "doc"), "doc"]
        : [...s.windowOrder, "doc"],
      windows: { ...s.windows, doc: { open: true, minimized: false } },
    })),

  setTheme: (t) => {
    document.body.dataset.theme = t;
    set({ theme: t });
  },

  cycleTheme: () => {
    const cur = get().theme;
    const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
    get().setTheme(next);
  },

  setSnapGhost: (g) => set({ snapGhost: g }),

  dismissBalloon: () => set({ balloonDismissed: true }),
}));
