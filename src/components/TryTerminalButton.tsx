import { useStore } from "../store";
import { openTerminal } from "../lib/actions";
import { sClick } from "../lib/audio";

/** Sits in the "doc" window's title bar in place of the maximize button —
 * only on the About tab specifically, not Skills/Contact, and not
 * on the project-detail window at all. */
export function TryTerminalButton() {
  const activeDoc = useStore((s) => s.activeDoc);
  if (activeDoc !== "about") return null;

  return (
    <button
      type="button"
      className="try-terminal-btn"
      onClick={() => {
        sClick();
        openTerminal();
      }}
    >
      ▶ Try the terminal
    </button>
  );
}
