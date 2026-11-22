import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { photos } from "@/data/photos";
import { exportFeed } from "@/lib/export-feed";
import { createId } from "@/lib/id";
import { createLocalImagePreview, persistLocalImage } from "@/lib/local-assets";
import { takeOpenProject } from "@/lib/open-project";
import { read, storageKeys, write } from "@/lib/storage";
import type { FeedDraft, PhotoAsset } from "@/models";
import { useProjectStore } from "@/stores/project-store";
import { notify } from "@/stores/toast-store";

const samplePhotos = (): PhotoAsset[] =>
  photos.slice(0, 6).map((url, i) => ({
    id: `sample-${i}`,
    name: `Moodboard ${i + 1}`,
    url,
    width: 900,
    height: 900,
  }));

/** All state and actions for the feed planner. */
export function useFeedPlanner() {
  const saveProject = useProjectStore((state) => state.saveProject);
  const [items, setItems] = useState<PhotoAsset[]>(() =>
    read(storageKeys.feedItems, samplePhotos()),
  );
  const [feedName, setFeedName] = useState(() =>
    read(storageKeys.feedName, "Weekend notes"),
  );
  const [drafts, setDrafts] = useState<FeedDraft[]>(() =>
    read(storageKeys.feedDrafts, []),
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceAt = useRef<number | null>(null); // slot waiting for a replacement

  useEffect(() => write(storageKeys.feedItems, items), [items]);
  useEffect(() => write(storageKeys.feedName, feedName), [feedName]);
  useEffect(() => write(storageKeys.feedDrafts, drafts), [drafts]);

  // Load the project opened from "Projects", if any.
  useEffect(() => {
    const project = takeOpenProject("feed");
    if (!project) return;
    setFeedName(project.title);
    setItems(project.content?.items ?? []);
  }, []);

  const chooseFiles = () => {
    replaceAt.current = null;
    fileRef.current?.click();
  };

  const replace = (index: number) => {
    replaceAt.current = index;
    fileRef.current?.click();
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    const target = replaceAt.current;
    replaceAt.current = null;
    event.target.value = "";
    let added = 0;
    for (const [fileIndex, file] of files.entries()) {
      try {
        const asset: PhotoAsset = {
          id: createId(),
          name: file.name,
          ...(await createLocalImagePreview(file)),
        };
        await persistLocalImage(asset.id, file);
        setItems((previous) =>
          target !== null && fileIndex === 0
            ? previous.map((item, i) => (i === target ? asset : item))
            : [...previous, asset],
        );
        added++;
      } catch {
        notify(`Could not open ${file.name}. Choose another image.`);
      }
    }
    if (added) notify(`${added} ${added === 1 ? "photo" : "photos"} added.`);
  };

  const addCopy = (asset: PhotoAsset) =>
    setItems((previous) => [...previous, { ...asset, id: createId() }]);

  const removeAt = (index: number) =>
    setItems((previous) => previous.filter((_, i) => i !== index));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    setItems((previous) => arrayMove(previous, from, to));
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setItems((previous) =>
      arrayMove(
        previous,
        previous.findIndex((item) => item.id === active.id),
        previous.findIndex((item) => item.id === over.id),
      ),
    );
  };

  const saveDraft = () => {
    const draft: FeedDraft = { id: createId(), name: feedName, items: [...items] };
    setDrafts((previous) => [
      draft,
      ...previous.filter((item) => item.name !== feedName),
    ]);
    const now = new Date().toISOString();
    saveProject({
      id: `feed-${feedName.toLowerCase().replace(/\W+/g, "-")}`,
      title: feedName,
      type: "feed",
      createdAt: now,
      updatedAt: now,
      thumbnail: items[0]?.url ?? photos[0],
      content: { items },
    });
    notify("Draft saved.");
  };

  const openDraft = (draft: FeedDraft) => {
    setFeedName(draft.name);
    setItems(draft.items);
    notify("Draft opened.");
  };

  const deleteDraft = (id: string) =>
    setDrafts((previous) => previous.filter((draft) => draft.id !== id));

  const exportPreview = async () => {
    if (!items.length) {
      notify("Add a photo before exporting.");
      return;
    }
    try {
      const failed = await exportFeed(items, feedName);
      notify(
        failed
          ? `Exported, but ${failed} of the photos could not be loaded.`
          : "Feed exported.",
      );
    } catch {
      notify("Export failed. Check your connection and try again.");
    }
  };

  return {
    items,
    feedName,
    setFeedName,
    drafts,
    fileRef,
    chooseFiles,
    replace,
    upload,
    addCopy,
    removeAt,
    move,
    onDragEnd,
    saveDraft,
    openDraft,
    deleteDraft,
    exportPreview,
  };
}

export type FeedPlanner = ReturnType<typeof useFeedPlanner>;
