"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  ChevronDown,
  ChevronRight,
  Flame,
  HandCoins,
  Heart,
  MapPin,
  Menu,
  Package,
  ShoppingCart,
  Ticket,
  Truck,
  User,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { SearchBar } from "@/components/layout/SearchBar";
import { CepModal } from "@/components/layout/CepModal";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { CATEGORY_META, CATEGORY_ORDER, products } from "@/lib/products";
import { useCart } from "@/store/cart";
import { usePreferences } from "@/store/preferences";
import { useUser } from "@/store/user";
import { cn, firstName } from "@/lib/format";

const mainLinks = [
  { label: "Categorias", href: "/catalogo", mega: true },
  {
    label: "iPhone",
    href: "/catalogo?categoria=Celulares&marca=Apple",
  },
  {
    label: "Samsung",
    href: "/catalogo?categoria=Celulares&marca=Samsung",
  },
  {
    label: "Motorola",
    href: "/catalogo?categoria=Celulares&marca=Motorola",
  },
  { label: "Informática", href: "/catalogo?categoria=Notebooks,Tablets", mega: "info" },
  { label: "Notebook", href: "/catalogo?categoria=Notebooks" },
  { label: "Smartwatches", href: "/catalogo?categoria=Smartwatches" },
  { label: "Tablets", href: "/catalogo?categoria=Tablets" },
  { label: "Acessórios", href: "/catalogo?categoria=Acess%C3%B3rios" },
];

const categoryIcons = ["Celulares", "Notebooks", "Tablets", "Smartwatches", "Acessórios"];

export function Header() {
  const [cepOpen, setCepOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cep = usePreferences((state) => state.cep);
  const city = usePreferences((state) => state.city);
  const stateUf = usePreferences((state) => state.state);
  const isLoggedIn = useUser((state) => state.isLoggedIn);
  const userName = useUser((state) => state.name);
  const cartCount = useCart((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <>
      <div className="bg-ink-950 text-white/80">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[11px]">
          <p className="hidden items-center gap-1.5 sm:flex">
            <Truck className="size-3.5 text-lime-400" />
            Frete grátis acima de R$ 499
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <Ticket className="size-3.5 shrink-0 text-lime-400" />
            <span className="truncate">
              Cupom <strong className="font-bold text-white">TECH10</strong>: 10% OFF na
              primeira compra
            </span>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCepOpen(true)}
              className="flex items-center gap-1.5 font-medium text-white/85 transition hover:text-white focus-ring rounded-md"
            >
              <MapPin className="size-3.5 text-lime-400" />
              <span className="hidden sm:inline">
                {cep ? `Enviar para ${city} (${stateUf})` : "Informe seu CEP"}
              </span>
              <span className="sm:hidden">CEP</span>
            </button>
            <Link
              href="/conta?aba=pedidos"
              className="hidden items-center gap-1.5 font-medium text-white/70 transition hover:text-white lg:flex"
            >
              <Package className="size-3.5" />
              Meus pedidos
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-ink-200/70 bg-white/95 backdrop-blur-md">
        <div className="container-page">
          <div className="flex h-[66px] items-center gap-2 lg:gap-5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-700 transition hover:bg-ink-100 lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <Logo />

            <div className="hidden min-w-0 flex-1 md:block">
              <SearchBar />
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Link
                href="/vender"
                className="group hidden h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 px-3.5 text-xs font-bold text-white shadow-[0_10px_24px_-12px_rgba(151,109,14,0.55)] transition hover:brightness-110 md:inline-flex xl:px-4 xl:text-[13px]"
              >
                <HandCoins className="size-4 text-lime-400" />
                <span className="hidden lg:inline">Venda seu aparelho</span>
                <span className="lg:hidden">Vender</span>
                <ChevronRight className="size-3.5 text-white/50 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/vender"
                aria-label="Venda seu aparelho"
                className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700 transition hover:bg-brand-100 md:hidden"
              >
                <HandCoins className="size-5" />
              </Link>

              <Link
                href="/conta"
                className="hidden h-10 items-center gap-2 rounded-xl px-2.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 sm:flex"
              >
                <User className="size-[18px]" />
                <span className="hidden xl:inline">
                  {isLoggedIn ? `Olá, ${firstName(userName)}` : "Entrar"}
                </span>
                <span className="sr-only xl:hidden">Minha conta</span>
              </Link>

              <Link
                href="/carrinho"
                aria-label={`Carrinho${cartCount > 0 ? `, ${cartCount} itens` : ""}`}
                className="relative grid size-10 place-items-center rounded-xl text-ink-800 transition hover:bg-ink-50"
              >
                <ShoppingCart className="size-[19px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="pb-3 md:hidden">
            <SearchBar />
          </div>

          <nav
            aria-label="Categorias"
            className="hidden items-center gap-0.5 border-t border-ink-100 py-1.5 lg:flex"
          >
            {mainLinks.map((link) =>
              link.mega ? (
                <MegaMenu key={link.label} type={link.mega} label={link.label} />
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="whitespace-nowrap rounded-lg px-2.5 py-2 text-[12.5px] font-semibold text-ink-600 transition hover:bg-brand-50 hover:text-brand-700 xl:px-3"
                >
                  {link.label}
                </Link>
              ),
            )}

            <Link
              href="/catalogo?ofertas=1"
              className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[12.5px] font-bold text-brand-700 transition hover:bg-brand-50"
            >
              <BadgePercent className="size-4" />
              Ofertas
            </Link>
            <Link
              href="/catalogo?ofertas=1&ordenar=desconto"
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-ink-950 px-3 py-2 text-[11.5px] font-extrabold tracking-wide text-lime-400 transition hover:bg-ink-900"
            >
              <Flame className="size-3.5" />
              BLACK FRIDAY
            </Link>
          </nav>

          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-2 lg:hidden">
            {categoryIcons.map((category) => (
              <Link
                key={category}
                href={`/catalogo?categoria=${encodeURIComponent(category)}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                <CategoryIcon category={category} className="size-3.5" />
                {category}
              </Link>
            ))}
            <Link
              href="/catalogo?ofertas=1"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink-950 px-2.5 py-1.5 text-[11px] font-bold text-lime-400"
            >
              <Flame className="size-3.5" />
              Ofertas
            </Link>
          </div>
        </div>
      </header>

      <CepModal open={cepOpen} onClose={() => setCepOpen(false)} />
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenCep={() => setCepOpen(true)}
      />
    </>
  );
}

function MegaMenu({ type, label }: { type: string | boolean; label: string }) {
  const isInfo = type === "info";
  const categories = isInfo
    ? ["Notebooks", "Tablets"]
    : CATEGORY_ORDER.filter((category) => categoryIcons.includes(category));

  return (
    <div className="group relative">
      <Link
        href={isInfo ? "/catalogo?categoria=Notebooks,Tablets" : "/catalogo"}
        aria-haspopup="true"
        className="flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[12.5px] font-semibold text-ink-600 transition hover:bg-brand-50 hover:text-brand-700 group-focus-within:bg-brand-50 group-focus-within:text-brand-700 xl:px-3"
      >
        {label}
        <ChevronDown className="size-3.5 text-ink-400 transition group-hover:rotate-180" />
      </Link>

      <div
        className={cn(
          "invisible absolute left-0 top-full z-[60] pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
          isInfo ? "w-[430px]" : "w-[720px]",
        )}
      >
        <div className="mega-panel overflow-hidden rounded-2xl border border-ink-100 bg-white p-4">
          <div className={cn("grid gap-3", isInfo ? "grid-cols-2" : "grid-cols-[1fr_215px]")}>
            <div className={cn("grid gap-1", isInfo ? "grid-cols-1" : "grid-cols-2")}>
              {categories.map((category) => {
                const count = products.filter(
                  (product) => product.category === category,
                ).length;
                return (
                  <Link
                    key={category}
                    href={`/catalogo?categoria=${encodeURIComponent(category)}`}
                    className="group/item flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-brand-50/70"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover/item:bg-white">
                      <CategoryIcon category={category} className="size-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 text-sm font-bold text-ink-900">
                        {category}
                        <ChevronRight className="size-3 text-ink-300 transition group-hover/item:translate-x-0.5 group-hover/item:text-brand-500" />
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">
                        {CATEGORY_META[category]?.description}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-ink-400">
                        {count} produtos
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            {!isInfo && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-800 via-brand-700 to-ink-900 p-4 text-white">
                <span className="absolute -right-5 -top-5 size-20 rounded-full bg-lime-500/20 blur-xl" />
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-lime-400">
                  Tech Note Troca
                </p>
                <p className="mt-2 font-display text-lg font-bold leading-tight">
                  Seu usado vale desconto.
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/65">
                  Avalie em 2 minutos e receba uma oferta na hora.
                </p>
                <Link
                  href="/vender"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-brand-800 transition hover:bg-lime-400 hover:text-ink-950"
                >
                  Avaliar aparelho
                  <ArrowRight className="size-3" />
                </Link>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-white/60">
                  <Heart className="size-3 text-lime-400" />
                  Mais de 50 mil clientes
                </div>
              </div>
            )}
          </div>

          {!isInfo && (
            <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-700 hover:text-brand-800"
              >
                Ver todos os produtos
                <ChevronRight className="size-3" />
              </Link>
              <Link
                href="/catalogo?ofertas=1"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-600 hover:text-brand-700"
              >
                <Flame className="size-3.5 text-sale-500" />
                Ver ofertas da semana
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


