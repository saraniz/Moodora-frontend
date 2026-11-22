import { ActiveSelection, Canvas as FabricCanvas } from "fabric";
import { useEffect, useRef } from "react";
import {
  createLayerObject,
  readLayerObject,
  type LayerObject,
} from "@/lib/fabric-layers";
import type { CollageEditor } from "./use-collage-editor";

/** The fabric.js canvas. Draws the layers and reports drags back to the editor. */
export function CollageCanvas({ editor }: { editor: CollageEditor }) {
  const { layers, bg, size, zoom, selectedId } = editor;
  const elementRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const redrawing = useRef(false); // ignore selection events while we redraw
  const editorRef = useRef(editor); // latest editor for canvas events
  editorRef.current = editor;

  // Create the canvas once.
  useEffect(() => {
    if (!elementRef.current) return;
    const canvas = new FabricCanvas(elementRef.current, {
      ...editorRef.current.size,
      backgroundColor: editorRef.current.bg,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    const onSelect = () => {
      if (redrawing.current) return;
      const object = canvas.getActiveObject() as LayerObject | undefined;
      editorRef.current.setSelectedId(object?.layerId ?? null);
    };
    const onModified = () => {
      if (redrawing.current) return;
      // In a group, positions are relative to the group: ungroup before reading them.
      if (canvas.getActiveObject() instanceof ActiveSelection) {
        redrawing.current = true;
        canvas.discardActiveObject();
        redrawing.current = false;
      }
      const objects = canvas.getObjects() as LayerObject[];
      editorRef.current.commit((current) =>
        current.map((layer) => {
          const object = objects.find((item) => item.layerId === layer.id);
          return object
            ? readLayerObject(layer, object, editorRef.current.size)
            : layer;
        }),
      );
    };
    canvas.on("selection:created", onSelect);
    canvas.on("selection:updated", onSelect);
    canvas.on("selection:cleared", onSelect);
    canvas.on("object:modified", onModified);
    return () => {
      fabricRef.current = null;
      void canvas.dispose();
    };
  }, []);

  // Redraw when the layers, background or size change.
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    let cancelled = false;
    void (async () => {
      const objects = await Promise.all(
        layers.map((layer) => createLayerObject(layer, size)),
      );
      if (cancelled) return;
      redrawing.current = true;
      canvas.setDimensions(size);
      canvas.clear();
      canvas.backgroundColor = bg;
      const ready = objects.filter((object): object is LayerObject => object !== null);
      if (ready.length) canvas.add(...ready);
      const active = ready.find(
        (object) => object.layerId === editorRef.current.selectedId,
      );
      if (active) canvas.setActiveObject(active);
      canvas.requestRenderAll();
      redrawing.current = false;
    })();
    return () => {
      cancelled = true;
    };
  }, [layers, bg, size]);

  // Follow selections made in the layer list.
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject() as LayerObject | undefined;
    if (active instanceof ActiveSelection || active?.layerId === selectedId) return;
    const target = (canvas.getObjects() as LayerObject[]).find(
      (object) => object.layerId === selectedId,
    );
    redrawing.current = true;
    if (target) canvas.setActiveObject(target);
    else canvas.discardActiveObject();
    canvas.requestRenderAll();
    redrawing.current = false;
  }, [selectedId]);

  return (
    <div className="canvas-scroll">
      <div
        className="canvas-frame"
        style={{
          width: `calc(min(100%, 72vh * ${size.width / size.height}) * ${zoom / 100})`,
          aspectRatio: `${size.width} / ${size.height}`,
          background: bg,
        }}
      >
        <canvas ref={elementRef} aria-label="Collage canvas" />
        {!layers.length && (
          <div className="canvas-empty">
            <strong className="display display--small">Blank canvas</strong>
            <span>Pick a layout or add a photo to begin.</span>
          </div>
        )}
      </div>
    </div>
  );
}
