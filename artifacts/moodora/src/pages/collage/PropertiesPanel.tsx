import { ArrowDown, ArrowUp, Copy, FileImage, Trash2 } from "lucide-react";
import { DEFAULT_SHAPE_COLOR, DEFAULT_TEXT_COLOR } from "@/data/collage-options";
import type { CollageEditor } from "./use-collage-editor";

/** Details of the selected layer. */
export function PropertiesPanel({ editor }: { editor: CollageEditor }) {
  const { selected: layer, updateSelected } = editor;
  if (!layer) {
    return <p className="muted">Select something on the canvas to edit it.</p>;
  }
  const fallback = layer.kind === "text" ? DEFAULT_TEXT_COLOR : DEFAULT_SHAPE_COLOR;
  return (
    <div className="panel">
      {layer.kind === "text" && (
        <label>
          <span className="panel-label">Text</span>
          <input
            className="field"
            value={layer.text ?? ""}
            onChange={(e) => updateSelected({ text: e.target.value })}
          />
        </label>
      )}
      <div className="pair">
        <label>
          <span className="panel-label">Width %</span>
          <input
            className="field"
            type="number"
            min="1"
            value={Math.round(layer.w)}
            onChange={(e) => updateSelected({ w: Math.max(1, Number(e.target.value)) })}
          />
        </label>
        <label>
          <span className="panel-label">
            {layer.kind === "text" ? "Text size" : "Height %"}
          </span>
          <input
            className="field"
            type="number"
            min="1"
            value={Math.round(layer.h)}
            onChange={(e) => updateSelected({ h: Math.max(1, Number(e.target.value)) })}
          />
        </label>
      </div>
      <label>
        <span className="panel-label">Rotation</span>
        <input
          type="range"
          min="-20"
          max="20"
          value={layer.rotation ?? 0}
          onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
        />
      </label>
      <label>
        <span className="panel-label">Opacity</span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={layer.opacity ?? 1}
          onChange={(e) => updateSelected({ opacity: Number(e.target.value) })}
        />
      </label>
      {layer.kind !== "image" && (
        <label>
          <span className="panel-label">Color</span>
          <input
            className="field field--color"
            type="color"
            value={layer.color ?? fallback}
            onChange={(e) => updateSelected({ color: e.target.value })}
          />
        </label>
      )}
      {layer.kind === "image" && (
        <button
          className="btn btn--full"
          onClick={() => editor.chooseFiles(layer.id)}
        >
          <FileImage size={15} /> Replace photo
        </button>
      )}
      <div className="row row--tight">
        <button
          className="icon-btn"
          onClick={editor.duplicateSelected}
          aria-label="Duplicate layer"
        >
          <Copy size={15} />
        </button>
        <button
          className="icon-btn"
          onClick={() => editor.moveSelected(1)}
          aria-label="Bring forward"
        >
          <ArrowUp size={15} />
        </button>
        <button
          className="icon-btn"
          onClick={() => editor.moveSelected(-1)}
          aria-label="Send backward"
        >
          <ArrowDown size={15} />
        </button>
        <button
          className="icon-btn"
          onClick={editor.removeSelected}
          aria-label="Delete layer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
