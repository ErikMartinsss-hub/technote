import type { ConditionId, Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/format";

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
  conditionId,
}: {
  products: Product[];
  className?: string;
  priorityCount?: number;
  conditionId?: ConditionId;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
          conditionId={conditionId}
        />
      ))}
    </div>
  );
}
