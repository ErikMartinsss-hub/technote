"use client";

import Image from "next/image";
import { isMediaRef } from "@/lib/media";
import { useMediaImage } from "@/lib/use-media-image";
import { cn } from "@/lib/format";

interface ProductImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Renderiza imagens de produto vindas do catálogo estático (next/image) ou
 * fotos enviadas/tiradas pelo admin (blob URL do IndexedDB).
 */
export function ProductImage({ src, alt, sizes, priority, className }: ProductImageProps) {
  const mediaUrl = useMediaImage(isMediaRef(src) ? src : null);

  if (isMediaRef(src)) {
    return mediaUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mediaUrl} alt={alt} className={cn("absolute inset-0", className)} />
    ) : (
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 block bg-[linear-gradient(90deg,#f4f2eb_25%,#faf9f5_37%,#f4f2eb_63%)] bg-[length:400%_100%] [animation:shimmer_1.6s_linear_infinite]",
        )}
      />
    );
  }

  return (
    <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />
  );
}
