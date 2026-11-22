import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WindowProps {
  title: string;
  children: ReactNode;
  /** Small controls on the right of the title bar */
  actions?: ReactNode;
  /** Solid blue slab peeking out behind the window. Use once per page. */
  slab?: boolean;
  className?: string;
  bodyClassName?: string;
}

/** The desktop-style window everything in the app sits in. */
export function Window({
  title,
  children,
  actions,
  slab,
  className,
  bodyClassName,
}: WindowProps) {
  return (
    <section className={cn("window", slab && "window--slab", className)}>
      <div className="window-bar">
        <span className="window-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <h2 className="window-title">{title}</h2>
        <span className="window-actions">{actions}</span>
      </div>
      <div className={cn("window-body", bodyClassName)}>{children}</div>
    </section>
  );
}
