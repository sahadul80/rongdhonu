"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsTeamMember } from "@/app/types/public-cms";
import ContentDetailModal from "./ContentDetailModal";

function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

interface TeamSectionProps { embedded?: boolean; teamSlug: string; }

export default function TeamSection({ embedded = false, teamSlug }: TeamSectionProps) {
  const { t, language, pick } = useLanguage();
  const { ref, data, loading, error } = useLazyPublicData<{ team: CmsTeamMember[] }>("/api/public/team");
  const team = data?.team ?? [];
  const [selectedMember, setSelectedMember] = useState<CmsTeamMember | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const closeModal = useCallback(() => setSelectedMember(null), []);

  useEffect(() => {
    if (!selectedMember) return;
    if (!team.some((member) => member.id === selectedMember.id)) setSelectedMember(null);
  }, [selectedMember, team]);

  const outerClassName = embedded ? "h-full min-w-0" : "bg-background py-7 sm:py-10";
  const innerClassName = embedded ? "h-full min-w-0" : "mx-auto max-w-7xl px-4 sm:px-5 lg:px-6";

  return (
    <section id={teamSlug} ref={ref} className={outerClassName} aria-labelledby="team-title">
      <div className={innerClassName}>
        <div className="mb-5 min-w-0"><div className="mb-3 flex items-center gap-2"><div className="h-px w-8 bg-rainbow sm:w-12" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs">{t("team")}</span></div><h2 id="team-title" className="h2-fluid font-black uppercase leading-tight text-foreground">{t("teamTitle")}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{t("teamIntro")}</p></div>
        {loading || !data ? <div className="grid gap-3 sm:grid-cols-2"><div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" /><div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" /></div> : error ? <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">{error}</div> : team.length === 0 ? null : (
          <div className="relative min-w-0"><Swiper onSwiper={(swiper) => (swiperRef.current = swiper)} slidesPerView={2.5} spaceBetween={8} breakpoints={{ 640: { slidesPerView: 1, spaceBetween: 12 } }} loop={team.length > 1} speed={400} autoplay={team.length > 1 ? { delay: 4500, disableOnInteraction: true, pauseOnMouseEnter: true } : false} pagination={{ clickable: true, dynamicBullets: true }} modules={[Pagination, Autoplay]} className="team-swiper w-full! overflow-hidden! pb-8!">{team.map((member, index) => { const role = language === "bn" && member.roleBn ? member.roleBn : member.role; const bio = language === "bn" && member.bioBn ? member.bioBn : member.bio; const name = pick(member.name, member.nameBn); return <SwiperSlide key={member.id} className="h-auto!"><button type="button" onClick={() => setSelectedMember(member)} className="glass-card swatch-card group grid h-full w-full min-w-0 overflow-hidden text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:grid" aria-label={`View ${name}`}><div className="relative aspect-square min-w-0 bg-primary/10 sm:aspect-4/3 lg:aspect-auto lg:min-h-90">{member.photoUrl ? <img src={member.photoUrl} alt={name} loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-5xl font-black text-primary/50" aria-hidden="true">{initialsOf(name)}</div>}<div className="absolute inset-x-0 bottom-0 h-1 bg-rainbow" /></div><div className="flex min-w-0 flex-col justify-center p-2.5 sm:p-6 lg:p-7"><span className="text-[8px] font-black uppercase tracking-[.14em] text-primary sm:text-[10px] sm:tracking-[.2em]">{role}</span><h3 className="mt-1 wrap-break-word text-sm font-black leading-tight text-foreground sm:mt-2 sm:text-3xl">{name}</h3>{bio && <p className="mt-2 hidden wrap-break-word text-sm leading-7 text-muted-strong sm:mt-4 sm:block">{bio}</p>}<span className="mt-2 text-[8px] font-black uppercase tracking-widest text-primary sm:mt-5 sm:text-[10px]">{t("viewProfile")}</span></div></button></SwiperSlide>; })}</Swiper></div>
        )}
      </div>
      <ContentDetailModal open={Boolean(selectedMember)} title={selectedMember ? pick(selectedMember.name, selectedMember.nameBn) : ""} onClose={closeModal} labelledById="team-member-modal-title">{selectedMember && <article><div className="grid md:grid-cols-[.9fr_1.1fr]"><div className="min-h-72 bg-primary/10">{selectedMember.photoUrl ? <img src={selectedMember.photoUrl} alt={pick(selectedMember.name, selectedMember.nameBn)} className="h-full min-h-72 w-full object-cover" /> : <div className="grid h-full min-h-72 place-items-center text-6xl font-black text-primary/40" aria-hidden="true">{initialsOf(pick(selectedMember.name, selectedMember.nameBn))}</div>}</div><div className="p-5 sm:p-7"><span className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{language === "bn" && selectedMember.roleBn ? selectedMember.roleBn : selectedMember.role}</span><h3 id="team-member-modal-title" className="mt-2 text-2xl font-black text-foreground sm:text-3xl">{pick(selectedMember.name, selectedMember.nameBn)}</h3>{(language === "bn" ? selectedMember.bioBn || selectedMember.bio : selectedMember.bio) && <p className="mt-4 text-sm leading-7 text-muted-strong">{language === "bn" ? selectedMember.bioBn || selectedMember.bio : selectedMember.bio}</p>}</div></div></article>}</ContentDetailModal>
    </section>
  );
}
