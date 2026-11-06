import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/format";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Navegação estrutural"
      className={cn("flex flex-wrap items-center gap-1.5 text-xs text-ink-500", className)}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 transition hover:text-brand-700"
      >
        <Home className="size-3.5" />
        <span className="sr-only sm:not-sr-only">Início</span>
      </Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          <ChevronRight className="size-3 text-ink-300" aria-hidden="true" />
          {item.href ? (
            <Link
              href={item.href}
              className="max-w-[180px] truncate transition hover:text-brand-700 sm:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className="max-w-[220px] truncate font-medium text-ink-700 sm:max-w-none">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
