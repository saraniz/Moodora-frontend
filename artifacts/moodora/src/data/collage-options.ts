import type { CanvasFormat } from "@/models";

export const layoutOptions = [
  "Balanced grid",
  "Vertical columns",
  "Horizontal rows",
  "Editorial split",
  "Feature top",
  "Mosaic",
];

export const compositionStyles = [
  "Asymmetric",
  "Editorial",
  "Magazine",
  "Scrapbook",
  "Polaroid",
  "Overlapping",
  "Film strip",
  "Minimal",
  "Mosaic",
  "Pinterest",
];

export const photoCounts = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

export const canvasColors = [
  "#E4ECF8",
  "#FFFFFF",
  "#B9D0F0",
  "#6B8CCF",
  "#E3D8EA",
  "#CDD1D9",
  "#000000",
];

export const DEFAULT_CANVAS_COLOR = canvasColors[0];
export const DEFAULT_SHAPE_COLOR = "#6B8CCF";
export const DEFAULT_TEXT_COLOR = "#000000";

/** Canvas sizes in pixels. */
export const canvasFormats: Record<CanvasFormat, { width: number; height: number }> = {
  Square: { width: 1080, height: 1080 },
  Portrait: { width: 1080, height: 1350 },
  Story: { width: 1080, height: 1920 },
};
