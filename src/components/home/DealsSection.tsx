"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Ticket } from "lucide-react";
import { products } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/format";
import { toast } from "@/store/toast";

const tabs = ["Todos", "Celulares", "Notebooks", "Tablets", "Smartwatches", "Acessórios"];

export function DealsSection() {
  const [active, setActive] = useState("Todos");
  const [copied, setCopied] = useState(false);

  const deals = useMemo(() => products.filter((product) => product.offer), []);
  const filtered = useMemo(
    () =>
      (active === "Todos"
        ? deals
        : deals.filter((product) => product.category === active)
      ).slice(0, 8),
    [active, deals],
  );

  async function copyCoupon() {
    try {
      await navigator.clipboard.writeText("TECH10");
      setCopied(true);
      toast.success("Cupom copiado!", "Use TECH10 no carrinho e ganhe 10% OFF.");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info("Use o cupom TECH10", "Copie o código e aplique no carrinho.");
    }
  }

  return (
    <section className="pb-10 sm:pb-14">
      <div className="container-page">
        <SectionHeading
          eyebrow="Ofertas da semana"
          title="Achados que valem a pena"
          description="Produtos seminovos selecionados, com garantia e preço de verdade."
          actionLabel="Ver todas as ofertas"
          actionHref="/catalogo?ofertas=1"
        />

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const count =
                tab === "Todos"
                  ? deals.length
                  : deals.filter((product) => product.category === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActive(tab)}
                  aria-pressed={active === tab}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition",
                    active === tab
                      ? "border-ink-950 bg-ink-950 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700",
                  )}
                >
                  {tab}
                  <span
                    className={cn(
                      "ml-1.5 text-[9px]",
                      active === tab ? "text-white/55" : "text-ink-400",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/70 px-3.5 py-2.5 lg:w-auto lg:min-w-[310px]">
            <div className="flex items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                <Ticket className="size-4" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                  Cupom exclusivo
                </p>
                <p className="text-xs font-bold text-ink-900">
                  10% OFF com <span className="text-amber-700">TECH10</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={copyCoupon}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-ink-800 shadow-sm transition hover:bg-ink-950 hover:text-white"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        {filtered.length > 0 ? (
          <ProductGrid products={filtered} />
        ) : (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-ink-800">
              Ainda não temos ofertas nesta categoria.
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Veja outras categorias ou explore o catálogo completo.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
