"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  cep: string;
  city: string;
  state: string;
  hasHydrated: boolean;
  setLocation: (location: { cep: string; city: string; state: string }) => void;
  clearLocation: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      cep: "",
      city: "",
      state: "",
      hasHydrated: false,
      setLocation: ({ cep, city, state }) => set({ cep, city, state }),
      clearLocation: () => set({ cep: "", city: "", state: "" }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "technote:preferences",
      skipHydration: true,
      partialize: (state) => ({
        cep: state.cep,
        city: state.city,
        state: state.state,
      }),
    },
  ),
);
