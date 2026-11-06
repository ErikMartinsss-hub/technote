"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, ConditionId, Product, ShippingSelection } from "@/lib/types";
import type { CouponContext } from "@/lib/coupons";
import { couponDiscount, getCoupon, validateCoupon } from "@/lib/coupons";
import { getShippingOptions } from "@/lib/shipping";
import { products } from "@/lib/products";
import { round2 } from "@/lib/format";

interface CartState {
  items: CartItem[];
  coupon: string | null;
  shipping: ShippingSelection | null;
  hasHydrated: boolean;
  addItem: (product: Product, conditionId: ConditionId) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  setShipping: (shipping: ShippingSelection | null) => void;
  setHasHydrated: (value: boolean) => void;
}

export function buildCouponContext(items: CartItem[]): CouponContext {
  const categorySubtotals: Record<string, number> = {};
  let subtotal = 0;

  for (const item of items) {
    const total = item.price * item.quantity;
    subtotal += total;
    const product = products.find((candidate) => candidate.id === item.productId);
    if (product) {
      categorySubtotals[product.category] =
        (categorySubtotals[product.category] ?? 0) + total;
    }
  }

  return { subtotal: round2(subtotal), categorySubtotals };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      shipping: null,
      hasHydrated: false,

      addItem: (product, conditionId) => {
        const condition =
          product.conditions.find((item) => item.id === conditionId) ??
          product.conditions[product.conditions.length - 1];
        const key = `${product.id}:${condition.id}`;

        set((state) => {
          const existing = state.items.find((item) => item.key === key);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.key === key
                  ? { ...item, quantity: Math.min(item.quantity + 1, 5) }
                  : item,
              ),
            };
          }

          const newItem: CartItem = {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            image: product.image,
            imageFit: product.imageFit,
            conditionId: condition.id,
            conditionLabel: condition.label,
            price: condition.price,
            quantity: 1,
            storage: product.storage,
            color: product.color,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((item) => item.key !== key) })),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.key === key
                ? { ...item, quantity: Math.max(1, Math.min(quantity, 5)) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),

      clear: () => set({ items: [], coupon: null, shipping: null }),

      applyCoupon: (code) => {
        const result = validateCoupon(code, buildCouponContext(get().items));
        if (result.ok) {
          set({ coupon: result.coupon?.code ?? null });
        }
        return { ok: result.ok, message: result.message };
      },

      removeCoupon: () => set({ coupon: null }),

      setShipping: (shipping) => set({ shipping }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "technote:cart",
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        shipping: state.shipping,
      }),
    },
  ),
);

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingPrice: number;
  shippingLabel: string;
  coupon: string | null;
  couponDefinition: ReturnType<typeof getCoupon>;
  pixTotal: number;
  cardTotal: number;
  freeShippingRemaining: number;
}

export function useCartSummary(): CartSummary {
  const items = useCart((state) => state.items);
  const coupon = useCart((state) => state.coupon);
  const shipping = useCart((state) => state.shipping);

  return useMemo(() => {
    const context = buildCouponContext(items);
    const couponDefinition = getCoupon(coupon);
    const discount = couponDiscount(coupon, context);
    const shippingOptions = getShippingOptions(context.subtotal);
    const selectedShipping = shipping
      ? shippingOptions.find((option) => option.id === shipping.id)
      : undefined;
    const shippingPrice = selectedShipping
      ? couponDefinition?.type === "shipping"
        ? 0
        : selectedShipping.price
      : 0;
    const totalBase = round2(context.subtotal - discount);
    const pixTotal = round2(totalBase * 0.95 + shippingPrice);
    const cardTotal = round2(totalBase + shippingPrice);

    return {
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: context.subtotal,
      discount,
      shippingPrice,
      shippingLabel: selectedShipping?.label ?? "",
      coupon,
      couponDefinition,
      pixTotal,
      cardTotal,
      freeShippingRemaining: Math.max(0, round2(499 - context.subtotal)),
    };
  }, [items, coupon, shipping]);
}
