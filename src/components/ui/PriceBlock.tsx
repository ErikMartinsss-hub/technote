import { cn } from "@/lib/format";
import { formatBRL, round2 } from "@/lib/format";
import { installmentLabels, installmentValue, NO_INTEREST_INSTALLMENTS } from "@/lib/installments";
import { pixPrice } from "@/lib/products";

interface PriceBlockProps {
  total: number;
  size?: "sm" | "md" | "lg";
  showInstallments?: boolean;
  from?: boolean;
  className?: string;
}

export function PriceBlock({
  total,
  size = "md",
  showInstallments = true,
  from = false,
  className,
}: PriceBlockProps) {
  const pix = pixPrice(total);
  const labels = installmentLabels(total);
  const tenX = installmentValue(total, NO_INTEREST_INSTALLMENTS);

  return (
    <div className={cn("space-y-1", className)}>
      {from && (
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-400">
          a partir de
        </span>
      )}
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span
          className={cn(
            "font-display font-extrabold tracking-[-0.035em] text-ink-950",
            size === "lg" ? "text-[34px] leading-none" : size === "sm" ? "text-xl" : "text-[22px] leading-none sm:text-[26px]",
          )}
        >
          {formatBRL(pix)}
        </span>
        <span
          className={cn(
            "font-bold text-emerald-600",
            size === "lg" ? "text-sm" : "text-[11px]",
          )}
        >
          no pix
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "text-ink-400 line-through",
            size === "lg" ? "text-sm" : "text-[11px]",
          )}
        >
          {formatBRL(total)}
        </span>
        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
          -5% no Pix
        </span>
      </div>
      {showInstallments && (
        <div
          className={cn(
            "space-y-0.5 pt-0.5 leading-snug text-ink-500",
            size === "lg" ? "text-sm" : "text-[11px]",
          )}
        >
          <p>
            <span className="font-semibold text-ink-700">
              até 10x de {formatBRL(tenX)}
            </span>{" "}
            s/ juros
          </p>
          <p>{labels.withInterest}</p>
        </div>
      )}
    </div>
  );
}

export function SavingsPill({ price }: { price: number }) {
  const pix = pixPrice(price);
  const saving = round2(price - pix);
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
      Economize {formatBRL(saving)} no Pix
    </span>
  );
}
