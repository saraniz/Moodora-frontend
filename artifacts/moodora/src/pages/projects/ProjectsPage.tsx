import { Copy, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { PageHeading } from "@/components/layout/PageHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ConfirmModal } from "@/components/y2k/Modal";
import { Window } from "@/components/y2k/Window";
import { cn } from "@/lib/utils";
import type { Project } from "@/models";
import { useProjectStore } from "@/stores/project-store";
import { useSettingsStore } from "@/stores/settings-store";
import { notify } from "@/stores/toast-store";
import { RenameModal } from "./RenameModal";

export function ProjectsPage() {
  const { projects, renameProject, duplicateProject, deleteProject } =
    useProjectStore();
  const compact = useSettingsStore((state) => state.compact);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Project["type"]>("all");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [renaming, setRenaming] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const shown = useMemo(
    () =>
      projects
        .filter(
          (project) =>
            (filter === "all" || project.type === filter) &&
            project.title.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "recent"
            ? b.updatedAt.localeCompare(a.updatedAt)
            : a.title.localeCompare(b.title),
        ),
    [projects, filter, query, sort],
  );

  return (
    <>
      <PageHeading
        title="Projects"
        description="Everything you have made, saved in this browser."
      >
        <Link href="/planner" className="btn">
          Plan a feed
        </Link>
        <Link href="/collage" className="btn btn--primary">
          Make a collage
        </Link>
      </PageHeading>
      <Window title={`${shown.length} ${shown.length === 1 ? "item" : "items"}`} slab>
        <div className="toolbar">
          <input
            className="field"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects"
            aria-label="Search projects"
          />
          <select
            className="field"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            aria-label="Filter by type"
          >
            <option value="all">All projects</option>
            <option value="feed">Feeds</option>
            <option value="collage">Collages</option>
          </select>
          <select
            className="field"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Sort by"
          >
            <option value="recent">Recently saved</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {shown.length ? (
          <div className={cn("card-grid", compact && "card-grid--compact")}>
            {shown.map((project) => (
              <ProjectCard key={project.id} project={project}>
                <button
                  className="icon-btn"
                  onClick={() => setRenaming(project)}
                  aria-label={`Rename ${project.title}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => {
                    duplicateProject(project.id);
                    notify("Project duplicated.");
                  }}
                  aria-label={`Duplicate ${project.title}`}
                >
                  <Copy size={15} />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => setDeleting(project)}
                  aria-label={`Delete ${project.title}`}
                >
                  <Trash2 size={15} />
                </button>
              </ProjectCard>
            ))}
          </div>
        ) : projects.length ? (
          <div className="empty">
            <p className="muted">No project matches this search.</p>
            <button
              className="btn"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="empty">
            <p className="muted">
              Nothing saved yet. Save a feed or a collage and it will appear here.
            </p>
          </div>
        )}
      </Window>

      {renaming && (
        <RenameModal
          project={renaming}
          onClose={() => setRenaming(null)}
          onRename={(title) => {
            renameProject(renaming.id, title);
            notify("Project renamed.");
          }}
        />
      )}
      {deleting && (
        <ConfirmModal
          title="Delete project"
          message={`“${deleting.title}” will be removed from this device. This can't be undone.`}
          confirmLabel="Delete"
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            deleteProject(deleting.id);
            notify("Project deleted.");
          }}
        />
      )}
    </>
  );
}
