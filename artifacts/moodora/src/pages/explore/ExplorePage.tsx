import { useMemo, useState } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { Window } from "@/components/y2k/Window";
import { ALL_CATEGORIES, categories } from "@/data/aesthetics";
import { cn } from "@/lib/utils";
import { useAestheticStore } from "@/stores/aesthetic-store";
import { MoodCard } from "./MoodCard";
import { MoodModal } from "./MoodModal";

export function ExplorePage() {
  const { aesthetics, toggleFavorite } = useAestheticStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [openId, setOpenId] = useState<string | null>(null);
  const featured = aesthetics.find((mood) => mood.id === "pixel-dream");
  const open = aesthetics.find((mood) => mood.id === openId);

  const shown = useMemo(
    () =>
      aesthetics.filter(
        (mood) =>
          (category === ALL_CATEGORIES || mood.category === category) &&
          `${mood.name} ${mood.category} ${mood.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [aesthetics, category, query],
  );

  return (
    <>
      <PageHeading
        title="Moods"
        description="Browse photos and palettes, save the ones you love and open them in a collage."
      />
      {featured && (
        <Window title="Featured mood" slab className="featured">
          <div className="featured-body">
            <div>
              <h2 className="display display--small">{featured.name}</h2>
              <p className="muted">{featured.description}</p>
              <button
                className="btn btn--primary"
                onClick={() => setOpenId(featured.id)}
              >
                View mood
              </button>
            </div>
            <div className="featured-photos">
              {featured.images.map((src) => (
                <img key={src} className="framed" src={src} alt="" />
              ))}
            </div>
          </div>
        </Window>
      )}
      <div className="toolbar">
        <input
          className="field"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search moods"
          aria-label="Search moods"
        />
        <span className="muted">
          {shown.length} {shown.length === 1 ? "mood" : "moods"}
        </span>
      </div>
      <div className="chips">
        {categories.map((name) => (
          <button
            key={name}
            className={cn("chip", category === name && "is-active")}
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {shown.length ? (
        <div className="mood-grid">
          {shown.map((mood) => (
            <MoodCard
              key={mood.id}
              mood={mood}
              onOpen={() => setOpenId(mood.id)}
              onToggle={() => toggleFavorite(mood.id)}
            />
          ))}
        </div>
      ) : (
        <Window title="No results">
          <div className="empty">
            <p className="muted">No mood matches this search.</p>
            <button
              className="btn"
              onClick={() => {
                setQuery("");
                setCategory(ALL_CATEGORIES);
              }}
            >
              Clear filters
            </button>
          </div>
        </Window>
      )}
      {open && (
        <MoodModal
          mood={open}
          onToggle={() => toggleFavorite(open.id)}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
