import {
  FolderOpen,
  Grid2X2,
  House,
  Images,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Home", Icon: House, color: "blue" },
  { href: "/planner", label: "Feed", Icon: Grid2X2, color: "white" },
  { href: "/collage", label: "Collage", Icon: Images, color: "lilac" },
  { href: "/explore", label: "Moods", Icon: Sparkles, color: "sky" },
  { href: "/projects", label: "Projects", Icon: FolderOpen, color: "silver" },
  { href: "/profile", label: "Profile", Icon: UserRound, color: "white" },
  { href: "/settings", label: "Settings", Icon: Settings, color: "ink" },
];
