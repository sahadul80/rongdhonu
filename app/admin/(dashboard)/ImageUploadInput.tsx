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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-strong">{label}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${value ? "bg-rd-green/10 text-rd-green" : "bg-surface-2 text-muted"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${value ? "bg-rd-green" : "bg-muted"}`} />
          {value ? "Ready" : "Not set"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-2/40">
        <div className="flex min-h-32 items-center justify-center p-3 sm:min-h-36">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- the CMS stores base64 image data URIs.
            <img src={value} alt={`${label} preview`} className="max-h-32 w-full rounded-lg object-contain sm:max-h-36" />
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted">
              <ImagePlus className="h-7 w-7" aria-hidden="true" />
              <p className="mt-2 text-xs font-medium">Preview appears here</p>
              <p className="mt-0.5 text-[10px]">PNG, JPG or WebP · base64</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-background/80 p-2.5">
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
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-600 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : value ? <RefreshCw className="h-4 w-4" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
            {busy ? "Preparing…" : value ? "Replace image" : "Choose image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => { setError(null); onChange(null); }}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-strong transition hover:border-rd-red/40 hover:text-rd-red"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="rounded-lg bg-rd-red/10 px-2.5 py-2 text-[11px] font-medium text-rd-red" role="alert">{error}</p>}
    </div>
  );
}
