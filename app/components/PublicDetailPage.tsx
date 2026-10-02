"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Briefcase, Mail, MapPin, Star, Users } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import type { CmsReview, CmsService, CmsTeamMember, CmsWork } from "@/app/types/public-cms";

interface DetailData {
  kind: "service" | "work" | "team" | "review";
  basePath: string;
  businessEmail: string;
  workBasePath?: string;
  service?: CmsService;
  work?: CmsWork & { reviews?: CmsReview[] };
  team?: CmsTeamMember;
  review?: CmsReview;
}

export default function PublicDetailPage({ data }: { data: DetailData }) {
  const { language, pick } = useLanguage();
  const pickText = (en: string | null | undefined, bn: string | null | undefined) => pick(en ?? "", bn ?? "");

  const backLabel = language === "bn" ? "ফিরে যান" : "Back";
  const backTitle = data.kind === "service" ? "Services" : data.kind === "work" ? "Our Work" : data.kind === "team" ? "Our Team" : "Reviews";

  return (
    <main className="min-h-dvh bg-background px-4 pb-12 pt-24 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href={data.basePath} className="mb-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted transition hover:text-primary"><ArrowLeft className="h-4 w-4" />{backLabel} {backTitle}</Link>

        {data.kind === "service" && data.service && <ServiceDetail service={data.service} language={language} pick={pickText} />}
        {data.kind === "work" && data.work && <WorkDetail work={data.work} language={language} pick={pickText} />}
        {data.kind === "team" && data.team && <TeamDetail team={data.team} businessEmail={data.businessEmail} language={language} pick={pickText} />}
        {data.kind === "review" && data.review && <ReviewDetail review={data.review} basePath={data.basePath} workBasePath={data.workBasePath || "/our-work"} language={language} pick={pickText} />}
      </div>
    </main>
  );
}

function Media({ src, alt, icon }: { src: string | null; alt: string; icon: "briefcase" | "users" }) {
  if (src) return <div className="relative h-70 overflow-hidden bg-primary/5 sm:h-95"><Image src={src} alt={alt} fill sizes="(max-width: 640px) 100vw, 900px" className="object-cover" priority unoptimized={src.startsWith("data:")} /></div>;
  const Icon = icon === "users" ? Users : Briefcase;
  return <div className="grid h-70 place-items-center bg-primary/5 text-primary/30 sm:h-95"><Icon className="h-14 w-14" /></div>;
}

function ServiceDetail({ service, language, pick }: { service: CmsService; language: "en" | "bn"; pick: (en: string | null | undefined, bn: string | null | undefined) => string }) {
  return <article className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm"><Media src={service.imageUrl} alt={pick(service.name, service.nameBn)} icon="briefcase" /><div className="p-5 sm:p-8"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{pick(service.category, service.categoryBn)}</span><h1 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl">{pick(service.name, service.nameBn)}</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-muted-strong sm:text-base">{pick(service.description, service.descriptionBn)}</p><div className="mt-7 rounded-2xl border border-border bg-surface/60 p-4"><span className="text-[9px] font-black uppercase tracking-widest text-muted">{language === "bn" ? "কার জন্য উপযোগী" : "Best for"}</span><p className="mt-2 text-sm font-bold leading-6 text-foreground">{pick(service.bestFor, service.bestForBn)}</p></div></div></article>;
}

function WorkDetail({ work, language, pick }: { work: CmsWork & { reviews?: CmsReview[] }; language: "en" | "bn"; pick: (en: string | null | undefined, bn: string | null | undefined) => string }) {
  const reviews = work.reviews ?? [];
  return <article className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm"><Media src={work.imageUrl} alt={pick(work.title, work.titleBn)} icon="briefcase" /><div className="p-5 sm:p-8"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{pick(work.category, work.categoryBn)}</span><h1 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl">{pick(work.title, work.titleBn)}</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-muted-strong sm:text-base">{pick(work.description, work.descriptionBn)}</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{[["Client", work.clientName || "—"], ["Location", work.location || "Bangladesh"], ["Year", work.year ? String(work.year) : "—"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-border bg-surface/60 p-4"><span className="text-[9px] font-black uppercase tracking-widest text-muted">{label}</span><p className="mt-2 truncate text-sm font-bold text-foreground">{value}</p></div>)}</div>{reviews.length > 0 && <section className="mt-8 border-t border-border pt-6"><h2 className="text-base font-black uppercase text-foreground">{language === "bn" ? "সংশ্লিষ্ট মতামত" : "Related reviews"}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{reviews.map((review) => <div key={review.id} className="rounded-2xl border border-border p-4"><div className="flex items-center gap-1 text-rd-amber">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${review.rating != null && i < Math.round(review.rating) ? "fill-current" : "opacity-25"}`} />)}{review.rating != null && <span className="ml-1 text-[10px] text-muted">{review.rating.toFixed(1)}</span>}</div><p className="mt-3 text-sm leading-6 text-muted-strong">&ldquo;{language === "bn" ? review.textBn || review.textEn : review.textEn}&rdquo;</p><p className="mt-4 text-xs font-black text-foreground">{review.name}</p></div>)}</div></section>}</div></article>;
}

function TeamDetail({ team, businessEmail, language, pick }: { team: CmsTeamMember; businessEmail: string; language: "en" | "bn"; pick: (en: string | null | undefined, bn: string | null | undefined) => string }) {
  const bio = language === "bn" ? team.bioBn || team.bio || "" : team.bio || "";
  return <article className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm"><Media src={team.photoUrl} alt={pick(team.name, team.nameBn)} icon="users" /><div className="p-5 sm:p-8"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{pick(team.role, team.roleBn)}</span><h1 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl">{pick(team.name, team.nameBn)}</h1>{bio && <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-strong sm:text-base">{bio}</p>}<a href={`mailto:${businessEmail}?subject=${encodeURIComponent(`Rong Dhonu — ${pick(team.name, team.nameBn)}`)}`} className="btn-primary mt-7 inline-flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest"><Mail className="h-4 w-4" />{language === "bn" ? "ইমেইল করুন" : "Contact by email"}</a></div></article>;
}

function ReviewDetail({ review, basePath, workBasePath, language, pick }: { review: CmsReview; basePath: string; workBasePath: string; language: "en" | "bn"; pick: (en: string | null | undefined, bn: string | null | undefined) => string }) {
  return <article className="rounded-3xl border border-border bg-background p-5 shadow-sm sm:p-8"><MessageSquareQuoteIcon /><div className="mt-5 flex items-center gap-2">{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-5 w-5 ${review.rating != null && index < Math.round(review.rating) ? "fill-current text-rd-amber" : "text-muted/25"}`} />)}{review.rating != null && <span className="text-xs font-bold text-muted">{review.rating.toFixed(1)} / 5</span>}</div><blockquote className="mt-6 text-xl font-bold leading-9 text-foreground sm:text-2xl">&ldquo;{language === "bn" ? review.textBn || review.textEn : review.textEn}&rdquo;</blockquote><div className="mt-8 border-t border-border pt-5"><p className="text-base font-black text-foreground">{review.name}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted">{language === "bn" ? review.roleBn || review.role || "Client" : review.role || "Client"}</p>{review.workSlug && <Link href={`${workBasePath}/${review.workSlug}`} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-primary">{language === "bn" ? review.workTitleBn || review.workTitle || "সংশ্লিষ্ট কাজ দেখুন" : `View ${review.workTitle || "related project"}`} <ArrowUpRight className="h-3.5 w-3.5" /></Link>}</div></article>;
}

function MessageSquareQuoteIcon() { return <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><span className="text-xl font-black">“</span></div>; }
