import { Circle, Square, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Layer } from "@/models";
import type { CollageEditor } from "./use-collage-editor";

const layerName = (layer: Layer, position: number) => {
  if (layer.kind === "text") return layer.text || "Text";
  return `${layer.kind === "image" ? "Photo" : "Shape"} ${position}`;
};

function LayerIcon({ layer }: { layer: Layer }) {
  if (layer.kind === "image") return <img className="photo" src={layer.src} alt="" />;
  if (layer.kind === "text") return <Type size={14} />;
  return layer.shape === "circle" ? <Circle size={14} /> : <Square size={14} />;
}

/** Every layer, top one first. */
export function LayersPanel({ editor }: { editor: CollageEditor }) {
  const { layers, selectedId, setSelectedId } = editor;
  if (!layers.length) return <p className="muted">The canvas is empty.</p>;
  return (
    <div className="layers">
      {layers
        .map((layer, i) => (
          <button
            key={layer.id}
            className={cn("layer", selectedId === layer.id && "is-active")}
            aria-pressed={selectedId === layer.id}
            onClick={() => setSelectedId(layer.id)}
          >
            <span className="layer-icon">
              <LayerIcon layer={layer} />
            </span>
            <span className="layer-name">{layerName(layer, i + 1)}</span>
          </button>
        ))
        .reverse()}
    </div>
  );
}
