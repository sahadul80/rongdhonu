"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useMemo, useState } from "react";
import { ImageIcon, RefreshCw, Search } from "lucide-react";
import ImageUploadInput from "../ImageUploadInput";
import { isValidImageDataUri } from "@/lib/formValidation";
import AdminActionButton from "../AdminActionButton";
import AdminActionFeedback from "../AdminActionFeedback";
import AdminPageHeader from "../AdminPageHeader";

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
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [slotFilter, setSlotFilter] = useState<"all" | "banner" | "process">("all");

  async function load(isRefresh = false, silent = false) {
    if (isRefresh && !silent) setRefreshing(true); else if (!silent) setLoading(true);
    try {
      const response = await fetch("/api/admin/hero-images", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load picture slots.");
      setImages(Array.isArray(data.heroImages) ? data.heroImages : []);
      if (isRefresh && !silent) setMessage({ ok: true, text: "Picture slots refreshed." });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not load picture slots." });
    } finally {
      if (isRefresh && !silent) setRefreshing(false); else if (!silent) setLoading(false);
    }
  }

  useEffect(() => { void load(false); }, []);

  async function handleUpdate(image: HeroImageRow, imageUrl: string | null) {
    if (!isValidImageDataUri(imageUrl)) {
      setMessage({ ok: false, text: `${image.label} must be a supported base64 image.` });
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
        await load(true, true);
        throw new Error(data.error || `Could not save ${image.label}.`);
      }
      setMessage({ ok: true, text: `“${image.label}” saved successfully.` });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : `Could not save ${image.label}.` });
    } finally {
      setSavingSlot(null);
    }
  }

  const filteredImages = useMemo(() => images.filter((item) => {
    const matchesSlot = slotFilter === "all" || (slotFilter === "banner" ? item.slot === "banner" : false) || (slotFilter === "process" ? item.slot !== "banner" : false);
    return matchesSlot;
  }), [images, slotFilter]);

  const groups = useMemo(() => [
    { key: "banner", title: "Hero / banner", description: "The primary visual at the top of the public site.", items: filteredImages.filter((item) => item.slot === "banner") },
    { key: "process", title: "Process gallery", description: "Step visuals grouped together so uploads remain easy to scan on desktop and mobile.", items: filteredImages.filter((item) => item.slot !== "banner") },
  ], [filteredImages]);

  if (loading) return <AdminLoadingSkeleton title="Loading picture slots" variant="gallery" rows={5} />;

  return (
    <div className="admin-page">
      <AdminPageHeader
        icon={<ImageIcon className="h-4 w-4" />}
        title="Pictures"
        subtitle="Manage hero and process imagery with compact previews and per-slot save status."
        actions={<AdminActionButton type="button" onClick={() => void load(true)} loading={refreshing} loadingLabel="Refreshing…" icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />} className="admin-action border border-border bg-background text-muted-strong hover:bg-surface-2">Refresh</AdminActionButton>}
      >
        <select className="admin-select admin-toolbar-filter" value={slotFilter} onChange={(e) => setSlotFilter(e.target.value as typeof slotFilter)} aria-label="Filter image configuration"><option value="all">All slots</option><option value="banner">Banner</option><option value="process">Process</option></select>
        <span className="admin-toolbar-meta">{filteredImages.length} / {images.length}</span>
      </AdminPageHeader>
      <div className="admin-sticky-feedback"><AdminActionFeedback message={message} /></div>

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
