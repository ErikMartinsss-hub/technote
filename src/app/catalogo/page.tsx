import type { Metadata } from "next";
import { CatalogView } from "@/components/product/CatalogView";

export const metadata: Metadata = {
  title: "Catálogo de eletrônicos seminovos",
  description:
    "Filtre por marca, modelo, armazenamento, condição e preço. iPhone, Samsung, Motorola, MacBook, iPad, Apple Watch e acessórios seminovos com garantia de 12 meses.",
  alternates: { canonical: "/catalogo" },
};

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toQueryString(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  }
  return query.toString();
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  return <CatalogView initialQuery={toQueryString(params)} />;
}
