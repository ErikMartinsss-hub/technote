"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PackageX } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCustomProducts } from "@/store/custom-products";
import { getRatingBreakdown, getReviews } from "@/lib/reviews";
import { products } from "@/lib/products";
import { ProductDetail } from "@/components/product/ProductDetail";

interface CustomProductDetailProps {
  slug: string;
}

/** Resolve produtos cadastrados pelo admin (não existem no bundle estático). */
export function CustomProductDetail({ slug }: CustomProductDetailProps) {
  const customProducts = useCustomProducts((state) => state.items);
  const hasHydrated = useCustomProducts((state) => state.hasHydrated);

  const custom = useMemo(
    () => customProducts.find((product) => product.slug === slug) ?? null,
    [customProducts, slug],
  );

  const related = useMemo<Product[]>(() => {
    if (!custom) return [];
    const pool = [...customProducts.filter((item) => item.id !== custom.id), ...products];
    const sameCategory = pool.filter(
      (item) => item.category === custom.category && item.brand !== custom.brand,
    );
    const sameBrand = pool.filter((item) => item.brand === custom.brand);
    return [...sameCategory, ...sameBrand].sort((a, b) => b.rating - a.rating).slice(0, 4);
  }, [custom, customProducts]);

  if (!hasHydrated) {
    return (
      <div className="border-b border-ink-200/70 bg-white">
        <div className="container-page py-16 text-center text-[12px] font-semibold text-ink-400">
          Carregando produto…
        </div>
      </div>
    );
  }

  if (!custom) {
    return (
      <div className="container-page py-14">
        <div className="mx-auto max-w-md rounded-2xl border border-ink-200/80 bg-white p-8 text-center shadow-soft">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <PackageX className="size-6" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-ink-950">
            Produto não encontrado
          </h1>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">
            Este produto foi cadastrado pelo painel admin e pode ter sido removido deste navegador.
          </p>
          <Link
            href="/catalogo"
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProductDetail
      product={custom}
      related={related}
      reviews={getReviews(custom)}
      ratingBreakdown={getRatingBreakdown(custom)}
    />
  );
}
