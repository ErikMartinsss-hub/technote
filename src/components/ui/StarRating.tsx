import { Star } from "lucide-react";
import { cn } from "@/lib/format";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-5",
};

export function StarRating({
  rating,
  count,
  size = "sm",
  showValue = false,
  className,
}: StarRatingProps) {
  const rounded = Math.round(rating);

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      aria-label={`Avaliação ${rating.toFixed(1)} de 5 estrelas${
        count ? `, ${count} avaliações` : ""
      }`}
    >
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            aria-hidden="true"
            className={cn(
              sizeMap[size],
              index < rounded
                ? "fill-star-400 text-star-400"
                : "fill-ink-200 text-ink-200",
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-semibold text-ink-700">
          {rating.toFixed(1)}
        </span>
      )}
      {typeof count === "number" && (
        <span className={cn("text-ink-400", size === "sm" ? "text-[11px]" : "text-xs")}>
          ({count})
        </span>
      )}
    </div>
  );
}
