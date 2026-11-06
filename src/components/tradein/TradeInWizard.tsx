"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  Headphones,
  Laptop,
  MapPin,
  PackageCheck,
  Printer,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Truck,
  Watch,
} from "lucide-react";
import {
  DEFAULT_ANSWERS,
  QUESTION_OPTIONS,
  TRADEIN_CATEGORIES,
  calculateTradeIn,
  getTradeInBrands,
  getTradeInModels,
  type TradeInAnswers,
} from "@/lib/tradein";
import type { TradeInProtocol } from "@/lib/types";
import { saveTradeIn } from "@/lib/orders";
import { cn, formatBRL } from "@/lib/format";
import { toast } from "@/store/toast";

const categoryIcons: Record<string, typeof Smartphone> = {
  celular: Smartphone,
  notebook: Laptop,
  tablet: Tablet,
  smartwatch: Watch,
  acessorio: Headphones,
};

const steps = ["Aparelho", "Condição", "Oferta", "Envio"];

const questions: {
  key: keyof TradeInAnswers;
  title: string;
  hint: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "powersOn",
    title: "O aparelho liga normalmente?",
    hint: "Considere o funcionamento geral, sem travar ou reiniciar sozinho.",
    options: QUESTION_OPTIONS.powersOn.map((option) => ({ ...option })),
  },
  {
    key: "screen",
    title: "Como está a tela?",
    hint: "Riscos superficiais que não aparecem com a tela ligada contam como leves.",
    options: QUESTION_OPTIONS.screen.map((option) => ({ ...option })),
  },
  {
    key: "body",
    title: "E a carcaça?",
    hint: "Observe laterais, traseira e a moldura ao redor da tela.",
    options: QUESTION_OPTIONS.body.map((option) => ({ ...option })),
  },
  {
    key: "battery",
    title: "Qual a saúde da bateria?",
    hint: "No iPhone: Ajustes › Bateria › Saúde da bateria. No Android, use um app de diagnóstico.",
    options: QUESTION_OPTIONS.battery.map((option) => ({ ...option })),
  },
  {
    key: "accessories",
    title: "O que acompanha o aparelho?",
    hint: "Caixa original, carregador e cabos valorizam a sua oferta.",
    options: QUESTION_OPTIONS.accessories.map((option) => ({ ...option })),
  },
  {
    key: "account",
    title: "A conta já foi desvinculada?",
    hint: "Desative o iCloud/Conta Google e o bloqueio de tela antes de enviar.",
    options: QUESTION_OPTIONS.account.map((option) => ({ ...option })),
  },
];

const paymentOptions = [
  {
    id: "pix" as const,
    label: "Pix",
    description: "Dinheiro na conta em até 1 dia útil após a aprovação.",
    icon: QrCode,
    bonus: false,
  },
  {
    id: "credito" as const,
    label: "Crédito na loja",
    description: "Ganhe 10% extra para usar em qualquer produto Tech Note.",
    icon: CircleDollarSign,
    bonus: true,
  },
  {
    id: "troca" as const,
    label: "Troca assistida",
    description: "Use a oferta como entrada em um aparelho novo.",
    icon: RefreshCcw,
    bonus: false,
  },
];

export function TradeInWizard() {
  const [step, setStep] = useState(0);
  const [categoryId, setCategoryId] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [storageLabel, setStorageLabel] = useState<string>("");
  const [answers, setAnswers] = useState<TradeInAnswers>(DEFAULT_ANSWERS);
  const [payment, setPayment] = useState<"pix" | "credito" | "troca">("pix");
  const [shippingMethod, setShippingMethod] = useState<"etiqueta" | "coleta">("etiqueta");
  const [protocol, setProtocol] = useState<TradeInProtocol | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const category = TRADEIN_CATEGORIES.find((item) => item.id === categoryId);
  const brands = categoryId ? getTradeInBrands(categoryId) : [];
  const models = categoryId && brand ? getTradeInModels(categoryId, brand) : [];
  const model = models.find((item) => item.id === modelId);

  const quote = useMemo(() => {
    if (!modelId || !storageLabel) return null;
    return calculateTradeIn(modelId, storageLabel, answers);
  }, [modelId, storageLabel, answers]);

  function resetFromCategory(id: string) {
    setCategoryId(id);
    setBrand("");
    setModelId("");
    setStorageLabel("");
  }

  function selectBrand(value: string) {
    setBrand(value);
    setModelId("");
    setStorageLabel("");
  }

  function selectModel(value: string) {
    setModelId(value);
    const found = models.find((item) => item.id === value);
    setStorageLabel(found?.storages[0]?.label ?? "");
  }

  function setAnswer(key: keyof TradeInAnswers, value: string) {
    setAnswers((previous) => ({ ...previous, [key]: value }) as TradeInAnswers);
  }

  const canContinue =
    step === 0
      ? Boolean(categoryId && brand && modelId && storageLabel)
      : step === 1
        ? Boolean(quote)
        : step === 2
          ? Boolean(quote)
          : true;

  function nextStep() {
    if (!canContinue) {
      toast.info("Complete as informações", "Selecione todas as opções para continuar.");
      return;
    }
    setStep((value) => Math.min(steps.length - 1, value + 1));
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  function previousStep() {
    setStep((value) => Math.max(0, value - 1));
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!quote) return;
    setSubmitting(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      const stamp = Date.now().toString(36).toUpperCase().slice(-6);
      const record: TradeInProtocol = {
        protocol: `TNT-${stamp}`,
        createdAt: new Date().toISOString(),
        model: `${quote.model.brand} ${quote.model.label}`,
        storage: quote.storage,
        offer: quote.offer,
        creditOffer: quote.creditOffer,
        payment,
        shippingMethod,
        status: "aguardando_envio",
      };
      saveTradeIn(record);
      setProtocol(record);
      toast.success("Avaliação concluída!", `Seu protocolo é ${record.protocol}.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  async function copyProtocol() {
    if (!protocol) return;
    try {
      await navigator.clipboard.writeText(protocol.protocol);
      setCopied(true);
      toast.success("Protocolo copiado!", protocol.protocol);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info("Anote o protocolo", protocol.protocol);
    }
  }

  if (protocol) {
    return (
      <TradeInSuccess
        protocol={protocol}
        payment={payment}
        shippingMethod={shippingMethod}
        onCopy={() => void copyProtocol()}
        copied={copied}
      />
    );
  }

  const chosen = quote?.offer ?? 0;
  const displayValue = payment === "credito" ? quote?.creditOffer ?? 0 : chosen;
  const baseDelta = quote ? quote.offer - quote.base : 0;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-brand-950 to-ink-950 text-white">
        <div className="absolute -right-20 -top-24 size-[360px] rounded-full border border-white/10" />
        <div className="absolute -bottom-28 left-1/4 size-[380px] rounded-full bg-brand-600/25 blur-3xl" />
        <div className="container-page relative py-9 sm:py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-lime-400">
            <Sparkles className="size-3.5" />
            Tech Note Troca
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-[44px]">
            Quanto vale o seu aparelho?
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
            Responda algumas perguntas e receba uma oferta na hora. Envio grátis,
            avaliação em até 2 dias úteis e pagamento rápido.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10.5px] text-white/50">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              Oferta garantida por 7 dias
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-lime-400" />
              Etiqueta de envio grátis
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-lime-400" />
              Pix em até 1 dia útil
            </span>
          </div>
        </div>
      </section>

      <section className="container-page py-6 sm:py-8">
        <ol className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold sm:gap-3">
          {steps.map((label, index) => {
            const current = step === index;
            const done = step > index;
            return (
              <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
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
                  {done ? <Check className="size-3" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap",
                    current ? "text-ink-900" : done ? "text-emerald-700" : "text-ink-400",
                  )}
                >
                  {label}
                </span>
                {index < steps.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1",
                      step > index ? "bg-emerald-300" : "bg-ink-200",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:gap-7">
          <div className="min-w-0 space-y-4">
            {step === 0 && (
              <section className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-950">
                    1. Qual é o seu aparelho?
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-ink-500">
                    Selecione a categoria, a marca, o modelo e o armazenamento.
                  </p>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                    Categoria
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {TRADEIN_CATEGORIES.map((item) => {
                      const Icon = categoryIcons[item.id] ?? Smartphone;
                      const active = categoryId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => resetFromCategory(item.id)}
                          aria-pressed={active}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition",
                            active
                              ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-200"
                              : "border-ink-200 hover:border-ink-300 hover:bg-ink-50/60",
                          )}
                        >
                          <Icon className={cn("size-5", active ? "text-brand-700" : "text-ink-500")} />
                          <span className="text-[11px] font-bold text-ink-800">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {categoryId && (
                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                      Marca
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {brands.map((item) => {
                        const active = brand === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => selectBrand(item)}
                            aria-pressed={active}
                            className={cn(
                              "rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition",
                              active
                                ? "border-ink-950 bg-ink-950 text-white"
                                : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700",
                            )}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {brand && (
                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                      Modelo
                    </p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {models.map((item) => {
                        const active = modelId === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectModel(item.id)}
                            aria-pressed={active}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition",
                              active
                                ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-200"
                                : "border-ink-200 hover:border-ink-300 hover:bg-ink-50/60",
                            )}
                          >
                            <span className="text-[12px] font-semibold text-ink-900">
                              {item.label}
                            </span>
                            <span className="shrink-0 text-[10px] text-ink-400">{item.year}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {model && (
                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                      Armazenamento / tamanho
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {model.storages.map((item) => {
                        const active = storageLabel === item.label;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setStorageLabel(item.label)}
                            aria-pressed={active}
                            className={cn(
                              "rounded-xl border px-3.5 py-2 text-[12px] font-bold transition",
                              active
                                ? "border-brand-500 bg-brand-50 text-brand-700"
                                : "border-ink-200 bg-white text-ink-600 hover:border-brand-300",
                            )}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {step === 1 && (
              <section className="space-y-3">
                <div className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
                  <h2 className="font-display text-lg font-bold text-ink-950">
                    2. Como está o aparelho?
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-ink-500">
                    Seja sincero: a avaliação final confirma cada item. A oferta é atualizada
                    na hora.
                  </p>
                </div>

                {questions.map((question) => (
                  <div
                    key={question.key}
                    className="rounded-2xl border border-ink-200/80 bg-white p-4"
                  >
                    <h3 className="text-[13px] font-bold text-ink-900">{question.title}</h3>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-ink-500">{question.hint}</p>
                    <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                      {question.options.map((option) => {
                        const active = answers[question.key] === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setAnswer(question.key, option.value)}
                            aria-pressed={active}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
                              active
                                ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-200"
                                : "border-ink-200 hover:border-ink-300 hover:bg-ink-50/60",
                            )}
                          >
                            <span
                              className={cn(
                                "grid size-3.5 shrink-0 place-items-center rounded-full border-2",
                                active ? "border-brand-600 bg-brand-600" : "border-ink-300",
                              )}
                            >
                              {active && <span className="size-1 rounded-full bg-white" />}
                            </span>
                            <span className="text-[11.5px] font-medium text-ink-700">
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {step === 2 && quote && (
              <section className="space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Oferta calculada para você
                  </p>
                  <p className="mt-1 font-display text-[46px] font-extrabold leading-none tracking-[-0.04em] text-ink-950">
                    {formatBRL(quote.offer)}
                  </p>
                  <p className="mt-1 text-[11.5px] text-ink-500">
                    pela sua {quote.model.brand} {quote.model.label} {quote.storage} • valor de
                    tabela {formatBRL(quote.base)}
                  </p>
                  <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-emerald-800">
                    <BadgeCheck className="mt-0.5 size-3.5 shrink-0" />
                    {quote.summary}
                  </p>
                </div>

                <div className="rounded-2xl border border-ink-200/80 bg-white p-4">
                  <h2 className="font-display text-lg font-bold text-ink-950">
                    3. Como quer receber?
                  </h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {paymentOptions.map((option) => {
                      const active = payment === option.id;
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setPayment(option.id)}
                          aria-pressed={active}
                          className={cn(
                            "relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition",
                            active
                              ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-200"
                              : "border-ink-200 hover:border-ink-300 hover:bg-ink-50/60",
                          )}
                        >
                          {option.bonus && (
                            <span className="absolute right-2 top-2 rounded bg-lime-400 px-1.5 py-0.5 text-[8.5px] font-extrabold text-ink-950">
                              +10%
                            </span>
                          )}
                          <Icon
                            className={cn("size-5", active ? "text-brand-700" : "text-ink-400")}
                          />
                          <span className="text-[12px] font-bold text-ink-900">
                            {option.label}
                          </span>
                          <span className="text-[10px] leading-snug text-ink-500">
                            {option.description}
                          </span>
                          {option.id === "credito" && (
                            <span className="text-[11px] font-extrabold text-brand-700">
                              {formatBRL(quote.creditOffer)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-ink-200/80 bg-white p-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-600">
                    Detalhes da avaliação
                  </h3>
                  <ul className="mt-2 divide-y divide-ink-100">
                    {quote.deductions.length === 0 ? (
                      <li className="flex items-center gap-1.5 py-2 text-[11.5px] font-medium text-emerald-700">
                        <Check className="size-3.5" />
                        Seu aparelho está em excelente estado — sem descontos aplicados.
                      </li>
                    ) : (
                      quote.deductions.map((deduction, index) => (
                        <li
                          key={`${deduction.label}-${index}`}
                          className="flex items-start justify-between gap-3 py-2 text-[11px]"
                        >
                          <span className="text-ink-600">
                            {deduction.label}
                            <span className="ml-1 text-ink-400">
                              ({deduction.percent > 0 ? "+" : ""}
                              {deduction.percent}%)
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 font-semibold",
                              deduction.kind === "bonus"
                                ? "text-emerald-600"
                                : "text-rose-600",
                            )}
                          >
                            {deduction.kind === "bonus" ? "+" : "−"}
                            {formatBRL(deduction.amount)}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                  <p className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-400">
                    <Clock3 className="size-3" />
                    Oferta válida por 7 dias. O valor final é confirmado após a avaliação física.
                  </p>
                </div>
              </section>
            )}

            {step === 3 && quote && (
              <section className="space-y-3">
                <div className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
                  <h2 className="font-display text-lg font-bold text-ink-950">
                    4. Como prefere enviar?
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-ink-500">
                    O envio é gratuito e você acompanha cada etapa pelo protocolo.
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setShippingMethod("etiqueta")}
                      aria-pressed={shippingMethod === "etiqueta"}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                        shippingMethod === "etiqueta"
                          ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-200"
                          : "border-ink-200 hover:border-ink-300",
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                        <Printer className="size-4" />
                      </span>
                      <span>
                        <span className="block text-[12.5px] font-bold text-ink-900">
                          Etiqueta grátis
                        </span>
                        <span className="mt-0.5 block text-[10.5px] leading-snug text-ink-500">
                          Geramos a etiqueta na hora. Leve em qualquer agência ou ponto de coleta.
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingMethod("coleta")}
                      aria-pressed={shippingMethod === "coleta"}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                        shippingMethod === "coleta"
                          ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-200"
                          : "border-ink-200 hover:border-ink-300",
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                        <MapPin className="size-4" />
                      </span>
                      <span>
                        <span className="block text-[12.5px] font-bold text-ink-900">
                          Coleta em casa
                        </span>
                        <span className="mt-0.5 block text-[10.5px] leading-snug text-ink-500">
                          Um motoboy busca o aparelho no endereço escolhido, sem custo.
                        </span>
                      </span>
                    </button>
                  </div>

                  <div className="mt-3 rounded-xl bg-ink-50/70 p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700">
                      <CalendarDays className="size-3.5 text-brand-600" />
                      Próximas janelas de coleta
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10.5px] text-ink-500">
                      <span className="rounded-md bg-white px-2 py-1 font-medium">Amanhã, 9h–12h</span>
                      <span className="rounded-md bg-white px-2 py-1 font-medium">Amanhã, 13h–18h</span>
                      <span className="rounded-md bg-white px-2 py-1 font-medium">Sábado, 9h–13h</span>
                    </div>
                    <p className="mt-1.5 text-[9.5px] text-ink-400">
                      A janela é confirmada por e-mail após a solicitação.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-ink-200/80 bg-white p-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-600">
                    Checklist antes de enviar
                  </h3>
                  <ul className="mt-2 grid gap-1.5 text-[11px] text-ink-600 sm:grid-cols-2">
                    {[
                      "Desvincule iCloud ou Conta Google",
                      "Desative bloqueio de tela e senha",
                      "Faça backup das suas fotos",
                      "Inclua os acessórios informados",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-1.5">
                        <Check className="size-3.5 shrink-0 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-ink-200/80 bg-white p-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-600">
                    Resumo da oferta
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-bold text-ink-900">
                        {quote.model.brand} {quote.model.label} • {quote.storage}
                      </p>
                      <p className="text-[10.5px] text-ink-500">
                        {paymentOptions.find((option) => option.id === payment)?.label} •{" "}
                        {shippingMethod === "etiqueta" ? "Etiqueta grátis" : "Coleta em casa"}
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-xl font-extrabold text-ink-950">
                      {formatBRL(displayValue)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-[0_14px_28px_-14px_rgba(151,109,14,0.55)] transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <PackageCheck className="size-4" />
                  )}
                  {submitting ? "Gerando protocolo..." : "Confirmar e gerar etiqueta"}
                </button>
              </section>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={previousStep}
                disabled={step === 0}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 text-xs font-bold text-ink-600 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="size-3.5" />
                Voltar
              </button>
              {step < steps.length - 1 && (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canContinue}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {step === 1 ? "Ver minha oferta" : "Continuar"}
                  <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-[150px] lg:self-start">
            <div className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                <CircleDollarSign className="size-3.5 text-emerald-600" />
                Sua oferta estimada
              </p>
              <p className="mt-1 font-display text-[36px] font-extrabold leading-none tracking-[-0.04em] text-ink-950">
                {quote ? formatBRL(displayValue) : "R$ 0"}
              </p>
              <p className="mt-1 text-[10.5px] text-ink-500">
                {quote
                  ? `${quote.model.brand} ${quote.model.label} • ${quote.storage}`
                  : "Selecione o aparelho para ver a oferta"}
              </p>

              <div className="mt-3 space-y-1.5 border-t border-ink-100 pt-3 text-[10.5px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-500">Valor de tabela</span>
                  <span className="font-semibold text-ink-800">
                    {quote ? formatBRL(quote.base) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-500">
                    {baseDelta > 0 ? "Bônus aplicados" : "Descontos aplicados"}
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      baseDelta > 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {quote
                      ? baseDelta === 0
                        ? formatBRL(0)
                        : baseDelta > 0
                          ? `+${formatBRL(baseDelta)}`
                          : `−${formatBRL(Math.abs(baseDelta))}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-500">Oferta em crédito</span>
                  <span className="font-semibold text-brand-700">
                    {quote ? formatBRL(quote.creditOffer) : "—"}
                  </span>
                </div>
              </div>

              {quote && (
                <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[10.5px] font-medium text-emerald-800">
                  Oferta {payment === "credito" ? "em crédito" : "via Pix"} de{" "}
                  <strong>{formatBRL(displayValue)}</strong> válida por 7 dias.
                </div>
              )}

              <ul className="mt-4 space-y-2 border-t border-ink-100 pt-3 text-[10.5px] text-ink-500">
                <li className="flex items-start gap-1.5">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                  Avaliação transparente, sem taxas escondidas.
                </li>
                <li className="flex items-start gap-1.5">
                  <Truck className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  Envio gratuito para todo o Brasil.
                </li>
                <li className="flex items-start gap-1.5">
                  <Clock3 className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  Pagamento em até 1 dia útil após a aprovação.
                </li>
              </ul>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-[10px] text-ink-500">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                Mais de 50 mil aparelhos avaliados com segurança.
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function TradeInSuccess({
  protocol,
  payment,
  shippingMethod,
  onCopy,
  copied,
}: {
  protocol: TradeInProtocol;
  payment: "pix" | "credito" | "troca";
  shippingMethod: "etiqueta" | "coleta";
  onCopy: () => void;
  copied: boolean;
}) {
  const paymentLabel =
    payment === "pix" ? "Pix" : payment === "credito" ? "Crédito na loja" : "Troca assistida";

  return (
    <section className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-5 shadow-soft sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
              Avaliação concluída
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink-950 sm:text-3xl">
              Sua oferta está garantida!
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-ink-500">
              Anote o protocolo e acompanhe cada etapa. Você receberá as instruções por
              e-mail.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                  Protocolo
                </p>
                <p className="mt-0.5 font-display text-xl font-extrabold tracking-tight text-ink-950">
                  {protocol.protocol}
                </p>
              </div>
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-ink-700 shadow-sm transition hover:bg-ink-950 hover:text-white"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copiado" : "Copiar protocolo"}
              </button>
            </div>
            <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
              <p className="text-ink-500">
                <span className="font-semibold text-ink-800">Aparelho:</span> {protocol.model}{" "}
                {protocol.storage}
              </p>
              <p className="text-ink-500">
                <span className="font-semibold text-ink-800">Pagamento:</span> {paymentLabel}
              </p>
              <p className="text-ink-500">
                <span className="font-semibold text-ink-800">Oferta:</span>{" "}
                {formatBRL(protocol.offer)}
              </p>
              <p className="text-ink-500">
                <span className="font-semibold text-ink-800">Crédito:</span>{" "}
                {formatBRL(protocol.creditOffer)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-ink-100 p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                {shippingMethod === "etiqueta" ? (
                  <Printer className="size-3.5" />
                ) : (
                  <Truck className="size-3.5" />
                )}
                {shippingMethod === "etiqueta" ? "Etiqueta de envio" : "Coleta agendada"}
              </p>
              <p className="mt-1 text-[12px] font-semibold text-ink-900">
                {shippingMethod === "etiqueta"
                  ? "Etiqueta gerada com sucesso"
                  : "Coleta solicitada"}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-500">
                {shippingMethod === "etiqueta"
                  ? "Você receberá o código de postagem por e-mail. Leve o aparelho em qualquer agência ou ponto de coleta."
                  : "Nossa equipe entrará em contato para confirmar a janela de coleta no seu endereço."}
              </p>
            </div>
            <div className="rounded-xl border border-ink-100 p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                <Clock3 className="size-3.5" />
                Próximos passos
              </p>
              <ol className="mt-1 space-y-0.5 text-[10.5px] leading-relaxed text-ink-500">
                <li>1. Prepare o aparelho e desvincule a conta.</li>
                <li>2. Envie ou aguarde a coleta.</li>
                <li>3. Avaliamos em até 2 dias úteis.</li>
                <li>4. Pagamento via Pix ou crédito.</li>
              </ol>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/conta?aba=trocas"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Acompanhar troca
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-ink-200 text-sm font-bold text-ink-800 transition hover:border-brand-300 hover:text-brand-700"
            >
              Usar meu crédito
            </Link>
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
          <CreditCard className="size-3.5 text-brand-600" />
          Avaliação simulada para demonstração da Tech Note
        </p>
      </div>
    </section>
  );
}
