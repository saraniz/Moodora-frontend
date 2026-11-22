import { create } from "zustand";
import { seedAesthetics } from "@/data/aesthetics";
import { read, storageKeys, write } from "@/lib/storage";
import type { Aesthetic } from "@/models";

interface AestheticStore {
  aesthetics: Aesthetic[];
  toggleFavorite: (id: string) => void;
  resetAesthetics: () => void;
}

/** Keeps the user's favorites but always uses the current sample moods. */
function loadAesthetics() {
  const saved = read<Aesthetic[]>(storageKeys.aesthetics, []);
  const favorites = new Map(saved.map((mood) => [mood.id, mood.favorited]));
  return seedAesthetics.map((mood) => ({
    ...mood,
    favorited: favorites.get(mood.id) ?? mood.favorited,
  }));
}

export const useAestheticStore = create<AestheticStore>((set) => ({
  aesthetics: loadAesthetics(),
  toggleFavorite: (id) =>
    set((state) => {
      const aesthetics = state.aesthetics.map((mood) =>
        mood.id === id ? { ...mood, favorited: !mood.favorited } : mood,
      );
      write(storageKeys.aesthetics, aesthetics);
      return { aesthetics };
    }),
  resetAesthetics: () => set({ aesthetics: seedAesthetics }),
}));
