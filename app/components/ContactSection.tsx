"use client";

import { BRAND } from "@/app/data/brand";
import { Mail, MapPin, Navigation, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsBusiness } from "@/app/types/public-cms";
import MapLocationModal from "./MapLocationModal";

export default function ContactSection() {
  const { t, language, pick } = useLanguage();
  const { ref, data, loading, error } = useLazyPublicData<{ business: CmsBusiness }>("/api/public/business");
  const business = data?.business;
  const name = business?.name || pick(BRAND.name, BRAND.nameBn);
  const email = business?.email || BRAND.email;
  const phone = business?.phone || BRAND.phone;
  const website = business?.website || BRAND.website;
  const address = business?.address ? pick(business.address, business.addressBn) : pick(BRAND.address, BRAND.addressBn);
  const mapQuery = business?.mapQuery || BRAND.mapQuery;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapInView, setMapInView] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const contactRows = [[t("address"), address], [t("phone"), phone], [t("email"), email], [t("website"), website]];

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      const ratio = entry?.intersectionRatio ?? 0;
      setMapInView((current) => (ratio >= 0.52 ? true : ratio <= 0.10 ? false : current));
    }, { threshold: [0.1, 0.52, 0.85], rootMargin: "-8% 0px -8% 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [data]);

  const setSectionRef = (node: HTMLElement | null) => {
    ref(node);
  };

  return (
    <>
      <section ref={setSectionRef} id="contact" className="bg-surface py-9 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr] lg:items-end lg:gap-10">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2"><div className="h-px w-8 bg-rainbow sm:w-12" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs">{t("contactUs")}</span></div>
            </div>
            <h2 className="h2-fluid max-w-3xl font-black uppercase leading-[0.95] text-foreground">{t("readyTransform")}</h2>
          </div>

          {loading || !data ? <div className="mt-7 grid gap-6 lg:grid-cols-[.98fr_1.02fr]"><div className="h-104 rounded-2xl border border-border bg-surface-2" /><div className="h-104 rounded-2xl border border-border bg-surface-2" /></div> : error ? <div className="mt-7 glass-panel p-5 text-sm text-muted">{error}</div> : (
            <div className="mt-7 grid items-stretch gap-6 lg:grid-cols-[.98fr_1.02fr] lg:gap-8">
              <div className="min-w-0">
                <div ref={mapRef} className={`glass-card relative overflow-hidden p-2 transition-transform duration-500 ${mapInView ? "map-zoom-active" : "map-zoom-idle"}`}>
                  <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-surface">
                    <iframe title={`${name} — ${t("mapTitle")}`} src={(() => {
                      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;
                      return apiKey
                        ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(mapQuery)}&zoom=${mapInView ? 18 : 14}&maptype=roadmap&language=${encodeURIComponent(language === "bn" ? "bn" : "en")}&region=BD`
                        : `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=${mapInView ? 18 : 14}&output=embed&hl=${language === "bn" ? "bn" : "en"}`;
                    })()} width="100%" height="340" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className={`map-zoom-frame pointer-events-none block h-85 w-full border-0 sm:h-97.5 ${mapInView ? "map-zoom-active" : ""}`} />
                    <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <div className="glass-panel max-w-[75%] px-3 py-2"><p className="text-[8px] font-black uppercase tracking-[0.16em] text-primary">{t("officeLocation")}</p><p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-4 text-foreground sm:text-xs">{address}</p></div>
                      <span className="glass-panel grid h-10 w-10 shrink-0 place-items-center text-primary"><Navigation className="h-4 w-4" aria-hidden="true" /></span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted">{mapInView ? (t("officeLocation")) : t("mapTitle")}</span>
                    <button type="button" onClick={() => setMapModalOpen(true)} className="btn-outline-primary inline-flex min-h-10 items-center gap-2 px-3 text-[9px] font-black uppercase tracking-widest"><Navigation className="h-3.5 w-3.5" aria-hidden="true" />{t("viewRoadMap")}</button>
                  </div>
                </div>
                <div className="glass-panel mt-3 flex items-start gap-3 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><MapPin className="h-4.5 w-4.5" aria-hidden="true" /></span>
                  <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">{t("address")}</p><p className="mt-1 text-sm leading-6 text-muted-strong">{address}</p></div>
                </div>
              </div>

              <div className="glass-card min-w-0 p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-4"><div><h3 className="text-base font-black uppercase text-foreground sm:text-xl">{t("businessInfo")}</h3><p className="mt-1 text-xs text-muted">{name}</p></div><span className="glass-toggle rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary">{t("dhaka")}</span></div>
                <div className="divide-y divide-border">
                  {contactRows.filter(([label]) => label !== t("address")).map(([label, value]) => <div key={label} className="grid grid-cols-[72px_1fr] gap-4 py-3 sm:grid-cols-[100px_1fr]"><span className="text-[9px] font-black uppercase tracking-wider text-muted">{label}</span><span className="wrap-break-word text-xs leading-relaxed text-muted-strong sm:text-sm">{value}</span></div>)}
                </div>

                <div className="glass-panel mt-6 p-4 sm:p-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("nextStep")}</p><p className="mt-2 text-sm leading-relaxed text-muted-strong">{t("nextStepText")}</p></div>
                
                <div className="glass-panel min-w-0 p-4 sm:p-5">
                  <p className="text-sm leading-relaxed text-muted sm:text-base">{t("contactIntro")}</p>
                  <div className="mt-4 flex justify-around gap-2.5">
                    <a href={`mailto:${email}`} className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest"><Mail className="h-3.5 w-3.5" aria-hidden="true" />{t("emailUs")}</a>
                    <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="btn-outline-primary inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest"><Phone className="h-3.5 w-3.5" aria-hidden="true" />{t("callUs")}</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <MapLocationModal open={mapModalOpen} onClose={() => setMapModalOpen(false)} title={name} query={mapQuery} address={address} />
    </>
  );
}
