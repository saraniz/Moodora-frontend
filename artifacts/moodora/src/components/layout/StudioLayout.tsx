import type { ReactNode } from "react";
import { Dock } from "./Dock";
import { StatusBar } from "./StatusBar";

/** Status bar, page and dock: the frame around every studio page. */
export function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="studio">
      <StatusBar />
      <main className="page">{children}</main>
      <Dock />
    </div>
  );
}
