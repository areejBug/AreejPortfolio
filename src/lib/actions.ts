import { useStore } from "../store";
import { sOpen } from "./audio";

/**
 * Shared cross-surface actions (desktop icons, Start menu, mobile
 * nav, Explorer sidebar, terminal commands all trigger the same behaviour).
 * Plain functions rather than hooks so they can be called from any event
 * handler without regard to the rules of hooks.
 */

export function openProjectsExplorer() {
  sOpen();
  useStore.getState().openWindow("exp");
}

export function openAbout() {
  sOpen();
  useStore.getState().openDoc("about");
}

export function openSkills() {
  sOpen();
  useStore.getState().openDoc("skills");
}

export function openContact() {
  sOpen();
  useStore.getState().openDoc("contact");
}

export function openTerminal(focusInput = true) {
  sOpen();
  useStore.getState().openWindow("term");
  if (focusInput) {
    // Terminal owns its own input ref; it listens for this custom event
    // instead of App reaching into its internals directly.
    requestAnimationFrame(() => window.dispatchEvent(new Event("terminal-focus")));
  }
}

export function openProject(id: string) {
  sOpen();
  useStore.getState().openProject(id);
}
