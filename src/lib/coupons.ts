export interface CouponDefinition {
  code: string;
  type: "percent" | "shipping";
  value: number;
  minSubtotal: number;
  category?: string;
  label: string;
  description: string;
}

export const COUPONS: Record<string, CouponDefinition> = {
  TECH10: {
    code: "TECH10",
    type: "percent",
    value: 10,
    minSubtotal: 499,
    label: "10% OFF em toda a loja",
    description: "Válido para compras acima de R$ 499.",
  },
  NOTE10: {
    code: "NOTE10",
    type: "percent",
    value: 10,
    minSubtotal: 999,
    category: "Notebooks",
    label: "10% OFF em notebooks",
    description: "Válido para notebooks acima de R$ 999.",
  },
  BEMVINDO15: {
    code: "BEMVINDO15",
    type: "percent",
    value: 15,
    minSubtotal: 999,
    label: "15% OFF na primeira compra",
    description: "Válido para compras acima de R$ 999.",
  },
  FRETEGRATIS: {
    code: "FRETEGRATIS",
    type: "shipping",
    value: 100,
    minSubtotal: 0,
    label: "Frete grátis",
    description: "Frete grátis para todo o Brasil.",
  },
};

export interface CouponContext {
  subtotal: number;
  categorySubtotals: Record<string, number>;
}

export function normalizeCoupon(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function getCoupon(code: string | null | undefined) {
  if (!code) return null;
  return COUPONS[normalizeCoupon(code)] ?? null;
}

export function validateCoupon(
  code: string,
  context: CouponContext,
): { ok: boolean; coupon: CouponDefinition | null; message: string } {
  const coupon = getCoupon(code);
  if (!coupon) {
    return { ok: false, coupon: null, message: "Cupom inválido. Confira o código." };
  }

  if (context.subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      coupon,
      message: `Este cupom é válido para compras acima de ${formatMin(
        coupon.minSubtotal,
      )}.`,
    };
  }

  if (coupon.category) {
    const eligible = context.categorySubtotals[coupon.category] ?? 0;
    if (eligible <= 0) {
      return {
        ok: false,
        coupon,
        message: `Este cupom é válido apenas para ${coupon.category.toLowerCase()}.`,
      };
    }
  }

  return { ok: true, coupon, message: coupon.label };
}

export function couponDiscount(
  code: string | null | undefined,
  context: CouponContext,
) {
  const coupon = getCoupon(code);
  if (!coupon || coupon.type !== "percent") return 0;
  const validation = validateCoupon(coupon.code, context);
  if (!validation.ok) return 0;

  const base = coupon.category
    ? context.categorySubtotals[coupon.category] ?? 0
    : context.subtotal;

  return Math.round((base * (coupon.value / 100) + Number.EPSILON) * 100) / 100;
}

function formatMin(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
