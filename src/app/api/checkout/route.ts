import { NextResponse } from "next/server";
import type { Order, OrderItem } from "@/lib/types";
import { getCoupon } from "@/lib/coupons";
import { round2 } from "@/lib/format";
import { installmentValue } from "@/lib/installments";
import {
  buildServerTotals,
  estimatedOrderDate,
  orderStatusForPayment,
  serverShipping,
  type CheckoutInput,
} from "@/lib/checkout-server";

function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `TN-${stamp}${random}`;
}

function generatePixPayload(orderId: string, amount: number) {
  const amountString = amount.toFixed(2);
  return [
    "000201",
    "26580014BR.GOV.BCB.PIX0136",
    `technote-${orderId.toLowerCase()}-pagamento`,
    "52040000",
    "5303986",
    `54${amountString.length.toString().padStart(2, "0")}${amountString}`,
    "5802BR",
    "5910TECH NOTE",
    "6009SAO PAULO",
    `62${(orderId.length + 8).toString().padStart(2, "0")}05${orderId.length
      .toString()
      .padStart(2, "0")}${orderId}`,
    "6304A1B2",
  ].join("");
}

export async function POST(request: Request) {
  let body: CheckoutInput = {} as CheckoutInput;
  try {
    body = (await request.json()) as CheckoutInput;
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ler os dados do pedido." },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    !body.customer?.name ||
    !body.customer?.email ||
    !body.address?.cep ||
    !body.payment?.method ||
    !body.shippingId
  ) {
    return NextResponse.json(
      { error: "Dados do pedido incompletos. Revise as etapas e tente novamente." },
      { status: 400 },
    );
  }

  if (!["pix", "cartao"].includes(body.payment.method)) {
    return NextResponse.json({ error: "Forma de pagamento inválida." }, { status: 400 });
  }

  const totals = buildServerTotals(body.items, body.coupon);
  if (!totals) {
    return NextResponse.json(
      { error: "Um ou mais itens do carrinho não estão mais disponíveis." },
      { status: 409 },
    );
  }

  const shippingOption = serverShipping(totals.subtotal, body.shippingId);
  if (!shippingOption) {
    return NextResponse.json(
      { error: "Selecione uma opção de entrega válida." },
      { status: 400 },
    );
  }

  const coupon = getCoupon(body.coupon);
  const shippingPrice = coupon?.type === "shipping" ? 0 : shippingOption.price;
  const baseTotal = round2(totals.subtotal - totals.discount + shippingPrice);
  const installments = Math.max(
    1,
    Math.min(21, Math.trunc(body.payment.installments || 1)),
  );
  const total =
    body.payment.method === "pix"
      ? round2((totals.subtotal - totals.discount) * 0.95 + shippingPrice)
      : round2(installmentValue(baseTotal, installments) * installments);

  const orderId = generateOrderId();
  const items: OrderItem[] = totals.items.map((item) => ({
    productId: item.product.id,
    slug: item.product.slug,
    name: item.product.name,
    image: item.product.image,
    conditionLabel: item.condition.label,
    price: item.condition.price,
    quantity: item.quantity,
  }));

  const order: Order = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: orderStatusForPayment(body.payment.method),
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: shippingPrice,
    total,
    payment: body.payment.method,
    installments: body.payment.method === "cartao" ? installments : 1,
    estimatedDelivery: estimatedOrderDate(shippingOption.days),
    address: body.address,
    customer: {
      name: body.customer.name,
      email: body.customer.email,
    },
  };

  return NextResponse.json({
    order,
    shippingLabel: shippingOption.label,
    pixPayload:
      body.payment.method === "pix" ? generatePixPayload(orderId, total) : null,
  });
}
