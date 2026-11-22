import type { CollageContent } from "./collage";
import type { FeedContent } from "./feed";

interface ProjectBase {
  id: string;
  title: string;
  /** ISO date */
  createdAt: string;
  /** ISO date */
  updatedAt: string;
  /** Image URL shown on the project card */
  thumbnail: string;
}

export interface FeedProject extends ProjectBase {
  type: "feed";
  content: FeedContent;
}

export interface CollageProject extends ProjectBase {
  type: "collage";
  content: CollageContent;
}

/** Anything saved to "My projects". */
export type Project = FeedProject | CollageProject;
