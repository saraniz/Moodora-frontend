import { create } from "zustand";
import { createId } from "@/lib/id";
import { read, storageKeys, write } from "@/lib/storage";
import type { Project } from "@/models";

interface ProjectStore {
  projects: Project[];
  /** Adds a project, or updates the one with the same id. */
  saveProject: (project: Project) => void;
  renameProject: (id: string, title: string) => void;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
  resetProjects: () => void;
}

const now = () => new Date().toISOString();

export const useProjectStore = create<ProjectStore>((set) => {
  const update = (change: (projects: Project[]) => Project[]) =>
    set((state) => {
      const projects = change(state.projects);
      write(storageKeys.projects, projects);
      return { projects };
    });

  return {
    projects: read<Project[]>(storageKeys.projects, []),
    saveProject: (project) =>
      update((projects) => {
        const existing = projects.find((item) => item.id === project.id);
        const saved = {
          ...project,
          createdAt: existing?.createdAt ?? now(),
          updatedAt: now(),
        };
        return existing
          ? projects.map((item) => (item.id === project.id ? saved : item))
          : [saved, ...projects];
      }),
    renameProject: (id, title) =>
      update((projects) =>
        projects.map((item) =>
          item.id === id ? { ...item, title, updatedAt: now() } : item,
        ),
      ),
    duplicateProject: (id) =>
      update((projects) => {
        const source = projects.find((item) => item.id === id);
        if (!source) return projects;
        const copy: Project = {
          ...structuredClone(source),
          id: createId(),
          title: `${source.title} copy`,
          createdAt: now(),
          updatedAt: now(),
        };
        return [copy, ...projects];
      }),
    deleteProject: (id) =>
      update((projects) => projects.filter((item) => item.id !== id)),
    resetProjects: () => set({ projects: [] }),
  };
});
