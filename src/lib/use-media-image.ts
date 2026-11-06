"use client";

import { useEffect, useState } from "react";
import { resolveMedia } from "@/lib/media";

export function useMediaImage(src: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setUrl(null);
      return;
    }
    let active = true;
    resolveMedia(src)
      .then((resolved) => {
        if (active) setUrl(resolved);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
  }, [src]);

  return url;
}
