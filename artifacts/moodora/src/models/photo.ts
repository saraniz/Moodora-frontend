/** A photo in the feed: either an upload or a sample image. */
export interface PhotoAsset {
  id: string;
  name: string;
  /** Data URL (uploads) or remote URL (samples) */
  url: string;
  width: number;
  height: number;
}
