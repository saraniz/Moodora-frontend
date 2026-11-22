import type { PhotoAsset } from "./photo";

/** A saved version of a feed grid. */
export interface FeedDraft {
  id: string;
  name: string;
  items: PhotoAsset[];
}

/** What a feed project stores. */
export interface FeedContent {
  items: PhotoAsset[];
}
