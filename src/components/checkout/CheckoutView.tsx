"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductImage } from "@/components/product/ProductImage";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { useCart, useCartSummary } from "@/store/cart";
import { usePreferences } from "@/store/preferences";
import type { Order } from "@/lib/types";
import {
  cn,
  formatBRL,
  formatCardNumber,
  formatCep,
  formatCpf,
  formatExpiry,
  formatPhone,
  onlyDigits,
  round2,
} from "@/lib/format";
import {
  installmentValue,
  NO_INTEREST_INSTALLMENTS,
} from "@/lib/installments";
import { getShippingOptions } from "@/lib/shipping";
import { saveOrder } from "@/lib/orders";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { toast } from "@/store/toast";

type PaymentMethod = "pix" | "cartao";

interface CheckoutResult {
  order: Order;
  shippingLabel: string;
  pixPayload: string | null;
}

const stepLabels = ["Seus dados", "Entrega", "Pagamento"];

export function CheckoutView() {
  const items = useCart((state) => state.items);
  const coupon = useCart((state) => state.coupon);
  const shipping = useCart((state) => state.shipping);
  const setShipping = useCart((state) => state.setShipping);
  const clear = useCart((state) => state.clear);
  const summary = useCartSummary();
  const savedCep = usePreferences((state) => state.cep);
  const savedCity = usePreferences((state) => state.city);
  const savedState = usePreferences((state) => state.state);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
  const [address, setAddress] = useState({
    cep: savedCep,
    street: "",
    number: "",
    complement: "",
    district: "",
    city: savedCity,
    state: savedState,
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [installments, setInstallments] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [copied, setCopied] = useState(false);

  const shippingOptions = useMemo(
    () => getShippingOptions(summary.subtotal),
    [summary.subtotal],
  );

  useEffect(() => {
    if (shipping) {
      const exists = shippingOptions.some((option) => option.id === shipping.id);
      if (!exists) setShipping(null);
    }
  }, [shipping, shippingOptions, setShipping]);

  useEffect(() => {
    setAddress((state) => {
      const cep = state.cep || shipping?.cep || savedCep;
      const city = state.city || shipping?.city || savedCity;
      const uf = state.state || shipping?.state || savedState;
      if (cep === state.cep && city === state.city && uf === state.state) {
        return state;
      }
      return { ...state, cep, city, state: uf };
    });
  }, [savedCep, savedCity, savedState, shipping]);

  const baseTotal = round2(summary.subtotal - summary.discount);
  const pixTotal = round2(baseTotal * 0.95 + summary.shippingPrice);
  const cardTotal = round2(baseTotal + summary.shippingPrice);
  const chosenInstallmentValue = installmentValue(cardTotal, installments);
  const chosenInstallmentTotal = round2(chosenInstallmentValue * installments);

  function setField(key: keyof typeof customer, value: string) {
    setCustomer((state) => ({ ...state, [key]: value }));
    setErrors((state) => ({ ...state, [key]: "" }));
  }

  function setAddressField(key: keyof typeof address, value: string) {
    setAddress((state) => ({ ...state, [key]: value }));
    setErrors((state) => ({ ...state, [`address.${key}`]: "" }));
  }

  function validateStepOne() {
    const next: Record<string, string> = {};
    if (customer.name.trim().length < 3) next.name = "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
      next.email = "Informe um e-mail válido.";
    if (onlyDigits(customer.cpf).length !== 11) next.cpf = "CPF deve ter 11 dígitos.";
    if (onlyDigits(customer.phone).length < 10)
      next.phone = "Informe um telefone com DDD.";
    if (onlyDigits(address.cep).length !== 8) next["address.cep"] = "CEP inválido.";
    if (!address.street.trim()) next["address.street"] = "Informe a rua.";
    if (!address.number.trim()) next["address.number"] = "Informe o número.";
    if (!address.district.trim()) next["address.district"] = "Informe o bairro.";
    if (!address.city.trim()) next["address.city"] = "Informe a cidade.";
    if (address.state.trim().length !== 2) next["address.state"] = "Informe a UF.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function lookupCep() {
    const digits = onlyDigits(address.cep);
    if (digits.length !== 8) {
      setCepError("Digite um CEP válido com 8 dígitos.");
      return;
    }
    setCepLoading(true);
    setCepError("");
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
        error?: string;
      };
      if (!response.ok || !data.city || !data.state || !data.cep) {
        throw new Error(data.error ?? "Não foi possível consultar o CEP.");
      }
      setAddress((state) => ({
        ...state,
        cep: data.cep!,
        city: data.city!,
        state: data.state!,
      }));
      setErrors((state) => ({
        ...state,
        "address.cep": "",
        "address.city": "",
        "address.state": "",
      }));
    } catch (caught) {
      setCepError(caught instanceof Error ? caught.message : "Erro ao consultar o CEP.");
    } finally {
      setCepLoading(false);
    }
  }

  function goToStepTwo() {
    if (!validateStepOne()) {
      toast.error("Revise seus dados", "Alguns campos precisam de atenção.");
      return;
    }
    if (!shipping) {
      const first = shippingOptions[0];
      if (first) {
        setShipping({
          id: first.id,
          label: first.label,
          description: first.description,
          price: first.price,
          days: first.days,
          cep: address.cep,
          city: address.city,
          state: address.state,
        });
      }
    }
    setStep(2);
  }

  function goToStepThree() {
    if (!shipping) {
      toast.error("Escolha uma entrega", "Selecione uma opção de frete para continuar.");
      return;
    }
    setStep(3);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (payment === "cartao") {
      const next: Record<string, string> = {};
      if (onlyDigits(card.number).length !== 16)
        next.cardNumber = "Número do cartão inválido.";
      if (card.name.trim().length < 3) next.cardName = "Informe o nome impresso.";
      if (onlyDigits(card.expiry).length !== 4) next.cardExpiry = "Validade inválida.";
      if (onlyDigits(card.cvv).length < 3) next.cardCvv = "CVV inválido.";
      if (Object.keys(next).length > 0) {
        setErrors(next);
        return;
      }
    }

    if (!shipping) {
      setStep(2);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            conditionId: item.conditionId,
            quantity: item.quantity,
          })),
          coupon,
          shippingId: shipping.id,
          customer: {
            name: customer.name.trim(),
            email: customer.email.trim(),
            cpf: onlyDigits(customer.cpf),
            phone: onlyDigits(customer.phone),
          },
          address: {
            cep: address.cep,
            street: address.street.trim(),
            number: address.number.trim(),
            complement: address.complement.trim(),
            district: address.district.trim(),
            city: address.city.trim(),
            state: address.state.trim().toUpperCase(),
          },
          payment: {
            method: payment,
            installments: payment === "cartao" ? installments : 1,
            cardLast4:
              payment === "cartao" ? onlyDigits(card.number).slice(-4) : undefined,
          },
        }),
      });

      const data = (await response.json()) as CheckoutResult & { error?: string };
      if (!response.ok || !data.order) {
        throw new Error(data.error ?? "Não foi possível concluir o pedido.");
      }

      saveOrder(data.order);
      setResult({ order: data.order, shippingLabel: data.shippingLabel, pixPayload: data.pixPayload });
      clear();
      toast.success("Pedido confirmado!", `Seu pedido ${data.order.id} foi criado.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setSubmitError(
        caught instanceof Error ? caught.message : "Erro ao finalizar o pedido.",
      );
      toast.error("Não foi possível finalizar", "Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyPix() {
    if (!result?.pixPayload) return;
    try {
      await navigator.clipboard.writeText(result.pixPayload);
      setCopied(true);
      toast.success("Código Pix copiado!", "Cole no app do seu banco para pagar.");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info("Copie o código manualmente", "Selecione o código Pix exibido.");
    }
  }

  if (result) {
    return <OrderSuccess result={result} onCopy={() => void copyPix()} copied={copied} />;
  }

  if (items.length === 0) {
    return (
      <section className="container-page py-12 sm:py-16">
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-ink-200/80 bg-white px-6 py-12 text-center shadow-soft">
          <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <CreditCard className="size-7" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink-950">
            Nada para finalizar ainda
          </h1>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            Adicione produtos ao carrinho para concluir sua compra com Pix ou cartão.
          </p>
          <Link
            href="/catalogo"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Explorar catálogo
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-ink-200/70 bg-white">
        <div className="container-page py-4">
          <Breadcrumbs
            items={[
              { label: "Carrinho", href: "/carrinho" },
              { label: "Checkout" },
            ]}
          />
        </div>
      </section>

      <section className="container-page py-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-extrabold tracking-[-0.035em] text-ink-950 sm:text-[32px]">
              Finalizar compra
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
              <Lock className="size-3.5 text-emerald-600" />
              Ambiente seguro — seus dados são protegidos
            </p>
          </div>
          <Link
            href="/carrinho"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao carrinho
          </Link>
        </div>

        <ol className="mt-5 flex items-center gap-2 text-[11px] font-semibold sm:gap-3">
          {stepLabels.map((label, index) => {
            const number = index + 1;
            const current = step === number;
            const done = step > number;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                    current
                      ? "bg-brand-600 text-white"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-ink-100 text-ink-500",
                  )}
                >
                  {done ? <Check className="size-3" /> : number}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap",
                    current ? "text-ink-900" : done ? "text-emerald-700" : "text-ink-400",
                  )}
                >
                  {label}
                </span>
                {index < stepLabels.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1",
                      step > number ? "bg-emerald-300" : "bg-ink-200",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px] xl:gap-7">
          <div className="min-w-0 space-y-3">
            {step === 1 && (
              <>
                <section className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-950">
                    <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <Check className="size-4" />
                    </span>
                    Seus dados
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Nome completo"
                      value={customer.name}
                      onChange={(value) => setField("name", value)}
                      error={errors.name}
                      placeholder="Como no documento"
                      autoComplete="name"
                      className="sm:col-span-2"
                    />
                    <Field
                      label="E-mail"
                      type="email"
                      value={customer.email}
                      onChange={(value) => setField("email", value)}
                      error={errors.email}
                      placeholder="voce@email.com"
                      autoComplete="email"
                    />
                    <Field
                      label="CPF"
                      value={customer.cpf}
                      onChange={(value) => setField("cpf", formatCpf(value))}
                      error={errors.cpf}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                    />
                    <Field
                      label="Telefone / WhatsApp"
                      value={customer.phone}
                      onChange={(value) => setField("phone", formatPhone(value))}
                      error={errors.phone}
                      placeholder="(11) 90000-0000"
                      inputMode="tel"
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-950">
                    <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <MapPin className="size-4" />
                    </span>
                    Endereço de entrega
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-ink-700" htmlFor="checkout-cep">
                        CEP
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          id="checkout-cep"
                          value={address.cep}
                          onChange={(event) => {
                            setAddressField("cep", formatCep(event.target.value));
                            setCepError("");
                          }}
                          inputMode="numeric"
                          placeholder="00000-000"
                          autoComplete="postal-code"
                          className={cn(
                            "h-10 min-w-0 flex-1 rounded-xl border bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:ring-4 focus:ring-brand-100",
                            errors["address.cep"]
                              ? "border-rose-400 focus:border-rose-400"
                              : "border-ink-200 focus:border-brand-400",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => void lookupCep()}
                          disabled={cepLoading}
                          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-[11px] font-bold text-ink-700 transition hover:bg-ink-50 disabled:opacity-60"
                        >
                          {cepLoading ? <Loader2 className="size-3.5 animate-spin" /> : null}
                          {cepLoading ? "Buscando" : "Buscar"}
                        </button>
                      </div>
                      {errors["address.cep"] && (
                        <p className="mt-1 text-[10.5px] font-medium text-rose-600">
                          {errors["address.cep"]}
                        </p>
                      )}
                      {cepError && (
                        <p className="mt-1 text-[10.5px] font-medium text-rose-600">{cepError}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-ink-700" htmlFor="checkout-street">
                        Rua / Avenida
                      </label>
                      <input
                        id="checkout-street"
                        value={address.street}
                        onChange={(event) => setAddressField("street", event.target.value)}
                        placeholder="Av. Paulista"
                        autoComplete="address-line1"
                        className={cn(
                          "h-10 w-full rounded-xl border bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:ring-4 focus:ring-brand-100",
                          errors["address.street"]
                            ? "border-rose-400 focus:border-rose-400"
                            : "border-ink-200 focus:border-brand-400",
                        )}
                      />
                      {errors["address.street"] && (
                        <p className="mt-1 text-[10.5px] font-medium text-rose-600">
                          {errors["address.street"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-ink-700" htmlFor="checkout-number">
                        Número
                      </label>
                      <input
                        id="checkout-number"
                        value={address.number}
                        onChange={(event) => setAddressField("number", event.target.value)}
                        placeholder="123"
                        className={cn(
                          "h-10 w-full rounded-xl border bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:ring-4 focus:ring-brand-100",
                          errors["address.number"]
                            ? "border-rose-400 focus:border-rose-400"
                            : "border-ink-200 focus:border-brand-400",
                        )}
                      />
                      {errors["address.number"] && (
                        <p className="mt-1 text-[10.5px] font-medium text-rose-600">
                          {errors["address.number"]}
                        </p>
                      )}
                    </div>
                    <Field
                      label="Bairro"
                      value={address.district}
                      onChange={(value) => setAddressField("district", value)}
                      error={errors["address.district"]}
                      placeholder="Centro"
                    />
                    <Field
                      label="Complemento"
                      value={address.complement}
                      onChange={(value) => setAddressField("complement", value)}
                      placeholder="Apto, bloco (opcional)"
                    />
                    <div className="grid grid-cols-[1fr_74px] gap-2">
                      <Field
                        label="Cidade"
                        value={address.city}
                        onChange={(value) => setAddressField("city", value)}
                        error={errors["address.city"]}
                        placeholder="São Paulo"
                      />
                      <Field
                        label="UF"
                        value={address.state}
                        onChange={(value) =>
                          setAddressField("state", value.toUpperCase().slice(0, 2))
                        }
                        error={errors["address.state"]}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </section>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/carrinho"
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-4 text-xs font-bold text-ink-600 transition hover:bg-ink-50"
                  >
                    <ArrowLeft className="size-3.5" />
                    Voltar ao carrinho
                  </Link>
                  <button
                    type="button"
                    onClick={goToStepTwo}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    Escolher entrega
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <section className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-950">
                      <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700">
                        <Truck className="size-4" />
                      </span>
                      Como você quer receber?
                    </h2>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] font-bold text-brand-700 hover:text-brand-800"
                    >
                      Alterar endereço
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-500">
                    Entrega para {address.city} ({address.state}) — CEP {address.cep}
                  </p>

                  <div className="mt-4 space-y-2">
                    {shippingOptions.map((option) => {
                      const active = shipping?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setShipping({
                              id: option.id,
                              label: option.label,
                              description: option.description,
                              price: option.price,
                              days: option.days,
                              cep: address.cep,
                              city: address.city,
                              state: address.state,
                            })
                          }
                          aria-pressed={active}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                            active
                              ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-200"
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
                              {option.badge && (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                                  {option.badge}
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-[10.5px] text-ink-500">
                              {option.description} • {option.days}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 text-sm font-extrabold",
                              option.price === 0 ? "text-emerald-600" : "text-ink-900",
                            )}
                          >
                            {option.price === 0 ? "Grátis" : formatBRL(option.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-600">
                    Resumo do destinatário
                  </h2>
                  <p className="mt-2 text-[12px] font-semibold text-ink-900">{customer.name}</p>
                  <p className="text-[11px] text-ink-500">
                    {address.street}, {address.number}
                    {address.complement ? ` — ${address.complement}` : ""} • {address.district}
                  </p>
                  <p className="text-[11px] text-ink-500">
                    {address.city} ({address.state}) — {address.cep}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-500">
                    {customer.email} • {customer.phone}
                  </p>
                </section>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-4 text-xs font-bold text-ink-600 transition hover:bg-ink-50"
                  >
                    <ArrowLeft className="size-3.5" />
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={goToStepThree}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    Ir para pagamento
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <section className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-950">
                    <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <CreditCard className="size-4" />
                    </span>
                    Forma de pagamento
                  </h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPayment("pix")}
                      aria-pressed={payment === "pix"}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                        payment === "pix"
                          ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-200"
                          : "border-ink-200 hover:border-ink-300",
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                        <QrCode className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-[13px] font-bold text-ink-900">
                          Pix
                          <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[8.5px] font-bold text-white">
                            5% OFF
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[10.5px] text-ink-500">
                          Aprovação imediata. Pagamento em {formatBRL(pixTotal)}.
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayment("cartao")}
                      aria-pressed={payment === "cartao"}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                        payment === "cartao"
                          ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-200"
                          : "border-ink-200 hover:border-ink-300",
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                        <CreditCard className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-ink-900">
                          Cartão de crédito
                        </span>
                        <span className="mt-0.5 block text-[10.5px] text-ink-500">
                          Em até 10x sem juros ou 21x com juros.
                        </span>
                      </span>
                    </button>
                  </div>

                  {payment === "pix" && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                      <p className="text-[12px] font-bold text-emerald-800">
                        Você economiza {formatBRL(round2(cardTotal - pixTotal))} pagando no Pix
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-emerald-700">
                        Ao confirmar, geramos um QR Code e um código copia e cola. O
                        pedido fica reservado por 30 minutos.
                      </p>
                    </div>
                  )}

                  {payment === "cartao" && (
                    <div className="mt-4 space-y-3">
                      <Field
                        label="Número do cartão"
                        value={card.number}
                        onChange={(value) => {
                          setCard((state) => ({ ...state, number: formatCardNumber(value) }));
                          setErrors((state) => ({ ...state, cardNumber: "" }));
                        }}
                        error={errors.cardNumber}
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                      />
                      <Field
                        label="Nome impresso no cartão"
                        value={card.name}
                        onChange={(value) => {
                          setCard((state) => ({ ...state, name: value.toUpperCase() }));
                          setErrors((state) => ({ ...state, cardName: "" }));
                        }}
                        error={errors.cardName}
                        placeholder="SEU NOME"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Validade"
                          value={card.expiry}
                          onChange={(value) => {
                            setCard((state) => ({ ...state, expiry: formatExpiry(value) }));
                            setErrors((state) => ({ ...state, cardExpiry: "" }));
                          }}
                          error={errors.cardExpiry}
                          placeholder="MM/AA"
                          inputMode="numeric"
                        />
                        <Field
                          label="CVV"
                          value={card.cvv}
                          onChange={(value) => {
                            setCard((state) => ({
                              ...state,
                              cvv: onlyDigits(value).slice(0, 4),
                            }));
                            setErrors((state) => ({ ...state, cardCvv: "" }));
                          }}
                          error={errors.cardCvv}
                          placeholder="000"
                          inputMode="numeric"
                        />
                      </div>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold text-ink-700">
                          Parcelamento
                        </span>
                        <select
                          value={installments}
                          onChange={(event) => setInstallments(Number(event.target.value))}
                          className="h-10 w-full appearance-none rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        >
                          {Array.from({ length: 21 }, (_, index) => index + 1).map((count) => {
                            const value = installmentValue(cardTotal, count);
                            const interest = count > NO_INTEREST_INSTALLMENTS;
                            return (
                              <option key={count} value={count}>
                                {count}x de {formatBRL(value)} {interest ? "com juros" : "sem juros"}
                                {count === NO_INTEREST_INSTALLMENTS ? " (recomendado)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                      <div className="rounded-lg bg-ink-50 px-3 py-2 text-[10.5px] text-ink-500">
                        Total no cartão:{" "}
                        <strong className="text-ink-900">{formatBRL(chosenInstallmentTotal)}</strong>
                        {installments > NO_INTEREST_INSTALLMENTS
                          ? ` • ${installments}x de ${formatBRL(chosenInstallmentValue)}`
                          : ""}
                      </div>
                      <p className="flex items-center gap-1.5 text-[10px] text-ink-400">
                        <Lock className="size-3" />
                        Simulação de pagamento — nenhum dado real é processado.
                      </p>
                    </div>
                  )}
                </section>

                {submitError && (
                  <p
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] font-medium text-rose-700"
                  >
                    {submitError}
                  </p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-4 text-xs font-bold text-ink-600 transition hover:bg-ink-50"
                  >
                    <ArrowLeft className="size-3.5" />
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Lock className="size-4" />
                    )}
                    {submitting
                      ? "Processando..."
                      : payment === "pix"
                        ? `Pagar ${formatBRL(pixTotal)} no Pix`
                        : `Concluir por ${formatBRL(chosenInstallmentTotal)}`}
                  </button>
                </div>
              </>
            )}
          </div>

          <aside className="lg:sticky lg:top-[150px] lg:self-start">
            <div className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
              <h2 className="font-display text-lg font-bold text-ink-950">Seu pedido</h2>
              <ul className="mt-3 space-y-2.5">
                {summary.items.map((item) => (
                  <li key={item.key} className="flex gap-2.5">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                      <ProductImage
                        src={item.image}
                        alt=""
                        sizes="48px"
                        className={item.imageFit === "contain" ? "object-contain p-1" : "object-cover"}
                      />
                      <span className="absolute -right-0 -top-0 grid size-4 place-items-center rounded-full bg-ink-950 text-[8px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-[11px] font-semibold leading-snug text-ink-800">
                        {item.name}
                      </span>
                      <span className="block text-[9.5px] text-ink-400">
                        {item.conditionLabel}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] font-bold text-ink-900">
                      {formatBRL(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-1.5 border-t border-ink-100 pt-3 text-[11.5px]">
                <div className="flex justify-between gap-2">
                  <span className="text-ink-500">Subtotal</span>
                  <span className="font-semibold text-ink-900">{formatBRL(summary.subtotal)}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between gap-2 text-emerald-700">
                    <span>Cupom {coupon}</span>
                    <span className="font-semibold">-{formatBRL(summary.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span className="text-ink-500">Frete</span>
                  <span
                    className={cn(
                      "font-semibold",
                      summary.shippingPrice === 0 ? "text-emerald-600" : "text-ink-900",
                    )}
                  >
                    {shipping
                      ? summary.shippingPrice === 0
                        ? "Grátis"
                        : formatBRL(summary.shippingPrice)
                      : "A calcular"}
                  </span>
                </div>
              </div>

              <div className="mt-3 border-t border-ink-100 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-semibold text-ink-600">
                    {payment === "pix" ? "Total no Pix" : "Total no cartão"}
                  </span>
                  <span className="font-display text-[24px] font-extrabold tracking-[-0.03em] text-ink-950">
                    {formatBRL(payment === "pix" ? pixTotal : chosenInstallmentTotal)}
                  </span>
                </div>
                {payment === "pix" ? (
                  <p className="mt-0.5 text-right text-[10px] font-bold text-emerald-600">
                    5% de desconto aplicado
                  </p>
                ) : (
                  <p className="mt-0.5 text-right text-[10px] text-ink-400">
                    {installments}x de {formatBRL(chosenInstallmentValue)}
                  </p>
                )}
              </div>

              <div className="mt-4 space-y-2 border-t border-ink-100 pt-3 text-[10px] text-ink-500">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  Compra protegida e garantia de 12 meses
                </p>
                <p className="flex items-center gap-1.5">
                  <Truck className="size-3.5 text-brand-600" />
                  {shipping ? `${shipping.label} — ${shipping.days}` : "Selecione a entrega"}
                </p>
                <p className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-ink-400" />
                  Ambiente de demonstração — pedido simulado
                </p>
              </div>
            </div>
          </aside>
        </form>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[11px] font-semibold text-ink-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={cn(
          "h-10 w-full rounded-xl border bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:ring-4 focus:ring-brand-100",
          error ? "border-rose-400 focus:border-rose-400" : "border-ink-200 focus:border-brand-400",
        )}
      />
      {error && <p className="mt-1 text-[10.5px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function OrderSuccess({
  result,
  onCopy,
  copied,
}: {
  result: CheckoutResult;
  onCopy: () => void;
  copied: boolean;
}) {
  const { order, pixPayload, shippingLabel } = result;
  const deliveryDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  }).format(new Date(order.estimatedDelivery));
  const qrCells = useMemo(() => buildQrPattern(pixPayload ?? order.id), [pixPayload, order.id]);

  return (
    <section className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-5 shadow-soft sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
              Pedido {order.status === "pago" ? "aprovado" : "criado com sucesso"}
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink-950 sm:text-3xl">
              Obrigado, {order.customer.name.split(" ")[0]}!
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-ink-500">
              Seu pedido <strong className="text-ink-800">{order.id}</strong> foi
              registrado. Enviamos os detalhes para {order.customer.email}.
            </p>
          </div>

          {order.payment === "pix" && pixPayload && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="shrink-0 rounded-xl bg-white p-2.5 shadow-sm">
                  <div
                    className="grid gap-[2px]"
                    style={{ gridTemplateColumns: "repeat(21, 6px)", gridTemplateRows: "repeat(21, 6px)" }}
                    aria-label="QR Code Pix simulado"
                    role="img"
                  >
                    {qrCells.map((filled, index) => (
                      <span
                        key={index}
                        className={filled ? "rounded-[1px] bg-ink-950" : "bg-white"}
                      />
                    ))}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-emerald-900">
                    Pague {formatBRL(order.total)} via Pix
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-emerald-700">
                    Escaneie o QR Code ou copie o código abaixo. O pedido será separado
                    assim que o pagamento for confirmado.
                  </p>
                  <p className="mt-2 break-all rounded-lg bg-white px-2.5 py-2 font-mono text-[9px] leading-relaxed text-ink-500">
                    {pixPayload}
                  </p>
                  <button
                    type="button"
                    onClick={onCopy}
                    className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[11px] font-bold text-white transition hover:bg-emerald-700"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Código copiado" : "Copiar código Pix"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-ink-100 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                Entrega estimada
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-900">
                <Truck className="size-4 text-brand-600" />
                {deliveryDate}
              </p>
              <p className="mt-0.5 text-[10.5px] text-ink-500">
                {shippingLabel} • {order.address.city} ({order.address.state})
              </p>
            </div>
            <div className="rounded-xl border border-ink-100 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                Pagamento
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-900">
                {order.payment === "pix" ? (
                  <>
                    <QrCode className="size-4 text-emerald-600" />
                    Pix — {formatBRL(order.total)}
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4 text-brand-600" />
                    Cartão em {order.installments}x — {formatBRL(order.total)}
                  </>
                )}
              </p>
              <p className="mt-0.5 text-[10.5px] text-ink-500">
                {order.status === "pago" ? "Pagamento aprovado" : "Aguardando confirmação"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-ink-100">
            <p className="border-b border-ink-100 px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
              Itens do pedido
            </p>
            <ul className="divide-y divide-ink-100">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.conditionLabel}`} className="flex items-center gap-3 p-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    <ProductImage src={item.image} alt="" sizes="48px" className="object-contain p-1" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11.5px] font-semibold text-ink-900">
                      {item.name}
                    </span>
                    <span className="block text-[10px] text-ink-400">
                      {item.conditionLabel} • {item.quantity} un.
                    </span>
                  </span>
                  <span className="text-[11.5px] font-bold text-ink-900">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/conta?aba=pedidos"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Acompanhar pedido
              <ChevronRight className="size-4" />
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-ink-200 text-sm font-bold text-ink-800 transition hover:border-brand-300 hover:text-brand-700"
            >
              Continuar comprando
            </Link>
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
          <ShieldCheck className="size-3.5 text-emerald-600" />
          Compra simulada para demonstração da Tech Note
        </p>
      </div>
    </section>
  );
}

function buildQrPattern(seed: string) {
  const size = 21;
  const cells: boolean[] = [];
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }

  const inFinder = (row: number, col: number) => {
    const zones = [
      [0, 0],
      [0, size - 7],
      [size - 7, 0],
    ];
    return zones.some(
      ([top, left]) =>
        row >= top && row < top + 7 && col >= left && col < left + 7,
    );
  };

  const finderValue = (row: number, col: number) => {
    const zones = [
      [0, 0],
      [0, size - 7],
      [size - 7, 0],
    ];
    const zone = zones.find(
      ([top, left]) =>
        row >= top && row < top + 7 && col >= left && col < left + 7,
    );
    if (!zone) return false;
    const localRow = row - zone[0];
    const localCol = col - zone[1];
    const edge = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
    const center = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
    return edge || center;
  };

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (inFinder(row, col)) {
        cells.push(finderValue(row, col));
      } else {
        const value = Math.abs(Math.sin((row + 1) * 12.9898 + (col + 1) * 78.233 + hash)) * 43758.5453;
        cells.push(value - Math.floor(value) > 0.48);
      }
    }
  }
  return cells;
}
