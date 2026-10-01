"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useMemo, useState } from "react";
import { ImageIcon, RefreshCw } from "lucide-react";
import ImageUploadInput from "../ImageUploadInput";
import { isValidImageDataUri } from "@/lib/formValidation";

interface HeroImageRow {
  slot: string;
  label: string;
  image_url: string | null;
  sort_order: number;
}

export default function HeroImagesEditorPage() {
  const [images, setImages] = useState<HeroImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/hero-images")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load picture slots.");
        setImages(Array.isArray(data.heroImages) ? data.heroImages : []);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load picture slots."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleUpdate(image: HeroImageRow, imageUrl: string | null) {
    if (!isValidImageDataUri(imageUrl)) {
      setMessage(`${image.label} must be a supported base64 image.`);
      return;
    }
    setMessage(null);
    setImages((prev) => prev.map((item) => (item.slot === image.slot ? { ...item, image_url: imageUrl } : item)));
    setSavingSlot(image.slot);
    try {
      const response = await fetch("/api/admin/hero-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: image.slot, label: image.label, imageUrl, sortOrder: image.sort_order }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error || `Could not save ${image.label}.`);
        load();
      }
    } catch {
      setMessage(`Could not save ${image.label}.`);
      load();
    } finally {
      setSavingSlot(null);
    }
  }

  const groups = useMemo(() => [
    { key: "banner", title: "Hero / banner", description: "The primary visual at the top of the public site.", items: images.filter((item) => item.slot === "banner") },
    { key: "process", title: "Process gallery", description: "Step visuals grouped together so uploads remain easy to scan on desktop and mobile.", items: images.filter((item) => item.slot !== "banner") },
  ], [images]);

  if (loading) return <AdminLoadingSkeleton title="Loading picture slots" variant="gallery" rows={5} />;

  return (
    <div className="admin-page">
      <div className="flex flex-row items-center justify-between">
        <div className="min-w-0">
          <span className="flex flex-row items-center gap-2"><ImageIcon className="h-auto w-auto text-primary" aria-hidden="true" /><p className="admin-page-title">Pictures</p></span>
          <p className="admin-page-subtitle hidden sm:inline">Upload images by category. Each preview shows the live CMS value; images are stored as base64, never as an upload path.</p>
        </div>
        <div>
          <button type="button" onClick={load} className="admin-action border border-border bg-background text-muted-strong hover:bg-surface-2"><RefreshCw className="h-4 w-4" aria-hidden="true" />Refresh</button>
        </div>
      </div>

      {message && <p role="alert" className="rounded-lg bg-rd-red/10 px-3 py-2 text-xs font-semibold text-rd-red">{message}</p>}

      <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
        {groups.map((group) => (
          <section key={group.key} className="admin-panel p-3 sm:p-4">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div><h2 className="text-sm font-bold text-foreground">{group.title}</h2><p className="mt-1 text-[10px] text-muted">{group.description}</p></div>
              <span className="admin-status bg-surface-2 text-muted">{group.items.length} slot{group.items.length === 1 ? "" : "s"}</span>
            </div>
            {group.items.length ? (
              <div className={group.key === "banner" ? "max-w-xl" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
                {group.items.map((image) => (
                  <article key={image.slot} className="rounded-xl border border-border bg-surface p-3">
                    <ImageUploadInput label={image.label} value={image.image_url} onChange={(value) => void handleUpdate(image, value)} />
                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted">
                      <span className="truncate">Slot: {image.slot}</span>
                      {savingSlot === image.slot && <span className="shrink-0 font-semibold text-primary">Saving…</span>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface p-5 text-center text-xs text-muted">No configured image slots in this category.</div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
