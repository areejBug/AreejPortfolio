import { useEffect, useState } from "react";
import { PixelIcon } from "./PixelIcon";
import type { IconKind } from "../lib/pixel";
import { sOpen } from "../lib/audio";
import {
  openProjectsExplorer,
  openAbout,
  openSkills,
  openContact,
  openTerminal,
} from "../lib/actions";

type DeskIcon = { label: string; kind: IconKind; action: () => void };

const ICONS: DeskIcon[] = [
  { label: "Projects", kind: "folder", action: openProjectsExplorer },
  { label: "About Me", kind: "user", action: openAbout },
  { label: "Skills", kind: "chip", action: openSkills },
  { label: "Contact", kind: "mail", action: openContact },
  { label: "Terminal", kind: "term", action: () => openTerminal() },
];

export function DesktopIcons() {
  const [selected, setSelected] = useState<number | null>(null);
  const [entered, setEntered] = useState<boolean[]>(() => ICONS.map(() => false));

  useEffect(() => {
    const timers = ICONS.map((_, i) =>
      setTimeout(() => setEntered((e) => e.map((v, j) => (j === i ? true : v))), 60 * i),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="desktop-icons">
      {ICONS.map((icon, i) => (
        <button
          key={icon.label}
          type="button"
          className={`dicon${entered[i] ? " in" : ""}${selected === i ? " selected" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setSelected(i);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            sOpen();
            icon.action();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              sOpen();
              icon.action();
            }
          }}
        >
          <PixelIcon kind={icon.kind} />
          <span>{icon.label}</span>
        </button>
      ))}
    </div>
  );
}
