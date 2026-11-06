"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  name: string;
  email: string;
  isLoggedIn: boolean;
  hasHydrated: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      name: "",
      email: "",
      isLoggedIn: false,
      hasHydrated: false,
      login: (name, email) => set({ name, email, isLoggedIn: true }),
      logout: () => set({ name: "", email: "", isLoggedIn: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "technote:user",
      skipHydration: true,
      partialize: (state) => ({
        name: state.name,
        email: state.email,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);
