"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Navigation, X } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useModalScrollLock } from "./useModalScrollLock";

function buildMapUrl(query: string, language: "en" | "bn") {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&zoom=18&maptype=roadmap&language=${encodeURIComponent(language === "bn" ? "bn" : "en")}&region=BD`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=18&output=embed&hl=${language === "bn" ? "bn" : "en"}`;
}

function buildGoogleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;
}

export default function MapLocationModal({ open, onClose, title, query, address }: { open: boolean; onClose: () => void; title: string; query: string; address: string }) {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useModalScrollLock(open);

  if (!mounted || !open) return null;

  const mapsUrl = buildGoogleMapsUrl(query);
  const directionsUrl = buildDirectionsUrl(query);

  return createPortal(
    <div className="modal-layer fixed inset-0 z-1100 isolate flex items-center justify-center overscroll-none bg-black/65 p-3 backdrop-blur-md sm:p-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="flex max-h-[92dvh] w-full max-w-5xl min-h-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-background/95 shadow-2xl backdrop-blur-2xl sm:rounded-3xl" role="dialog" aria-modal="true" aria-labelledby="office-map-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/70 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t("officeLocation")}</p>
            <h2 id="office-map-modal-title" className="mt-1 truncate text-base font-black text-foreground sm:text-xl">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="glass-toggle grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background/55 text-muted-strong" aria-label={`${t("closeMenuShort")} ${title}`}>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
          <div className="relative min-h-80 border-b border-border bg-surface sm:min-h-107.5">
            <iframe title={`${title} — ${t("mapTitle")}`} src={buildMapUrl(query, language)} className="h-[52vh] min-h-80 w-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-3">
                <div className="glass-panel max-w-xl px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">{t("address")}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-foreground sm:text-sm">{address}</p>
                </div>
                <div className="glass-panel inline-flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-muted-strong">
                  <Navigation className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {language === "bn" ? "রোডম্যাপ" : "Road map"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:p-5">
            <div className="min-w-0">
              <p className="text-sm font-black text-foreground">{language === "bn" ? "অফিসের অবস্থান" : "Company office location"}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{language === "bn" ? "রাস্তাঘাটের পূর্বরূপ দেখুন এবং গুগল ম্যাপে নেভিগেশন চালু করুন।" : "Review the road map preview and open turn-by-turn navigation in Google Maps."}</p>
            </div>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 px-4 text-[10px] font-black uppercase tracking-widest"><Navigation className="h-3.5 w-3.5" aria-hidden="true" />{language === "bn" ? "দিকনির্দেশনা" : "Get directions"}</a>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-primary inline-flex min-h-11 items-center justify-center gap-2 px-4 text-[10px] font-black uppercase tracking-widest"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />{t("openMaps")}</a>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
