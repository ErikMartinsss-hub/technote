"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

interface CustomProductsState {
  items: Product[];
  hasHydrated: boolean;
  upsert: (product: Product) => void;
  remove: (id: string) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useCustomProducts = create<CustomProductsState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      upsert: (product) =>
        set((state) => {
          const next = state.items.filter((item) => item.id !== product.id);
          return { items: [...next, product] };
        }),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "technote:custom-products",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
