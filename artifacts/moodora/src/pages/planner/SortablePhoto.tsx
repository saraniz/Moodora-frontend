import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, ArrowRight, Pencil, X } from "lucide-react";
import type { PhotoAsset } from "@/models";

interface SortablePhotoProps {
  asset: PhotoAsset;
  index: number;
  onReplace: () => void;
  onRemove: () => void;
  onMove: (direction: number) => void;
}

/** One draggable photo in the feed grid. */
export function SortablePhoto({
  asset,
  index,
  onReplace,
  onRemove,
  onMove,
}: SortablePhotoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: asset.id });
  const actions = [
    { label: `Move photo ${index + 1} left`, Icon: ArrowLeft, run: () => onMove(-1) },
    { label: `Replace photo ${index + 1}`, Icon: Pencil, run: onReplace },
    { label: `Remove photo ${index + 1}`, Icon: X, run: onRemove },
    { label: `Move photo ${index + 1} right`, Icon: ArrowRight, run: () => onMove(1) },
  ];
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="feed-photo"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 2 : undefined,
      }}
    >
      <img className="photo" src={asset.url} alt={asset.name} draggable={false} />
      <div className="feed-actions">
        {actions.map(({ label, Icon, run }) => (
          <button
            key={label}
            className="icon-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              run();
            }}
            aria-label={label}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>
    </div>
  );
}
