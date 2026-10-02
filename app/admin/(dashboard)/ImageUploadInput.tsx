"use client";

import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, Upload } from "lucide-react";
import { isValidImageDataUri } from "@/lib/formValidation";

const MAX_BYTES = 3 * 1024 * 1024;
const MAX_BYTES_WHEN_RESIZING = 15 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function readAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = src;
  });
}

async function shrink(dataUri: string, maxDimension: number): Promise<string> {
  const img = await loadImage(dataUri);
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = Math.min(1, maxDimension / Math.max(longest, 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUri;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export default function ImageUploadInput({
  label,
  value,
  onChange,
  maxDimension,
}: {
  label: string;
  value: string | null;
  onChange: (dataUri: string | null) => void;
  maxDimension?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const limit = maxDimension ? MAX_BYTES_WHEN_RESIZING : MAX_BYTES;

    if (!SUPPORTED_TYPES.has(file.type)) {
      setError("Use a PNG, JPG or WebP image.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > limit) {
      setError(`Image is too large. Use a file under ${Math.round(limit / 1024 / 1024)}MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setBusy(true);
    try {
      const raw = await readAsDataUri(file);
      const dataUri = maxDimension ? await shrink(raw, maxDimension) : raw;
      if (!isValidImageDataUri(dataUri)) throw new Error("Unsupported image encoding.");
      onChange(dataUri);
    } catch {
      setError("Could not prepare this image. Try another PNG, JPG or WebP file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface/60 p-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- CMS image data can be a data URI.
            <img src={value} alt={`${label} preview`} className="h-full w-full object-contain p-1" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-muted-strong">{label}</span>
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${value ? "bg-rd-green/10 text-rd-green" : "bg-surface-2 text-muted"}`}>
              {value ? "Ready" : "Empty"}
            </span>
          </div>
          <p className="mt-1 truncate text-[10px] text-muted">
            {value ? "Preview ready" : "PNG, JPG or WebP"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => void handleFile(event.target.files?.[0])}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-[10px] font-bold text-primary-foreground transition hover:bg-primary-600 disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : value ? <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> : <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
              {busy ? "Preparing" : value ? "Replace" : "Choose"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => { setError(null); onChange(null); }}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[10px] font-bold text-muted-strong transition hover:border-rd-red/40 hover:text-rd-red"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {error ? <p className="mt-2 rounded-md bg-rd-red/10 px-2 py-1.5 text-[10px] font-semibold text-rd-red" role="alert">{error}</p> : null}
    </div>
  );
}
