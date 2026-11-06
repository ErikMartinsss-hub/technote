import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  HandCoins,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const steps = [
  { icon: HandCoins, label: "Avalie seu aparelho" },
  { icon: CircleDollarSign, label: "Receba a oferta" },
  { icon: Truck, label: "Envie de graça" },
];

export function TradeInBanner() {
  return (
    <section className="pb-10 sm:pb-16">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-ink-950 via-brand-950 to-ink-950 px-5 py-8 text-white shadow-float sm:rounded-[36px] sm:px-10 sm:py-11 lg:px-14">
          <div className="absolute -right-20 -top-24 size-[380px] rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-14 size-[260px] rounded-full border border-white/10" />
          <div className="absolute -bottom-32 left-1/3 size-[320px] rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute right-6 top-5 select-none font-display text-[80px] font-extrabold leading-none tracking-tighter text-white/[0.035] sm:text-[120px]">
            TROCA
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-lime-400">
                <Sparkles className="size-3.5" />
                Tech Note Troca
              </span>
              <h2 className="mt-4 max-w-lg font-display text-[30px] font-extrabold leading-[1.06] tracking-[-0.04em] sm:text-[40px]">
                Seu aparelho antigo
                <br />
                <span className="text-lime-400">vale dinheiro.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
                Responda 5 perguntas, receba uma oferta na hora e envie seu aparelho
                de graça. O pagamento cai via Pix em até 1 dia útil.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {steps.map(({ icon: Icon, label }, index) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[11px] font-medium text-white/75 backdrop-blur"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-lime-400 text-[9px] font-extrabold text-ink-950">
                      {index + 1}
                    </span>
                    <Icon className="size-3.5 text-lime-400" />
                    {label}
                  </div>
                ))}
              </div>

              <Link
                href="/vender"
                className="group mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-lime-500 px-6 text-sm font-extrabold text-ink-950 transition hover:bg-lime-400"
              >
                Avaliar meu aparelho
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </Link>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10.5px] text-white/45">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  Oferta garantida por 7 dias
                </span>
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="size-3.5 text-lime-400" />
                  Etiqueta de envio grátis
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5 text-lime-400" />
                  Pagamento em até 1 dia útil
                </span>
              </div>
            </div>

            <div className="relative min-h-[300px] sm:min-h-[340px]">
              <div className="absolute inset-x-6 bottom-0 top-6 rounded-[36px] bg-white/[0.06] backdrop-blur-sm" />
              <div className="absolute left-1/2 top-1/2 size-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-500/80 to-brand-800/60 blur-sm sm:size-[290px]" />

              <Image
                src="/products/iphone-11.jpg"
                alt="iPhone seminovo"
                width={300}
                height={300}
                className="absolute left-1/2 top-1/2 z-10 w-[190px] -translate-x-1/2 -translate-y-[55%] rotate-[6deg] rounded-2xl object-contain drop-shadow-2xl animate-float sm:w-[220px]"
              />

              <div className="absolute right-0 top-5 z-20 w-[150px] rounded-2xl border border-white/10 bg-white/95 p-3 text-ink-950 shadow-2xl sm:right-4 sm:w-[170px]">
                <div className="flex items-center gap-1.5">
                  <CircleDollarSign className="size-4 text-emerald-600" />
                  <p className="text-[9px] font-bold uppercase tracking-wide text-ink-500">
                    Oferta estimada
                  </p>
                </div>
                <p className="mt-1 font-display text-[27px] font-extrabold tracking-tight text-ink-950">
                  R$ 2.430
                </p>
                <p className="text-[10px] leading-snug text-ink-500">
                  iPhone 13 128 GB
                  <br />
                  <strong className="text-emerald-600">+R$ 243</strong> em crédito
                </p>
                <div className="mt-2 rounded-lg bg-ink-50 px-2 py-1 text-[9px] font-semibold text-ink-600">
                  Pix em até 1 dia útil
                </div>
              </div>

              <div className="absolute bottom-5 left-2 z-20 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-ink-900 shadow-xl sm:left-5">
                <span className="grid size-8 place-items-center rounded-lg bg-lime-100 text-lime-700">
                  <PackageCheck className="size-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold">Etiqueta grátis</p>
                  <p className="text-[9px] text-ink-500">Envie de qualquer lugar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
