import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

/** Main navigation: the dock at the bottom of the screen. */
export function Dock() {
  const [path] = useLocation();
  return (
    <nav className="dock" aria-label="Main">
      {navItems.map(({ href, label, Icon, color }) => (
        <Link
          key={href}
          href={href}
          className={cn("dock-item", path === href && "is-active")}
          aria-current={path === href ? "page" : undefined}
        >
          <span className={`dock-tile dock-tile--${color}`}>
            <Icon size={20} strokeWidth={1.8} />
          </span>
          <span className="dock-label">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
