"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  slugs: string[];
  hasHydrated: boolean;
  toggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  clear: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      slugs: [],
      hasHydrated: false,
      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug)
            ? state.slugs.filter((item) => item !== slug)
            : [...state.slugs, slug],
        })),
      isFavorite: (slug) => get().slugs.includes(slug),
      clear: () => set({ slugs: [] }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "technote:favorites",
      skipHydration: true,
      partialize: (state) => ({ slugs: state.slugs }),
    },
  ),
);
