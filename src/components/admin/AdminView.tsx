"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Lock,
  LogOut,
  PackageOpen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORY_ORDER, getLowestCondition, pixPrice } from "@/lib/products";
import { delMedia, mediaKeyFromRef } from "@/lib/media";
import { formatBRL } from "@/lib/format";
import { toast } from "@/store/toast";
import { useCustomProducts } from "@/store/custom-products";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { ProductImage } from "@/components/product/ProductImage";
import { StarRating } from "@/components/ui/StarRating";

const STORAGE_FLAG = "technote:admin";
const ADMIN_PASSWORD = "admin123";

type Mode = { kind: "list" } | { kind: "create" } | { kind: "edit"; product: Product };

export function AdminView() {
  const [authorized, setAuthorized] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const customProducts = useCustomProducts((state) => state.items);
  const upsert = useCustomProducts((state) => state.upsert);
  const remove = useCustomProducts((state) => state.remove);

  useEffect(() => {
    setAuthorized(sessionStorage.getItem(STORAGE_FLAG) === ADMIN_PASSWORD);
    setCheckedAuth(true);
  }, []);

  const stats = useMemo(() => {
    const count = customProducts.length;
    const total = customProducts.reduce(
      (sum, product) => sum + getLowestCondition(product).price,
      0,
    );
    return { count, total };
  }, [customProducts]);

  function login() {
    if (passcode.trim() === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_FLAG, ADMIN_PASSWORD);
      setAuthorized(true);
      setPasscode("");
      toast.success("Acesso liberado", "Bem-vindo ao painel de cadastro da Tech Note.");
    } else {
      toast.info("Senha incorreta", "Dica da demo: use a senha admin123.");
    }
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_FLAG);
    setAuthorized(false);
    setMode({ kind: "list" });
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Excluir “${product.name}” do catálogo?`)) return;
    remove(product.id);
    for (const image of product.images) {
      if (image.startsWith("tnimg:")) {
        await delMedia(mediaKeyFromRef(image));
      }
    }
    toast.info("Produto excluído", `${product.name} saiu do catálogo local.`);
  }

  if (!checkedAuth) return null;

  if (!authorized) {
    return (
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-sm rounded-2xl border border-ink-200/80 bg-white p-6 shadow-soft">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-ink-950">
            Área administrativa
          </h1>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
            Ambiente de demonstração. Informe a senha de acesso ao painel de cadastro
            (demo: <strong className="text-ink-800">admin123</strong>).
          </p>
          <input
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") login();
            }}
            placeholder="Senha do painel"
            className="mt-4 h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={login}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Entrar no painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <section className="border-b border-ink-200/70 bg-gradient-to-br from-ink-950 via-brand-950 to-ink-950 text-white">
        <div className="container-page flex flex-wrap items-start justify-between gap-4 py-8 sm:py-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-lime-400">
              <Boxes className="size-3.5" />
              Painel admin Tech Note
            </span>
            <h1 className="mt-3 font-display text-[26px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[34px]">
              Cadastre produto com fotos direto do site
            </h1>
            <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-white/70">
              Envie imagens do dispositivo ou tire fotos pela câmera. Produtos publicados
              aparecem no catálogo, na busca e na página de detalhe deste navegador.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 px-3.5 text-xs font-bold text-white/90 transition hover:bg-white/10"
          >
            <LogOut className="size-3.5" />
            Sair do painel
          </button>
        </div>
      </section>

      <div className="container-page pt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Produtos cadastrados" value={String(stats.count)} />
          <StatCard label="Ticket médio (a partir de)" value={stats.count ? formatBRL(stats.total / stats.count) : "—"} />
          <StatCard label="Catálogo base + admin" value={String(15 + stats.count)} />
        </div>

        <div className="mt-6">
          {mode.kind === "list" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-950">Meus produtos</h2>
                  <p className="mt-0.5 text-[11.5px] text-ink-500">
                    Salvos neste navegador (localStorage + IndexedDB).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode({ kind: "create" })}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  <Plus className="size-4" />
                  Cadastrar produto
                </button>
              </div>

              {customProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-10 text-center">
                  <PackageOpen className="mx-auto size-10 text-ink-300" />
                  <p className="mt-3 font-display text-base font-bold text-ink-950">
                    Nenhum produto cadastrado ainda
                  </p>
                  <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-relaxed text-ink-500">
                    Cadastre um iPhone, notebook ou acessório com fotos tiradas na hora —
                    ele entra no catálogo, na busca e no checkout.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {customProducts.map((product) => (
                    <li key={product.id}>
                      <AdminProductRow
                        product={product}
                        onEdit={() => setMode({ kind: "edit", product })}
                        onDelete={() => void handleDelete(product)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <AdminProductForm
              product={mode.kind === "edit" ? mode.product : null}
              catalogSave={(saved) => {
                upsert(saved);
                setMode({ kind: "list" });
              }}
              onCancel={() => setMode({ kind: "list" })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <p className="mt-1 font-display text-xl font-extrabold text-ink-950">{value}</p>
    </div>
  );
}

function AdminProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const lowest = getLowestCondition(product);
  return (
    <div className="flex h-full flex-col rounded-2xl border border-ink-200/80 bg-white p-3 shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ink-200/70">
        <ProductImage src={product.image} alt={product.name} sizes="280px" className="object-cover" />
        <span className="absolute left-2 top-2 rounded-md bg-ink-950/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          {product.category}
        </span>
      </div>
      <p className="mt-2.5 line-clamp-1 text-[13px] font-semibold text-ink-900">{product.name}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-brand-700">
          {formatBRL(pixPrice(lowest.price))} <span className="text-[10px] text-ink-400">no Pix</span>
        </span>
        <StarRating rating={product.rating} count={product.reviewCount} />
      </div>
      <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 text-[11px] font-bold text-ink-800 transition hover:border-brand-300 hover:text-brand-700"
        >
          <Pencil className="size-3" />
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Excluir ${product.name}`}
          className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-rose-300 hover:text-rose-600"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
