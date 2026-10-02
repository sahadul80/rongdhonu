"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Briefcase, MessageSquareQuote, Users } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import type { CmsReview, CmsService, CmsTeamMember, CmsWork } from "@/app/types/public-cms";

interface CollectionData {
  collection: "services" | "reviews" | "work" | "team";
  basePath: string;
  businessName: string;
  services?: CmsService[];
  reviews?: CmsReview[];
  work?: CmsWork[];
  team?: CmsTeamMember[];
}

function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      <span className="tracking-[0.08em] text-rd-amber" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (index < rounded ? "★" : "☆")).join("")}
      </span>
      <span className="text-[10px] font-bold text-muted">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function PublicCollectionPage({ data }: { data: CollectionData }) {
  const { language, pick } = useLanguage();

  if (data.collection === "services") {
    return (
      <CollectionShell title={language === "bn" ? "সেবাসমূহ" : "Services"} intro={language === "bn" ? "বাড়ি, অফিস ও অন্যান্য স্পেসের জন্য পেইন্টিং ও ফিনিশিং সমাধান।" : "Painting, renovation and finishing solutions for homes, offices and other spaces."}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data.services ?? []).map((item) => (
            <Link key={item.id} href={`${data.basePath}/${item.slug}`} className="group glass-card overflow-hidden rounded-2xl border border-border bg-background transition hover:-translate-y-0.5 hover:border-primary/40">
              <div className="relative h-48 overflow-hidden bg-primary/5">
                {item.imageUrl ? <Image src={item.imageUrl} alt={pick(item.name, item.nameBn)} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" unoptimized={item.imageUrl.startsWith("data:")} /> : <div className="grid h-full place-items-center text-primary/30"><Briefcase className="h-10 w-10" /></div>}
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">{pick(item.category, item.categoryBn)}</span>
                <h2 className="mt-2 text-lg font-black text-foreground">{pick(item.name, item.nameBn)}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{pick(item.description, item.descriptionBn)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-primary">View details <ArrowUpRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          ))}
        </div>
      </CollectionShell>
    );
  }

  if (data.collection === "work") {
    return (
      <CollectionShell title={language === "bn" ? "আমাদের কাজ" : "Our Work"} intro={language === "bn" ? "প্রকাশিত প্রজেক্ট ও সম্পন্ন কাজের বিস্তারিত দেখুন।" : "Explore published projects and completed work in detail."}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data.work ?? []).map((item) => (
            <Link key={item.id} href={`${data.basePath}/${item.slug}`} className="group glass-card overflow-hidden rounded-2xl border border-border bg-background transition hover:-translate-y-0.5 hover:border-primary/40">
              <div className="relative h-48 overflow-hidden bg-primary/5">
                {item.imageUrl ? <Image src={item.imageUrl} alt={pick(item.title, item.titleBn)} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" unoptimized={item.imageUrl.startsWith("data:")} /> : <div className="grid h-full place-items-center text-primary/30"><Briefcase className="h-10 w-10" /></div>}
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">{pick(item.category, item.categoryBn)}</span>
                <h2 className="mt-2 text-lg font-black text-foreground">{pick(item.title, item.titleBn)}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{pick(item.description, item.descriptionBn)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-primary">View project <ArrowUpRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          ))}
        </div>
      </CollectionShell>
    );
  }

  if (data.collection === "team") {
    return (
      <CollectionShell title={language === "bn" ? "আমাদের টিম" : "Our Team"} intro={language === "bn" ? "আমাদের টিমের সদস্যদের প্রোফাইল ও ভূমিকা দেখুন।" : "Meet the people behind the work and explore their profiles."}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data.team ?? []).map((item) => (
            <Link key={item.id} href={`${data.basePath}/${item.slug}`} className="group glass-card overflow-hidden rounded-2xl border border-border bg-background transition hover:-translate-y-0.5 hover:border-primary/40">
              <div className="relative h-64 overflow-hidden bg-primary/5">
                {item.photoUrl ? <Image src={item.photoUrl} alt={pick(item.name, item.nameBn)} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" unoptimized={item.photoUrl.startsWith("data:")} /> : <div className="grid h-full place-items-center text-primary/30"><Users className="h-10 w-10" /></div>}
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">{pick(item.role, item.roleBn)}</span>
                <h2 className="mt-2 text-lg font-black text-foreground">{pick(item.name, item.nameBn)}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{language === "bn" ? item.bioBn || item.bio || "" : item.bio || ""}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-primary">View profile <ArrowUpRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          ))}
        </div>
      </CollectionShell>
    );
  }

  return (
    <CollectionShell title={language === "bn" ? "গ্রাহকের মতামত" : "Customer Reviews"} intro={language === "bn" ? "আমাদের কাজ ও সেবা সম্পর্কে ক্লায়েন্টদের অভিজ্ঞতা।" : "Client experiences with our work and services."}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data.reviews ?? []).map((item) => {
          const card = <div className="group glass-card rounded-2xl border border-border bg-background p-5 transition hover:-translate-y-0.5 hover:border-primary/40"><MessageSquareQuote className="h-7 w-7 text-primary/20" aria-hidden="true" /><div className="mt-3"><Stars rating={item.rating} /></div><p className="mt-3 line-clamp-6 text-sm leading-6 text-muted-strong">&ldquo;{language === "bn" ? item.textBn || item.textEn : item.textEn}&rdquo;</p><div className="mt-5 border-t border-border pt-3"><p className="truncate text-sm font-black text-foreground">{item.name}</p><p className="mt-1 truncate text-[9px] uppercase tracking-widest text-muted">{language === "bn" ? item.roleBn || item.role || "Client" : item.role || "Client"}</p>{item.workSlug && <p className="mt-2 text-[10px] font-bold text-primary">{language === "bn" ? item.workTitleBn || item.workTitle || "সংশ্লিষ্ট কাজ" : item.workTitle || "Related project"}</p>}</div></div>;
          return item.source === "user" ? <article key={`user-${item.id}`}>{card}</article> : <Link key={`admin-${item.id}`} href={`${data.basePath}/${item.slug}`}>{card}</Link>;
        })}
      </div>
    </CollectionShell>
  );
}

function CollectionShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-background px-4 pb-12 pt-24 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 flex items-center gap-2"><div className="h-px w-10 bg-rainbow" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Rong Dhonu</span></div>
          <h1 className="text-3xl font-black uppercase leading-tight text-foreground sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{intro}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
