"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  ChevronRight,
  Flame,
  HandCoins,
  Headset,
  Heart,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CATEGORY_META, products } from "@/lib/products";
import { usePreferences } from "@/store/preferences";
import { useUser } from "@/store/user";
import { firstName } from "@/lib/format";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenCep: () => void;
}

const categories = ["Celulares", "Notebooks", "Tablets", "Smartwatches", "Acessórios"];

export function MobileMenu({ open, onClose, onOpenCep }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  const cep = usePreferences((state) => state.cep);
  const city = usePreferences((state) => state.city);
  const stateUf = usePreferences((state) => state.state);
  const isLoggedIn = useUser((store) => store.isLoggedIn);
  const userName = useUser((store) => store.name);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[108] lg:hidden">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar menu"
        className="absolute inset-0 bg-ink-950/55 backdrop-blur-[2px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className="absolute inset-y-0 left-0 flex w-[88%] max-w-[390px] flex-col overflow-y-auto bg-white shadow-2xl animate-drawer"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="grid size-9 place-items-center rounded-full bg-ink-50 text-ink-500 transition hover:bg-ink-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <Link
            href="/vender"
            onClick={onClose}
            className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-4 text-white shadow-[0_16px_30px_-16px_rgba(151,109,14,0.55)]"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime-400">
                Tech Note Troca
              </p>
              <p className="mt-0.5 text-base font-bold">Venda seu aparelho</p>
              <p className="text-xs text-white/70">Oferta na hora, pagamento rápido.</p>
            </div>
            <HandCoins className="size-8 shrink-0 text-lime-400" />
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCep();
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-ink-200 px-3.5 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50/50"
          >
            <MapPin className="size-4 shrink-0 text-brand-600" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-400">
                Enviar para
              </span>
              <span className="block truncate text-sm font-semibold text-ink-800">
                {cep ? `${city} (${stateUf}) — ${cep}` : "Informe seu CEP"}
              </span>
            </span>
            <ChevronRight className="size-4 text-ink-400" />
          </button>

          <Link
            href="/catalogo"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-ink-50 px-3.5 py-3 text-sm font-semibold text-ink-600 transition hover:bg-ink-100"
          >
            <Search className="size-4" />
            Buscar no catálogo
          </Link>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Categorias
            </p>
            <ul className="space-y-0.5">
              {categories.map((category) => {
                const count = products.filter(
                  (product) => product.category === category,
                ).length;
                return (
                  <li key={category}>
                    <Link
                      href={`/catalogo?categoria=${encodeURIComponent(category)}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-ink-50"
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                        <CategoryIcon category={category} className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink-800">
                          {category}
                        </span>
                        <span className="block truncate text-[11px] text-ink-400">
                          {CATEGORY_META[category]?.description}
                        </span>
                      </span>
                      <span className="text-[10px] font-semibold text-ink-400">
                        {count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/catalogo?ofertas=1"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2.5 text-xs font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              <BadgePercent className="size-4 text-brand-600" />
              Ofertas
            </Link>
            <Link
              href="/catalogo?ofertas=1&ordenar=desconto"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl bg-ink-950 px-3 py-2.5 text-xs font-bold text-lime-400"
            >
              <Flame className="size-4" />
              BLACK FRIDAY
            </Link>
          </div>

          <div className="border-t border-ink-100 pt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Minha conta
            </p>
            <Link
              href="/conta"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-ink-50"
            >
              <User className="size-4 text-ink-400" />
              {isLoggedIn ? `Olá, ${firstName(userName)}` : "Entrar ou criar conta"}
              <ArrowRight className="ml-auto size-4 text-ink-300" />
            </Link>
            <Link
              href="/conta?aba=pedidos"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-ink-50"
            >
              <Package className="size-4 text-ink-400" />
              Meus pedidos
            </Link>
            <Link
              href="/conta?aba=favoritos"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-ink-50"
            >
              <Heart className="size-4 text-ink-400" />
              Favoritos
            </Link>
          </div>
        </div>

        <div className="mt-auto border-t border-ink-100 bg-ink-50/70 px-5 py-4">
          <div className="flex items-center gap-2 text-[11px] font-medium text-ink-500">
            <ShieldCheck className="size-4 text-emerald-600" />
            Garantia de 12 meses em todos os produtos
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-ink-500">
            <Headset className="size-4 text-brand-600" />
            Atendimento de segunda a sábado
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
