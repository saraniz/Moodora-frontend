export interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

/** Rectangles (in percentages) for a grid layout. */
export function gridCells(
  count: number,
  layout: string,
  spacing: number,
  margin: number,
): Cell[] {
  const edge = 100 - margin * 2; // usable area
  if (layout === "Vertical columns") {
    const width = (edge - spacing * (count - 1)) / count;
    return Array.from({ length: count }, (_, i) => ({
      x: margin + i * (width + spacing),
      y: margin,
      w: width,
      h: edge,
    }));
  }
  if (layout === "Horizontal rows") {
    const height = (edge - spacing * (count - 1)) / count;
    return Array.from({ length: count }, (_, i) => ({
      x: margin,
      y: margin + i * (height + spacing),
      w: edge,
      h: height,
    }));
  }
  if (layout === "Editorial split") {
    const small = count - 1,
      columns = small > 3 ? 2 : 1,
      rows = Math.ceil(small / columns);
    const largeWidth = (edge - spacing) * 0.56,
      rightWidth = edge - largeWidth - spacing;
    const width = (rightWidth - spacing * (columns - 1)) / columns,
      height = (edge - spacing * (rows - 1)) / rows;
    return [
      { x: margin, y: margin, w: largeWidth, h: edge },
      ...Array.from({ length: small }, (_, i) => ({
        x: margin + largeWidth + spacing + (i % columns) * (width + spacing),
        y: margin + Math.floor(i / columns) * (height + spacing),
        w: width,
        h: height,
      })),
    ];
  }
  if (layout === "Feature top") {
    const small = count - 1,
      columns = Math.max(1, Math.ceil(Math.sqrt(small))),
      rows = Math.ceil(small / columns);
    const largeHeight = (edge - spacing) * 0.55,
      remainingHeight = edge - largeHeight - spacing;
    const width = (edge - spacing * (columns - 1)) / columns,
      height = (remainingHeight - spacing * (rows - 1)) / rows;
    return [
      { x: margin, y: margin, w: edge, h: largeHeight },
      ...Array.from({ length: small }, (_, i) => ({
        x: margin + (i % columns) * (width + spacing),
        y:
          margin +
          largeHeight +
          spacing +
          Math.floor(i / columns) * (height + spacing),
        w: width,
        h: height,
      })),
    ];
  }
  // Default: balanced grid
  const columns = Math.ceil(Math.sqrt(count)),
    rows = Math.ceil(count / columns);
  const width = (edge - spacing * (columns - 1)) / columns,
    height = (edge - spacing * (rows - 1)) / rows;
  return Array.from({ length: count }, (_, i) => ({
    x: margin + (i % columns) * (width + spacing),
    y: margin + Math.floor(i / columns) * (height + spacing),
    w: width,
    h: height,
  }));
}

/** Rectangles for a freeform composition (magazine, polaroid and so on). */
export function creativeCells(style: string, total: number): Cell[] {
  return Array.from({ length: total }, (_, i) => {
    const first = i === 0;
    const overlapping = style === "Overlapping";
    const film = style === "Film strip";
    const columns = film ? total : 2;
    const rows = Math.ceil((total - 1) / Math.max(1, columns - 1));
    const x = first
      ? 8
      : overlapping
        ? 20 + (i % 3) * 20
        : film
          ? 4 + i * (92 / total)
          : style === "Minimal"
            ? 8 + ((i - 1) % 2) * 43
            : style === "Pinterest"
              ? 8 + ((i - 1) % 2) * 43
              : 48 + ((i - 1) % 2) * 24;
    const y = first
      ? 10
      : overlapping
        ? 18 + Math.floor(i / 3) * 18
        : film
          ? 18
          : style === "Magazine"
            ? 64
            : style === "Pinterest"
              ? 10 + Math.floor((i - 1) / 2) * 34
              : style === "Minimal"
                ? 10 + Math.floor((i - 1) / 2) * 40
                : 8 + Math.floor((i - 1) / 2) * (76 / Math.max(1, rows));
    return {
      x,
      y,
      w: first
        ? style === "Magazine"
          ? 84
          : 44
        : overlapping
          ? 38
          : film
            ? 92 / total - 2
            : style === "Pinterest"
              ? 38
              : style === "Minimal"
                ? 38
                : 21,
      h: first
        ? style === "Magazine"
          ? 48
          : 72
        : overlapping
          ? 45
          : film
            ? 64
            : style === "Pinterest"
              ? 30 + (i % 2) * 10
              : style === "Minimal"
                ? 34
                : style === "Magazine"
                  ? 27
                  : 34,
      rotation:
        style === "Polaroid" || style === "Scrapbook"
          ? i % 2
            ? 3
            : -3
          : style === "Overlapping"
            ? i % 2
              ? 2
              : -2
            : 0,
    };
  });
}
