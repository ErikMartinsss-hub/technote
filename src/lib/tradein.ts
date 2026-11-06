import tradeinData from "@/data/tradein.json";

export interface TradeInStorage {
  label: string;
  base: number;
}

export interface TradeInModel {
  id: string;
  brand: string;
  label: string;
  year: number;
  storages: TradeInStorage[];
}

export interface TradeInCategory {
  id: string;
  label: string;
  description: string;
  models: TradeInModel[];
}

export const TRADEIN_CATEGORIES = tradeinData.categories as TradeInCategory[];

export type PowerAnswer = "sim" | "nao";
export type ScreenAnswer = "intacta" | "riscos" | "trincada";
export type BodyAnswer = "sem-marcas" | "leves" | "amassados";
export type BatteryAnswer = "acima-90" | "entre-80-90" | "abaixo-80" | "nao-sei";
export type AccessoriesAnswer = "completo" | "carregador" | "nenhum";
export type AccountAnswer = "desvinculada" | "vinculada";

export interface TradeInAnswers {
  powersOn: PowerAnswer;
  screen: ScreenAnswer;
  body: BodyAnswer;
  battery: BatteryAnswer;
  accessories: AccessoriesAnswer;
  account: AccountAnswer;
}

export const DEFAULT_ANSWERS: TradeInAnswers = {
  powersOn: "sim",
  screen: "intacta",
  body: "sem-marcas",
  battery: "acima-90",
  accessories: "completo",
  account: "desvinculada",
};

export const QUESTION_OPTIONS = {
  powersOn: [
    { value: "sim", label: "Sim, liga normalmente" },
    { value: "nao", label: "Não liga ou está com defeito" },
  ],
  screen: [
    { value: "intacta", label: "Intacta, sem trincas" },
    { value: "riscos", label: "Riscos leves, sem trincas" },
    { value: "trincada", label: "Tela trincada ou quebrada" },
  ],
  body: [
    { value: "sem-marcas", label: "Sem marcas de uso" },
    { value: "leves", label: "Leves riscos ou amassados" },
    { value: "amassados", label: "Marcas profundas" },
  ],
  battery: [
    { value: "acima-90", label: "Acima de 90%" },
    { value: "entre-80-90", label: "Entre 80% e 90%" },
    { value: "abaixo-80", label: "Abaixo de 80%" },
    { value: "nao-sei", label: "Não sei informar" },
  ],
  accessories: [
    { value: "completo", label: "Caixa e carregador" },
    { value: "carregador", label: "Apenas carregador" },
    { value: "nenhum", label: "Nenhum acessório" },
  ],
  account: [
    { value: "desvinculada", label: "Sim, já desvinculei" },
    { value: "vinculada", label: "Não, ainda está vinculada" },
  ],
} as const;

const SCREEN_FACTOR: Record<ScreenAnswer, number> = {
  intacta: 1,
  riscos: 0.92,
  trincada: 0.65,
};

const BODY_FACTOR: Record<BodyAnswer, number> = {
  "sem-marcas": 1,
  leves: 0.92,
  amassados: 0.78,
};

const BATTERY_FACTOR: Record<BatteryAnswer, number> = {
  "acima-90": 1,
  "entre-80-90": 0.95,
  "abaixo-80": 0.85,
  "nao-sei": 0.9,
};

const ACCESSORIES_FACTOR: Record<AccessoriesAnswer, number> = {
  completo: 1.03,
  carregador: 1,
  nenhum: 0.97,
};

const ACCOUNT_FACTOR: Record<AccountAnswer, number> = {
  desvinculada: 1,
  vinculada: 0.9,
};

export function findTradeInModel(modelId: string) {
  for (const category of TRADEIN_CATEGORIES) {
    const model = category.models.find((item) => item.id === modelId);
    if (model) return { category, model };
  }
  return null;
}

export function getTradeInBrands(categoryId: string) {
  const category = TRADEIN_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) return [];
  return [...new Set(category.models.map((model) => model.brand))];
}

export function getTradeInModels(categoryId: string, brand: string) {
  const category = TRADEIN_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) return [];
  return category.models.filter((model) => model.brand === brand);
}

export interface TradeInDeduction {
  label: string;
  percent: number;
  amount: number;
  kind: "discount" | "bonus";
}

export interface TradeInQuote {
  model: TradeInModel;
  category: TradeInCategory;
  storage: string;
  base: number;
  offer: number;
  creditOffer: number;
  multiplier: number;
  deductions: TradeInDeduction[];
  summary: string;
}

export function calculateTradeIn(
  modelId: string,
  storageLabel: string,
  answers: TradeInAnswers,
): TradeInQuote | null {
  const found = findTradeInModel(modelId);
  if (!found) return null;

  const storage =
    found.model.storages.find((item) => item.label === storageLabel) ??
    found.model.storages[0];

  const factors: Array<{ label: string; factor: number }> = [
    {
      label:
        answers.powersOn === "sim"
          ? "Aparelho liga e funciona"
          : "Aparelho não liga ou tem defeito",
      factor: answers.powersOn === "sim" ? 1 : 0.35,
    },
    {
      label:
        answers.screen === "intacta"
          ? "Tela intacta"
          : answers.screen === "riscos"
            ? "Riscos leves na tela"
            : "Tela trincada",
      factor: SCREEN_FACTOR[answers.screen],
    },
    {
      label:
        answers.body === "sem-marcas"
          ? "Carcaça sem marcas"
          : answers.body === "leves"
            ? "Marcas leves na carcaça"
            : "Marcas profundas na carcaça",
      factor: BODY_FACTOR[answers.body],
    },
    {
      label:
        answers.battery === "nao-sei"
          ? "Saúde da bateria não informada"
          : `Bateria: ${answers.battery.replace("-", " ")}`,
      factor: BATTERY_FACTOR[answers.battery],
    },
    {
      label:
        answers.accessories === "completo"
          ? "Com caixa e carregador"
          : answers.accessories === "carregador"
            ? "Com carregador"
            : "Sem acessórios",
      factor: ACCESSORIES_FACTOR[answers.accessories],
    },
    {
      label:
        answers.account === "desvinculada"
          ? "Conta desvinculada"
          : "Conta ainda vinculada",
      factor: ACCOUNT_FACTOR[answers.account],
    },
  ];

  const multiplier = factors.reduce((total, item) => total * item.factor, 1);
  const rawOffer = storage.base * multiplier;
  const offer = Math.max(20, Math.floor(rawOffer / 10) * 10);

  let running = storage.base;
  const deductions = factors
    .filter((item) => item.factor !== 1)
    .map((item) => {
      const next = running * item.factor;
      const amount = Math.round(Math.abs(running - next) * 100) / 100;
      running = next;
      return {
        label: item.label,
        percent: Math.round((item.factor - 1) * 100),
        amount,
        kind: item.factor > 1 ? ("bonus" as const) : ("discount" as const),
      };
    });

  const summary =
    answers.powersOn === "nao"
      ? "Seu aparelho precisa de reparo. A oferta considera o valor de recuperação."
      : answers.screen === "trincada"
        ? "A oferta já considera o custo de troca da tela."
        : "Oferta calculada com base na condição informada. A avaliação final confirma os dados.";

  return {
    model: found.model,
    category: found.category,
    storage: storage.label,
    base: storage.base,
    offer,
    creditOffer: Math.floor((offer * 1.1) / 10) * 10,
    multiplier,
    deductions,
    summary,
  };
}
