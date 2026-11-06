"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Ticket,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useCart, useCartSummary } from "@/store/cart";
import { ProductImage } from "@/components/product/ProductImage";
import { usePreferences } from "@/store/preferences";
import { cn, formatBRL, formatCep, onlyDigits, round2 } from "@/lib/format";
import { pixPrice } from "@/lib/products";
import { installmentLabels } from "@/lib/installments";
import { COUPONS } from "@/lib/coupons";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getBestSellers } from "@/lib/products";
import { toast } from "@/store/toast";

interface ShippingOption {
  id: string;
  label: string;
  description: string;
  price: number;
  days: string;
  badge?: string;
}

const couponSuggestions = [COUPONS.TECH10, COUPONS.BEMVINDO15, COUPONS.FRETEGRATIS];

export function CartView() {
  const items = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const clear = useCart((state) => state.clear);
  const coupon = useCart((state) => state.coupon);
  const applyCoupon = useCart((state) => state.applyCoupon);
  const removeCoupon = useCart((state) => state.removeCoupon);
  const shipping = useCart((state) => state.shipping);
  const setShipping = useCart((state) => state.setShipping);
  const summary = useCartSummary();

  const savedCep = usePreferences((state) => state.cep);
  const preferencesHydrated = usePreferences((state) => state.hasHydrated);
  const setLocation = usePreferences((state) => state.setLocation);
  const [cep, setCep] = useState(savedCep);
  const [preferencesApplied, setPreferencesApplied] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [options, setOptions] = useState<ShippingOption[] | null>(null);
  const [city, setCity] = useState("");
  const suggestions = getBestSellers(4).filter(
    (product) => !items.some((item) => item.productId === product.id),
  );

  useEffect(() => {
    if (!preferencesHydrated || preferencesApplied) return;
    if (savedCep) setCep(savedCep);
    setPreferencesApplied(true);
  }, [preferencesHydrated, preferencesApplied, savedCep]);

  function handleApplyCoupon(code: string) {
    const result = applyCoupon(code);
    setCouponMessage({ ok: result.ok, text: result.message });
    if (result.ok) {
      toast.success("Cupom aplicado!", result.message);
      setCouponInput("");
    } else {
      toast.error("Não foi possível aplicar", result.message);
    }
  }

  function handleRemoveCoupon() {
    removeCoupon();
    setCouponMessage(null);
    toast.info("Cupom removido", "Os valores foram recalculados.");
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
        body: JSON.stringify({ cep: digits, subtotal: summary.subtotal }),
      });
      const data = (await response.json()) as {
        cep?: string;
        city?: string;
        state?: string;
        options?: ShippingOption[];
        error?: string;
      };
      if (!response.ok || !data.options || !data.city || !data.state || !data.cep) {
        throw new Error(data.error ?? "Não foi possível calcular o frete.");
      }
      setOptions(data.options);
      setCity(`${data.city} (${data.state})`);
      setLocation({ cep: data.cep, city: data.city, state: data.state });
      const first = data.options[0];
      if (first) {
        setShipping({
          id: first.id,
          label: first.label,
          description: first.description,
          price: first.price,
          days: first.days,
          cep: data.cep,
          city: data.city,
          state: data.state,
        });
      }
    } catch (caught) {
      setShippingError(
        caught instanceof Error ? caught.message : "Erro ao calcular o frete.",
      );
    } finally {
      setShippingLoading(false);
    }
  }

  function selectOption(option: ShippingOption) {
    const digits = onlyDigits(cep);
    setShipping({
      id: option.id,
      label: option.label,
      description: option.description,
      price: option.price,
      days: option.days,
      cep: digits,
      city: city.replace(/\s*\(.*\)$/, ""),
      state: city.match(/\((.*)\)$/)?.[1] ?? "",
    });
  }

  if (items.length === 0) {
    return (
      <>
        <section className="border-b border-ink-200/70 bg-white">
          <div className="container-page py-4">
            <Breadcrumbs items={[{ label: "Carrinho" }]} />
          </div>
        </section>
        <section className="container-page py-12 sm:py-16">
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-ink-200/80 bg-white px-6 py-12 text-center shadow-soft">
            <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <ShoppingBag className="size-7" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink-950">
              Seu carrinho está vazio
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
              Que tal explorar nossos seminovos com garantia de 12 meses e Pix com
              5% de desconto?
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/catalogo?ofertas=1"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                Ver ofertas
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 px-5 text-sm font-bold text-ink-800 transition hover:border-brand-300 hover:text-brand-700"
              >
                Explorar catálogo
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-ink-950">
                Mais vendidos
              </h2>
              <Link
                href="/catalogo?ordenar=avaliacao"
                className="text-xs font-bold text-brand-700 hover:text-brand-800"
              >
                Ver todos
              </Link>
            </div>
            <ProductGrid products={suggestions} />
          </div>
        </section>
      </>
    );
  }

  const shippingMissing = !shipping;
  const checkoutHref = "/checkout";
  const baseForDiscount = round2(summary.subtotal - summary.discount);
  const pixWithShipping = round2(baseForDiscount * 0.95 + summary.shippingPrice);
  const cardTotal = round2(baseForDiscount + summary.shippingPrice);
  const labels = installmentLabels(cardTotal);

  return (
    <>
      <section className="border-b border-ink-200/70 bg-white">
        <div className="container-page py-4">
          <Breadcrumbs items={[{ label: "Carrinho" }]} />
        </div>
      </section>

      <section className="container-page py-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-extrabold tracking-[-0.035em] text-ink-950 sm:text-[32px]">
              Meu carrinho
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {summary.itemCount} {summary.itemCount === 1 ? "item" : "itens"} •{" "}
              {formatBRL(summary.subtotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              clear();
              toast.info("Carrinho esvaziado", "Você pode adicionar novos produtos quando quiser.");
            }}
            className="text-[11px] font-semibold text-ink-500 underline underline-offset-2 transition hover:text-rose-600"
          >
            Esvaziar carrinho
          </button>
        </div>

        {summary.freeShippingRemaining > 0 ? (
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-800">
              <Truck className="size-4" />
              Faltam {formatBRL(summary.freeShippingRemaining)} para o frete grátis
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${Math.min(100, (summary.subtotal / 499) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11.5px] font-semibold text-emerald-800">
            <Truck className="size-4" />
            Você ganhou frete grátis no PAC!
          </div>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px] xl:gap-7">
          <div className="min-w-0 space-y-3">
            {items.map((item) => (
              <article
                key={item.key}
                className="flex gap-3 rounded-2xl border border-ink-200/80 bg-white p-3 sm:gap-4 sm:p-4"
              >
                <Link
                  href={`/produto/${item.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-ink-50 sm:size-28"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    sizes="112px"
                    className={item.imageFit === "contain" ? "object-contain p-2" : "object-cover"}
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-400">
                        {item.brand}
                      </p>
                      <Link
                        href={`/produto/${item.slug}`}
                        className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-ink-900 transition hover:text-brand-700 sm:text-sm"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-[10.5px] text-ink-400">
                        {[item.storage, item.color].filter(Boolean).join(" • ")}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-700">
                        <Check className="size-3" />
                        Condição {item.conditionLabel}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.key);
                        toast.info("Produto removido", item.name);
                      }}
                      aria-label={`Remover ${item.name} do carrinho`}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(value) => updateQuantity(item.key, value)}
                      size="sm"
                    />
                    <div className="text-right">
                      <p className="text-[10px] text-ink-400 line-through">
                        {formatBRL(item.price * item.quantity)}
                      </p>
                      <p className="text-base font-extrabold leading-tight text-ink-950">
                        {formatBRL(pixPrice(item.price * item.quantity))}
                        <span className="ml-1 text-[10px] font-bold text-emerald-600">
                          no Pix
                        </span>
                      </p>
                      <p className="text-[9.5px] text-ink-400">
                        {item.quantity > 1 ? `${item.quantity} • ${formatBRL(item.price)}` : "1 unidade"}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <div className="rounded-2xl border border-ink-200/80 bg-white p-4">
              <h2 className="flex items-center gap-1.5 text-xs font-bold text-ink-900">
                <MapPin className="size-4 text-brand-600" />
                Calcular frete
              </h2>
              <form onSubmit={handleShipping} className="mt-2.5 flex gap-2">
                <input
                  value={cep}
                  onChange={(event) => {
                    setCep(formatCep(event.target.value));
                    setShippingError("");
                  }}
                  inputMode="numeric"
                  placeholder="Digite seu CEP"
                  aria-label="CEP"
                  className="h-10 min-w-0 flex-1 rounded-xl border border-ink-200 px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
                <button
                  type="submit"
                  disabled={shippingLoading}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-ink-950 px-4 text-xs font-bold text-white transition hover:bg-ink-800 disabled:opacity-60"
                >
                  {shippingLoading && <Loader2 className="size-3.5 animate-spin" />}
                  {shippingLoading ? "Calculando" : "Calcular"}
                </button>
              </form>
              {shippingError && (
                <p role="alert" className="mt-2 text-[11px] font-medium text-rose-600">
                  {shippingError}
                </p>
              )}
              {options && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[10.5px] text-ink-400">Entrega para {city}</p>
                  {options.map((option) => {
                    const active = shipping?.id === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectOption(option)}
                        aria-pressed={active}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition",
                          active
                            ? "border-brand-500 bg-brand-50/50"
                            : "border-ink-200 hover:border-ink-300",
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
                          <span className="flex items-center gap-1.5 text-[12px] font-bold text-ink-900">
                            {option.label}
                            {option.badge && (
                              <span className="rounded bg-emerald-50 px-1 py-0.5 text-[8.5px] font-bold text-emerald-700">
                                {option.badge}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-ink-500">
                            {option.description} • {option.days}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-xs font-bold",
                            option.price === 0 ? "text-emerald-600" : "text-ink-900",
                          )}
                        >
                          {option.price === 0 ? "Grátis" : formatBRL(option.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-[150px] lg:self-start">
            <div className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
              <h2 className="font-display text-lg font-bold text-ink-950">Resumo do pedido</h2>

              <div className="mt-4 space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-500">
                    Subtotal ({summary.itemCount} {summary.itemCount === 1 ? "item" : "itens"})
                  </span>
                  <span className="font-semibold text-ink-900">{formatBRL(summary.subtotal)}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex items-center justify-between gap-2 text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Tag className="size-3.5" />
                      Cupom {coupon}
                    </span>
                    <span className="font-semibold">-{formatBRL(summary.discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-500">Frete</span>
                  <span className={cn("font-semibold", summary.shippingPrice === 0 ? "text-emerald-600" : "text-ink-900")}>
                    {shippingMissing
                      ? "A calcular"
                      : summary.shippingPrice === 0
                        ? "Grátis"
                        : formatBRL(summary.shippingPrice)}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-ink-100 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-semibold text-ink-600">Total no Pix</span>
                  <span className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-ink-950">
                    {formatBRL(pixWithShipping)}
                  </span>
                </div>
                <p className="mt-0.5 text-right text-[10px] font-bold text-emerald-600">
                  5% de desconto aplicado
                </p>
                <div className="mt-2 rounded-lg bg-ink-50 px-3 py-2 text-[10.5px] leading-relaxed text-ink-600">
                  <p className="font-semibold text-ink-800">Ou no cartão</p>
                  <p>
                    {formatBRL(cardTotal)} em até 10x de{" "}
                    {formatBRL(cardTotal / 10)} s/ juros
                  </p>
                  <p className="text-ink-400">{labels.withInterest}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-ink-700">
                  <Ticket className="size-3.5 text-amber-600" />
                  Cupom de desconto
                </p>
                {coupon ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-800">{coupon}</p>
                      <p className="truncate text-[10px] text-emerald-700">
                        {summary.couponDefinition?.label}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      aria-label="Remover cupom"
                      className="grid size-7 shrink-0 place-items-center rounded-full text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (couponInput.trim()) handleApplyCoupon(couponInput);
                      }}
                      className="flex gap-1.5"
                    >
                      <input
                        value={couponInput}
                        onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                        placeholder="Digite o cupom"
                        aria-label="Cupom de desconto"
                        className="h-9 min-w-0 flex-1 rounded-lg border border-ink-200 px-2.5 text-xs uppercase text-ink-900 outline-none placeholder:normal-case placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      />
                      <button
                        type="submit"
                        className="h-9 shrink-0 rounded-lg border border-ink-200 bg-ink-50 px-3 text-[11px] font-bold text-ink-700 transition hover:bg-ink-100"
                      >
                        Aplicar
                      </button>
                    </form>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {couponSuggestions.map((definition) => (
                        <button
                          key={definition.code}
                          type="button"
                          onClick={() => handleApplyCoupon(definition.code)}
                          className="rounded border border-dashed border-ink-300 px-1.5 py-0.5 text-[9px] font-semibold text-ink-500 transition hover:border-amber-400 hover:text-amber-700"
                        >
                          {definition.code}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {couponMessage && !couponMessage.ok && (
                  <p className="mt-1.5 text-[10.5px] font-medium text-rose-600">
                    {couponMessage.text}
                  </p>
                )}
              </div>

              <Link
                href={checkoutHref}
                aria-disabled={shippingMissing}
                onClick={(event) => {
                  if (shippingMissing) {
                    event.preventDefault();
                    toast.info("Calcule o frete", "Informe seu CEP e escolha uma opção de entrega.");
                  }
                }}
                className={cn(
                  "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition",
                  shippingMissing
                    ? "cursor-not-allowed bg-ink-200 text-ink-500"
                    : "bg-brand-600 text-white shadow-[0_14px_28px_-14px_rgba(151,109,14,0.55)] hover:bg-brand-700",
                )}
              >
                Finalizar compra
                <ChevronRight className="size-4" />
              </Link>
              <Link
                href="/catalogo"
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-brand-700 transition hover:bg-brand-50"
              >
                Continuar comprando
              </Link>

              <div className="mt-4 space-y-2 border-t border-ink-100 pt-3 text-[10.5px] text-ink-500">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  Compra 100% segura e garantia de 12 meses
                </p>
                <p className="flex items-center gap-1.5">
                  <Truck className="size-3.5 text-brand-600" />
                  Envio rastreado para todo o Brasil
                </p>
              </div>
            </div>
          </aside>
        </div>

        {suggestions.length > 0 && (
          <section className="mt-12 border-t border-ink-200/70 pt-8">
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-ink-950">
                Quem viu, também comprou
              </h2>
              <Link
                href="/catalogo?ordenar=avaliacao"
                className="text-xs font-bold text-brand-700 hover:text-brand-800"
              >
                Ver mais
              </Link>
            </div>
            <ProductGrid products={suggestions} />
          </section>
        )}
      </section>
    </>
  );
}
