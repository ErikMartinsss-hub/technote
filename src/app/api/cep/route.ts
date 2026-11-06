import { NextResponse } from "next/server";
import { getShippingOptions, lookupCep } from "@/lib/shipping";

export async function POST(request: Request) {
  let body: { cep?: string; subtotal?: number } = {};
  try {
    body = (await request.json()) as { cep?: string; subtotal?: number };
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ler os dados enviados." },
      { status: 400 },
    );
  }

  const location = lookupCep(body.cep ?? "");
  if (!location) {
    return NextResponse.json(
      { error: "Informe um CEP válido com 8 dígitos." },
      { status: 400 },
    );
  }

  const subtotal = Number(body.subtotal ?? 0);
  return NextResponse.json({
    ...location,
    options: getShippingOptions(Number.isFinite(subtotal) ? subtotal : 0),
  });
}
