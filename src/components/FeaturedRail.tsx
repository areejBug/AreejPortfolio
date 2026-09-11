import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { CONTENT } from "../content";
import type { Project } from "../types";
import { ProjectMedia } from "./ProjectMedia";
import { ProjectTitle } from "./ProjectTitle";
import { openProject } from "../lib/actions";

const PREVIEW_W = 220;
// Derived from the shared .media-frame 16/10 ratio, so the flip-above/below
// math below matches what actually renders.
const PREVIEW_H = Math.round((PREVIEW_W * 10) / 16);
const PREVIEW_GAP = 10;
const VIEWPORT_PAD = 8;

type Preview = { project: Project; left: number; top: number };

export function FeaturedRail() {
  const [entered, setEntered] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 10);
    return () => clearTimeout(t);
  }, []);

  const featured = CONTENT.projects.filter((p) => p.featured);

  function showPreview(e: ReactMouseEvent<HTMLButtonElement>, project: Project) {
    const r = e.currentTarget.getBoundingClientRect();
    const centerX = r.left + r.width / 2;
    const left = Math.max(
      VIEWPORT_PAD,
      Math.min(centerX - PREVIEW_W / 2, window.innerWidth - PREVIEW_W - VIEWPORT_PAD),
    );
    // Cards live in the bottom rail, so the preview opens upward by default,
    // flipping below the card if there isn't room above.
    let top = r.top - PREVIEW_H - PREVIEW_GAP;
    if (top < VIEWPORT_PAD) top = r.bottom + PREVIEW_GAP;
    setPreview({ project, left, top });
  }

  return (
    <>
      <div className={`strip${entered ? " in" : ""}`}>
        <div className="cap">FEATURED WORK</div>
        <div className="rail">
          {featured.map((p) => (
            <button
              key={p.id}
              type="button"
              className="pcard"
              aria-label={`Open project ${p.name}`}
              onClick={() => openProject(p.id)}
              onMouseEnter={(e) => showPreview(e, p)}
              onMouseLeave={() => setPreview(null)}
            >
              <ProjectTitle name={p.name} as="div" className="n" />
            </button>
          ))}
        </div>
      </div>
      {preview && (
        <div
          className="pcard-preview"
          style={{ left: `${preview.left}px`, top: `${preview.top}px` }}
        >
          <ProjectMedia
            project={preview.project}
            width={PREVIEW_W}
            height={PREVIEW_H}
            variant="thumb"
            frameClassName="media-frame-bordered"
          />
        </div>
      )}
    </>
  );
}
