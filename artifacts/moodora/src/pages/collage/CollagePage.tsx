import { Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { PageHeading } from "@/components/layout/PageHeading";
import { Window } from "@/components/y2k/Window";
import { canvasFormats } from "@/data/collage-options";
import type { CanvasFormat } from "@/models";
import { AddPanel } from "./AddPanel";
import { CollageCanvas } from "./CollageCanvas";
import { LayersPanel } from "./LayersPanel";
import { LayoutPanel } from "./LayoutPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { useCollageEditor } from "./use-collage-editor";

export function CollagePage() {
  const editor = useCollageEditor();
  return (
    <>
      <PageHeading
        title="Collage"
        description="Arrange photos, type and shapes. Select anything on the canvas to edit it."
      >
        <button className="btn" onClick={() => void editor.exportImage("png")}>
          Export PNG
        </button>
        <button className="btn" onClick={() => void editor.exportImage("jpeg")}>
          Export JPEG
        </button>
        <button className="btn btn--primary" onClick={editor.save}>
          Save
        </button>
      </PageHeading>
      <div className="collage-grid">
        <div className="stack">
          <Window title="Layout">
            <LayoutPanel editor={editor} />
          </Window>
          <Window title="Add">
            <AddPanel editor={editor} />
          </Window>
        </div>

        <Window
          title={`${editor.size.width} × ${editor.size.height}`}
          slab
          className="collage-stage"
        >
          <div className="collage-bar">
            <input
              className="field"
              value={editor.title}
              onChange={(e) => editor.setTitle(e.target.value)}
              aria-label="Collage title"
            />
            <select
              className="field field--auto"
              value={editor.format}
              onChange={(e) => editor.setFormat(e.target.value as CanvasFormat)}
              aria-label="Canvas size"
            >
              {Object.keys(canvasFormats).map((format) => (
                <option key={format}>{format}</option>
              ))}
            </select>
            <div className="row row--tight">
              <button
                className="icon-btn"
                onClick={editor.undo}
                disabled={!editor.canUndo}
                aria-label="Undo"
              >
                <Undo2 size={16} />
              </button>
              <button
                className="icon-btn"
                onClick={editor.redo}
                disabled={!editor.canRedo}
                aria-label="Redo"
              >
                <Redo2 size={16} />
              </button>
              <button
                className="icon-btn"
                onClick={() => editor.setZoom(Math.max(60, editor.zoom - 10))}
                aria-label="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="zoom-value">{editor.zoom}%</span>
              <button
                className="icon-btn"
                onClick={() => editor.setZoom(Math.min(140, editor.zoom + 10))}
                aria-label="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
          <CollageCanvas editor={editor} />
        </Window>

        <div className="stack">
          <Window title="Properties">
            <PropertiesPanel editor={editor} />
          </Window>
          <Window title={`Layers (${editor.layers.length})`}>
            <LayersPanel editor={editor} />
          </Window>
        </div>
      </div>
      <input
        ref={editor.fileRef}
        hidden
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => void editor.upload(event)}
      />
    </>
  );
}
