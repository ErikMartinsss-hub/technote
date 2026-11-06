import Link from "next/link";
import { cn } from "@/lib/format";

interface LogoProps {
  compact?: boolean;
  light?: boolean;
  className?: string;
}

export function Logo({ compact = false, light = false, className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Tech Note — página inicial"
      className={cn(
        "group inline-flex shrink-0 items-center gap-2.5 focus-ring rounded-xl",
        className,
      )}
    >
      <span className="relative grid size-10 place-items-center overflow-hidden rounded-[13px] bg-gradient-to-br from-brand-400 via-brand-500 to-brand-800 shadow-[0_8px_20px_-8px_rgba(151,109,14,0.55)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
        <svg viewBox="0 0 40 40" className="size-9" aria-hidden="true">
          <path
            d="M11.5 28V12.5L28.5 27.5V12"
            fill="none"
            stroke="white"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="30.5" cy="9.5" r="2.6" fill="#F8E4AC" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[23px] font-extrabold tracking-[-0.045em]",
              light ? "text-white" : "text-ink-950",
            )}
          >
            tech<span className="text-brand-600">note</span>
            <span className="text-lime-500">.</span>
          </span>
          <span
            className={cn(
              "mt-1 text-[8.5px] font-bold uppercase tracking-[0.32em]",
              light ? "text-white/50" : "text-ink-400",
            )}
          >
            tecnologia seminova
          </span>
        </span>
      )}
    </Link>
  );
}
