"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  SearchX,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import type { ConditionId } from "@/lib/types";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  CONDITION_LABELS,
  products,
} from "@/lib/products";
import { cn } from "@/lib/format";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Modal } from "@/components/ui/Modal";
import { useCustomProducts } from "@/store/custom-products";

const CONDITION_OPTIONS: { id: ConditionId; label: string; hint: string }[] = [
  { id: "excelente", label: "Excelente", hint: "Sem marcas de uso" },
  { id: "muito-bom", label: "Muito bom", hint: "Leves sinais de uso" },
  { id: "bom", label: "Bom", hint: "Marcas visíveis" },
];

const PRICE_RANGES = [
  { label: "Até R$ 1.000", min: undefined as number | undefined, max: 1000 },
  { label: "R$ 1.000 a R$ 2.000", min: 1000, max: 2000 },
  { label: "R$ 2.000 a R$ 3.000", min: 2000, max: 3000 },
  { label: "Acima de R$ 3.000", min: 3000, max: undefined as number | undefined },
];

const SORT_OPTIONS = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "desconto", label: "Melhores ofertas" },
  { value: "avaliacao", label: "Melhor avaliação" },
];

function parseList(value: string | null) {
  return (value ?? "").split(",").filter(Boolean);
}

function FilterSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-t border-ink-100 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-700">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md py-1 text-xs text-ink-600 transition hover:text-ink-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-3.5 shrink-0 cursor-pointer rounded border-ink-300 accent-brand-600"
      />
      <span className="flex-1 leading-tight">{label}</span>
      {typeof count === "number" && (
        <span className="text-[10px] text-ink-400">{count}</span>
      )}
    </label>
  );
}

export function CatalogView({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [queryString, setQueryString] = useState(initialQuery);
  const searchParams = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [customMin, setCustomMin] = useState(searchParams.get("min") ?? "");
  const [customMax, setCustomMax] = useState(searchParams.get("max") ?? "");

  const q = searchParams.get("q") ?? "";
  const selectedCategories = parseList(searchParams.get("categoria"));
  const selectedBrands = parseList(searchParams.get("marca"));
  const selectedStorages = parseList(searchParams.get("armazenamento"));
  const selectedConditions = parseList(searchParams.get("condicao"));
  const selectedRating = Number(searchParams.get("avaliacao") ?? 0);
  const offersOnly = searchParams.get("ofertas") === "1";
  const sort = searchParams.get("ordenar") ?? "relevancia";
  const minParam = searchParams.get("min");
  const maxParam = searchParams.get("max");
  const minPrice = minParam ? Number(minParam) : undefined;
  const maxPrice = maxParam ? Number(maxParam) : undefined;

  useEffect(() => {
    setQueryString(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCustomMin(searchParams.get("min") ?? "");
    setCustomMax(searchParams.get("max") ?? "");
  }, [searchParams]);

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(queryString);
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    setQueryString(query);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function toggleList(key: string, selected: string[], value: string) {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    updateParams({ [key]: next.length ? next.join(",") : null });
  }

  function clearAll() {
    setQueryString("");
    router.replace(pathname, { scroll: false });
  }

  function setPriceRange(min?: number, max?: number) {
    updateParams({
      min: min ? String(min) : null,
      max: max ? String(max) : null,
    });
  }

  const customProducts = useCustomProducts((state) => state.items);
  const allProducts = useMemo(
    () => [...customProducts, ...products],
    [customProducts],
  );

  const brands = useMemo(
    () => [...new Set(allProducts.map((product) => product.brand))].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    ),
    [allProducts],
  );
  const storages = useMemo(
    () => [
      ...new Set(allProducts.map((product) => product.storage).filter(Boolean)),
    ],
    [allProducts],
  );
  const dealCount = useMemo(() => allProducts.filter((p) => p.offer).length, [allProducts]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const result = allProducts.filter((product) => {
      if (term) {
        const haystack = [
          product.name,
          product.brand,
          product.model,
          product.category,
          product.storage,
          product.color,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category)
      ) {
        return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }
      if (
        selectedStorages.length > 0 &&
        !selectedStorages.includes(product.storage)
      ) {
        return false;
      }

      const availableConditions =
        selectedConditions.length > 0
          ? product.conditions.filter((condition) =>
              selectedConditions.includes(condition.id),
            )
          : product.conditions;
      if (availableConditions.length === 0) return false;

      const price = Math.min(...availableConditions.map((condition) => condition.price));
      if (typeof minPrice === "number" && price < minPrice) return false;
      if (typeof maxPrice === "number" && price > maxPrice) return false;
      if (selectedRating > 0 && product.rating < selectedRating) return false;
      if (offersOnly && !product.offer) return false;
      return true;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "menor-preco":
          return (
            Math.min(...a.conditions.map((c) => c.price)) -
            Math.min(...b.conditions.map((c) => c.price))
          );
        case "maior-preco":
          return (
            Math.min(...b.conditions.map((c) => c.price)) -
            Math.min(...a.conditions.map((c) => c.price))
          );
        case "desconto":
          return Number(b.offer) - Number(a.offer) || b.rating - a.rating;
        case "avaliacao":
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        default:
          return (
            Number(b.bestSeller) - Number(a.bestSeller) ||
            b.rating * b.reviewCount - a.rating * a.reviewCount
          );
      }
    });
  }, [
    q,
    selectedCategories,
    selectedBrands,
    selectedStorages,
    selectedConditions,
    selectedRating,
    offersOnly,
    minPrice,
    maxPrice,
    sort,
  ]);

  const heading = q
    ? `Resultados para “${q}”`
    : selectedCategories.length === 1
      ? `${selectedCategories[0]} seminovos`
      : offersOnly
        ? "Ofertas selecionadas"
        : "Todos os seminovos";

  const description = q
    ? "Encontre o aparelho ideal entre os nossos produtos revisados."
    : selectedCategories.length === 1
      ? CATEGORY_META[selectedCategories[0]]?.short ??
        "Produtos revisados com garantia de 12 meses."
      : offersOnly
        ? "Descontos reais em tecnologia revisada e com garantia."
        : "Celulares, notebooks, tablets, smartwatches e acessórios com garantia de 12 meses.";

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (q) {
    activeChips.push({
      label: `Busca: ${q}`,
      onRemove: () => updateParams({ q: null }),
    });
  }
  selectedCategories.forEach((value) =>
    activeChips.push({
      label: value,
      onRemove: () => toggleList("categoria", selectedCategories, value),
    }),
  );
  selectedBrands.forEach((value) =>
    activeChips.push({
      label: value,
      onRemove: () => toggleList("marca", selectedBrands, value),
    }),
  );
  selectedStorages.forEach((value) =>
    activeChips.push({
      label: value,
      onRemove: () => toggleList("armazenamento", selectedStorages, value),
    }),
  );
  selectedConditions.forEach((value) =>
    activeChips.push({
      label: CONDITION_LABELS[value as ConditionId] ?? value,
      onRemove: () => toggleList("condicao", selectedConditions, value),
    }),
  );
  if (minParam || maxParam) {
    activeChips.push({
      label: `Preço: ${minParam ? `R$ ${minParam}` : "R$ 0"} a ${
        maxParam ? `R$ ${maxParam}` : "sem limite"
      }`,
      onRemove: () => updateParams({ min: null, max: null }),
    });
  }
  if (selectedRating > 0) {
    activeChips.push({
      label: `${selectedRating}★ ou mais`,
      onRemove: () => updateParams({ avaliacao: null }),
    });
  }
  if (offersOnly) {
    activeChips.push({
      label: "Somente ofertas",
      onRemove: () => updateParams({ ofertas: null }),
    });
  }

  const filterCount = activeChips.length;

  const filtersContent = (
    <div>
      <FilterSection title="Categoria">
        <div className="space-y-0.5">
          {CATEGORY_ORDER.map((category) => (
            <CheckRow
              key={category}
              label={category}
              count={allProducts.filter((p) => p.category === category).length}
              checked={selectedCategories.includes(category)}
              onChange={() => toggleList("categoria", selectedCategories, category)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Marca">
        <div className="space-y-0.5">
          {brands.map((brand) => (
            <CheckRow
              key={brand}
              label={brand}
              count={allProducts.filter((p) => p.brand === brand).length}
              checked={selectedBrands.includes(brand)}
              onChange={() => toggleList("marca", selectedBrands, brand)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Armazenamento">
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {storages.map((storage) => (
            <CheckRow
              key={storage}
              label={storage}
              checked={selectedStorages.includes(storage)}
              onChange={() => toggleList("armazenamento", selectedStorages, storage)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Condição">
        <div className="space-y-1">
          {CONDITION_OPTIONS.map((condition) => (
            <label
              key={condition.id}
              className="flex cursor-pointer items-start gap-2.5 rounded-md py-1"
            >
              <input
                type="checkbox"
                checked={selectedConditions.includes(condition.id)}
                onChange={() => toggleList("condicao", selectedConditions, condition.id)}
                className="mt-0.5 size-3.5 shrink-0 cursor-pointer accent-brand-600"
              />
              <span>
                <span className="block text-xs font-medium text-ink-700">
                  {condition.label}
                </span>
                <span className="block text-[10px] text-ink-400">{condition.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Faixa de preço"
        action={
          (minParam || maxParam) && (
            <button
              type="button"
              onClick={() => updateParams({ min: null, max: null })}
              className="text-[10px] font-semibold text-brand-600 hover:text-brand-800"
            >
              Limpar
            </button>
          )
        }
      >
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const active =
              (range.min ? String(range.min) : "") === (minParam ?? "") &&
              (range.max ? String(range.max) : "") === (maxParam ?? "");
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => setPriceRange(range.min, range.max)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition",
                  active
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-ink-600 hover:bg-ink-50",
                )}
              >
                {range.label}
                {active && <span className="size-1.5 rounded-full bg-brand-600" />}
              </button>
            );
          })}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const min = Number(customMin.replace(/\D/g, ""));
            const max = Number(customMax.replace(/\D/g, ""));
            if (min && max && min > max) {
              updateParams({ min: String(max), max: String(min) });
              return;
            }
            updateParams({
              min: min ? String(min) : null,
              max: max ? String(max) : null,
            });
          }}
          className="mt-2 flex items-center gap-1.5"
        >
          <input
            inputMode="numeric"
            value={customMin}
            onChange={(event) => setCustomMin(event.target.value)}
            placeholder="Mín."
            aria-label="Preço mínimo"
            className="h-8 min-w-0 flex-1 rounded-lg border border-ink-200 px-2 text-[11px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <span className="text-ink-300">—</span>
          <input
            inputMode="numeric"
            value={customMax}
            onChange={(event) => setCustomMax(event.target.value)}
            placeholder="Máx."
            aria-label="Preço máximo"
            className="h-8 min-w-0 flex-1 rounded-lg border border-ink-200 px-2 text-[11px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            className="h-8 shrink-0 rounded-lg bg-ink-950 px-2.5 text-[10px] font-bold text-white transition hover:bg-ink-800"
          >
            OK
          </button>
        </form>
      </FilterSection>

      <FilterSection title="Avaliação">
        <div className="space-y-0.5">
          {[4.5, 4.0].map((rating) => (
            <CheckRow
              key={rating}
              label={`${rating}★ ou mais`}
              checked={selectedRating === rating}
              onChange={() =>
                updateParams({
                  avaliacao: selectedRating === rating ? null : String(rating),
                })
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Promoções">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-md py-1 text-xs text-ink-600">
          <input
            type="checkbox"
            checked={offersOnly}
            onChange={() => updateParams({ ofertas: offersOnly ? null : "1" })}
            className="size-3.5 cursor-pointer accent-brand-600"
          />
          <Ticket className="size-3.5 text-amber-600" />
          Somente produtos em oferta
          <span className="ml-auto text-[10px] text-ink-400">{dealCount}</span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <>
      <section className="border-b border-ink-200/70 bg-white">
        <div className="container-page py-5 sm:py-7">
          <Breadcrumbs
            items={[
              { label: "Catálogo", href: "/catalogo" },
              ...(selectedCategories.length === 1
                ? [{ label: selectedCategories[0] }]
                : []),
            ]}
          />
          <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-ink-950 sm:text-[34px]">
                {heading}
              </h1>
              <p className="mt-1 text-sm text-ink-500">{description}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-500">
              <Sparkles className="size-3.5 text-brand-500" />
              {filtered.length} produto{filtered.length === 1 ? "" : "s"} encontrado
              {filtered.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[248px_1fr] xl:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-[160px] max-h-[calc(100vh-180px)] overflow-y-auto rounded-2xl border border-ink-200/80 bg-white p-4 pb-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-bold text-ink-900">
                  <SlidersHorizontal className="size-3.5 text-brand-600" />
                  Filtros
                </p>
                {filterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[10px] font-semibold text-brand-600 hover:text-brand-800"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>
              {filtersContent}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 lg:hidden"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Filtros
                  {filterCount > 0 && (
                    <span className="grid size-4 place-items-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                      {filterCount}
                    </span>
                  )}
                </button>
                <p className="hidden text-[11px] text-ink-500 sm:block">
                  {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => updateParams({ ordenar: event.target.value })}
                  aria-label="Ordenar produtos"
                  className="h-9 appearance-none rounded-lg border border-ink-200 bg-white pl-3 pr-8 text-xs font-medium text-ink-700 outline-none transition hover:border-ink-300 focus:border-brand-400"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" />
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                {activeChips.map((chip, index) => (
                  <button
                    key={`${chip.label}-${index}`}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700 transition hover:bg-brand-100"
                  >
                    {chip.label}
                    <X className="size-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="ml-1 text-[10px] font-semibold text-ink-500 underline underline-offset-2 hover:text-ink-900"
                >
                  Limpar tudo
                </button>
              </div>
            )}

            {filtered.length > 0 ? (
              <ProductGrid
                products={filtered}
                priorityCount={4}
                conditionId={
                  selectedConditions.length === 1
                    ? (selectedConditions[0] as ConditionId)
                    : undefined
                }
                className="md:grid-cols-2 xl:grid-cols-3"
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-ink-50 text-ink-400">
                  <SearchX className="size-6" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-ink-900">
                  Nenhum produto encontrado
                </h2>
                <p className="mt-1 max-w-sm text-sm text-ink-500">
                  Tente remover alguns filtros ou buscar por outro termo.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-4 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filtros"
        description={`${filtered.length} produtos encontrados`}
        className="max-w-md"
      >
        {filtersContent}
        <div className="sticky bottom-0 -mx-6 mt-4 flex gap-2 border-t border-ink-100 bg-white/95 px-6 py-3 backdrop-blur">
          <button
            type="button"
            onClick={clearAll}
            className="h-11 flex-1 rounded-xl border border-ink-200 text-xs font-bold text-ink-600 transition hover:bg-ink-50"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="h-11 flex-[1.6] rounded-xl bg-brand-600 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            Ver {filtered.length} produto{filtered.length === 1 ? "" : "s"}
          </button>
        </div>
      </Modal>
    </>
  );
}
