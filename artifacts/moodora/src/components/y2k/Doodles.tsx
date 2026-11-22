import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function Butterfly(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M24 17c-2-8-9-12-15-11-5 1-5 8-2 13 2 4 8 6 17 5" />
      <path d="M24 17c2-8 9-12 15-11 5 1 5 8 2 13-2 4-8 6-17 5" />
      <path d="M24 24c-8 0-13 3-13 8 0 6 6 9 9 6 2-2 4-6 4-14" />
      <path d="M24 24c8 0 13 3 13 8 0 6-6 9-9 6-2-2-4-6-4-14" />
      <path d="M24 16v20M24 16c-1-4-3-6-5-7M24 16c1-4 3-6 5-7" />
    </svg>
  );
}

export function Cloud(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 48" {...base} {...props}>
      <path d="M16 34c-6 0-10-4-10-9s4-8 9-8c1-7 7-11 13-11 7 0 11 4 13 9 8-1 14 3 14 9 0 7-5 10-11 10" />
      <path d="M22 34v6M31 32v8M40 34v6" />
    </svg>
  );
}

export function Sun(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M33 24a9 9 0 1 1-5-8c4 2 5 6 4 9-1 4-6 5-8 2-2-2 0-6 3-5" />
      <path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M10 38l4-4" />
    </svg>
  );
}

export function Plant(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 56" {...base} {...props}>
      <path d="M10 32h28l-4 20H14z" />
      <path d="M24 32C20 22 22 12 24 4c2 8 4 18 0 28M22 30C16 26 11 20 8 12c8 3 13 9 14 18M26 30c6-4 11-10 14-18-8 3-13 9-14 18" />
    </svg>
  );
}

/** Solid wavy edge between two blocks of color. */
export function Wave({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M-10 62C120 20 250 18 380 46s250 38 380 8 250-52 380-20 210 34 310 8v80H-10z"
        fill="var(--slab)"
        stroke="var(--line)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
