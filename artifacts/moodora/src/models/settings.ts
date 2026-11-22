export type Theme = "light" | "dark";

export interface Settings {
  theme: Theme;
  /** Smaller cards on the projects page */
  compact: boolean;
}
