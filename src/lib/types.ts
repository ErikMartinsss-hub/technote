export type ConditionId = "excelente" | "muito-bom" | "bom";

export interface ProductCondition {
  id: ConditionId;
  label: string;
  description: string;
  price: number;
  stock: number;
}

export type ProductImageFit = "contain" | "cover";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  storage: string;
  color: string;
  screen: string;
  image: string;
  images: string[];
  imageFit: ProductImageFit;
  badge: string | null;
  coupon: string | null;
  offer: boolean;
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  sold: number;
  releaseYear: number;
  conditions: ProductCondition[];
  specs: Record<string, string>;
  highlights: string[];
  description: string;
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  imageFit: ProductImageFit;
  conditionId: ConditionId;
  conditionLabel: string;
  price: number;
  quantity: number;
  storage: string;
  color: string;
}

export interface ShippingSelection {
  id: string;
  label: string;
  description: string;
  price: number;
  days: string;
  cep: string;
  city: string;
  state: string;
}

export interface OrderAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  conditionLabel: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: "pago" | "aguardando_pagamento" | "enviado" | "entregue";
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  payment: "pix" | "cartao";
  installments: number;
  estimatedDelivery: string;
  address: OrderAddress;
  customer: { name: string; email: string };
}

export interface TradeInProtocol {
  protocol: string;
  createdAt: string;
  model: string;
  storage: string;
  offer: number;
  creditOffer: number;
  payment: "pix" | "credito" | "troca";
  shippingMethod: "etiqueta" | "coleta";
  status: "aguardando_envio" | "em_analise" | "pago";
}
