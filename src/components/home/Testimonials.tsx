import { BadgeCheck, Quote, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";

const reviews = [
  {
    name: "Mariana Alves",
    initials: "MA",
    color: "from-brand-400 to-brand-600",
    product: "iPhone 13 128GB",
    rating: 5,
    text: "Chegou impecável, muito melhor do que eu esperava. A bateria está ótima e o aparelho não tem nenhuma marca. Já indiquei para três amigas!",
  },
  {
    name: "Rafael Souza",
    initials: "RS",
    color: "from-emerald-400 to-emerald-600",
    product: "MacBook Air M1",
    rating: 5,
    text: "Notebook muito conservado, teclado e tela sem defeitos. Uso para programar todos os dias e a bateria dura o dia inteiro.",
  },
  {
    name: "Camila Ribeiro",
    initials: "CR",
    color: "from-lime-300 to-lime-600",
    product: "Galaxy Z Flip4",
    rating: 5,
    text: "Comprei o dobrável com um pouco de receio e me surpreendi. Veio com garantia, embalagem reforçada e funcionando perfeitamente.",
  },
];

const stats = [
  { value: "+50 mil", label: "clientes felizes" },
  { value: "4.9/5", label: "nota média" },
  { value: "98%", label: "recomendam" },
  { value: "12", label: "meses de garantia" },
];

export function Testimonials() {
  return (
    <section className="py-10 sm:py-16">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[28px] border border-ink-200/70 bg-white p-5 shadow-soft sm:p-8 lg:p-10">
          <div className="absolute -right-16 -top-20 size-56 rounded-full bg-brand-50" />
          <div className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-lime-100/60 blur-2xl" />

          <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.5fr] lg:gap-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">
                Quem compra, recomenda
              </p>
              <h2 className="mt-2 max-w-xs font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.035em] text-ink-950 sm:text-[34px]">
                Confiança que se renova.
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="font-display text-5xl font-extrabold tracking-tight text-ink-950">
                  4.9
                </span>
                <div>
                  <StarRating rating={5} size="md" />
                  <p className="mt-1 text-[11px] text-ink-500">
                    12.480 avaliações verificadas
                  </p>
                </div>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-500">
                Cada aparelho passa por uma revisão de 42 pontos antes de chegar até
                você. Se não gostar, devolvemos seu dinheiro.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2.5"
                  >
                    <p className="font-display text-lg font-extrabold text-ink-950">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-ink-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-medium text-ink-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  Compra protegida
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="size-3.5 text-brand-600" />
                  Entrega rastreada
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {reviews.map((review) => (
                <figure
                  key={review.name}
                  className="flex flex-col rounded-2xl border border-ink-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <Quote className="size-5 text-brand-200" />
                  <StarRating rating={review.rating} className="mt-2" />
                  <blockquote className="mt-2 flex-1 text-[12px] leading-relaxed text-ink-600">
                    “{review.text}”
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-2.5 border-t border-ink-100 pt-3">
                    <span
                      className={`grid size-8 place-items-center rounded-full bg-gradient-to-br ${review.color} text-[9px] font-bold text-white`}
                    >
                      {review.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-ink-900">
                        {review.name}
                      </p>
                      <p className="flex items-center gap-1 truncate text-[9.5px] text-ink-400">
                        <BadgeCheck className="size-3 shrink-0 text-emerald-500" />
                        {review.product}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-brand-50 to-lime-50/60 px-4 py-3">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-ink-700">
              <Sparkles className="size-4 text-brand-600" />
              Junte-se a mais de 50 mil pessoas que já trocaram o novo pelo seminovo.
            </p>
            <span className="text-[10px] font-bold text-brand-700">
              ★ Compra 100% segura
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
