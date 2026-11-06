"use client";

import { useState } from "react";
import { Loader2, MapPin, ShieldCheck, Truck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { usePreferences } from "@/store/preferences";
import { toast } from "@/store/toast";
import { formatCep, onlyDigits } from "@/lib/format";

interface CepModalProps {
  open: boolean;
  onClose: () => void;
}

export function CepModal({ open, onClose }: CepModalProps) {
  const cep = usePreferences((state) => state.cep);
  const city = usePreferences((state) => state.city);
  const state = usePreferences((state) => state.state);
  const setLocation = usePreferences((store) => store.setLocation);
  const [value, setValue] = useState(cep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = onlyDigits(value);
    if (digits.length !== 8) {
      setError("Digite um CEP válido com 8 dígitos.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: digits, subtotal: 499 }),
      });
      const data = (await response.json()) as {
        cep?: string;
        city?: string;
        state?: string;
        error?: string;
      };
      if (!response.ok || !data.cep || !data.city || !data.state) {
        throw new Error(data.error ?? "Não foi possível consultar o CEP.");
      }

      setLocation({ cep: data.cep, city: data.city, state: data.state });
      toast.success(
        "CEP atualizado!",
        `Entregamos em ${data.city} (${data.state}) com frete grátis acima de R$ 499.`,
      );
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro ao consultar o CEP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Calcular frete e prazo"
      description="Informe seu CEP para ver as opções de entrega para a sua região."
    >
      {cep && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-3 text-sm text-brand-800">
          <MapPin className="size-4 shrink-0" />
          <span>
            Entregando em <strong>{city} ({state})</strong> — CEP {cep}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-700">
            CEP
          </span>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
              <input
                value={value}
                onChange={(event) => {
                  setValue(formatCep(event.target.value));
                  setError("");
                }}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                aria-label="CEP"
                className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-sm font-medium text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Calculando" : "Calcular"}
            </button>
          </div>
        </label>

        {error && (
          <p role="alert" className="text-xs font-medium text-rose-600">
            {error}
          </p>
        )}

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-xl border border-ink-100 bg-ink-50/60 p-3">
            <Truck className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <div>
              <p className="text-xs font-semibold text-ink-800">Frete grátis</p>
              <p className="text-[11px] leading-relaxed text-ink-500">
                Em compras acima de R$ 499 para todo o Brasil.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-ink-100 bg-ink-50/60 p-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-semibold text-ink-800">Entrega segura</p>
              <p className="text-[11px] leading-relaxed text-ink-500">
                Embalagem reforçada e rastreamento completo.
              </p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
