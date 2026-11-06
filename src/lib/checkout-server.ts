import productsData from "@/data/products.json";
import type { Order, Product } from "@/lib/types";
import { round2 } from "@/lib/format";
import { couponDiscount } from "@/lib/coupons";
import { getShippingOptions } from "@/lib/shipping";

export interface CheckoutItemInput {
  productId: string;
  conditionId: string;
  quantity: number;
}

export interface CheckoutInput {
  items: CheckoutItemInput[];
  coupon: string | null;
  shippingId: string;
  customer: { name: string; email: string; cpf: string; phone: string };
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
  };
  payment: {
    method: "pix" | "cartao";
    installments: number;
    cardLast4?: string;
  };
}

const productsById = new Map<string, Product>(
  (productsData as unknown as Product[]).map((product) => [product.id, product]),
);

export function buildServerTotals(items: CheckoutItemInput[], coupon: string | null) {
  const normalized = items.map((item) => {
    const product = productsById.get(item.productId);
    const condition = product?.conditions.find(
      (candidate) => candidate.id === item.conditionId,
    );
    if (!product || !condition) return null;
    const quantity = Math.max(1, Math.min(5, Math.trunc(item.quantity)));
    return {
      product,
      condition,
      quantity,
      total: condition.price * quantity,
    };
  });

  const validItems = normalized.filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );
  if (validItems.length === 0) return null;

  const subtotal = round2(
    validItems.reduce((total, item) => total + item.total, 0),
  );
  const categorySubtotals: Record<string, number> = {};
  for (const item of validItems) {
    categorySubtotals[item.product.category] =
      (categorySubtotals[item.product.category] ?? 0) + item.total;
  }

  const discount = couponDiscount(coupon, { subtotal, categorySubtotals });
  return { items: validItems, subtotal, discount };
}

export function serverShipping(subtotal: number, shippingId: string) {
  return getShippingOptions(subtotal).find((option) => option.id === shippingId);
}

export function estimatedOrderDate(days: string) {
  const match = days.match(/(\d+)\s*a\s*(\d+)/);
  const maxDays = match ? Number(match[2]) : 6;
  const date = new Date();
  date.setDate(date.getDate() + maxDays);
  return date.toISOString();
}

export function orderStatusForPayment(method: "pix" | "cartao"): Order["status"] {
  return method === "pix" ? "aguardando_pagamento" : "pago";
}
