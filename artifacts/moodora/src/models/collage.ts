export type LayerKind = "image" | "text" | "shape";
export type ShapeKind = "rect" | "circle";
export type CollageMode = "grid" | "creative";
export type CanvasFormat = "Square" | "Portrait" | "Story";

/** One element on the collage canvas. x, y, w and h are percentages of the canvas. */
export interface Layer {
  id: string;
  kind: LayerKind;
  /** Only for text layers */
  text?: string;
  /** Only for image layers */
  src?: string;
  /** Only for shape layers (defaults to "rect") */
  shape?: ShapeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  /** Degrees */
  rotation?: number;
  /** 0 to 1 */
  opacity?: number;
}

/** What a collage project stores. */
export interface CollageContent {
  layers: Layer[];
  bg: string;
  mode: CollageMode;
  count: number;
  layout: string;
  canvasFormat: CanvasFormat;
}
