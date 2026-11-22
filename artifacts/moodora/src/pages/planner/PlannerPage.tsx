import { Download, Upload } from "lucide-react";
import { PageHeading } from "@/components/layout/PageHeading";
import { Window } from "@/components/y2k/Window";
import { DraftList } from "./DraftList";
import { FeedGrid } from "./FeedGrid";
import { PhotoLibrary } from "./PhotoLibrary";
import { useFeedPlanner } from "./use-feed-planner";

export function PlannerPage() {
  const planner = useFeedPlanner();
  return (
    <>
      <PageHeading
        title="Feed planner"
        description="Drag photos into a new order, or use the arrows on each photo."
      >
        <button className="btn" onClick={planner.chooseFiles}>
          <Upload size={15} /> Upload photos
        </button>
        <button className="btn" onClick={() => void planner.exportPreview()}>
          <Download size={15} /> Export PNG
        </button>
        <button className="btn btn--primary" onClick={planner.saveDraft}>
          Save draft
        </button>
        <input
          ref={planner.fileRef}
          hidden
          type="file"
          accept="image/*"
          multiple
          onChange={planner.upload}
        />
      </PageHeading>
      <div className="planner-grid">
        <Window title={`Photos (${planner.items.length})`}>
          <PhotoLibrary
            items={planner.items}
            onAdd={planner.addCopy}
            onUpload={planner.chooseFiles}
          />
        </Window>
        <Window title="Feed preview" slab>
          <FeedGrid planner={planner} />
        </Window>
        <Window title="Drafts">
          <DraftList
            drafts={planner.drafts}
            onOpen={planner.openDraft}
            onDelete={planner.deleteDraft}
          />
        </Window>
      </div>
    </>
  );
}
