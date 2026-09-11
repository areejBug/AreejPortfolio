import type { Project } from "../types";
import type { IconKind } from "./pixel";

export type ProjectGroup = { folder: string; projects: Project[] };

/** Projects grouped by folder, in first-appearance order — never an empty group. */
export function groupProjectsByFolder(projects: Project[]): ProjectGroup[] {
  const order: string[] = [];
  const byFolder = new Map<string, Project[]>();
  for (const p of projects) {
    if (!byFolder.has(p.folder)) {
      byFolder.set(p.folder, []);
      order.push(p.folder);
    }
    byFolder.get(p.folder)!.push(p);
  }
  return order.map((folder) => ({ folder, projects: byFolder.get(folder)! }));
}

/** One icon per real folder in CONTENT.projects — reusing existing icon kinds
 * where they already fit, adding "pointer" for the one that had nothing
 * close (see lib/pixel.ts). Falls back to "chip" for any folder not listed
 * here, so a future new category never renders with no icon at all. */
export const CATEGORY_ICON: Record<string, IconKind> = {
  AUTONOMOUS_AGENTS: "chip",
  COMPUTATIONAL_ENGINES: "term",
  POINTER_MECHANICS: "pointer",
  OOP_ARCHITECTURES: "folder",
};
export const CATEGORY_ICON_FALLBACK: IconKind = "chip";

/** General icon for every project leaf — a single shared icon is intentional
 * (per-project icons weren't warranted), distinct from every category icon. */
export const LEAF_ICON: IconKind = "chart";
