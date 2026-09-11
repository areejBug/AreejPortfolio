import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useStore, type WindowId } from "../../store";
import { useIsFrontWindow, useWindowZIndex } from "../../lib/focus";
import { useIsMobile } from "../../lib/useMediaQuery";
import { sClick } from "../../lib/audio";

export type WindowRect = { left: string; top: string; width: string; height: string };

type Snap = "none" | "max" | "L" | "R";

type WindowProps = {
  id: WindowId;
  title: string;
  children: ReactNode;
  initialRect: WindowRect;
  titleExtra?: ReactNode;
  /** Grow the window's initial width/height to fit its content's actual
   * measured size (once, right after first mount) instead of trusting
   * initialRect to have guessed correctly — for content whose natural size
   * depends on live data, like the project tree. Never shrinks below
   * initialRect; caps at 90vw/80vh. */
  autoFit?: boolean;
  /** Opens maximized the very first time this window is shown, instead of
   * at initialRect — always exactly fills the current viewport regardless
   * of screen size/device, so there's nothing to clamp or cascade. */
  startMaximized?: boolean;
  /** Whether this window can be maximized at all — no maximize button, no
   * double-click-titlebar-to-maximize, no drag-to-top-edge snap. Defaults
   * to true; only Terminal and Projects opt out of disabling it. */
  allowMaximize?: boolean;
};

const TASKBAR_H = 38;
// Small stagger applied to a window's very first-ever open, per window
// already open at that moment — so a newly opened window never spawns
// stacked directly under/behind one that's already up.
const CASCADE_STEP_PX = 28;
const CASCADE_MAX_STEPS = 4;

export function Window({
  id,
  title,
  children,
  initialRect,
  titleExtra,
  autoFit,
  startMaximized,
  allowMaximize = true,
}: WindowProps) {
  const winState = useStore((s) => s.windows[id]);
  const closeWindow = useStore((s) => s.closeWindow);
  const minimizeWindow = useStore((s) => s.minimizeWindow);
  const focusWindow = useStore((s) => s.focusWindow);
  const setSnapGhost = useStore((s) => s.setSnapGhost);
  const zIndex = useWindowZIndex(id);
  const isFront = useIsFrontWindow(id);
  const isMobile = useIsMobile();

  const [rect, setRect] = useState<WindowRect>(initialRect);
  const [snap, setSnap] = useState<Snap>("none");
  const dragRef = useRef<{
    dx: number;
    dy: number;
    dragging: boolean;
    zone: Snap | null;
  }>({
    dx: 0,
    dy: 0,
    dragging: false,
    zone: null,
  });
  const elRef = useRef<HTMLElement>(null);
  const bodyElRef = useRef<HTMLDivElement>(null);
  const hasOpenedRef = useRef(false);
  const hasAutoFitRef = useRef(false);

  const visible = winState.open && !winState.minimized;

  // First-ever open: either maximize outright, or apply a cascade offset —
  // measured and clamped against the actual current viewport (not assumed),
  // so the window can never land partly or fully off-screen regardless of
  // device/resolution.
  useLayoutEffect(() => {
    if (!winState.open || hasOpenedRef.current) return;
    hasOpenedRef.current = true;

    if (startMaximized) {
      // Same "can't be derived at render time" case as below — depends on
      // whether this is the window's first-ever open, which only this
      // effect can know.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSnap("max");
      return;
    }

    const s = useStore.getState();
    const openOthers = s.windowOrder.filter((w) => w !== id && s.windows[w].open).length;
    if (openOthers === 0) return;
    const el = elRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const offset = Math.min(openOthers, CASCADE_MAX_STEPS) * CASCADE_STEP_PX;
    const left = Math.max(0, Math.min(innerWidth - r.width, r.left + offset));
    const top = Math.max(0, Math.min(innerHeight - TASKBAR_H - r.height, r.top + offset));
    setRect({ left: `${left}px`, top: `${top}px`, width: `${r.width}px`, height: `${r.height}px` });
  }, [winState.open, id, startMaximized]);

  // Auto-fit — measured the first time this window actually becomes
  // visible (not at mount: hidden windows are display:none, so scrollWidth/
  // Height would read 0 then). Runs before paint, so no visible resize pop.
  useLayoutEffect(() => {
    if (!autoFit || !visible || hasAutoFitRef.current) return;
    hasAutoFitRef.current = true;
    const content = bodyElRef.current?.firstElementChild as HTMLElement | null;
    if (!content) return;
    const naturalW = content.scrollWidth;
    const naturalH = content.scrollHeight;
    const maxW = innerWidth * 0.9;
    const maxH = innerHeight * 0.8;
    setRect((r) => ({
      ...r,
      width: `${Math.min(Math.max(naturalW + 6, 320), maxW)}px`,
      height: `${Math.min(Math.max(naturalH + 6, 240), maxH)}px`,
    }));
  }, [autoFit, visible]);

  function onBarMouseDown(e: ReactMouseEvent) {
    if (isMobile) return;
    if ((e.target as HTMLElement).closest(".wbtn")) return;
    focusWindow(id);
    const el = elRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSnap("none");
    setRect({
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
    dragRef.current.dx = e.clientX - r.left;
    dragRef.current.dy = e.clientY - r.top;
    dragRef.current.dragging = true;
    e.preventDefault();
  }

  useEffect(() => {
    function move(e: MouseEvent) {
      if (!dragRef.current.dragging) return;
      const left = Math.max(0, Math.min(innerWidth - 80, e.clientX - dragRef.current.dx));
      const top = Math.max(0, Math.min(innerHeight - 70, e.clientY - dragRef.current.dy));
      setRect((r) => ({ ...r, left: `${left}px`, top: `${top}px` }));

      let zone: Snap | null = null;
      if (e.clientX < 14) zone = "L";
      else if (e.clientX > innerWidth - 14) zone = "R";
      else if (e.clientY < 8 && allowMaximize) zone = "max";
      dragRef.current.zone = zone;

      if (zone === "L")
        setSnapGhost({
          left: "0",
          top: "0",
          width: "50vw",
          height: `calc(100vh - ${TASKBAR_H}px)`,
        });
      else if (zone === "R")
        setSnapGhost({
          left: "50vw",
          top: "0",
          width: "50vw",
          height: `calc(100vh - ${TASKBAR_H}px)`,
        });
      else if (zone === "max")
        setSnapGhost({
          left: "0",
          top: "0",
          width: "100vw",
          height: `calc(100vh - ${TASKBAR_H}px)`,
        });
      else setSnapGhost(null);
    }
    function up() {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      setSnapGhost(null);
      const zone = dragRef.current.zone;
      if (zone === "L") setSnap("L");
      else if (zone === "R") setSnap("R");
      else if (zone === "max") setSnap("max");
      dragRef.current.zone = null;
    }
    addEventListener("mousemove", move);
    addEventListener("mouseup", up);
    return () => {
      removeEventListener("mousemove", move);
      removeEventListener("mouseup", up);
    };
  }, [setSnapGhost, allowMaximize]);

  function toggleMax() {
    if (!allowMaximize) return;
    setSnap((s) => (s === "none" ? "max" : "none"));
    focusWindow(id);
  }

  const snapClass =
    snap === "max" ? "max" : snap === "L" ? "snapL" : snap === "R" ? "snapR" : "";
  const style =
    snap === "none"
      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, zIndex }
      : { zIndex };

  return (
    <section
      ref={elRef}
      className={`win ${snapClass} ${visible ? "" : "win-hidden"} ${isFront ? "" : "blur"}`}
      style={style}
      data-win={id}
      onMouseDown={() => focusWindow(id)}
    >
      <header className="win-bar" onMouseDown={onBarMouseDown} onDoubleClick={toggleMax}>
        <span className="t">{title}</span>
        {titleExtra}
        <span className="wbtns">
          <button
            className="wbtn min"
            aria-label="Minimize window"
            onClick={() => {
              sClick();
              minimizeWindow(id);
            }}
          >
            _
          </button>
          {allowMaximize && (
            <button
              className="wbtn max"
              aria-label="Maximize window"
              onClick={() => {
                sClick();
                toggleMax();
              }}
            >
              □
            </button>
          )}
          <button
            className="wbtn x"
            aria-label="Close window"
            onClick={() => {
              sClick();
              closeWindow(id);
            }}
          >
            ×
          </button>
        </span>
      </header>
      <div className="win-body" ref={bodyElRef}>
        {children}
      </div>
    </section>
  );
}
