"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  CreditCard,
  Heart,
  Loader2,
  MapPin,
  Package,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Truck,
  Zap,
} from "lucide-react";
import type { ConditionId, Product } from "@/lib/types";
import { cn, formatBRL, formatCep, onlyDigits } from "@/lib/format";
import { getCondition, pixPrice } from "@/lib/products";
import { type Review } from "@/lib/reviews";
import { installmentLabels, installmentValue, NO_INTEREST_INSTALLMENTS } from "@/lib/installments";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { StarRating } from "@/components/ui/StarRating";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { toast } from "@/store/toast";
import { ProductImage } from "@/components/product/ProductImage";

interface ProductDetailProps {
  product: Product;
  related: Product[];
  reviews: Review[];
  ratingBreakdown: { stars: number; count: number }[];
}

interface ShippingResult {
  id: string;
  label: string;
  description: string;
  price: number;
  days: string;
  badge?: string;
}

const tabs = ["Descrição", "Especificações", "Avaliações"] as const;
type Tab = (typeof tabs)[number];

export function ProductDetail({
  product,
  related,
  reviews,
  ratingBreakdown,
}: ProductDetailProps) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);
  const isFavorite = useFavorites((state) => state.slugs.includes(product.slug));
  const toggleFavorite = useFavorites((state) => state.toggle);

  const [conditionId, setConditionId] = useState<ConditionId>(
    product.conditions[product.conditions.length - 1].id,
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.images[0] ?? product.image);
  const [tab, setTab] = useState<Tab>("Descrição");
  const [cep, setCep] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingResult[] | null>(null);
  const [shippingCity, setShippingCity] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAllInstallments, setShowAllInstallments] = useState(false);

  const condition = getCondition(product, conditionId);
  const maxQuantity = Math.min(5, Math.max(1, condition.stock));
  const pix = pixPrice(condition.price);
  const labels = installmentLabels(condition.price);
  const tenX = installmentValue(condition.price, NO_INTEREST_INSTALLMENTS);
  const gallery = product.images.length > 0 ? product.images : [product.image];
  const filledBreakdown = useMemo(
    () =>
      ratingBreakdown.map((row) => ({
        ...row,
        percent: product.reviewCount
          ? Math.round((row.count / product.reviewCount) * 100)
          : 0,
      })),
    [ratingBreakdown, product.reviewCount],
  );

  function changeCondition(id: ConditionId) {
    setConditionId(id);
    setQuantity(1);
  }

  function handleAddToCart(redirect = false) {
    for (let index = 0; index < quantity; index += 1) {
      addItem(product, condition.id);
    }
    if (redirect) {
      router.push("/checkout");
      return;
    }
    toast.success(
      "Produto adicionado ao carrinho!",
      `${product.name} • ${condition.label}${quantity > 1 ? ` • ${quantity}` : ""}`,
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

  async function handleShipping(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = onlyDigits(cep);
    if (digits.length !== 8) {
      setShippingError("Digite um CEP válido com 8 dígitos.");
      return;
    }

    setShippingLoading(true);
    setShippingError("");
    try {
      const response = await fetch("/api/cep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: digits, subtotal: condition.price * quantity }),
      });
      const data = (await response.json()) as {
        city?: string;
        state?: string;
        options?: ShippingResult[];
        error?: string;
      };
      if (!response.ok || !data.options) {
        throw new Error(data.error ?? "Não foi possível calcular o frete.");
      }
      setShippingOptions(data.options);
      setShippingCity(`${data.city} (${data.state})`);
    } catch (caught) {
      setShippingError(
        caught instanceof Error ? caught.message : "Erro ao calcular o frete.",
      );
    } finally {
      setShippingLoading(false);
    }
  }

  async function copyCoupon() {
    if (!product.coupon) return;
    try {
      await navigator.clipboard.writeText(product.coupon);
      setCopied(true);
      toast.success("Cupom copiado!", `Use ${product.coupon} no carrinho.`);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info(`Use o cupom ${product.coupon}`, "Copie o código e aplique no carrinho.");
    }
  }

  const stockLabel =
    condition.stock <= 4
      ? `Últimas ${condition.stock} unidades`
      : `${condition.stock} unidades em estoque`;

  return (
    <div className="pb-24 lg:pb-16">
      <section className="border-b border-ink-200/70 bg-white">
        <div className="container-page py-4">
          <Breadcrumbs
            items={[
              { label: "Catálogo", href: "/catalogo" },
              {
                label: product.category,
                href: `/catalogo?categoria=${encodeURIComponent(product.category)}`,
              },
              { label: product.name },
            ]}
          />
        </div>
      </section>

      <div className="container-page pt-6">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_440px] xl:gap-10">
          <div>
            <div className="grid gap-3 sm:grid-cols-[88px_1fr] sm:gap-4">
              <div className="order-2 flex gap-2 sm:order-1 sm:flex-col">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    aria-label={`Ver imagem ${index + 1} de ${product.name}`}
                    aria-pressed={activeImage === image}
                    className={cn(
                      "relative h-16 w-16 overflow-hidden rounded-xl border-2 bg-white transition sm:h-[84px] sm:w-full",
                      activeImage === image
                        ? "border-brand-500 ring-2 ring-brand-100"
                        : "border-ink-200 hover:border-ink-300",
                    )}
                  >
                    <ProductImage
                      src={image}
                      alt=""
                      sizes="90px"
                      className={cn(
                        product.imageFit === "contain" ? "object-contain p-1.5" : "object-cover",
                      )}
                    />
                  </button>
                ))}
              </div>

              <div
                className={cn(
                  "relative order-1 aspect-square overflow-hidden rounded-3xl border border-ink-200/70 sm:order-2",
                  product.imageFit === "cover" ? "product-stage-cover" : "product-stage",
                )}
              >
                <ProductImage
                  src={activeImage}
                  alt={product.name}
                  priority
                  sizes="(max-width: 1024px) 100vw, 620px"
                  className={cn(
                    product.imageFit === "contain" ? "object-contain p-8 sm:p-12" : "object-cover",
                  )}
                />
                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-lg bg-ink-950 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {product.badge}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleFavorite}
                  aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  aria-pressed={isFavorite}
                  className={cn(
                    "absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/95 text-ink-500 shadow-soft backdrop-blur transition hover:scale-105",
                    isFavorite && "text-rose-500",
                  )}
                >
                  <Heart className={cn("size-5", isFavorite && "fill-current")} />
                </button>
                {product.coupon && (
                  <button
                    type="button"
                    onClick={copyCoupon}
                    className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/95 px-2.5 py-1.5 text-[10px] font-bold text-amber-800 backdrop-blur transition hover:bg-amber-100"
                  >
                    {copied ? <Check className="size-3.5" /> : <Ticket className="size-3.5" />}
                    Cupom {product.coupon} — {copied ? "copiado" : "copiar"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 hidden lg:block">
              <ProductDetailsTabs
                product={product}
                reviews={reviews}
                filledBreakdown={filledBreakdown}
                tab={tab}
                setTab={setTab}
              />
            </div>
          </div>

          <aside className="lg:sticky lg:top-[150px] lg:self-start">
            <div className="rounded-3xl border border-ink-200/80 bg-white p-5 shadow-soft sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
                {product.brand} • {product.category}
              </p>
              <h1 className="mt-1.5 font-display text-[23px] font-extrabold leading-tight tracking-[-0.03em] text-ink-950 sm:text-[26px]">
                {product.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <StarRating rating={product.rating} count={product.reviewCount} size="md" />
                <a
                  href="#avaliacoes"
                  onClick={() => setTab("Avaliações")}
                  className="text-[11px] font-semibold text-brand-700 hover:text-brand-800"
                >
                  Ver avaliações
                </a>
                <span className="text-[11px] text-ink-400">
                  {product.sold.toLocaleString("pt-BR")} vendidos
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {[product.storage, product.color, product.screen]
                  .filter((value) => value && value !== "—")
                  .map((value) => (
                    <span
                      key={value}
                      className="rounded-md bg-ink-50 px-2 py-1 text-[10.5px] font-medium text-ink-600"
                    >
                      {value}
                    </span>
                  ))}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-600">
                  Escolha a condição
                </p>
                <div className="space-y-1.5">
                  {product.conditions.map((option) => {
                    const active = option.id === conditionId;
                    const conditionPix = pixPrice(option.price);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => changeCondition(option.id)}
                        aria-pressed={active}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                          active
                            ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-200"
                            : "border-ink-200 hover:border-ink-300 hover:bg-ink-50/50",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-full border-2",
                            active ? "border-brand-600 bg-brand-600" : "border-ink-300",
                          )}
                        >
                          {active && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-[13px] font-bold text-ink-900">
                            {option.label}
                            {option.id === "excelente" && (
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                                Melhor estado
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-[10.5px] leading-snug text-ink-500">
                            {option.description}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[13px] font-extrabold text-ink-950">
                            {formatBRL(conditionPix)}
                          </span>
                          <span className="block text-[9.5px] text-ink-400">no Pix</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-ink-50/70 px-3 py-2">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-600">
                  <Package className="size-3.5 text-brand-600" />
                  {stockLabel}
                </span>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={maxQuantity}
                  size="sm"
                />
              </div>

              <div className="mt-5">
                <PriceBlock total={condition.price} size="lg" />
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-[0_14px_28px_-14px_rgba(151,109,14,0.55)] transition hover:bg-brand-700 active:scale-[0.995]"
                >
                  <Zap className="size-4" />
                  Comprar agora
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-sm font-bold text-ink-800 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
                >
                  <ShoppingBag className="size-4" />
                  Adicionar ao carrinho
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-ink-200 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700">
                  <MapPin className="size-3.5 text-brand-600" />
                  Calcular frete e prazo
                </p>
                <form onSubmit={handleShipping} className="mt-2 flex gap-1.5">
                  <input
                    value={cep}
                    onChange={(event) => {
                      setCep(formatCep(event.target.value));
                      setShippingError("");
                    }}
                    inputMode="numeric"
                    placeholder="00000-000"
                    aria-label="CEP para calcular frete"
                    className="h-9 min-w-0 flex-1 rounded-lg border border-ink-200 px-2.5 text-xs text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="submit"
                    disabled={shippingLoading}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-ink-950 px-3 text-[11px] font-bold text-white transition hover:bg-ink-800 disabled:opacity-60"
                  >
                    {shippingLoading && <Loader2 className="size-3 animate-spin" />}
                    Calcular
                  </button>
                </form>
                {shippingError && (
                  <p role="alert" className="mt-2 text-[10.5px] font-medium text-rose-600">
                    {shippingError}
                  </p>
                )}
                {shippingOptions && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-ink-400">Entrega em {shippingCity}</p>
                    {shippingOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between gap-2 rounded-md bg-ink-50/70 px-2 py-1.5 text-[10.5px]"
                      >
                        <span className="flex items-center gap-1.5 font-medium text-ink-700">
                          <Truck className="size-3 text-ink-400" />
                          {option.label}
                          <span className="text-ink-400">• {option.days}</span>
                        </span>
                        <span
                          className={cn(
                            "font-bold",
                            option.price === 0 ? "text-emerald-600" : "text-ink-900",
                          )}
                        >
                          {option.price === 0 ? "Grátis" : formatBRL(option.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ul className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-[11px] text-ink-600">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                  Garantia Tech Note de 12 meses e nota fiscal.
                </li>
                <li className="flex items-start gap-2">
                  <Truck className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  Frete grátis em compras acima de R$ 499.
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCcw className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  7 dias para desistir ou trocar sem burocracia.
                </li>
                <li className="flex items-start gap-2">
                  <CreditCard className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  Até 10x sem juros ou 21x com juros no cartão.
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-ink-200/80 bg-white p-4">
              <button
                type="button"
                onClick={() => setShowAllInstallments((value) => !value)}
                aria-expanded={showAllInstallments}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="flex items-center gap-2 text-xs font-bold text-ink-900">
                  <CreditCard className="size-4 text-brand-600" />
                  Opções de parcelamento
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-ink-400 transition",
                    showAllInstallments && "rotate-180",
                  )}
                />
              </button>
              <p className="mt-1.5 text-[11px] text-ink-500">
                {labels.noInterest} · {labels.withInterest}
              </p>
              {showAllInstallments && (
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-ink-100 pt-3 text-[11px]">
                  {Array.from({ length: 21 }, (_, index) => index + 1).map((count) => {
                    const value = installmentValue(condition.price, count);
                    const interest = count > NO_INTEREST_INSTALLMENTS;
                    return (
                      <div
                        key={count}
                        className="flex items-center justify-between rounded-md px-1 py-0.5 odd:bg-ink-50/60"
                      >
                        <span className="text-ink-600">{count}x</span>
                        <span className={cn("font-semibold", interest ? "text-ink-500" : "text-ink-900")}>
                          {formatBRL(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-400">
                <QrCode className="size-3" />
                No Pix: {formatBRL(pix)} (5% de desconto)
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 lg:hidden">
          <ProductDetailsTabs
            product={product}
            reviews={reviews}
            filledBreakdown={filledBreakdown}
            tab={tab}
            setTab={setTab}
          />
        </div>

        {related.length > 0 && (
          <section className="mt-12 border-t border-ink-200/70 pt-8">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">
                  Você também pode gostar
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink-950">
                  Produtos relacionados
                </h2>
              </div>
              <Link
                href={`/catalogo?categoria=${encodeURIComponent(product.category)}`}
                className="hidden shrink-0 text-xs font-bold text-brand-700 hover:text-brand-800 sm:block"
              >
                Ver todos
              </Link>
            </div>
            <ProductGrid products={related} />
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-ink-400 line-through">{formatBRL(condition.price)}</p>
            <p className="text-base font-extrabold leading-tight text-ink-950">
              {formatBRL(pix)}
              <span className="ml-1 text-[10px] font-bold text-emerald-600">no Pix</span>
            </p>
            <p className="truncate text-[9.5px] text-ink-400">
              ou 10x de {formatBRL(tenX)} s/ juros
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAddToCart(true)}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white"
          >
            <Zap className="size-4" />
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailsTabs({
  product,
  reviews,
  filledBreakdown,
  tab,
  setTab,
}: {
  product: Product;
  reviews: Review[];
  filledBreakdown: { stars: number; count: number; percent: number }[];
  tab: Tab;
  setTab: (tab: Tab) => void;
}) {
  return (
    <div id="avaliacoes" className="rounded-2xl border border-ink-200/80 bg-white">
      <div className="flex gap-1 overflow-x-auto border-b border-ink-100 px-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            aria-pressed={tab === item}
            className={cn(
              "relative shrink-0 px-3 py-3.5 text-xs font-bold transition",
              tab === item ? "text-brand-700" : "text-ink-500 hover:text-ink-800",
            )}
          >
            {item}
            {item === "Avaliações" && (
              <span className="ml-1 text-[10px] font-medium text-ink-400">
                ({product.reviewCount})
              </span>
            )}
            {tab === item && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-600" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {tab === "Descrição" && (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-sm leading-relaxed text-ink-600">{product.description}</p>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-ink-700">
                Destaques
              </h3>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {product.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2 rounded-lg bg-ink-50/60 p-2.5 text-[11.5px] leading-snug text-ink-600"
                  >
                    <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-ink-50/70 p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-700">
                Revisão Tech Note
              </h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-ink-600">
                Cada aparelho passa por 42 testes de funcionamento, limpeza e
                higienização. A saúde da bateria é medida e informada antes do
                envio, e todos os produtos acompanham garantia de 12 meses.
              </p>
              <ul className="mt-3 space-y-1.5 text-[11px] font-medium text-ink-600">
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" />
                  Bateria acima de 80%
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" />
                  Tela e touch testados
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" />
                  Desbloqueado para todas as operadoras
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" />
                  Nota fiscal e garantia inclusas
                </li>
              </ul>
            </div>
          </div>
        )}

        {tab === "Especificações" && (
          <dl className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
            {Object.entries(product.specs).map(([label, value], index) => (
              <div
                key={label}
                className={cn(
                  "flex items-start justify-between gap-4 border-b border-ink-100 py-2.5 text-[12px]",
                  index % 2 === 0 && "sm:border-b",
                )}
              >
                <dt className="shrink-0 font-semibold text-ink-500">{label}</dt>
                <dd className="text-right font-medium text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "Avaliações" && (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-4xl font-extrabold text-ink-950">
                  {product.rating.toFixed(1)}
                </span>
                <div>
                  <StarRating rating={product.rating} size="md" />
                  <p className="mt-1 text-[10.5px] text-ink-400">
                    {product.reviewCount} avaliações
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {filledBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2 text-[10.5px]">
                    <span className="w-6 shrink-0 text-ink-500">{row.stars}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-star-400"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-ink-400">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {reviews.map((review) => (
                <article
                  key={`${review.name}-${review.date}`}
                  className="rounded-xl border border-ink-100 p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                        {review.initials}
                      </span>
                      <div>
                        <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-ink-900">
                          {review.name}
                          {review.verified && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1 py-0.5 text-[8.5px] font-bold text-emerald-700">
                              <BadgeCheck className="size-2.5" />
                              Compra verificada
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-ink-400">{review.date}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <h4 className="mt-2.5 text-xs font-bold text-ink-800">{review.title}</h4>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-600">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
