import { CreditCard, RefreshCcw, ShieldCheck, Truck } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Garantia de 12 meses",
    description: "Todos os aparelhos testados e certificados.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Truck,
    title: "Frete grátis",
    description: "Em compras acima de R$ 499 para todo o Brasil.",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: RefreshCcw,
    title: "Troca fácil",
    description: "7 dias para desistir, sem burocracia.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: CreditCard,
    title: "Pix com 5% OFF",
    description: "Ou parcele em até 21x no cartão.",
    color: "bg-lime-100 text-lime-700",
  },
];

export function Benefits() {
  return (
    <section className="relative z-20 -mt-4 sm:-mt-6">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-2.5 rounded-2xl sm:grid-cols-4 sm:gap-3">
          {benefits.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-2xl border border-ink-200/70 bg-white p-3.5 shadow-soft sm:flex-row sm:items-center sm:gap-3 sm:p-4"
            >
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${color}`}>
                <Icon className="size-4.5" />
              </span>
              <div>
                <p className="text-[12px] font-bold leading-tight text-ink-900">
                  {title}
                </p>
                <p className="mt-0.5 hidden text-[10.5px] leading-snug text-ink-500 sm:block">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
