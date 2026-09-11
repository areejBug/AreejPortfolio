import { useStore, type WindowId } from "../store";
import { CONTENT } from "../content";

const WINDOW_BAR_TITLES: Record<WindowId, string> = {
  term: "areej@os — bash",
  exp: "Projects",
  app: "Project",
  doc: "Document",
};

const TASKBAR_TITLES: Record<WindowId, string> = {
  term: "Terminal",
  exp: "Projects",
  app: "Project",
  doc: "Document",
};

function dynamicSuffix(
  id: WindowId,
  s: { activeProject?: string; activeDoc?: string },
): string | undefined {
  if (id === "app" && s.activeProject) {
    const p = CONTENT.projects.find((x) => x.id === s.activeProject);
    if (p) return p.name;
  }
  if (id === "doc" && s.activeDoc) {
    return s.activeDoc.charAt(0).toUpperCase() + s.activeDoc.slice(1) + ".txt";
  }
  return undefined;
}

/** Title shown in the window's own title bar — reflects Explorer path, project, or doc. */
export function useWindowTitle(id: WindowId): string {
  return useStore((s) => {
    const dyn = dynamicSuffix(id, s);
    if (dyn) return dyn;
    return WINDOW_BAR_TITLES[id];
  });
}

/** Title shown on the taskbar — static for term/exp, dynamic for app/doc (matches the prototype). */
export function useTaskbarLabel(id: WindowId): string {
  return useStore((s) => dynamicSuffix(id, s) ?? TASKBAR_TITLES[id]);
}
