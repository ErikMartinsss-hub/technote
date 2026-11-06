import { NextResponse } from "next/server";
import {
  DEFAULT_ANSWERS,
  calculateTradeIn,
  type TradeInAnswers,
} from "@/lib/tradein";

export async function POST(request: Request) {
  let body: {
    modelId?: string;
    storage?: string;
    answers?: Partial<TradeInAnswers>;
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ler os dados enviados." },
      { status: 400 },
    );
  }

  if (!body.modelId) {
    return NextResponse.json(
      { error: "Selecione o modelo do aparelho." },
      { status: 400 },
    );
  }

  const answers = { ...DEFAULT_ANSWERS, ...body.answers };
  const quote = calculateTradeIn(body.modelId, body.storage ?? "", answers);

  if (!quote) {
    return NextResponse.json(
      { error: "Modelo não encontrado na tabela de avaliação." },
      { status: 404 },
    );
  }

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  return NextResponse.json({
    quote: {
      offer: quote.offer,
      creditOffer: quote.creditOffer,
      base: quote.base,
      deductions: quote.deductions,
      summary: quote.summary,
      model: quote.model.label,
      brand: quote.model.brand,
      storage: quote.storage,
      category: quote.category.label,
    },
    validUntil: validUntil.toISOString(),
  });
}
