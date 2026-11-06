import type { Metadata } from "next";
import { TradeInWizard } from "@/components/tradein/TradeInWizard";

export const metadata: Metadata = {
  title: "Venda seu aparelho usado",
  description:
    "Avalie seu celular, notebook, tablet ou smartwatch em 2 minutos e receba uma oferta na hora. Envio grátis, pagamento via Pix em até 1 dia útil e 10% extra em crédito na loja.",
  alternates: { canonical: "/vender" },
  openGraph: {
    title: "Venda seu aparelho usado | Tech Note",
    description:
      "Oferta na hora para iPhone, Samsung, Motorola, MacBook, iPad, Galaxy Watch e mais. Envio grátis e pagamento rápido.",
  },
};

export default function SellPage() {
  return <TradeInWizard />;
}
