import { Heart } from "lucide-react";
import { useLocation } from "wouter";
import { Palette } from "@/components/moods/Palette";
import { Modal } from "@/components/y2k/Modal";
import { createId } from "@/lib/id";
import { storageKeys, write } from "@/lib/storage";
import type { Aesthetic, Layer } from "@/models";
import { notify } from "@/stores/toast-store";

interface MoodModalProps {
  mood: Aesthetic;
  onToggle: () => void;
  onClose: () => void;
}

export function MoodModal({ mood, onToggle, onClose }: MoodModalProps) {
  const [, go] = useLocation();

  const openInCollage = () => {
    const layers: Layer[] = mood.images.map((src, i) => ({
      id: createId(),
      kind: "image",
      src,
      x: 10 + (i % 2) * 38,
      y: 10 + Math.floor(i / 2) * 36,
      w: 34,
      h: 30,
      rotation: i === 1 ? 3 : 0,
    }));
    write(storageKeys.collageLayers, layers);
    write(storageKeys.collageBg, mood.palette[2]);
    notify(`${mood.name} opened in Collage.`);
    go("/collage");
  };

  return (
    <Modal title={mood.category} onClose={onClose} className="modal--wide">
      <div className="mood-detail">
        <div className="mood-detail-photos">
          {mood.images.map((src) => (
            <img key={src} className="framed" src={src} alt="" />
          ))}
        </div>
        <div>
          <h3 className="display display--small">{mood.name}</h3>
          <p className="muted">{mood.description}</p>
          <Palette colors={mood.palette} labels />
          <div className="row">
            <button className="btn" onClick={onToggle} aria-pressed={mood.favorited}>
              <Heart size={15} fill={mood.favorited ? "var(--blue)" : "none"} />
              {mood.favorited ? "Saved" : "Save"}
            </button>
            <button className="btn btn--primary" onClick={openInCollage}>
              Open in collage
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
