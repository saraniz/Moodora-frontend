import { compositionStyles, layoutOptions, photoCounts } from "@/data/collage-options";
import { cn } from "@/lib/utils";
import type { CollageMode } from "@/models";
import type { CollageEditor } from "./use-collage-editor";

const modes: { value: CollageMode; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "creative", label: "Freeform" },
];

/** Ready-made arrangements: an even grid or a freeform composition. */
export function LayoutPanel({ editor }: { editor: CollageEditor }) {
  return (
    <div className="panel">
      <div className="segmented">
        {modes.map(({ value, label }) => (
          <button
            key={value}
            className={cn(editor.mode === value && "is-active")}
            aria-pressed={editor.mode === value}
            onClick={() => editor.setMode(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        <span className="panel-label">Photos</span>
        <div className="counts">
          {photoCounts.map((n) => (
            <button
              key={n}
              className={cn("chip", editor.count === n && "is-active")}
              aria-pressed={editor.count === n}
              onClick={() => editor.setCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      {editor.mode === "grid" ? (
        <>
          <label>
            <span className="panel-label">Grid style</span>
            <select
              className="field"
              value={editor.layout}
              onChange={(e) => editor.setLayout(e.target.value)}
            >
              {layoutOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="panel-label">Spacing</span>
            <input
              type="range"
              min="0"
              max="4"
              value={editor.spacing}
              onChange={(e) => editor.setSpacing(Number(e.target.value))}
            />
          </label>
          <label>
            <span className="panel-label">Margin</span>
            <input
              type="range"
              min="0"
              max="8"
              value={editor.margin}
              onChange={(e) => editor.setMargin(Number(e.target.value))}
            />
          </label>
          <button className="btn btn--blue btn--full" onClick={editor.createGrid}>
            Arrange {editor.count} photos
          </button>
        </>
      ) : (
        <div>
          <span className="panel-label">Composition</span>
          <div className="chips chips--wrap">
            {compositionStyles.map((name) => (
              <button
                key={name}
                className={cn("chip", editor.style === name && "is-active")}
                onClick={() => editor.createComposition(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
