import { PixelIcon } from "./PixelIcon";
import type { IconKind } from "../lib/pixel";
import { useStore } from "../store";
import {
  openProjectsExplorer,
  openAbout,
  openSkills,
  openContact,
  openTerminal,
} from "../lib/actions";

type Tab = { label: string; kind: IconKind; action: () => void; match: () => boolean };

export function MobileNav() {
  const windows = useStore((s) => s.windows);
  const windowOrder = useStore((s) => s.windowOrder);
  const activeDoc = useStore((s) => s.activeDoc);

  const frontWindow = [...windowOrder].reverse().find((w) => windows[w].open);

  const tabs: Tab[] = [
    {
      label: "Projects",
      kind: "folder",
      action: openProjectsExplorer,
      match: () => frontWindow === "exp",
    },
    {
      label: "About",
      kind: "user",
      action: openAbout,
      match: () => frontWindow === "doc" && activeDoc === "about",
    },
    {
      label: "Skills",
      kind: "chip",
      action: openSkills,
      match: () => frontWindow === "doc" && activeDoc === "skills",
    },
    {
      label: "Contact",
      kind: "mail",
      action: openContact,
      match: () => frontWindow === "doc" && activeDoc === "contact",
    },
    {
      label: "Terminal",
      kind: "term",
      action: () => openTerminal(),
      match: () => frontWindow === "term",
    },
  ];

  return (
    <nav className="mobile-nav">
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={tab.match() ? "on" : ""}
            onClick={tab.action}
          >
            <PixelIcon kind={tab.kind} size={22} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
