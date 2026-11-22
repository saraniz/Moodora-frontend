import { Heart } from "lucide-react";
import { Palette } from "@/components/moods/Palette";
import type { Aesthetic } from "@/models";

interface MoodCardProps {
  mood: Aesthetic;
  onOpen: () => void;
  onToggle: () => void;
}

export function MoodCard({ mood, onOpen, onToggle }: MoodCardProps) {
  return (
    <article className="mood-card">
      <button className="mood-open" onClick={onOpen}>
        <span className="mood-photos">
          {mood.images.map((src) => (
            <img key={src} className="photo" src={src} alt="" />
          ))}
        </span>
        <span className="mood-info">
          <strong>{mood.name}</strong>
          <span className="muted">{mood.category}</span>
        </span>
      </button>
      <Palette colors={mood.palette} />
      <button
        className="icon-btn mood-heart"
        onClick={onToggle}
        aria-pressed={mood.favorited}
        aria-label={mood.favorited ? `Unsave ${mood.name}` : `Save ${mood.name}`}
      >
        <Heart size={16} fill={mood.favorited ? "var(--blue)" : "none"} />
      </button>
    </article>
  );
}
