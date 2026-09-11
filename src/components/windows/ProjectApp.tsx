import { useStore } from "../../store";
import { CONTENT } from "../../content";
import { ProjectMedia } from "../ProjectMedia";
import { ProjectTitle } from "../ProjectTitle";
import "../../styles/project.css";

/** Witty stand-in for a flat "click here to look at the code" link label. */
const SOURCE_CTA = "Nosy? Peek at the source →";

export function ProjectApp() {
  const activeId = useStore((s) => s.activeProject);
  const project = CONTENT.projects.find((p) => p.id === activeId);

  if (!project) return null;

  const hasShots = !!project.shots && project.shots.length > 0;
  const showSourceLink = project.id !== "sehat-ai";

  return (
    <>
      <div className="app-header">
        <div className="app-header-media">
          <ProjectMedia
            project={project}
            width={320}
            height={200}
            variant="hero"
            frameClassName="media-frame-bordered"
          />
        </div>
        <div className="app-header-info">
          <div className="eyebrow">DIR: /{project.folder}</div>
          <ProjectTitle name={project.name} as="h3" />
          <p className="quote">&ldquo;{project.quote}&rdquo;</p>
          <p className="desc">{project.description}</p>
          {showSourceLink && (
            <div className="app-links">
              {project.repo ? (
                <a href={project.repo} target="_blank" rel="noopener noreferrer">
                  {SOURCE_CTA}
                </a>
              ) : (
                <a className="dim" aria-disabled="true" title="add repo link in content.ts">
                  {SOURCE_CTA}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      {hasShots && (
        <div className="app-pane">
          <div className="gal">
            {project.shots!.map((s, i) => (
              <figure key={s}>
                <div className="media-frame gal-frame">
                  <img src={s} alt={`${project.name} screenshot ${i + 1}`} />
                </div>
                <figcaption>screen {i + 1}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
