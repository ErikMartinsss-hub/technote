"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductImage } from "@/components/product/ProductImage";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock,
  CreditCard,
  Heart,
  HelpCircle,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  QrCode,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import type { Order, TradeInProtocol } from "@/lib/types";
import { getOrders, getTradeIns } from "@/lib/orders";
import { getProductBySlug } from "@/lib/products";
import { cn, firstName, formatBRL, formatCep } from "@/lib/format";
import { useUser } from "@/store/user";
import { useFavorites } from "@/store/favorites";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { toast } from "@/store/toast";

const tabs = [
  { id: "pedidos", label: "Pedidos", icon: Package },
  { id: "trocas", label: "Minhas trocas", icon: RefreshCcw },
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "ajuda", label: "Central de ajuda", icon: HelpCircle },
] as const;

type TabId = (typeof tabs)[number]["id"];

const orderStatus: Record<
  Order["status"],
  { label: string; className: string; icon: typeof Package }
> = {
  pago: {
    label: "Pagamento aprovado",
    className: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  aguardando_pagamento: {
    label: "Aguardando pagamento",
    className: "bg-amber-50 text-amber-700",
    icon: QrCode,
  },
  enviado: {
    label: "Enviado",
    className: "bg-brand-50 text-brand-700",
    icon: Truck,
  },
  entregue: {
    label: "Entregue",
    className: "bg-ink-100 text-ink-700",
    icon: PackageCheck,
  },
};

const tradeInStatus: Record<
  TradeInProtocol["status"],
  { label: string; className: string }
> = {
  aguardando_envio: { label: "Aguardando envio", className: "bg-amber-50 text-amber-700" },
  em_analise: { label: "Em análise", className: "bg-brand-50 text-brand-700" },
  pago: { label: "Pago", className: "bg-emerald-50 text-emerald-700" },
};

const faqs = [
  {
    question: "Como funciona a garantia de 12 meses?",
    answer:
      "Todos os aparelhos da Tech Note passam por 42 testes antes de serem anunciados. A garantia cobre defeitos de fabricação e de funcionamento por 12 meses, com nota fiscal emitida no seu nome. Baterias são testadas e informadas com saúde acima de 80%.",
  },
  {
    question: "Qual o prazo de entrega?",
    answer:
      "O PAC leva de 5 a 9 dias úteis e o SEDEX de 2 a 4 dias úteis após a confirmação do pagamento. Você acompanha o rastreio pelo menu Minha conta → Pedidos. Compras acima de R$ 499 têm frete PAC grátis.",
  },
  {
    question: "Posso trocar ou devolver o produto?",
    answer:
      "Sim. Você tem 7 dias corridos para desistir da compra sem justificativa e 90 dias para trocas por defeito, além da garantia. Basta abrir uma solicitação na aba Pedidos ou falar com a gente pelo WhatsApp.",
  },
  {
    question: "Quais as formas de pagamento?",
    answer:
      "Aceitamos Pix com 5% de desconto e cartão de crédito em até 10x sem juros. Acima de 10 parcelas, aplicamos juros de 1,99% ao mês, chegando a 21x. O pagamento é simulado neste ambiente de demonstração.",
  },
  {
    question: "Como vendo meu aparelho usado?",
    answer:
      "Acesse Venda seu aparelho, responda ao questionário de condição e receba uma oferta na hora. Você pode escolher Pix, crédito na loja com 10% extra ou usar o valor como entrada em um aparelho novo. O envio é grátis.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Este é um projeto de demonstração: nenhum pagamento real é processado e os dados ficam apenas no seu navegador (localStorage). Em produção, usaríamos criptografia e antifraude em todas as etapas.",
  },
];

const helpLinks = [
  {
    title: "Prazos e entregas",
    description: "Calcule o frete e acompanhe o rastreio do seu pedido.",
    icon: Truck,
    href: "/catalogo",
    action: "Explorar produtos",
  },
  {
    title: "Trocas e devoluções",
    description: "Solicite uma troca em até 7 dias sem burocracia.",
    icon: RefreshCcw,
    href: "/conta?aba=pedidos",
    action: "Ver meus pedidos",
  },
  {
    title: "Formas de pagamento",
    description: "Pix com 5% OFF e cartão em até 21x.",
    icon: CreditCard,
    href: "/carrinho",
    action: "Ir ao carrinho",
  },
];

export function AccountView({ initialTab }: { initialTab?: string }) {
  const requestedTab = initialTab;
  const activeTab: TabId = tabs.some((tab) => tab.id === requestedTab)
    ? (requestedTab as TabId)
    : "pedidos";

  const isLoggedIn = useUser((state) => state.isLoggedIn);
  const userName = useUser((state) => state.name);
  const userEmail = useUser((state) => state.email);
  const userHydrated = useUser((state) => state.hasHydrated);
  const login = useUser((state) => state.login);
  const logout = useUser((state) => state.logout);

  const favoriteSlugs = useFavorites((state) => state.slugs);
  const favoritesHydrated = useFavorites((state) => state.hasHydrated);

  const [orders, setOrders] = useState<Order[]>([]);
  const [tradeIns, setTradeIns] = useState<TradeInProtocol[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [loginForm, setLoginForm] = useState({ name: "", email: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    setOrders(getOrders());
    setTradeIns(getTradeIns());
    setDataLoaded(true);
  }, []);

  const favoriteProducts = useMemo(
    () =>
      favoriteSlugs
        .map((slug) => getProductBySlug(slug))
        .filter((product): product is NonNullable<typeof product> => Boolean(product)),
    [favoriteSlugs],
  );

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginForm.name.trim().length < 3) {
      setLoginError("Informe seu nome completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      setLoginError("Informe um e-mail válido.");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    window.setTimeout(() => {
      login(loginForm.name.trim(), loginForm.email.trim());
      setLoginLoading(false);
      setLoginForm({ name: "", email: "" });
      toast.success("Bem-vindo de volta!", "Sua conta simulada está pronta.");
    }, 550);
  }

  function handleLogout() {
    logout();
    toast.info("Você saiu da conta", "Seus pedidos continuam salvos neste navegador.");
  }

  const summaryItems = [
    { label: "Pedidos", value: orders.length, icon: ShoppingBag },
    { label: "Trocas", value: tradeIns.length, icon: RefreshCcw },
    { label: "Favoritos", value: favoriteSlugs.length, icon: Heart },
  ];

  return (
    <>
      <section className="border-b border-ink-200/70 bg-white">
        <div className="container-page py-4">
          <Breadcrumbs items={[{ label: "Minha conta" }]} />
        </div>
      </section>

      <section className="container-page py-6 sm:py-8">
        <div className="overflow-hidden rounded-3xl border border-ink-200/80 bg-gradient-to-br from-ink-950 via-brand-950 to-ink-950 p-5 text-white sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10 font-display text-lg font-extrabold uppercase text-lime-400 ring-1 ring-white/15">
                {isLoggedIn && userName ? initialsOf(userName) : <User className="size-6" />}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime-400">
                  {isLoggedIn ? "Cliente Tech Note" : "Área do cliente"}
                </p>
                <h1 className="mt-0.5 truncate font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
                  {isLoggedIn ? `Olá, ${firstName(userName)}!` : "Bem-vindo à Tech Note"}
                </h1>
                <p className="mt-1 truncate text-xs text-white/55">
                  {isLoggedIn
                    ? userEmail
                    : "Entre para acompanhar pedidos, trocas e favoritos."}
                </p>
              </div>
            </div>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-3.5" />
                Sair da conta
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10.5px] font-semibold text-white/60">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                Ambiente demonstrativo
              </span>
            )}
          </div>

          {isLoggedIn && (
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              {summaryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-white/10 text-lime-400">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-extrabold leading-none">
                        {item.value}
                      </p>
                      <p className="text-[9.5px] text-white/45">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isLoggedIn && (
          <div
            className={cn(
              "mt-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 sm:p-5",
              !userHydrated && "opacity-70",
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-md">
                <h2 className="font-display text-base font-bold text-ink-950">
                  Entrar na minha conta
                </h2>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                  Login simulado: informe qualquer nome e e-mail para acessar seus
                  pedidos e protocolos salvos neste navegador.
                </p>
              </div>
              <form onSubmit={handleLogin} className="grid w-full gap-2 sm:grid-cols-[1fr_1fr_auto] lg:max-w-xl">
                <input
                  value={loginForm.name}
                  onChange={(event) => {
                    setLoginForm((state) => ({ ...state, name: event.target.value }));
                    setLoginError("");
                  }}
                  placeholder="Nome completo"
                  autoComplete="name"
                  aria-label="Nome completo"
                  className="h-10 min-w-0 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
                <input
                  value={loginForm.email}
                  onChange={(event) => {
                    setLoginForm((state) => ({ ...state, email: event.target.value }));
                    setLoginError("");
                  }}
                  type="email"
                  placeholder="voce@email.com"
                  autoComplete="email"
                  aria-label="E-mail"
                  className="h-10 min-w-0 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {loginLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="size-3.5" />
                  )}
                  {loginLoading ? "Entrando" : "Entrar"}
                </button>
                {loginError && (
                  <p role="alert" className="text-[10.5px] font-medium text-rose-600 sm:col-span-3">
                    {loginError}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr] xl:gap-7">
          <aside className="min-w-0">
            <nav
              aria-label="Seções da conta"
              className="flex gap-1.5 overflow-x-auto rounded-2xl border border-ink-200/80 bg-white p-1.5 lg:sticky lg:top-[150px] lg:flex-col lg:overflow-visible"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={`/conta?aba=${tab.id}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-bold transition",
                      active
                        ? "bg-brand-600 text-white shadow-[0_10px_20px_-14px_rgba(151,109,14,0.6)]"
                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                    )}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                    {tab.id === "favoritos" && favoriteSlugs.length > 0 && (
                      <span
                        className={cn(
                          "ml-auto hidden rounded-full px-1.5 py-0.5 text-[9px] font-extrabold lg:inline",
                          active ? "bg-white/20 text-white" : "bg-ink-100 text-ink-600",
                        )}
                      >
                        {favoriteSlugs.length}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 hidden rounded-2xl border border-ink-200/80 bg-white p-4 lg:block">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-ink-900">
                <Sparkles className="size-3.5 text-amber-500" />
                Precisa de ajuda?
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-ink-500">
                Nosso time responde em até 1 hora útil pelo WhatsApp.
              </p>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-[11px] font-bold text-white transition hover:bg-emerald-700"
              >
                <MessageCircle className="size-3.5" />
                Falar no WhatsApp
              </a>
            </div>
          </aside>

          <div className="min-w-0">
            {activeTab === "pedidos" && (
              <OrdersPanel orders={orders} loaded={dataLoaded} />
            )}
            {activeTab === "trocas" && (
              <TradeInsPanel tradeIns={tradeIns} loaded={dataLoaded} />
            )}
            {activeTab === "favoritos" && (
              <FavoritesPanel
                products={favoriteProducts}
                hydrated={favoritesHydrated}
              />
            )}
            {activeTab === "ajuda" && <HelpPanel />}
          </div>
        </div>
      </section>
    </>
  );
}

function OrdersPanel({ orders, loaded }: { orders: Order[]; loaded: boolean }) {
  return (
    <section className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-950">Meus pedidos</h2>
          <p className="mt-0.5 text-[11px] text-ink-500">
            Acompanhe o pagamento, a separação e a entrega de cada compra.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="text-[11px] font-bold text-brand-700 hover:text-brand-800"
        >
          Continuar comprando
        </Link>
      </div>

      {!loaded ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="h-36 rounded-2xl skeleton" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-ink-200 px-5 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <ShoppingBag className="size-6" />
          </span>
          <h3 className="mt-3 font-display text-base font-bold text-ink-950">
            Você ainda não tem pedidos
          </h3>
          <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-ink-500">
            Quando finalizar uma compra, ela aparece aqui com rastreio e detalhes de
            pagamento.
          </p>
          <Link
            href="/catalogo?ofertas=1"
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            Ver ofertas
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => {
            const status = orderStatus[order.status];
            const StatusIcon = status.icon;
            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-ink-200/80"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/60 px-3.5 py-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[12px] font-extrabold text-ink-900">{order.id}</p>
                    <span className="text-[10px] text-ink-400">
                      {formatDate(order.createdAt)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold",
                        status.className,
                      )}
                    >
                      <StatusIcon className="size-3" />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-ink-900">
                    {formatBRL(order.total)}
                  </p>
                </div>

                <ul className="divide-y divide-ink-100">
                  {order.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.conditionLabel}`}
                      className="flex items-center gap-3 px-3.5 py-2.5"
                    >
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                        <ProductImage src={item.image} alt="" sizes="44px" className="object-contain p-1" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <Link
                          href={`/produto/${item.slug}`}
                          className="block truncate text-[11.5px] font-semibold text-ink-900 transition hover:text-brand-700"
                        >
                          {item.name}
                        </Link>
                        <span className="block text-[10px] text-ink-400">
                          {item.conditionLabel} • {item.quantity} un.
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] font-bold text-ink-900">
                        {formatBRL(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-3.5 py-2.5 text-[10.5px] text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3 text-brand-600" />
                    {order.address.city} ({order.address.state}) • CEP{" "}
                    {formatCep(order.address.cep)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {order.payment === "pix" ? (
                      <QrCode className="size-3 text-emerald-600" />
                    ) : (
                      <CreditCard className="size-3 text-brand-600" />
                    )}
                    {order.payment === "pix"
                      ? "Pix"
                      : `Cartão em ${order.installments}x`}{" "}
                    • entrega até {formatShortDate(order.estimatedDelivery)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TradeInsPanel({
  tradeIns,
  loaded,
}: {
  tradeIns: TradeInProtocol[];
  loaded: boolean;
}) {
  return (
    <section className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-950">Minhas trocas</h2>
          <p className="mt-0.5 text-[11px] text-ink-500">
            Ofertas de aparelhos enviados, em análise ou já pagas.
          </p>
        </div>
        <Link
          href="/vender"
          className="text-[11px] font-bold text-brand-700 hover:text-brand-800"
        >
          Avaliar outro aparelho
        </Link>
      </div>

      {!loaded ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="h-28 rounded-2xl skeleton" />
          ))}
        </div>
      ) : tradeIns.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-ink-200 px-5 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-lime-100 text-ink-800">
            <RefreshCcw className="size-6" />
          </span>
          <h3 className="mt-3 font-display text-base font-bold text-ink-950">
            Nenhuma troca em andamento
          </h3>
          <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-ink-500">
            Avalie seu aparelho usado e receba uma oferta na hora. Você escolhe entre
            Pix, crédito na loja com 10% extra ou troca assistida.
          </p>
          <Link
            href="/vender"
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            Vender meu aparelho
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {tradeIns.map((item) => {
            const status = tradeInStatus[item.status];
            return (
              <article
                key={item.protocol}
                className="rounded-2xl border border-ink-200/80 p-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Smartphone className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12px] font-bold text-ink-900">{item.model}</p>
                      <p className="text-[10px] text-ink-400">
                        {item.storage} • protocolo {item.protocol}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9.5px] font-bold",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <InfoPill
                    label="Oferta Pix"
                    value={formatBRL(item.offer)}
                    icon={CircleDollarSign}
                  />
                  <InfoPill
                    label="Crédito loja"
                    value={formatBRL(item.creditOffer)}
                    icon={Sparkles}
                  />
                  <InfoPill
                    label="Pagamento"
                    value={
                      item.payment === "pix"
                        ? "Pix"
                        : item.payment === "credito"
                          ? "Crédito"
                          : "Troca"
                    }
                    icon={CreditCard}
                  />
                  <InfoPill
                    label="Envio"
                    value={item.shippingMethod === "etiqueta" ? "Etiqueta" : "Coleta"}
                    icon={Truck}
                  />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-2.5 text-[10px] text-ink-400">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3" />
                    Solicitado em {formatDate(item.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3" />
                    {item.status === "pago"
                      ? "Pagamento concluído"
                      : item.status === "em_analise"
                        ? "Avaliação em até 2 dias úteis"
                        : item.shippingMethod === "etiqueta"
                          ? "Aguardando postagem do aparelho"
                          : "Aguardando coleta no endereço"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FavoritesPanel({
  products: favoriteProducts,
  hydrated,
}: {
  products: NonNullable<ReturnType<typeof getProductBySlug>>[];
  hydrated: boolean;
}) {
  return (
    <section className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-950">Meus favoritos</h2>
          <p className="mt-0.5 text-[11px] text-ink-500">
            {hydrated && favoriteProducts.length > 0
              ? `${favoriteProducts.length} ${
                  favoriteProducts.length === 1 ? "produto salvo" : "produtos salvos"
                } para decidir depois.`
              : "Salve aparelhos com o coração e volte quando quiser."}
          </p>
        </div>
        <Link
          href="/catalogo"
          className="text-[11px] font-bold text-brand-700 hover:text-brand-800"
        >
          Explorar catálogo
        </Link>
      </div>

      {!hydrated ? (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-72 rounded-2xl skeleton" />
          ))}
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-ink-200 px-5 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
            <Heart className="size-6" />
          </span>
          <h3 className="mt-3 font-display text-base font-bold text-ink-950">
            Sua lista está vazia
          </h3>
          <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-ink-500">
            Toque no coração dos produtos que você gostou. Eles ficam salvos aqui
            automaticamente.
          </p>
          <Link
            href="/catalogo?ofertas=1"
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            Descobrir ofertas
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <ProductGrid products={favoriteProducts} />
        </div>
      )}
    </section>
  );
}

function HelpPanel() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-5">
        <h2 className="font-display text-lg font-bold text-ink-950">Central de ajuda</h2>
        <p className="mt-0.5 text-[11px] text-ink-500">
          Respostas rápidas para as dúvidas mais comuns. Não encontrou? Fale com a gente.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {helpLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="group rounded-xl border border-ink-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="size-4" />
                </span>
                <p className="mt-2 text-[12px] font-bold text-ink-900">{link.title}</p>
                <p className="mt-0.5 text-[10.5px] leading-snug text-ink-500">
                  {link.description}
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-brand-700">
                  {link.action}
                  <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 divide-y divide-ink-100 border-t border-ink-100">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12.5px] font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="size-4 shrink-0 text-ink-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-[11.5px] leading-relaxed text-ink-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink-200/80 bg-white p-4">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <MessageCircle className="size-4" />
          </span>
          <p className="mt-2 text-[12px] font-bold text-ink-900">WhatsApp</p>
          <p className="mt-0.5 text-[10.5px] text-ink-500">Seg. a sáb., 9h às 19h</p>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-[10.5px] font-bold text-brand-700 hover:text-brand-800"
          >
            (11) 99999-9999
          </a>
        </div>
        <div className="rounded-2xl border border-ink-200/80 bg-white p-4">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Mail className="size-4" />
          </span>
          <p className="mt-2 text-[12px] font-bold text-ink-900">E-mail</p>
          <p className="mt-0.5 text-[10.5px] text-ink-500">Resposta em até 1 dia útil</p>
          <a
            href="mailto:oi@technote.com.br"
            className="mt-2 inline-flex text-[10.5px] font-bold text-brand-700 hover:text-brand-800"
          >
            oi@technote.com.br
          </a>
        </div>
        <div className="rounded-2xl border border-ink-200/80 bg-white p-4">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <ShieldCheck className="size-4" />
          </span>
          <p className="mt-2 text-[12px] font-bold text-ink-900">Garantia Tech Note</p>
          <p className="mt-0.5 text-[10.5px] text-ink-500">
            12 meses em todos os aparelhos
          </p>
          <Link
            href="/catalogo"
            className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-brand-700 hover:text-brand-800"
          >
            Conhecer produtos
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200/80 bg-white p-4">
        <p className="flex items-center gap-1.5 text-[12px] font-bold text-ink-900">
          <Search className="size-4 text-brand-600" />
          Ainda com dúvidas?
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
          Este projeto é uma demonstração da Tech Note. Nenhum pagamento real é
          processado e todos os dados ficam salvos apenas no seu navegador.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Link
            href="/vender"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[11px] font-bold text-white transition hover:bg-brand-700"
          >
            <BadgeCheck className="size-3.5" />
            Vender aparelho
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-[11px] font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            <ShoppingBag className="size-3.5" />
            Ir às compras
          </Link>
        </div>
      </div>
    </section>
  );
}

function InfoPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Package;
}) {
  return (
    <div className="rounded-lg bg-ink-50/70 px-2.5 py-1.5">
      <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-ink-400">
        <Icon className="size-2.5" />
        {label}
      </p>
      <p className="mt-0.5 text-[11px] font-bold text-ink-900">{value}</p>
    </div>
  );
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatShortDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
