import productsData from "@/data/products.json";
import type { ConditionId, Product, ProductCondition } from "@/lib/types";

export const products = productsData as unknown as Product[];

export const CATEGORY_ORDER = [
  "Celulares",
  "Notebooks",
  "Tablets",
  "Smartwatches",
  "Acessórios",
] as const;

export const CATEGORY_META: Record<
  string,
  { slug: string; description: string; short: string }
> = {
  Celulares: {
    slug: "celulares",
    description: "iPhone, Samsung, Motorola e muito mais",
    short: "Smartphones seminovos com garantia",
  },
  Notebooks: {
    slug: "notebooks",
    description: "MacBook, Dell, Lenovo e mais",
    short: "Notebooks para trabalho e estudos",
  },
  Tablets: {
    slug: "tablets",
    description: "iPad e Galaxy Tab seminovos",
    short: "Tablets para criar, estudar e assistir",
  },
  Smartwatches: {
    slug: "smartwatches",
    description: "Apple Watch e Galaxy Watch",
    short: "Tecnologia no seu pulso",
  },
  Acessórios: {
    slug: "acessorios",
    description: "Fones, caixas de som e carregadores",
    short: "Acessórios para completar seu setup",
  },
};

export const CONDITION_LABELS: Record<ConditionId, string> = {
  excelente: "Excelente",
  "muito-bom": "Muito bom",
  bom: "Bom",
};

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getCondition(
  product: Product,
  conditionId: ConditionId,
): ProductCondition {
  return (
    product.conditions.find((condition) => condition.id === conditionId) ??
    product.conditions[2]
  );
}

export function getLowestCondition(product: Product): ProductCondition {
  return [...product.conditions].sort((a, b) => a.price - b.price)[0];
}

export function getHighestCondition(product: Product): ProductCondition {
  return [...product.conditions].sort((a, b) => b.price - a.price)[0];
}

export function getFromPrice(product: Product) {
  return getLowestCondition(product).price;
}

export function pixPrice(price: number) {
  return Math.round((price * 0.95 + Number.EPSILON) * 100) / 100;
}

export function pixDiscountPercent(price: number) {
  return Math.round((1 - pixPrice(price) / price) * 100);
}

export function productSpecLine(product: Product) {
  return [product.storage, product.color, product.screen]
    .filter((value) => value && value !== "—")
    .join(" • ");
}

export function getBrands() {
  return [...new Set(products.map((product) => product.brand))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function getStorages() {
  return [...new Set(products.map((product) => product.storage).filter(Boolean))];
}

export function getRelatedProducts(product: Product, limit = 4) {
  const sameCategory = products.filter(
    (item) => item.id !== product.id && item.category === product.category,
  );
  const sameBrand = products.filter(
    (item) =>
      item.id !== product.id &&
      item.brand === product.brand &&
      item.category !== product.category,
  );
  return [...sameCategory, ...sameBrand]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function getBestSellers(limit = 8) {
  return products
    .filter((product) => product.bestSeller)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}

export function getDeals(limit = 8) {
  return products
    .filter((product) => product.offer)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
