import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Benefits } from "@/components/home/Benefits";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { DealsSection } from "@/components/home/DealsSection";
import { TradeInBanner } from "@/components/home/TradeInBanner";
import { Under1500 } from "@/components/home/Under1500";
import { Testimonials } from "@/components/home/Testimonials";
import { Brands } from "@/components/home/Brands";

export const metadata: Metadata = {
  title: "Tech Note — Eletrônicos seminovos com garantia de 12 meses",
  description:
    "Compre iPhone, Samsung, MacBook, tablets, smartwatches e acessórios seminovos com até 50% de desconto. Garantia de 12 meses, Pix com 5% OFF e entrega para todo o Brasil.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Benefits />
      <CategoryStrip />
      <DealsSection />
      <TradeInBanner />
      <Under1500 />
      <Testimonials />
      <Brands />
    </>
  );
}
