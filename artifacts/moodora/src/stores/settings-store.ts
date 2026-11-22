import { create } from "zustand";
import { read, storageKeys, write } from "@/lib/storage";
import type { Settings, Theme } from "@/models";

interface SettingsStore extends Settings {
  setTheme: (theme: Theme) => void;
  setCompact: (compact: boolean) => void;
  resetSettings: () => void;
}

const applyTheme = (theme: Theme) =>
  document.documentElement.classList.toggle("dark", theme === "dark");

const savedTheme = read<Theme>(storageKeys.theme, "light");
applyTheme(savedTheme); // so the saved theme is there from the first paint

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: savedTheme,
  compact: read(storageKeys.compact, false),
  setTheme: (theme) => {
    applyTheme(theme);
    write(storageKeys.theme, theme);
    set({ theme });
  },
  setCompact: (compact) => {
    write(storageKeys.compact, compact);
    set({ compact });
  },
  resetSettings: () => {
    applyTheme("light");
    set({ theme: "light", compact: false });
  },
}));
