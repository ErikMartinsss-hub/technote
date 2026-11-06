"use client";

/**
 * Armazenamento de imagens enviadas pelo admin.
 * As fotos ficam no IndexedDB do navegador (blob) e o produto guarda apenas a
 * referência `tnimg:<chave>`, que é resolvida para um blob URL na renderização.
 */

const DB_NAME = "technote-media";
const DB_VERSION = 1;
const STORE = "images";

export const TNIMG_PREFIX = "tnimg:";

interface MediaRecord {
  key: string;
  blob: Blob;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB não disponível neste ambiente."));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Falha ao abrir o IndexedDB."));
    });
  }
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = action(transaction.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Falha no IndexedDB."));
      }),
  );
}

export function isMediaRef(src: string | null | undefined): boolean {
  return Boolean(src && src.startsWith(TNIMG_PREFIX));
}

export function mediaKeyFromRef(src: string): string {
  return src.slice(TNIMG_PREFIX.length);
}

export function mediaRef(key: string): string {
  return `${TNIMG_PREFIX}${key}`;
}

export async function putMedia(key: string, blob: Blob): Promise<void> {
  await run<void>("readwrite", (store) =>
    store.put({ key, blob } satisfies MediaRecord) as unknown as IDBRequest<void>,
  );
}

export async function getMedia(key: string): Promise<Blob | null> {
  try {
    const record = (await run<MediaRecord | undefined>("readonly", (store) =>
      store.get(key) as IDBRequest<MediaRecord | undefined>,
    )) as MediaRecord | undefined;
    return record?.blob ?? null;
  } catch {
    return null;
  }
}

export async function delMedia(key: string): Promise<boolean> {
  try {
    await run<undefined>("readwrite", (store) =>
      store.delete(key) as unknown as IDBRequest<undefined>,
    );
    if (urlCache.has(key)) {
      URL.revokeObjectURL(urlCache.get(key)!);
      urlCache.delete(key);
    }
    return true;
  } catch {
    return false;
  }
}

const urlCache = new Map<string, string>();

/** Converte a referência `tnimg:` em URL de blob (cacheia o resultado). */
export async function resolveMedia(src: string): Promise<string | null> {
  if (!isMediaRef(src)) return src;
  const key = mediaKeyFromRef(src);
  if (urlCache.has(key)) return urlCache.get(key)!;
  const blob = await getMedia(key);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(key, url);
  return url;
}

function requestDb(): Promise<IDBDatabase> {
  return openDb();
}

export function resetMediaUrlCache() {
  urlCache.forEach((url) => URL.revokeObjectURL(url));
  urlCache.clear();
}

export { requestDb };

/**
 * Compressão: desenha a foto em um canvas (limite de 1280px) e exporta JPEG.
 * Mantém os arquivos leves o suficiente para caber no navegador com folga.
 */
export async function compressImage(
  source: Blob | HTMLCanvasElement,
  options: { maxDim?: number; quality?: number } = {},
): Promise<Blob> {
  const { maxDim = 1280, quality = 0.82 } = options;
  const bitmap = source instanceof Blob ? await createImageBitmap(source) : null;
  const sourceWidth = bitmap ? bitmap.width : source instanceof HTMLCanvasElement ? source.width : 1;
  const sourceHeight = bitmap
    ? bitmap.height
    : source instanceof HTMLCanvasElement
      ? source.height
      : 1;
  const scale = Math.min(1, maxDim / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível.");
  if (bitmap) {
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
  } else if (source instanceof HTMLCanvasElement) {
    context.drawImage(source, 0, 0, width, height);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Não foi possível processar a imagem."));
      },
      "image/jpeg",
      quality,
    );
  });
}
