/** Every localStorage key the app uses. */
export const storageKeys = {
  projects: "moodora.projects",
  aesthetics: "moodora.aesthetics",
  name: "moodora.name",
  email: "moodora.email",
  avatar: "moodora.avatar",
  session: "moodora.session",
  theme: "moodora.theme",
  compact: "moodora.compact",
  openProject: "moodora.openProject",
  feedItems: "moodora.feed.items",
  feedName: "moodora.feed.name",
  feedDrafts: "moodora.feed.drafts",
  collageLayers: "moodora.collage.layers",
  collageBg: "moodora.collage.bg",
  collageFormat: "moodora.collage.format",
} as const;

export function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Browser storage may be full. */
  }
}

export function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* Storage may be blocked. */
  }
}

export function clearMoodoraStorage() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith("moodora."))
    .forEach(remove);
}
