import { onlyDigits } from "@/lib/format";

export interface ShippingOption {
  id: "pac" | "sedex" | "retirada";
  label: string;
  description: string;
  price: number;
  days: string;
  badge?: string;
}

const REGIONS: Record<string, { city: string; state: string }> = {
  "0": { city: "São Paulo", state: "SP" },
  "1": { city: "São Paulo", state: "SP" },
  "2": { city: "Rio de Janeiro", state: "RJ" },
  "3": { city: "Belo Horizonte", state: "MG" },
  "4": { city: "Salvador", state: "BA" },
  "5": { city: "Recife", state: "PE" },
  "6": { city: "Fortaleza", state: "CE" },
  "7": { city: "Brasília", state: "DF" },
  "8": { city: "Curitiba", state: "PR" },
  "9": { city: "Porto Alegre", state: "RS" },
};

export function lookupCep(cep: string) {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  const region = REGIONS[digits[0]] ?? REGIONS["0"];
  return {
    cep: `${digits.slice(0, 5)}-${digits.slice(5)}`,
    city: region.city,
    state: region.state,
  };
}

export function getShippingOptions(subtotal: number): ShippingOption[] {
  const pacFree = subtotal >= 499;
  const sedexFree = subtotal >= 1999;

  return [
    {
      id: "pac",
      label: "PAC",
      description: "Entrega econômica para todo o Brasil",
      price: pacFree ? 0 : 19.9,
      days: "4 a 8 dias úteis",
      badge: pacFree ? "Grátis" : undefined,
    },
    {
      id: "sedex",
      label: "SEDEX",
      description: "Prioridade na separação e entrega",
      price: sedexFree ? 0 : 29.9,
      days: "2 a 4 dias úteis",
      badge: sedexFree ? "Grátis" : undefined,
    },
    {
      id: "retirada",
      label: "Retirar na loja",
      description: "Retirada gratuita em São Paulo (SP)",
      price: 0,
      days: "Pronto em 2 horas",
      badge: "Grátis",
    },
  ];
}

export function findShippingOption(subtotal: number, id: string) {
  return getShippingOptions(subtotal).find((option) => option.id === id);
}

export function estimateDelivery(days: string) {
  const match = days.match(/(\d+)\s*a\s*(\d+)/);
  const maxDays = match ? Number(match[2]) : 6;
  const date = new Date();
  date.setDate(date.getDate() + maxDays);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
