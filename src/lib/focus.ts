import { useStore, type WindowId } from "../store";

const Z_BASE = 20;

/** z-index for a window derived from its position in the shared stacking order. */
export function useWindowZIndex(id: WindowId): number {
  const order = useStore((s) => s.windowOrder);
  const idx = order.indexOf(id);
  return idx === -1 ? Z_BASE : Z_BASE + idx;
}

/** Whether this window is the frontmost *open, non-minimized* window. */
export function useIsFrontWindow(id: WindowId): boolean {
  return useStore((s) => {
    const openStack = s.windowOrder.filter((w) => s.windows[w].open);
    return openStack.length > 0 && openStack[openStack.length - 1] === id;
  });
}

/** The frontmost open, non-minimized window, if any — used for the Esc-closes-front shortcut. */
export function getFrontWindow(): WindowId | undefined {
  const s = useStore.getState();
  const openStack = s.windowOrder.filter((w) => s.windows[w].open);
  return openStack[openStack.length - 1];
}
