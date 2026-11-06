"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  VideoOff,
  X,
} from "lucide-react";
import { compressImage } from "@/lib/media";
import { useMediaImage } from "@/lib/use-media-image";
import { cn } from "@/lib/format";

export interface AdminShot {
  /** Identificador interno do disparo. */
  id: string;
  /** Chave já gravada no IndexedDB (`img-…`), quando a foto já pertence ao produto. */
  key?: string;
  /** Novo blob capturado/enviado que ainda não foi gravado. */
  blob?: Blob;
  /** Preview local para shots novos (blob URL). */
  previewUrl?: string;
}

interface PhotoPickerProps {
  shots: AdminShot[];
  onChange: (shots: AdminShot[]) => void;
  max?: number;
}

export function AdminPhotoPicker({ shots, onChange, max = 6 }: PhotoPickerProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function addBlobs(blobs: (Blob | File)[]) {
    const room = max - shots.length;
    if (room <= 0) return;
    setBusy(true);
    try {
      const next: AdminShot[] = [];
      for (const raw of blobs.slice(0, room)) {
        const compressed = await compressImage(raw as Blob);
        next.push({
          id: `s-${crypto.randomUUID()}`,
          blob: compressed,
          previewUrl: URL.createObjectURL(compressed),
        });
      }
      onChange([...shots, ...next]);
    } finally {
      setBusy(false);
    }
  }

  function removeShot(id: string) {
    const index = shots.findIndex((shot) => shot.id === id);
    if (index === -1) return;
    const current = shots[index];
    if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
    onChange(shots.filter((shot) => shot.id !== id));
  }

  function moveShot(id: string, direction: -1 | 1) {
    const index = shots.findIndex((shot) => shot.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= shots.length) return;
    const next = [...shots];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
          disabled={busy || shots.length >= max}
        >
          <Camera className="size-4" />
          Tirar foto agora
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 px-4 text-xs font-bold text-ink-800 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
          disabled={busy || shots.length >= max}
        >
          <ImagePlus className="size-4" />
          Enviar fotos
        </button>
        {busy && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-500">
            <Loader2 className="size-3.5 animate-spin" />
            Processando…
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (files.length > 0) void addBlobs(files);
          }}
        />
      </div>

      <p className="mt-2 text-[11px] text-ink-500">
        Primeira foto = capa do produto. Fotos de celular/notebook viram JPEG leve automaticamente.
      </p>

      {shots.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {shots.map((shot, index) => (
            <li key={shot.id} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
                <AdminShotPreview shot={shot} label={`Foto ${index + 1}`} />
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    <Star className="size-2.5 fill-current" />
                    Capa
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <span className="inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveShot(shot.id, -1)}
                    aria-label="Mover para a esquerda"
                    className="grid size-6 place-items-center rounded-md border border-ink-200 text-[11px] text-ink-600 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
                    disabled={index === 0}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveShot(shot.id, 1)}
                    aria-label="Mover para a direita"
                    className="grid size-6 place-items-center rounded-md border border-ink-200 text-[11px] text-ink-600 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
                    disabled={index === shots.length - 1}
                  >
                    →
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => removeShot(shot.id)}
                  aria-label={`Remover foto ${index + 1}`}
                  className="grid size-6 place-items-center rounded-md border border-ink-200 text-ink-500 transition hover:border-rose-300 hover:text-rose-600"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cameraOpen && (
        <CameraModal
          onClose={() => setCameraOpen(false)}
          onCapture={async (blob) => {
            const compressed = await compressImage(blob);
            onChange([
              ...shots,
              {
                id: `s-${crypto.randomUUID()}`,
                blob: compressed,
                previewUrl: URL.createObjectURL(compressed),
              },
            ]);
          }}
        />
      )}
    </div>
  );
}

function AdminShotPreview({ shot, label }: { shot: AdminShot; label: string }) {
  const imageUrl = useMediaImage(shot.key ? `tnimg:${shot.key}` : null);
  const src = shot.previewUrl ?? imageUrl;
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      className="absolute inset-0 size-full object-cover"
      loading="lazy"
    />
  );
}

interface CameraModalProps {
  onCapture: (blob: Blob) => void | Promise<void>;
  onClose: () => void;
}

function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setStarting(true);
      setError(null);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Navegador sem acesso à câmera. Use “Enviar fotos” ou permita o acesso (https/localhost).",
        );
        setStarting(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch (caught) {
        const name = caught instanceof DOMException ? caught.name : "";
        setError(
          name === "NotAllowedError"
            ? "Permissão da câmera negada. Libere o acesso nas configurações do navegador ou envie as fotos do dispositivo."
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "Nenhuma câmera disponível neste dispositivo. Use “Enviar fotos”."
              : "Não foi possível abrir a câmera. Tente enviar as fotos do dispositivo.",
        );
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facing]);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || busy) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      canvas.toBlob(
        async (blob) => {
          if (blob) await onCapture(blob);
          setBusy(false);
        },
        "image/jpeg",
        0.9,
      );
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-ink-950">Câmera do dispositivo</p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFacing((prev) => (prev === "environment" ? "user" : "environment"))}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 text-[11px] font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              Trocar câmera
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar câmera"
              className="grid size-8 place-items-center rounded-lg border border-ink-200 text-ink-600 transition hover:border-ink-300"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-ink-950">
          <video
            ref={videoRef}
            playsInline
            muted
            className={cn(
              "size-full object-cover",
              facing === "user" && "scale-x-[-1]",
              (error || starting) && "hidden",
            )}
          />
          {starting && !error && (
            <div className="absolute inset-0 grid place-items-center text-white/80">
              <span className="inline-flex items-center gap-2 text-xs font-semibold">
                <Loader2 className="size-4 animate-spin" />
                Abrindo câmera…
              </span>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div>
                <VideoOff className="mx-auto size-8 text-white/60" />
                <p className="mt-2 text-xs leading-relaxed text-white/80">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[10.5px] text-ink-500">
            Enquadre o aparelho com boa luz e capture quantas fotos quiser.
          </p>
          <button
            type="button"
            onClick={capture}
            disabled={Boolean(starting || error || busy)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-40"
          >
            <Camera className="size-4" />
            {busy ? "Capturando…" : "Capturar foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
