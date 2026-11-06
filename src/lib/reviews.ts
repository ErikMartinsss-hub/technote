import type { Product } from "@/lib/types";

const REVIEWERS = [
  "Mariana Alves",
  "Rafael Souza",
  "Camila Ribeiro",
  "Bruno Martins",
  "Juliana Costa",
  "Thiago Oliveira",
  "Fernanda Lima",
  "Lucas Pereira",
];

const COMMENTS: Record<string, string[]> = {
  Celulares: [
    "Chegou impecável, muito melhor do que eu esperava. A bateria está ótima e o aparelho não tem nenhuma marca.",
    "Comprei como presente e foi um sucesso. Veio bem embalado, com garantia e nota fiscal. Recomendo a Tech Note.",
    "Aparelho rápido, tela perfeita e bateria aguentando o dia inteiro. Custo-benefício excelente.",
    "Já é a segunda compra que faço aqui. Tudo funcionando perfeitamente e a entrega chegou antes do prazo.",
  ],
  Notebooks: [
    "Notebook muito conservado, teclado e tela sem defeitos. Ideal para o trabalho do dia a dia.",
    "Chegou com todos os acessórios e muito bem embalado. Ligou na hora e já está atualizado.",
    "Ótimo custo-benefício. Uso para faculdade e programação e tem dado conta tranquilamente.",
    "A bateria dura o suficiente para um turno inteiro de trabalho. Recomendo!",
  ],
  Tablets: [
    "Tela excelente para assistir e ler. O tablet chegou sem nenhum arranhão e funcionando perfeitamente.",
    "Uso para estudar e tomar notas todos os dias. A bateria é ótima e o aparelho é leve.",
    "Bem embalado, com carregador e garantia. Superou minhas expectativas.",
  ],
  Smartwatches: [
    "O relógio chegou praticamente novo. Bateria saudável e todos os sensores funcionando.",
    "Ótima compra para acompanhar treinos. Pulseira inclusa e sem marcas de uso.",
    "Entrega rápida e produto exatamente como descrito no anúncio.",
  ],
  Acessórios: [
    "Som excelente e bateria durando muito. Chegou em perfeito estado e bem embalado.",
    "Parece novo de fábrica. Funciona perfeitamente e veio com todos os acessórios.",
    "Comprei para presentear e a pessoa amou. Qualidade impecável.",
  ],
};

export interface Review {
  name: string;
  initials: string;
  date: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
}

export function getReviews(product: Product): Review[] {
  const seed = product.id
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const comments = COMMENTS[product.category] ?? COMMENTS.Celulares;
  const titles = [
    "Superou as expectativas",
    "Produto impecável",
    "Entrega rápida e produto novo",
    "Valeu cada centavo",
  ];

  return Array.from({ length: 3 }, (_, index) => {
    const name = REVIEWERS[(seed + index * 3) % REVIEWERS.length];
    const date = new Date();
    date.setDate(date.getDate() - (index * 9 + (seed % 12) + 2));
    return {
      name,
      initials: name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join(""),
      date: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date),
      rating: index === 2 ? 4 : 5,
      title: titles[(seed + index) % titles.length],
      comment: comments[(seed + index) % comments.length],
      verified: true,
    };
  });
}

export function getRatingBreakdown(product: Product) {
  const five = Math.round(product.reviewCount * 0.78);
  const four = Math.round(product.reviewCount * 0.15);
  const three = Math.round(product.reviewCount * 0.05);
  const two = Math.round(product.reviewCount * 0.015);
  const one = Math.max(product.reviewCount - five - four - three - two, 0);
  return [
    { stars: 5, count: five },
    { stars: 4, count: four },
    { stars: 3, count: three },
    { stars: 2, count: two },
    { stars: 1, count: one },
  ];
}
