import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/format";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-[32px]">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-500">{description}</p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-700 transition hover:text-brand-800"
        >
          {actionLabel}
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
