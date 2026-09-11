import { useEffect, useState } from "react";
import { useStore, type WindowId } from "../store";
import { useTaskbarLabel } from "../lib/windowTitles";
import { sClick } from "../lib/audio";

function formatClock(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function useClock() {
  const [label, setLabel] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const id = setInterval(() => setLabel(formatClock(new Date())), 20000);
    return () => clearInterval(id);
  }, []);
  return label;
}

const WINDOW_IDS: WindowId[] = ["term", "exp", "app", "doc"];

export function Taskbar() {
  const windows = useStore((s) => s.windows);
  const windowOrder = useStore((s) => s.windowOrder);
  const openWindow = useStore((s) => s.openWindow);
  const focusWindow = useStore((s) => s.focusWindow);
  const cycleTheme = useStore((s) => s.cycleTheme);
  const theme = useStore((s) => s.theme);
  const clock = useClock();

  const titles: Record<WindowId, string> = {
    term: useTaskbarLabel("term"),
    exp: useTaskbarLabel("exp"),
    app: useTaskbarLabel("app"),
    doc: useTaskbarLabel("doc"),
  };

  const frontWindow = [...windowOrder].reverse().find((w) => windows[w].open);

  // No pinned slots — every window (including Terminal) only shows up on the
  // taskbar once it has actually been opened this session, and disappears
  // again once fully closed. Order follows windowOrder for anything
  // windowOrder doesn't know about yet (shouldn't happen, but keeps this
  // total rather than partial).
  const tasks = WINDOW_IDS.filter((w) => windows[w].open || windows[w].minimized).sort(
    (a, b) => windowOrder.indexOf(a) - windowOrder.indexOf(b),
  );

  function handleTaskClick(w: WindowId) {
    sClick();
    if (!windows[w].open) openWindow(w);
    else focusWindow(w);
  }

  return (
    <div className="taskbar">
      <div className="tasks">
        {tasks.map((w) => (
          <button
            key={w}
            type="button"
            className={`task${windows[w].open && frontWindow === w ? " active" : ""}`}
            onClick={() => handleTaskClick(w)}
          >
            {titles[w]}
          </button>
        ))}
      </div>
      <button
        className="theme-btn"
        type="button"
        aria-label="Cycle theme"
        onClick={() => {
          sClick();
          cycleTheme();
        }}
      >
        {theme}
      </button>
      <div className="clock" aria-label="Current time">
        {clock}
      </div>
    </div>
  );
}
