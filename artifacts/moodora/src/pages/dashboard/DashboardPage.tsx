import { Link } from "wouter";
import { PageHeading } from "@/components/layout/PageHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CalendarWidget, dayKey } from "@/components/y2k/CalendarWidget";
import { Window } from "@/components/y2k/Window";
import { photo } from "@/data/photos";
import { useAestheticStore } from "@/stores/aesthetic-store";
import { useProjectStore } from "@/stores/project-store";
import { useUserStore } from "@/stores/user-store";

const starters = [
  { href: "/planner", title: "Plan a feed", image: photo.stripes },
  { href: "/collage", title: "Make a collage", image: photo.lake },
  { href: "/explore", title: "Find a mood", image: photo.clouds },
];

export function DashboardPage() {
  const user = useUserStore((state) => state.user);
  const projects = useProjectStore((state) => state.projects);
  const favorites = useAestheticStore((state) => state.aesthetics).filter(
    (mood) => mood.favorited,
  );
  const savedDays = new Set(
    projects.map((project) => dayKey(new Date(project.updatedAt))),
  );

  return (
    <>
      <PageHeading
        title={`Hello, ${user.name.split(" ")[0]}`}
        description="Start something new or go back to what you were making."
      />
      <div className="dashboard-grid">
        <Window title="Start" slab className="dashboard-start">
          <div className="starters">
            {starters.map((starter) => (
              <Link key={starter.href} href={starter.href} className="starter">
                <img className="photo" src={starter.image} alt="" />
                <span>{starter.title}</span>
              </Link>
            ))}
          </div>
        </Window>
        <div className="dashboard-side">
          <CalendarWidget marked={savedDays} />
          <div className="stats">
            <div>
              <strong>{projects.length}</strong>
              <span>{projects.length === 1 ? "project" : "projects"}</span>
            </div>
            <div>
              <strong>{favorites.length}</strong>
              <span>{favorites.length === 1 ? "saved mood" : "saved moods"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-lists">
        <Window
          title="Recent projects"
          actions={
            <Link href="/projects" className="link">
              See all
            </Link>
          }
        >
          {projects.length ? (
            <div className="card-grid">
              {projects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p className="muted">
                Nothing saved yet. Your first feed or collage will show up here.
              </p>
              <Link href="/collage" className="btn btn--primary">
                Make a collage
              </Link>
            </div>
          )}
        </Window>
        <Window
          title="Saved moods"
          actions={
            <Link href="/explore" className="link">
              See all
            </Link>
          }
        >
          {favorites.length ? (
            <div className="polaroids">
              {favorites.slice(0, 4).map((mood) => (
                <Link key={mood.id} href="/explore" className="polaroid">
                  <img className="photo" src={mood.images[0]} alt="" />
                  <span>{mood.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">
              <p className="muted">Save a mood to keep its palette here.</p>
              <Link href="/explore" className="btn">
                Browse moods
              </Link>
            </div>
          )}
        </Window>
      </div>
    </>
  );
}
