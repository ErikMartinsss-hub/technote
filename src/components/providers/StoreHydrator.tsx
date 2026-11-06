"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { usePreferences } from "@/store/preferences";
import { useUser } from "@/store/user";
import { useCustomProducts } from "@/store/custom-products";

export function StoreHydrator() {
  useEffect(() => {
    void Promise.allSettled([
      useCart.persist.rehydrate(),
      useFavorites.persist.rehydrate(),
      usePreferences.persist.rehydrate(),
      useUser.persist.rehydrate(),
      useCustomProducts.persist.rehydrate(),
    ]).finally(() => {
      useCart.getState().setHasHydrated(true);
      useFavorites.getState().setHasHydrated(true);
      usePreferences.getState().setHasHydrated(true);
      useUser.getState().setHasHydrated(true);
      useCustomProducts.getState().setHasHydrated(true);
    });
  }, []);

  return null;
}
