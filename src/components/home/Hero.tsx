import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  HandCoins,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
} from "lucide-react";

export function Hero() {
  return (
    <section className="pt-4 sm:pt-6">
      <div className="container-page">
        <div className="hero-glow relative overflow-hidden rounded-[28px] border border-white/70 sm:rounded-[36px]">
          <div className="absolute -left-24 top-24 size-64 rounded-full bg-brand-300/30 blur-3xl" />
          <div className="absolute -right-10 -top-20 size-72 rounded-full bg-lime-300/30 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1.04fr_0.96fr]">
            <div className="relative z-10 px-5 pb-8 pt-8 sm:px-9 sm:pb-10 sm:pt-11 lg:px-12 lg:py-14 xl:px-16 xl:py-16">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 px-3 py-1.5 text-[10.5px] font-bold text-brand-800 shadow-sm backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Seminovos verificados com 12 meses de garantia
              </span>

              <h1 className="mt-5 max-w-[590px] font-display text-[38px] font-extrabold leading-[1.02] tracking-[-0.05em] text-ink-950 sm:text-[50px] lg:text-[56px] xl:text-[62px]">
                Tecnologia de ponta.
                <br />
                Preço de{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-brand-800 via-brand-600 to-brand-500 bg-clip-text text-transparent">
                    seminovo.
                  </span>
                  <span className="absolute inset-x-0 bottom-1 z-0 h-2.5 rounded-full bg-lime-400/80 sm:h-3.5" />
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-600 sm:text-[15px]">
                iPhone, Samsung, MacBook e muito mais com até{" "}
                <strong className="font-bold text-ink-900">50% de desconto</strong>,
                bateria testada e entrega rápida para todo o Brasil.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <Link
                  href="/catalogo?ofertas=1"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-[0_16px_32px_-14px_rgba(151,109,14,0.55)] transition hover:bg-brand-700"
                >
                  Explorar ofertas
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/vender"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink-300/80 bg-white/75 px-5 text-sm font-bold text-ink-900 backdrop-blur transition hover:border-brand-300 hover:bg-white"
                >
                  <HandCoins className="size-4 text-brand-700" />
                  Vender meu aparelho
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] font-medium text-ink-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  Garantia 12 meses
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="size-4 text-brand-600" />
                  Até 21x
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="size-4 text-brand-600" />
                  Frete grátis*
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-ink-900/5 pt-5">
                <div className="flex -space-x-2">
                  {[
                    { initials: "MA", className: "from-brand-400 to-brand-600" },
                    { initials: "RS", className: "from-emerald-400 to-emerald-600" },
                    { initials: "CL", className: "from-lime-300 to-lime-600" },
                  ].map((avatar) => (
                    <span
                      key={avatar.initials}
                      className={`grid size-8 place-items-center rounded-full bg-gradient-to-br ${avatar.className} text-[9px] font-bold text-white ring-2 ring-white`}
                    >
                      {avatar.initials}
                    </span>
                  ))}
                  <span className="grid size-8 place-items-center rounded-full bg-ink-950 text-[8px] font-bold text-white ring-2 ring-white">
                    +50
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className="size-3 fill-star-400 text-star-400"
                      />
                    ))}
                    <span className="ml-1 text-[11px] font-bold text-ink-800">4.9</span>
                  </div>
                  <p className="text-[10.5px] text-ink-500">
                    Mais de 50 mil clientes satisfeitos
                  </p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[350px] sm:min-h-[430px] lg:min-h-[540px]">
              <div className="absolute inset-8 rounded-[48px] bg-white/30 blur-2xl" />
              <div className="absolute left-1/2 top-1/2 size-[290px] -translate-x-1/2 -translate-y-[47%] rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-900 shadow-[0_40px_90px_-30px_rgba(151,109,14,0.5)] sm:size-[350px] lg:size-[390px]" />
              <div className="absolute left-1/2 top-1/2 size-[310px] -translate-x-1/2 -translate-y-[47%] rounded-full border border-white/30 sm:size-[375px] lg:size-[420px]" />
              <div className="absolute left-1/2 top-1/2 size-[340px] -translate-x-1/2 -translate-y-[47%] rounded-full border border-white/15 sm:size-[410px] lg:size-[470px]" />

              <Image
                src="/products/iphone-13.png"
                alt="iPhone 13 seminovo"
                width={940}
                height={1112}
                priority
                className="absolute left-1/2 top-1/2 z-10 w-[190px] -translate-x-1/2 -translate-y-[52%] rotate-[-7deg] drop-shadow-[0_35px_35px_rgba(37,26,3,0.3)] animate-float sm:w-[235px] lg:w-[270px]"
              />

              <div className="absolute left-2 top-7 z-20 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-card backdrop-blur animate-float-slow sm:left-5 lg:left-3 lg:top-16">
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <BadgeCheck className="size-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold text-ink-900">Bateria saudável</p>
                  <p className="text-[9px] text-ink-400">acima de 80%</p>
                </div>
              </div>

              <div className="absolute right-2 top-10 z-20 flex items-center gap-2 rounded-xl bg-ink-950 px-3.5 py-2.5 text-white shadow-xl animate-float sm:right-4 lg:right-2 lg:top-20">
                <Zap className="size-4 text-lime-400" />
                <div>
                  <p className="text-[10px] font-bold text-lime-400">até 50% OFF</p>
                  <p className="text-[9px] text-white/60">vs. aparelho novo</p>
                </div>
              </div>

              <Link
                href="/produto/macbook-air-m1-2020-256gb"
                className="absolute bottom-5 left-3 z-20 w-[175px] rounded-2xl bg-white/95 p-2.5 shadow-card backdrop-blur transition hover:-translate-y-1 sm:left-6 sm:w-[200px] lg:bottom-10 lg:left-4"
              >
                <div className="relative h-[86px] overflow-hidden rounded-xl bg-ink-50">
                  <Image
                    src="/products/macbook-air.jpg"
                    alt="MacBook Air M1 seminovo"
                    fill
                    sizes="200px"
                    className="object-contain p-2"
                  />
                </div>
                <p className="mt-2 text-[10px] font-bold text-ink-900">
                  MacBook Air M1
                </p>
                <p className="text-[10px] text-ink-500">
                  <strong className="text-brand-700">R$ 2.079,55</strong> no Pix
                </p>
              </Link>

              <Link
                href="/produto/apple-watch-series-7-41mm"
                className="absolute bottom-8 right-3 z-20 w-[145px] rounded-2xl bg-white/95 p-2.5 shadow-card backdrop-blur transition hover:-translate-y-1 sm:right-6 sm:w-[165px] lg:bottom-14 lg:right-2"
              >
                <div className="relative h-[78px] overflow-hidden rounded-xl bg-ink-50">
                  <Image
                    src="/products/watch-series-7.jpg"
                    alt="Apple Watch Series 7 seminovo"
                    fill
                    sizes="165px"
                    className="object-contain p-1"
                  />
                </div>
                <p className="mt-2 text-[10px] font-bold text-ink-900">
                  Apple Watch S7
                </p>
                <p className="text-[10px] text-ink-500">
                  <strong className="text-brand-700">R$ 1.139,05</strong> no Pix
                </p>
              </Link>

              <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-1.5 rounded-full bg-lime-400 px-3 py-1.5 text-[9.5px] font-extrabold text-ink-950 shadow-lg sm:flex">
                <Sparkles className="size-3" />
                OFERTA DA SEMANA
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
