"use client";

import { useMemo, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORY_ORDER } from "@/lib/products";
import { delMedia, mediaKeyFromRef, putMedia } from "@/lib/media";
import { isMediaRef } from "@/lib/media";
import { cn, formatBRL } from "@/lib/format";
import { toast } from "@/store/toast";
import { AdminPhotoPicker, type AdminShot } from "@/components/admin/AdminPhotoPicker";

const BRAND_SUGGESTIONS = ["Apple", "Samsung", "Dell", "Motorola", "Xiaomi", "JBL", "Lenovo", "Asus"];
const STORAGE_SUGGESTIONS = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "41 mm", "44 mm"];
const BADGES = [
  { id: "", label: "Sem selo" },
  { id: "CUSTO-BENEFÍCIO", label: "Custo-benefício" },
  { id: "OFERTA", label: "Oferta" },
  { id: "MAIS VENDIDO", label: "Mais vendido" },
];
const COUPONS = [
  { id: "", label: "Sem cupom" },
  { id: "TECH10", label: "TECH10 — 10% OFF" },
  { id: "NOTE10", label: "NOTE10 — 10% OFF" },
  { id: "FRETEGRATIS", label: "FRETEGRATIS — frete grátis" },
];

const CATEGORY_DEFAULT_SPECS: Record<string, [string, string][]> = {
  Celulares: [
    ["Garantia", "12 meses Tech Note"],
    ["Bateria", "Testada e saudável"],
    ["Rede", "Desbloqueado para todas as operadoras"],
  ],
  Notebooks: [
    ["Garantia", "12 meses Tech Note"],
    ["Bateria", "Ciclos revisados"],
    ["Sistema", "macOS reinstalado"],
  ],
  Tablets: [
    ["Garantia", "12 meses Tech Note"],
    ["Bateria", "Testada e saudável"],
    ["Conectividade", "Wi-Fi"],
  ],
  Smartwatches: [
    ["Garantia", "12 meses Tech Note"],
    ["Bateria", "Saúde verificada"],
    ["Pulseira", "Inclusa"],
  ],
  Acessórios: [
    ["Garantia", "12 meses Tech Note"],
    ["Compatibilidade", "Informada na descrição"],
  ],
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSpecs(value: string): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const line of parseLines(value)) {
    const split = line.indexOf(":");
    const key = split > 0 ? line.slice(0, split).trim() : "";
    const val = split > 0 ? line.slice(split + 1).trim() : line;
    if (key && val) specs[key] = val;
  }
  return specs;
}

function specsToText(specs: Record<string, string>) {
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

interface FormState {
  name: string;
  brand: string;
  model: string;
  category: string;
  storage: string;
  color: string;
  screen: string;
  releaseYear: string;
  priceBom: string;
  priceMuitoBom: string;
  priceExcelente: string;
  stock: string;
  rating: string;
  reviewCount: string;
  description: string;
  highlights: string;
  specs: string;
  badge: string;
  offer: boolean;
  bestSeller: boolean;
  coupon: string;
  imageFit: "cover" | "contain";
}

function defaultPrices(base: string) {
  const value = Number(base.replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return { bom: "", muitoBom: "", excelente: "" };
  const round = (input: number) => String(Math.round(input * 100) / 100);
  return {
    bom: String(value),
    muitoBom: round(value * 1.08),
    excelente: round(value * 1.16),
  };
}

interface AdminProductFormProps {
  product: Product | null;
  catalogSave: (product: Product) => void;
  onCancel: () => void;
}

export function AdminProductForm({ product, catalogSave, onCancel }: AdminProductFormProps) {
  const editing = useMemo(() => Boolean(product), [product]);
  const [shots, setShots] = useState<AdminShot[]>(() =>
    (product?.images ?? [])
      .filter(isMediaRef)
      .map((ref) => ({ id: `s-${mediaKeyFromRef(ref)}`, key: mediaKeyFromRef(ref) })),
  );
  const originalKeys = useMemo(
    () => (product?.images ?? []).filter(isMediaRef).map(mediaKeyFromRef),
    [product],
  );

  const [form, setForm] = useState<FormState>(() =>
    buildFormState(product ?? null),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((state) => ({ ...state, [key]: value }));
    setErrors((state) => ({ ...state, [key]: "" }));
  }

  function handleBasePrice(value: string) {
    const generated = defaultPrices(value);
    setForm((state) => ({
      ...state,
      priceBom: value,
      priceMuitoBom: generated.muitoBom || state.priceMuitoBom,
      priceExcelente: generated.excelente || state.priceExcelente,
    }));
  }

  async function save() {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Informe o nome do produto.";
    if (!form.brand.trim()) nextErrors.brand = "Informe a marca.";
    if (!form.model.trim()) nextErrors.model = "Informe o modelo.";
    if (!Number(form.priceBom) || Number(form.priceBom) <= 0)
      nextErrors.priceBom = "Informe o preço da condição “Bom”.";
    if (!Number(form.priceMuitoBom) || !Number(form.priceExcelente))
      nextErrors.priceBom = nextErrors.priceBom ?? "Confira os preços por condição.";
    if (!form.description.trim()) nextErrors.description = "Escreva uma descrição para o produto.";
    if (shots.length === 0) nextErrors.photos = "Adicione ao menos uma foto (upload ou câmera).";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.info("Revise o formulário", "Alguns campos obrigatórios precisam de atenção.");
      return;
    }

    setSaving(true);
    try {
      const usedKeys: string[] = [];
      for (const shot of shots) {
        if (shot.key) {
          usedKeys.push(shot.key);
          continue;
        }
        if (!shot.blob) continue;
        const key = `img-${crypto.randomUUID()}`;
        await putMedia(key, shot.blob);
        usedKeys.push(key);
      }
      for (const key of originalKeys) {
        if (!usedKeys.includes(key)) void delMedia(key);
      }

      const id = product?.id ?? `custom-${crypto.randomUUID().slice(0, 8)}`;
      const slug = product?.slug ?? `${slugify(form.name) || "produto"}-${id.replace("custom-", "")}`;

      const newProduct: Product = {
        id,
        slug,
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        model: form.model.trim(),
        storage: form.storage.trim() || "—",
        color: form.color.trim() || "—",
        screen: form.screen.trim() || "—",
        image: `tnimg:${usedKeys[0]}`,
        images: usedKeys.map((key) => `tnimg:${key}`),
        imageFit: form.imageFit,
        badge: form.badge || null,
        coupon: form.coupon || null,
        offer: form.offer,
        bestSeller: form.bestSeller,
        rating: Math.min(5, Math.max(3.5, Number(form.rating) || 4.7)),
        reviewCount: Math.max(3, Number(form.reviewCount) || 24),
        sold: Math.max(10, (Number(form.reviewCount) || 24) * 2),
        releaseYear: Number(form.releaseYear) || new Date().getFullYear() - 2,
        conditions: [
          {
            id: "excelente",
            label: "Excelente",
            description: "Sem marcas de uso. Bateria acima de 90%.",
            price: Number(form.priceExcelente),
            stock: Math.max(0, Number(form.stock) || 4),
          },
          {
            id: "muito-bom",
            label: "Muito bom",
            description: "Leves sinais de uso. Bateria acima de 85%.",
            price: Number(form.priceMuitoBom),
            stock: Math.max(0, Number(form.stock) || 5),
          },
          {
            id: "bom",
            label: "Bom",
            description: "Marcas visíveis de uso. Bateria acima de 80%.",
            price: Number(form.priceBom),
            stock: Math.max(0, Number(form.stock) || 6),
          },
        ],
        specs: parseSpecs(form.specs),
        highlights: parseLines(form.highlights).length
          ? parseLines(form.highlights)
          : ["Testado e revisado pela equipe Tech Note"],
        description: form.description.trim(),
      };

      catalogSave(newProduct);
      toast.success("Produto salvo!", `${newProduct.name} já está no catálogo do site.`);
    } catch {
      toast.info("Não foi possível salvar", "Verifique as fotos e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const basePrice = Number(form.priceBom) || 0;
  const fieldClass =
    "h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

  return (
    <div className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-950">
            {editing ? "Editar produto" : "Cadastrar produto"}
          </h2>
          <p className="mt-0.5 text-[11.5px] text-ink-500">
            Preencha os dados, adicione fotos (upload ou câmera) e publique no catálogo.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-xs font-bold text-ink-700 transition hover:border-ink-300"
        >
          <X className="size-3.5" />
          Fechar
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <label className="lg:col-span-2">
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Nome do produto *</span>
          <input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex.: Apple iPhone 12 128GB" className={fieldClass} />
          {errors.name && <span className="mt-1 block text-[10.5px] font-medium text-rose-600">{errors.name}</span>}
        </label>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Marca *</span>
          <input list="admin-brands" value={form.brand} onChange={(e) => setField("brand", e.target.value)} placeholder="Apple" className={fieldClass} />
          <datalist id="admin-brands">{BRAND_SUGGESTIONS.map((b) => <option key={b} value={b} />)}</datalist>
          {errors.brand && <span className="mt-1 block text-[10.5px] font-medium text-rose-600">{errors.brand}</span>}
        </label>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Modelo *</span>
          <input value={form.model} onChange={(e) => setField("model", e.target.value)} placeholder="iPhone 12" className={fieldClass} />
          {errors.model && <span className="mt-1 block text-[10.5px] font-medium text-rose-600">{errors.model}</span>}
        </label>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Categoria *</span>
          <select
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            className={cn(fieldClass, "appearance-none font-medium")}
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Armazenamento / tamanho</span>
          <input list="admin-storages" value={form.storage} onChange={(e) => setField("storage", e.target.value)} placeholder="128 GB" className={fieldClass} />
          <datalist id="admin-storages">{STORAGE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
        </label>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Cor</span>
          <input value={form.color} onChange={(e) => setField("color", e.target.value)} placeholder="Azul" className={fieldClass} />
        </label>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Tela / exibição</span>
          <input value={form.screen} onChange={(e) => setField("screen", e.target.value)} placeholder='6,1" OLED' className={fieldClass} />
        </label>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Ano de lançamento</span>
          <input value={form.releaseYear} onChange={(e) => setField("releaseYear", e.target.value)} inputMode="numeric" placeholder="2020" className={fieldClass} />
        </label>

        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Estoque por condição</span>
          <input value={form.stock} onChange={(e) => setField("stock", e.target.value)} inputMode="numeric" placeholder="6" className={fieldClass} />
        </label>
      </div>

      <div className="mt-5 rounded-2xl border border-ink-200/80 bg-ink-50/60 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-600">Preços por condição</p>
        <p className="mt-0.5 text-[10.5px] text-ink-500">Base do campo "Bom" preenche os demais automaticamente (multiplicadores transparentes).</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="mb-1 block text-[11px] font-semibold text-ink-700">Bom (base) *</span>
            <input value={form.priceBom} onChange={(e) => handleBasePrice(e.target.value)} placeholder="2399" inputMode="decimal" className={fieldClass} />
          </label>
          <label>
            <span className="mb-1 block text-[11px] font-semibold text-ink-700">Muito bom *</span>
            <input value={form.priceMuitoBom} onChange={(e) => setField("priceMuitoBom", e.target.value)} inputMode="decimal" className={fieldClass} />
          </label>
          <label>
            <span className="mb-1 block text-[11px] font-semibold text-ink-700">Excelente *</span>
            <input value={form.priceExcelente} onChange={(e) => setField("priceExcelente", e.target.value)} inputMode="decimal" className={fieldClass} />
          </label>
        </div>
        {basePrice > 0 && (
          <p className="mt-2 text-[10.5px] font-semibold text-ink-600">
            A partir de {formatBRL(Number(form.priceBom) || 0)} — Pix: {formatBRL(Math.round((Number(form.priceBom) * 0.95 + Number.EPSILON) * 100) / 100)}
          </p>
        )}
        {errors.priceBom && <span className="mt-1 block text-[10.5px] font-medium text-rose-600">{errors.priceBom}</span>}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_240px]">
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Descrição *</span>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={4}
            placeholder="Ex.: iPhone 12 revisado, bateria acima de 85%, acompanha caixa e cabo USB-C."
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          {errors.description && <span className="mt-1 block text-[10.5px] font-medium text-rose-600">{errors.description}</span>}
        </label>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-ink-700">Nota média</span>
            <input value={form.rating} onChange={(e) => setField("rating", e.target.value)} inputMode="decimal" placeholder="4.8" className={fieldClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-ink-700">Nº de avaliações</span>
            <input value={form.reviewCount} onChange={(e) => setField("reviewCount", e.target.value)} inputMode="numeric" placeholder="24" className={fieldClass} />
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Destaques (um por linha)</span>
          <textarea value={form.highlights} onChange={(e) => setField("highlights", e.target.value)} rows={3} placeholder="Bateria acima de 85%" className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Especificações (formato “chave: valor”)</span>
          <textarea value={form.specs} onChange={(e) => setField("specs", e.target.value)} rows={3} placeholder="Garantia: 12 meses Tech Note" className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Selo no card</span>
          <select value={form.badge} onChange={(e) => setField("badge", e.target.value)} className={cn(fieldClass, "appearance-none font-medium")}>
            {BADGES.map((badge) => (
              <option key={badge.id} value={badge.id}>{badge.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-semibold text-ink-700">Cupom</span>
          <select value={form.coupon} onChange={(e) => setField("coupon", e.target.value)} className={cn(fieldClass, "appearance-none font-medium")}>
            {COUPONS.map((coupon) => (
              <option key={coupon.id} value={coupon.id}>{coupon.label}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-4 text-[12px] font-semibold text-ink-700">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.offer} onChange={(e) => setField("offer", e.target.checked)} className="size-4 accent-[#976d0e]" />
            Em oferta
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.bestSeller} onChange={(e) => setField("bestSeller", e.target.checked)} className="size-4 accent-[#976d0e]" />
            Mais vendido
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.imageFit === "cover"} onChange={(e) => setField("imageFit", e.target.checked ? "cover" : "contain")} className="size-4 accent-[#976d0e]" />
            Fotos ocupam o card (cover)
          </label>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-ink-200/80 bg-ink-50/60 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-600">Fotos do produto *</p>
        <div className="mt-3">
          <AdminPhotoPicker shots={shots} onChange={setShots} />
          {errors.photos && <span className="mt-1 block text-[10.5px] font-medium text-rose-600">{errors.photos}</span>}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-xl border border-ink-200 px-4 text-sm font-bold text-ink-800 transition hover:border-ink-300"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Salvando…" : editing ? "Salvar alterações" : "Publicar no catálogo"}
        </button>
      </div>
    </div>
  );
}

function buildFormState(product: Product | null): FormState {
  if (!product) {
    return {
      name: "",
      brand: "",
      model: "",
      category: "Celulares",
      storage: "",
      color: "",
      screen: "",
      releaseYear: String(new Date().getFullYear() - 2),
      priceBom: "",
      priceMuitoBom: "",
      priceExcelente: "",
      stock: "6",
      rating: "4.8",
      reviewCount: "24",
      description: "",
      highlights: "",
      specs: (CATEGORY_DEFAULT_SPECS.Celulares ?? []).map(([k, v]) => `${k}: ${v}`).join("\n"),
      badge: "",
      offer: false,
      bestSeller: false,
      coupon: "",
      imageFit: "cover",
    };
  }

  const bom = product.conditions.find((c) => c.id === "bom") ?? product.conditions[2];
  const muitoBom = product.conditions.find((c) => c.id === "muito-bom") ?? product.conditions[1];
  const excelente = product.conditions.find((c) => c.id === "excelente") ?? product.conditions[0];

  const badgeKey = product.badge ?? "";
  return {
    name: product.name,
    brand: product.brand,
    model: product.model === "—" ? "" : product.model,
    category: product.category,
    storage: product.storage === "—" ? "" : product.storage,
    color: product.color === "—" ? "" : product.color,
    screen: product.screen === "—" ? "" : product.screen,
    releaseYear: String(product.releaseYear ?? "") || "",
    priceBom: String(bom?.price ?? ""),
    priceMuitoBom: String(muitoBom?.price ?? ""),
    priceExcelente: String(excelente?.price ?? ""),
    stock: String(Math.min(...product.conditions.map((c) => c.stock)) || 6),
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
    description: product.description,
    highlights: product.highlights.join("\n"),
    specs: specsToText(product.specs),
    badge: BADGES.some((b) => b.id === badgeKey) ? badgeKey : "",
    offer: product.offer,
    bestSeller: product.bestSeller,
    coupon: product.coupon && COUPONS.some((c) => c.id === product.coupon) ? product.coupon : "",
    imageFit: product.imageFit === "contain" ? "contain" : "cover",
  };
}
