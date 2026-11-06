"use client";


import { ProductImage } from "@/components/product/ProductImage";
import Link from "next/link";
import { Heart, ShoppingBag, Ticket } from "lucide-react";
import type { ConditionId, Product } from "@/lib/types";
import { getCondition, getLowestCondition } from "@/lib/products";
import { cn } from "@/lib/format";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { StarRating } from "@/components/ui/StarRating";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { toast } from "@/store/toast";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
  conditionId?: ConditionId;
}

export function ProductCard({
  product,
  priority = false,
  className,
  conditionId,
}: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const isFavorite = useFavorites((state) => state.slugs.includes(product.slug));
  const toggleFavorite = useFavorites((state) => state.toggle);
  const lowest = conditionId
    ? getCondition(product, conditionId)
    : getLowestCondition(product);

  function handleAdd() {
    addItem(product, lowest.id);
    toast.success(
      "Produto adicionado!",
      `${product.name} • condição ${lowest.label}`,
      { label: "Ver carrinho", href: "/carrinho" },
    );
  }

  function handleFavorite() {
    toggleFavorite(product.slug);
    toast.info(
      isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      product.name,
    );
  }

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/80 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/produto/${product.slug}`}
          aria-label={`Ver ${product.name}`}
          className={cn(
            "relative block aspect-square overflow-hidden",
            product.imageFit === "cover" ? "product-stage-cover" : "product-stage",
          )}
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={cn(
              "transition-transform duration-500 group-hover:scale-[1.045]",
              product.imageFit === "contain"
                ? "object-contain p-5 sm:p-7"
                : "object-cover",
            )}
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-950/10 to-transparent opacity-0 transition group-hover:opacity-100" />
        </Link>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {product.badge && (
            <span className="rounded-md bg-ink-950 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-white shadow-sm">
              {product.badge}
            </span>
          )}
          <span className="rounded-md bg-white/95 px-2 py-1 text-[9.5px] font-bold text-ink-700 shadow-sm backdrop-blur">
            {lowest.label}
          </span>
        </div>

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={
            isFavorite
              ? `Remover ${product.name} dos favoritos`
              : `Adicionar ${product.name} aos favoritos`
          }
          aria-pressed={isFavorite}
          className={cn(
            "absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/95 shadow-sm backdrop-blur transition hover:scale-105",
            isFavorite ? "text-rose-500" : "text-ink-400 hover:text-rose-500",
          )}
        >
          <Heart className={cn("size-4", isFavorite && "fill-current")} />
        </button>

        {product.coupon && (
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md border border-dashed border-amber-300 bg-amber-50/95 px-2 py-1 text-[9.5px] font-bold text-amber-800 backdrop-blur">
            <Ticket className="size-3" />
            Cupom: {product.coupon}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
          {product.brand}
        </p>
        <Link
          href={`/produto/${product.slug}`}
          className="mt-1 line-clamp-2 min-h-[38px] text-[13px] font-semibold leading-snug text-ink-900 transition hover:text-brand-700 sm:min-h-[40px] sm:text-sm"
        >
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-1 text-[10.5px] text-ink-400">
          {[product.storage, product.color, product.screen]
            .filter((value) => value && value !== "—")
            .join(" • ")}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <StarRating rating={product.rating} count={product.reviewCount} />
          <span className="hidden text-[10px] font-medium text-emerald-600 sm:inline">
            Frete grátis
          </span>
        </div>

        <div className="mt-2.5 flex-1">
          <PriceBlock total={lowest.price} from size="md" />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[13px] font-bold text-white transition hover:bg-brand-700 active:scale-[0.99]"
        >
          <ShoppingBag className="size-4" />
          Comprar
        </button>
      </div>
    </article>
  );
}
