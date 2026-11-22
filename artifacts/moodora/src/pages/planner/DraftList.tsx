import { Trash2 } from "lucide-react";
import type { FeedDraft } from "@/models";

interface DraftListProps {
  drafts: FeedDraft[];
  onOpen: (draft: FeedDraft) => void;
  onDelete: (id: string) => void;
}

export function DraftList({ drafts, onOpen, onDelete }: DraftListProps) {
  if (!drafts.length) {
    return (
      <p className="muted">
        No drafts yet. Save this feed to come back to it later.
      </p>
    );
  }
  return (
    <ul className="list">
      {drafts.map((draft) => (
        <li key={draft.id}>
          <button className="list-main" onClick={() => onOpen(draft)}>
            <strong>{draft.name}</strong>
            <span className="muted">
              {draft.items.length} {draft.items.length === 1 ? "photo" : "photos"}
            </span>
          </button>
          <button
            className="icon-btn"
            aria-label={`Delete draft ${draft.name}`}
            onClick={() => onDelete(draft.id)}
          >
            <Trash2 size={15} />
          </button>
        </li>
      ))}
    </ul>
  );
}
