import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/layout/Avatar";
import { useUserStore } from "@/stores/user-store";
import { SortablePhoto } from "./SortablePhoto";
import type { FeedPlanner } from "./use-feed-planner";

/** The 3-column grid you can rearrange. */
export function FeedGrid({ planner }: { planner: FeedPlanner }) {
  const { items } = planner;
  const user = useUserStore((state) => state.user);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const slots = Math.max(9, Math.ceil(items.length / 3) * 3);
  return (
    <>
      <div className="feed-profile">
        <Avatar user={user} size={40} />
        <input
          className="field"
          aria-label="Feed name"
          value={planner.feedName}
          onChange={(e) => planner.setFeedName(e.target.value)}
        />
        <span className="muted">
          {items.length} {items.length === 1 ? "post" : "posts"}
        </span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={planner.onDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="feed-grid">
            {Array.from({ length: slots }, (_, i) => {
              const item = items[i];
              return item ? (
                <SortablePhoto
                  key={item.id}
                  asset={item}
                  index={i}
                  onReplace={() => planner.replace(i)}
                  onRemove={() => planner.removeAt(i)}
                  onMove={(direction) => planner.move(i, i + direction)}
                />
              ) : (
                <button
                  key={`empty-${i}`}
                  className="feed-empty"
                  onClick={planner.chooseFiles}
                  aria-label="Add a photo here"
                >
                  <Plus size={20} />
                </button>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
