import type { Project } from "@/models";
import { read, remove, storageKeys, write } from "./storage";

/** Hands a project to its editor. Returns the route to go to. */
export function openProject(project: Project) {
  write(storageKeys.openProject, project);
  return project.type === "feed" ? "/planner" : "/collage";
}

/** Called by an editor on load: returns the project waiting for it, once. */
export function takeOpenProject<T extends Project["type"]>(type: T) {
  const project = read<Project | null>(storageKeys.openProject, null);
  if (project?.type !== type) return null;
  remove(storageKeys.openProject);
  return project as Extract<Project, { type: T }>;
}
