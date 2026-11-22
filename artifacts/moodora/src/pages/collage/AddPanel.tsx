import { Circle, Square, Type, Upload } from "lucide-react";
import { canvasColors } from "@/data/collage-options";
import { photos } from "@/data/photos";
import { cn } from "@/lib/utils";
import type { CollageEditor } from "./use-collage-editor";

/** Things to put on the canvas: uploads, text, shapes, sample photos, background. */
export function AddPanel({ editor }: { editor: CollageEditor }) {
  const tools = [
    { label: "Upload", Icon: Upload, run: () => editor.chooseFiles() },
    { label: "Text", Icon: Type, run: editor.addText },
    { label: "Square", Icon: Square, run: () => editor.addShape("rect") },
    { label: "Circle", Icon: Circle, run: () => editor.addShape("circle") },
  ];
  return (
    <div className="panel">
      <div className="tools-row">
        {tools.map(({ label, Icon, run }) => (
          <button key={label} className="tool" onClick={run}>
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
      <div>
        <span className="panel-label">Sample photos</span>
        <div className="library library--small">
          {photos.slice(0, 12).map((src, i) => (
            <button
              key={src}
              className="library-item"
              onClick={() => editor.addPhoto(src)}
              aria-label={`Add sample photo ${i + 1}`}
            >
              <img className="photo" src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="panel-label">Background</span>
        <div className="color-row">
          {canvasColors.map((color) => (
            <button
              key={color}
              className={cn("color-btn", editor.bg === color && "is-active")}
              style={{ background: color }}
              onClick={() => editor.setBg(color)}
              aria-label={`Use background ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
