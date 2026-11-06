import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/Toaster";
import { StoreHydrator } from "@/components/providers/StoreHydrator";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://technote.com.br"),
  title: {
    default: "Tech Note — Eletrônicos seminovos com garantia de 12 meses",
    template: "%s | Tech Note",
  },
  description:
    "Compre celulares, notebooks, tablets, smartwatches e acessórios seminovos com até 50% de desconto, garantia de 12 meses e entrega para todo o Brasil. Venda seu aparelho usado com oferta na hora.",
  keywords: [
    "eletrônicos seminovos",
    "iPhone seminovo",
    "Samsung seminovo",
    "MacBook seminovo",
    "comprar celular usado",
    "trade-in",
    "vender celular",
    "Tech Note",
  ],
  applicationName: "Tech Note",
  authors: [{ name: "Tech Note" }],
  creator: "Tech Note",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Tech Note",
    title: "Tech Note — Tecnologia seminova com garantia",
    description:
      "iPhone, Samsung, MacBook e muito mais com até 50% de desconto, garantia de 12 meses e pagamento em até 21x.",
    url: "https://technote.com.br",
    images: [{ url: "/products/iphone-13.png", width: 940, height: 1112, alt: "iPhone 13 seminovo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Note — Tecnologia seminova com garantia",
    description:
      "Compre e venda eletrônicos seminovos com garantia de 12 meses e oferta na hora.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0d0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${jakarta.variable} ${sora.variable}`}>
      <body>
        <StoreHydrator />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-ink-950 focus:shadow-xl"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo" className="min-h-[60vh]">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
