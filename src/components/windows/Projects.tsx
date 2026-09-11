import { useStore } from "../../store";
import { ProjectTree } from "../ProjectTree";
import { sOpen } from "../../lib/audio";
import "../../styles/projectTree.css";

/**
 * The window content is nothing but the tree — no folder-browser chrome
 * (no back/up buttons, no address bar, no sidebar). There's nothing to
 * navigate: every category and every project is already on screen at once.
 */
export function Projects() {
  const openProject = useStore((s) => s.openProject);

  return (
    <div className="projects-win">
      <ProjectTree
        onOpen={(id) => {
          sOpen();
          openProject(id);
        }}
      />
    </div>
  );
}
