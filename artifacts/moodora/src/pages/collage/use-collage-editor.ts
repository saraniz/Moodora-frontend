import { Canvas as FabricCanvas } from "fabric";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  DEFAULT_CANVAS_COLOR,
  DEFAULT_SHAPE_COLOR,
  DEFAULT_TEXT_COLOR,
  canvasFormats,
  compositionStyles,
  layoutOptions,
} from "@/data/collage-options";
import { photos } from "@/data/photos";
import { creativeCells, gridCells, type Cell } from "@/lib/collage-layouts";
import { createLayerObject } from "@/lib/fabric-layers";
import { createId } from "@/lib/id";
import { createLocalImagePreview, persistLocalImage } from "@/lib/local-assets";
import { takeOpenProject } from "@/lib/open-project";
import { read, storageKeys, write } from "@/lib/storage";
import type { CanvasFormat, CollageMode, Layer, ShapeKind } from "@/models";
import { useProjectStore } from "@/stores/project-store";
import { notify } from "@/stores/toast-store";
import { useLayerHistory } from "./use-layer-history";

/** All state and actions for the collage studio. The canvas itself is in CollageCanvas. */
export function useCollageEditor() {
  const saveProject = useProjectStore((state) => state.saveProject);
  const history = useLayerHistory(read<Layer[]>(storageKeys.collageLayers, []));
  const { layers, commit, reset } = history;

  const [title, setTitle] = useState("Untitled collage");
  const [mode, setMode] = useState<CollageMode>("grid");
  const [count, setCount] = useState(4);
  const [layout, setLayout] = useState(layoutOptions[0]);
  const [style, setStyle] = useState(compositionStyles[0]);
  const [spacing, setSpacing] = useState(2);
  const [margin, setMargin] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [bg, setBg] = useState(() =>
    read(storageKeys.collageBg, DEFAULT_CANVAS_COLOR),
  );
  const [format, setFormat] = useState<CanvasFormat>(() => {
    const saved = read<CanvasFormat>(storageKeys.collageFormat, "Square");
    return saved in canvasFormats ? saved : "Square";
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceId = useRef<string | null>(null); // layer waiting for a new image

  const size = canvasFormats[format];
  const selected = layers.find((layer) => layer.id === selectedId);

  useEffect(() => write(storageKeys.collageLayers, layers), [layers]);
  useEffect(() => write(storageKeys.collageBg, bg), [bg]);
  useEffect(() => write(storageKeys.collageFormat, format), [format]);

  // Load the project opened from "Projects", if any.
  useEffect(() => {
    const project = takeOpenProject("collage");
    if (!project) return;
    const content = project.content;
    setTitle(project.title);
    reset(content?.layers ?? []);
    setBg(content?.bg ?? DEFAULT_CANVAS_COLOR);
    if (content?.canvasFormat in canvasFormats) setFormat(content.canvasFormat);
  }, []);

  // ---- adding layers ----
  const add = (layer: Layer) => {
    commit((current) => [...current, layer]);
    setSelectedId(layer.id);
  };

  const addPhoto = (src: string, id = createId()) => {
    const position = history.current().length;
    add({
      id,
      kind: "image",
      src,
      x: 12 + (position % 3) * 27,
      y: 12 + (position % 2) * 28,
      w: 26,
      h: 31,
      rotation: mode === "creative" ? (position % 2 ? 4 : -3) : 0,
    });
  };

  const addText = () =>
    add({
      id: createId(),
      kind: "text",
      text: "A note to remember",
      x: 32,
      y: 43,
      w: 36,
      h: 14,
      color: DEFAULT_TEXT_COLOR,
    });

  const addShape = (shape: ShapeKind) =>
    add({
      id: createId(),
      kind: "shape",
      shape,
      x: 40,
      y: 38,
      w: 20,
      h: 20,
      color: DEFAULT_SHAPE_COLOR,
    });

  // ---- uploads ----
  const chooseFiles = (layerToReplace: string | null = null) => {
    replaceId.current = layerToReplace;
    fileRef.current?.click();
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    const target = replaceId.current;
    replaceId.current = null;
    event.target.value = "";
    for (const [i, file] of files.entries()) {
      try {
        const preview = await createLocalImagePreview(file);
        const id = target && i === 0 ? target : createId();
        await persistLocalImage(id, file);
        if (id === target) {
          commit((current) =>
            current.map((layer) =>
              layer.id === target ? { ...layer, src: preview.url } : layer,
            ),
          );
          setSelectedId(target);
        } else {
          addPhoto(preview.url, id);
        }
      } catch {
        notify(`Could not open ${file.name}. Choose another image.`);
      }
    }
  };

  // ---- editing the selected layer ----
  const updateSelected = (changes: Partial<Layer>) => {
    if (!selected) return;
    commit((current) =>
      current.map((layer) =>
        layer.id === selected.id ? { ...layer, ...changes } : layer,
      ),
    );
  };

  const removeSelected = () => {
    if (!selected) return;
    commit((current) => current.filter((layer) => layer.id !== selected.id));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    add({
      ...selected,
      id: createId(),
      x: Math.min(80, selected.x + 4),
      y: Math.min(80, selected.y + 4),
    });
  };

  /** +1 brings the layer forward, -1 sends it back. */
  const moveSelected = (direction: 1 | -1) => {
    if (!selected) return;
    commit((current) => {
      const from = current.findIndex((layer) => layer.id === selected.id);
      const to = Math.min(current.length - 1, Math.max(0, from + direction));
      const next = [...current];
      next.splice(from, 1);
      next.splice(to, 0, selected);
      return next;
    });
  };

  // ---- layouts ----
  const fill = (cells: Cell[]) => {
    commit(() =>
      cells.map((cell, i) => ({
        id: createId(),
        kind: "image" as const,
        src: photos[i % photos.length],
        ...cell,
      })),
    );
    setSelectedId(null);
  };

  const createGrid = () => {
    fill(gridCells(count, layout, spacing, margin));
    notify(`${count} photos arranged.`);
  };

  const createComposition = (name: string) => {
    setStyle(name);
    fill(creativeCells(name, count));
    notify(`${name} composition created.`);
  };

  // ---- save and export ----
  const save = () => {
    const now = new Date().toISOString();
    saveProject({
      id: `collage-${title.toLowerCase().replace(/\W+/g, "-")}`,
      title,
      type: "collage",
      createdAt: now,
      updatedAt: now,
      thumbnail: layers.find((layer) => layer.kind === "image")?.src ?? photos[0],
      content: { layers, bg, mode, count, layout, canvasFormat: format },
    });
    notify("Collage saved to Projects.");
  };

  const exportImage = async (type: "png" | "jpeg") => {
    try {
      const canvas = new FabricCanvas(document.createElement("canvas"), {
        ...size,
        backgroundColor: bg,
        renderOnAddRemove: false,
        enableRetinaScaling: false,
      });
      for (const layer of layers) {
        const object = await createLayerObject(layer, size);
        if (object) canvas.add(object);
      }
      canvas.renderAll();
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-")}.${type}`;
      link.href = canvas.toDataURL({ format: type, quality: 0.92, multiplier: 1 });
      link.click();
      await canvas.dispose();
      notify(`Exported as ${type.toUpperCase()}.`);
    } catch {
      notify("Export failed. Check that your images loaded and try again.");
    }
  };

  return {
    ...history,
    size,
    title,
    setTitle,
    mode,
    setMode,
    count,
    setCount,
    layout,
    setLayout,
    style,
    spacing,
    setSpacing,
    margin,
    setMargin,
    zoom,
    setZoom,
    bg,
    setBg,
    format,
    setFormat,
    selected,
    selectedId,
    setSelectedId,
    fileRef,
    chooseFiles,
    upload,
    addPhoto,
    addText,
    addShape,
    updateSelected,
    removeSelected,
    duplicateSelected,
    moveSelected,
    createGrid,
    createComposition,
    save,
    exportImage,
  };
}

export type CollageEditor = ReturnType<typeof useCollageEditor>;
