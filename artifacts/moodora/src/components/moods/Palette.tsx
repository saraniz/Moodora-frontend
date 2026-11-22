/** A row of solid color swatches. */
export function Palette({ colors, labels }: { colors: string[]; labels?: boolean }) {
  return (
    <div className={labels ? "palette palette--labels" : "palette"}>
      {colors.map((color) => (
        <span key={color} className="swatch">
          <i style={{ background: color }} title={color} />
          {labels && <small>{color}</small>}
        </span>
      ))}
    </div>
  );
}
