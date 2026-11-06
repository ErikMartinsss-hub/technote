"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/format";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 5,
  size = "md",
  label = "Quantidade",
}: QuantityStepperProps) {
  const buttonClass = cn(
    "grid place-items-center rounded-lg text-ink-600 transition hover:bg-ink-100 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-35 focus-ring",
    size === "sm" ? "size-7" : "size-9",
  );

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white",
        size === "sm" ? "p-0.5" : "p-1",
      )}
      aria-label={label}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={cn(
          "text-center font-semibold tabular-nums text-ink-900",
          size === "sm" ? "w-5 text-xs" : "w-7 text-sm",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
