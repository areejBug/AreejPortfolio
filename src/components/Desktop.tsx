import { useEffect, useRef } from "react";
import { useStore } from "../store";
import { useIsMobile } from "../lib/useMediaQuery";
import { useWindowTitle } from "../lib/windowTitles";
import { useKeyboardShortcuts } from "../lib/useKeyboardShortcuts";
import type { DesktopPets as DesktopPetsClass } from "../lib/DesktopPets";
import { DesktopIcons } from "./DesktopIcons";
import { FeaturedRail } from "./FeaturedRail";
import { OnboardingBalloon } from "./OnboardingBalloon";
import { Taskbar } from "./Taskbar";
import { MobileNav } from "./MobileNav";
import { Window } from "./windows/Window";
import { Terminal } from "./windows/Terminal";
import { Projects } from "./windows/Projects";
import { ProjectApp } from "./windows/ProjectApp";
import { DocWindow } from "./windows/DocWindow";
import { TryTerminalButton } from "./TryTerminalButton";
import { DESKTOP_MARGIN_PX } from "../lib/layout";
import "../styles/desktop.css";

function WindowsLayer() {
  const termTitle = useWindowTitle("term");
  const expTitle = useWindowTitle("exp");
  const appTitle = useWindowTitle("app");
  const docTitle = useWindowTitle("doc");

  return (
    <>
      <Window
        id="term"
        title={termTitle}
        initialRect={{
          left: `${DESKTOP_MARGIN_PX}px`,
          top: `${DESKTOP_MARGIN_PX}px`,
          width: "min(620px, 46vw)",
          height: "min(560px, 64vh)",
        }}
      >
        <Terminal />
      </Window>
      <Window
        id="exp"
        title={expTitle}
        autoFit
        startMaximized
        initialRect={{
          left: "8%",
          top: "14%",
          width: "min(520px, 42vw)",
          height: "min(480px, 56vh)",
        }}
      >
        <Projects />
      </Window>
      <Window
        id="app"
        title={appTitle}
        allowMaximize={false}
        initialRect={{
          left: "18%",
          top: "10%",
          width: "min(600px, 56vw)",
          height: "min(420px, 58vh)",
        }}
      >
        <ProjectApp />
      </Window>
      <Window
        id="doc"
        title={docTitle}
        allowMaximize={false}
        titleExtra={<TryTerminalButton />}
        initialRect={{
          left: "10%",
          top: "8%",
          width: "min(880px, 70vw)",
          height: "min(680px, 75vh)",
        }}
      >
        <DocWindow />
      </Window>
    </>
  );
}

export function Desktop() {
  const isMobile = useIsMobile();
  const openWindow = useStore((s) => s.openWindow);
  const petsLayerRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts();

  useEffect(() => {
    if (isMobile) {
      openWindow("exp");
    } else {
      openWindow("term");
      requestAnimationFrame(() => window.dispatchEvent(new Event("terminal-focus")));
    }
    // Runs once at boot only — later window opens are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-wallpaper bugs: only on the roomy desktop layout — mobile boots
  // straight into a full-screen window sheet with no open background for
  // them to wander. Loaded via dynamic import (purely decorative, not
  // needed for first paint) into a real child of #desktop-root — NOT a
  // detached <body> sibling — so its z-index is compared against windows
  // within the same stacking context instead of one #desktop-root itself
  // (position:fixed always opens its own stacking context) traps them out of.
  useEffect(() => {
    if (isMobile || !petsLayerRef.current) return;

    let pets: DesktopPetsClass | undefined;
    let cancelled = false;
    const container = petsLayerRef.current;

    import("../lib/DesktopPets").then(({ DesktopPets }) => {
      if (cancelled) return;
      pets = new DesktopPets(container, useStore.getState());
      pets.start(7);
    });

    return () => {
      cancelled = true;
      pets?.stop();
    };
  }, [isMobile]);

  return (
    <div id="desktop-root" style={{ position: "fixed", inset: 0, zIndex: 1 }}>
      {!isMobile && (
        <>
          <DesktopIcons />
          <FeaturedRail />
          <OnboardingBalloon />
        </>
      )}

      {!isMobile && <div ref={petsLayerRef} />}

      <WindowsLayer />

      {!isMobile && <Taskbar />}
      {isMobile && <MobileNav />}
    </div>
  );
}
