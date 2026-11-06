import { Headphones, Laptop, Smartphone, Tablet, Watch } from "lucide-react";
import { cn } from "@/lib/format";

const icons: Record<string, typeof Smartphone> = {
  Celulares: Smartphone,
  Notebooks: Laptop,
  Tablets: Tablet,
  Smartwatches: Watch,
  Acessórios: Headphones,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const Icon = icons[category] ?? Smartphone;
  return <Icon aria-hidden="true" className={cn("size-5", className)} />;
}
