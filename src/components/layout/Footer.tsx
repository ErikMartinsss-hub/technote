import Link from "next/link";
import {
  ArrowUpRight,
  Barcode,
  Clock,
  CreditCard,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  QrCode,
  ShieldCheck,
  Youtube,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

const columns = [
  {
    title: "Compre",
    links: [
      { label: "Celulares", href: "/catalogo?categoria=Celulares" },
      { label: "Notebooks", href: "/catalogo?categoria=Notebooks" },
      { label: "Tablets", href: "/catalogo?categoria=Tablets" },
      { label: "Smartwatches", href: "/catalogo?categoria=Smartwatches" },
      { label: "Acessórios", href: "/catalogo?categoria=Acess%C3%B3rios" },
      { label: "Ofertas", href: "/catalogo?ofertas=1" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { label: "Central de ajuda", href: "/conta?aba=ajuda" },
      { label: "Prazos e entregas", href: "/conta?aba=ajuda" },
      { label: "Trocas e devoluções", href: "/conta?aba=ajuda" },
      { label: "Garantia de 12 meses", href: "/conta?aba=ajuda" },
      { label: "Formas de pagamento", href: "/conta?aba=ajuda" },
      { label: "Rastrear pedido", href: "/conta?aba=pedidos" },
    ],
  },
  {
    title: "Tech Note",
    links: [
      { label: "Sobre nós", href: "/conta?aba=ajuda" },
      { label: "Venda seu aparelho", href: "/vender" },
      { label: "Como funciona o trade-in", href: "/vender" },
      { label: "Programa de indicação", href: "/conta?aba=ajuda" },
      { label: "Trabalhe conosco", href: "/conta?aba=ajuda" },
      { label: "Blog", href: "/conta?aba=ajuda" },
    ],
  },
];

const socials = [
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
];

export function Footer() {
  return (
    <footer className="footer-glow relative mt-20 overflow-hidden text-white">
      <div className="container-page relative">
        <div className="grid gap-8 border-b border-white/10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-lime-400">
              Clube Tech Note
            </p>
            <h2 className="mt-2 max-w-xl font-display text-2xl font-bold leading-tight sm:text-3xl">
              Ofertas que valem a pena, direto no seu e-mail.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/55">
              Cupons exclusivos, lançamentos seminovos e achados por menos de R$ 1.500.
              Sem spam, só tecnologia boa.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Tecnologia seminova com garantia de 12 meses, preço justo e uma segunda
              vida para cada aparelho.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:border-lime-400/40 hover:bg-white/10 hover:text-lime-400"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
            <div className="mt-6 space-y-2 text-xs text-white/55">
              <p className="flex items-center gap-2">
                <Mail className="size-3.5 text-lime-400" />
                oi@technote.com.br
              </p>
              <p className="flex items-center gap-2">
                <Clock className="size-3.5 text-lime-400" />
                Seg. a sáb., 9h às 19h
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-lime-400" />
                São Paulo — SP
              </p>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/85">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-[13px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-5 border-t border-white/10 py-7 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
              Formas de pagamento
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/75">
              <QrCode className="size-3.5" /> Pix
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/75">
              <CreditCard className="size-3.5" /> Visa
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/75">
              <CreditCard className="size-3.5" /> Mastercard
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/75">
              <CreditCard className="size-3.5" /> Elo
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/75">
              <Barcode className="size-3.5" /> Boleto
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/45 lg:justify-end">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              Compra 100% segura
            </span>
            <span>Garantia de 12 meses</span>
            <span>7 dias para troca</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Tech Note Tecnologia Ltda. CNPJ 00.000.000/0001-00.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/conta?aba=ajuda" className="transition hover:text-white/70">
              Termos de uso
            </Link>
            <Link href="/conta?aba=ajuda" className="transition hover:text-white/70">
              Privacidade
            </Link>
            <Link href="/conta?aba=ajuda" className="transition hover:text-white/70">
              Cookies
            </Link>
            <Link
              href="/admin"
              className="text-white/25 transition hover:text-lime-400"
              title="Painel de demonstração"
            >
              Área admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
