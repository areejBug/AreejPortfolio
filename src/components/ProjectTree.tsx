import { CONTENT } from "../content";
import {
  CATEGORY_ICON,
  CATEGORY_ICON_FALLBACK,
  LEAF_ICON,
  groupProjectsByFolder,
} from "../lib/projectIndex";
import { PixelIcon } from "./PixelIcon";

type ProjectTreeProps = {
  onOpen: (id: string) => void;
};

const GROUPS = groupProjectsByFolder(CONTENT.projects);
const CAPTION = "A tree with O(1) traversal: just look at the screen.";

/**
 * The project tree as a vertical dependency-graph listing — the same
 * ├──/└──/│ nesting a `tree` command or dependency-graph tool would print,
 * built fresh from real CONTENT.projects (never hand-typed placeholder
 * names). Icons are the same hand-coded canvas pixel icons used everywhere
 * else in this OS. Every leaf name is still a real, keyboard-reachable
 * button — projects not on the featured rail would otherwise have no way
 * to be opened at all.
 */
export function ProjectTree({ onOpen }: ProjectTreeProps) {
  return (
    <nav className="dep-tree" aria-label="Projects, organized by category">
      {GROUPS.map((g, gi) => {
        const isLastCat = gi === GROUPS.length - 1;
        const catPrefix = isLastCat ? "└──> " : "├──> ";
        const trunk = isLastCat ? " " : "│";

        return (
          <div className="dep-group" key={g.folder}>
            <div className="dep-row">
              <span className="dep-prefix" aria-hidden="true">
                {catPrefix}
              </span>
              <span className="dep-icon">
                <PixelIcon kind={CATEGORY_ICON[g.folder] ?? CATEGORY_ICON_FALLBACK} size={16} />
              </span>
              <span className="dep-cat-label">{g.folder}</span>
            </div>

            {g.projects.map((p, pi) => {
              const isLastLeaf = pi === g.projects.length - 1;
              const leafPrefix = `${trunk}    ${isLastLeaf ? "└── " : "├── "}`;
              return (
                <div className="dep-row" key={p.id}>
                  <span className="dep-prefix" aria-hidden="true">
                    {leafPrefix}
                  </span>
                  <span className="dep-icon">
                    <PixelIcon kind={LEAF_ICON} size={16} />
                  </span>
                  <button
                    type="button"
                    className="dep-btn"
                    onClick={() => onOpen(p.id)}
                    aria-label={`Open project ${p.name}`}
                  >
                    {p.name}
                  </button>
                </div>
              );
            })}

            {!isLastCat && (
              <div className="dep-row dep-spacer" aria-hidden="true">
                <span className="dep-prefix">{trunk}</span>
              </div>
            )}
          </div>
        );
      })}

      <p className="dep-caption">{CAPTION}</p>
    </nav>
  );
}
