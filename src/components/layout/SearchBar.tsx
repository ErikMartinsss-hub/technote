"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, TrendingUp, X } from "lucide-react";
import { getFromPrice, products } from "@/lib/products";
import { useCustomProducts } from "@/store/custom-products";
import { ProductImage } from "@/components/product/ProductImage";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/format";

const POPULAR = ["iPhone 13", "MacBook Air", "Galaxy S22", "Apple Watch", "iPad"];

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const customProducts = useCustomProducts((state) => state.items);
  const results = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();
    if (term.length < 2) return [];
    return [...products, ...customProducts]
      .filter((product) => {
        const haystack = [
          product.name,
          product.brand,
          product.model,
          product.category,
          product.storage,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      })
      .slice(0, 5);
  }, [deferredQuery, customProducts]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function submitSearch(term: string) {
    const clean = term.trim();
    setOpen(false);
    if (!clean) {
      router.push("/catalogo");
      return;
    }
    router.push(`/catalogo?q=${encodeURIComponent(clean)}`);
  }

  const searching = deferredQuery.trim().length >= 2;

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch(query);
        }}
        className={cn(
          "flex h-11 items-center gap-2.5 rounded-full border bg-ink-50/80 px-4 transition-all duration-200",
          open
            ? "border-brand-300 bg-white shadow-[0_0_0_4px_rgba(151,109,14,0.12)]"
            : "border-ink-200 hover:border-ink-300",
        )}
      >
        <Search className="size-[18px] shrink-0 text-ink-400" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Encontre celulares e tablets seminovos..."
          aria-label="Buscar produtos"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Limpar busca"
            className="grid size-6 shrink-0 place-items-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="size-3.5" />
          </button>
        )}
        <button
          type="submit"
          aria-label="Buscar"
          className="hidden size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 sm:grid"
        >
          <ArrowRight className="size-4" />
        </button>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[60] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[0_28px_60px_-24px_rgba(28,23,12,0.4)]">
          {searching ? (
            results.length > 0 ? (
              <>
                <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
                  Produtos encontrados
                </p>
                <ul className="p-1.5">
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/produto/${product.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-ink-50"
                      >
                        <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-50">
                          <ProductImage
                            src={product.image}
                            alt=""
                            sizes="48px"
                            className={cn(
                              "size-full",
                              product.imageFit === "contain"
                                ? "object-contain p-1"
                                : "object-cover",
                            )}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink-900">
                            {product.name}
                          </span>
                          <span className="block text-xs text-ink-400">
                            {product.category} • {product.conditions[0].label}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-brand-700">
                          {formatBRL(getFromPrice(product))}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => submitSearch(query)}
                  className="flex w-full items-center justify-between border-t border-ink-100 bg-ink-50/60 px-4 py-3 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
                >
                  Ver todos os resultados para “{query.trim()}”
                  <ArrowRight className="size-3.5" />
                </button>
              </>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm font-semibold text-ink-800">
                  Nenhum produto encontrado
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Tente buscar por “iPhone”, “MacBook” ou “Galaxy”.
                </p>
              </div>
            )
          ) : (
            <div className="p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
                <TrendingUp className="size-3.5" />
                Buscas populares
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      submitSearch(term);
                    }}
                    className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <p className="mt-3 border-t border-ink-100 pt-3 text-[11px] text-ink-400">
                Pressione Enter para ver todos os resultados.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
