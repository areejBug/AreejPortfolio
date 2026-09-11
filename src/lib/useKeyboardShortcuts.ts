import { useEffect } from "react";
import { useStore } from "../store";
import { openTerminal, openProjectsExplorer, openAbout } from "./actions";

/**
 * Global shortcuts: Alt+T terminal, Alt+P projects, Alt+A about, Esc closes
 * the frontmost open window (except Terminal, which Esc deliberately leaves
 * alone so it can't be accidentally lost).
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const s = useStore.getState();
        const front = [...s.windowOrder].reverse().find((w) => s.windows[w].open);
        if (front && front !== "term") s.closeWindow(front);
      }
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        openTerminal();
      }
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        openProjectsExplorer();
      }
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        openAbout();
      }
    }
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  }, []);
}
