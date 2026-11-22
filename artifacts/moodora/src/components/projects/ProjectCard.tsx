import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { photos } from "@/data/photos";
import { openProject } from "@/lib/open-project";
import type { Project } from "@/models";

interface ProjectCardProps {
  project: Project;
  /** Buttons under the card */
  children?: ReactNode;
}

/** A saved project. Clicking it opens the right editor. */
export function ProjectCard({ project, children }: ProjectCardProps) {
  const [, go] = useLocation();
  return (
    <article className="project-card">
      <button className="project-open" onClick={() => go(openProject(project))}>
        <img className="photo" src={project.thumbnail || photos[0]} alt="" />
        <span className="project-info">
          <strong>{project.title}</strong>
          <span className="muted">
            {project.type === "feed" ? "Feed" : "Collage"}, saved{" "}
            {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </span>
      </button>
      {children && <div className="project-actions">{children}</div>}
    </article>
  );
}
