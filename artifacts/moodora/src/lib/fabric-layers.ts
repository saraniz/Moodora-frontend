import { Ellipse, FabricImage, Rect, Textbox, type FabricObject } from "fabric";
import { DEFAULT_SHAPE_COLOR, DEFAULT_TEXT_COLOR } from "@/data/collage-options";
import type { Layer } from "@/models";

export type LayerObject = FabricObject & { layerId?: string };
interface Size {
  width: number;
  height: number;
}

/** Turns one of our layers into a fabric.js object. Returns null if its image fails to load. */
export async function createLayerObject(
  layer: Layer,
  size: Size,
): Promise<LayerObject | null> {
  const width = (layer.w * size.width) / 100;
  const height = (layer.h * size.height) / 100;
  const common = {
    left: (layer.x * size.width) / 100,
    top: (layer.y * size.height) / 100,
    angle: layer.rotation || 0,
    opacity: layer.opacity ?? 1,
    originX: "left" as const,
    originY: "top" as const,
  };
  let object: LayerObject;

  if (layer.kind === "image" && layer.src) {
    try {
      const image = await FabricImage.fromURL(layer.src, {
        crossOrigin: "anonymous",
      });
      // Crop to fill the frame so photos are never stretched.
      const scale = Math.max(width / image.width, height / image.height);
      const cropWidth = width / scale;
      const cropHeight = height / scale;
      image.set({
        ...common,
        cropX: (image.width - cropWidth) / 2,
        cropY: (image.height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
        scaleX: scale,
        scaleY: scale,
      });
      object = image;
    } catch {
      return null;
    }
  } else if (layer.kind === "text") {
    object = new Textbox(layer.text || "Text", {
      ...common,
      width,
      fontSize: Math.max(18, height * 0.3),
      fontFamily: "Figtree",
      fill: layer.color || DEFAULT_TEXT_COLOR,
    });
  } else if (layer.shape === "circle") {
    object = new Ellipse({
      ...common,
      rx: width / 2,
      ry: height / 2,
      strokeWidth: 0,
      fill: layer.color || DEFAULT_SHAPE_COLOR,
    });
  } else {
    object = new Rect({
      ...common,
      width,
      height,
      strokeWidth: 0,
      fill: layer.color || DEFAULT_SHAPE_COLOR,
    });
  }
  object.layerId = layer.id;
  return object;
}

/** Reads position and size back from fabric after the user drags or resizes. */
export function readLayerObject(layer: Layer, object: LayerObject, size: Size): Layer {
  const isText = layer.kind === "text";
  return {
    ...layer,
    x: (object.left / size.width) * 100,
    y: (object.top / size.height) * 100,
    w: (object.getScaledWidth() / size.width) * 100,
    // Text keeps its own height (it drives the font size), scaled by the drag.
    h: isText
      ? layer.h * object.scaleY
      : (object.getScaledHeight() / size.height) * 100,
    rotation: object.angle || 0,
    opacity: object.opacity ?? 1,
  };
}
