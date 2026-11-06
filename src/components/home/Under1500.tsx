import { getFromPrice, products } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BadgePercent } from "lucide-react";

export function Under1500() {
  const picks = products
    .filter((product) => getFromPrice(product) <= 1500)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <section className="border-y border-ink-200/60 bg-white py-10 sm:py-14">
      <div className="container-page">
        <SectionHeading
          eyebrow="Achados do dia"
          title="Tecnologia boa por menos de R$ 1.500"
          description="Para presentear, começar o ano novo ou simplesmente economizar."
          actionLabel="Ver mais achados"
          actionHref="/catalogo?max=1500"
        />
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10.5px] font-bold text-emerald-700">
          <BadgePercent className="size-3.5" />
          Preços no Pix • produtos com garantia
        </div>
        <ProductGrid products={picks} />
      </div>
    </section>
  );
}
