import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_META, CATEGORY_ORDER, products } from "@/lib/products";
import { SectionHeading } from "@/components/ui/SectionHeading";

const images: Record<string, string> = {
  Celulares: "/products/iphone-13.png",
  Notebooks: "/products/macbook-air.jpg",
  Tablets: "/products/ipad.jpg",
  Smartwatches: "/products/watch-series-7.jpg",
  Acessórios: "/products/airpods-pro-2.png",
};

export function CategoryStrip() {
  return (
    <section className="py-10 sm:py-14">
      <div className="container-page">
        <SectionHeading
          eyebrow="Categorias"
          title="Encontre o seu próximo aparelho"
          description="Tudo o que você precisa em tecnologia, revisado e pronto para usar."
          actionLabel="Ver catálogo completo"
          actionHref="/catalogo"
        />

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          {CATEGORY_ORDER.map((category) => {
            const count = products.filter(
              (product) => product.category === category,
            ).length;
            return (
              <Link
                key={category}
                href={`/catalogo?categoria=${encodeURIComponent(category)}`}
                className="group relative overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card sm:p-4"
              >
                <span className="absolute -right-6 -top-6 size-20 rounded-full bg-brand-50 transition group-hover:scale-125" />
                <div className="relative flex items-center gap-3 sm:flex-col sm:items-start">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-ink-50 to-white sm:size-20">
                    <Image
                      src={images[category]}
                      alt=""
                      fill
                      sizes="90px"
                      className="object-contain p-1.5 transition duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-[13px] font-bold text-ink-900">
                      {category}
                      <ArrowUpRight className="size-3.5 text-ink-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-ink-400">
                      {CATEGORY_META[category]?.short}
                    </p>
                    <p className="mt-1.5 text-[9.5px] font-semibold text-ink-400">
                      {count} produtos
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
