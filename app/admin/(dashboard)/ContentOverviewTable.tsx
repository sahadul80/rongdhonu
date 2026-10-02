"use client";

import Link from "next/link";
import { ArrowDownUp, ChevronDown, ChevronUp, ExternalLink, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { DashboardContentItem, DashboardSummary } from "@/lib/dashboard";

type ContentSort = "title" | "type" | "status" | "updatedAt";

type Props = Pick<DashboardSummary, "content" | "collectionSlugs">;

const LABELS: Record<DashboardContentItem["type"], string> = {
  services: "Services",
  work: "Our Work",
  team: "Our Team",
  reviews: "Reviews",
};

function publicPath(item: DashboardContentItem, slugs: Props["collectionSlugs"]): string {
  switch (item.type) {
    case "services":
      return `/services/${encodeURIComponent(item.slug)}`;
    case "reviews":
      return `/reviews/${encodeURIComponent(item.slug)}`;
    case "work":
      return `/${encodeURIComponent(slugs.workSlug)}/${encodeURIComponent(item.slug)}`;
    case "team":
      return `/${encodeURIComponent(slugs.teamSlug)}/${encodeURIComponent(item.slug)}`;
  }
}

function adminPath(type: DashboardContentItem["type"]): string {
  switch (type) {
    case "services": return "/admin/services";
    case "work": return "/admin/work";
    case "team": return "/admin/team";
    case "reviews": return "/admin/reviews";
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-BD", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default function ContentOverviewTable({ content, collectionSlugs }: Props) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | DashboardContentItem["type"]>("all");
  const [status, setStatus] = useState<"all" | "active" | "hidden">("all");
  const [sort, setSort] = useState<ContentSort>("updatedAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = content.filter((item) => {
      if (type !== "all" && item.type !== type) return false;
      if (status === "active" && !item.active) return false;
      if (status === "hidden" && item.active) return false;
      if (!needle) return true;
      return [item.title, item.slug, item.secondary ?? "", LABELS[item.type]]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

    return filtered.sort((a, b) => {
      let result = 0;
      if (sort === "title") result = a.title.localeCompare(b.title);
      else if (sort === "type") result = LABELS[a.type].localeCompare(LABELS[b.type]);
      else if (sort === "status") result = Number(a.active) - Number(b.active);
      else result = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return direction === "asc" ? result : -result;
    });
  }, [content, direction, search, sort, status, type]);

  function changeSort(next: ContentSort) {
    if (sort === next) setDirection((current) => current === "asc" ? "desc" : "asc");
    else {
      setSort(next);
      setDirection(next === "updatedAt" ? "desc" : "asc");
    }
  }

  return (
    <section className="admin-panel flex min-h-0 flex-col overflow-hidden p-3 sm:p-4" aria-labelledby="content-overview-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 id="content-overview-title" className="text-sm font-black text-foreground">Website content</h2>
          <p className="mt-1 text-[10px] text-muted">Compact management view for the latest CMS records. Open a section to edit the complete collection.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black text-primary">{rows.length} shown</span>
      </div>

      <div className="mt-3 grid gap-2 border-y border-border py-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative min-w-0">
          <span className="sr-only">Search website content</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, slug, category, role..."
            className="admin-input w-full pl-9"
          />
        </label>
        <label className="flex min-w-40 items-center gap-2 rounded-lg border border-border bg-background px-2">
          <Filter className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
          <span className="sr-only">Content type</span>
          <select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="min-h-9 w-full bg-transparent text-xs text-foreground outline-none">
            <option value="all">All types</option>
            <option value="services">Services</option>
            <option value="work">Our Work</option>
            <option value="team">Our Team</option>
            <option value="reviews">Reviews</option>
          </select>
        </label>
        <label className="min-w-32 rounded-lg border border-border bg-background px-2">
          <span className="sr-only">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-9 w-full bg-transparent text-xs text-foreground outline-none">
            <option value="all">All status</option>
            <option value="active">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
      </div>

      <div className="mt-2 min-h-0 max-h-104 overflow-auto rounded-xl border border-border">
        <table className="min-w-190 w-full border-collapse text-left text-[11px]">
          <thead className="sticky top-0 z-10 bg-surface-2 text-muted-strong">
            <tr>
              {[['title', 'Content'], ['type', 'Section'], ['status', 'Status'], ['updatedAt', 'Updated']].map(([key, label]) => {
                const active = sort === key;
                return (
                  <th key={key} className="border-b border-border px-3 py-2.5 font-black uppercase tracking-wider">
                    <button type="button" onClick={() => changeSort(key as ContentSort)} className="inline-flex items-center gap-1.5 hover:text-primary">
                      {label}
                      {active ? direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" /> : <ArrowDownUp className="h-3 w-3 opacity-40" />}
                    </button>
                  </th>
                );
              })}
              <th className="border-b border-border px-3 py-2.5 font-black uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((item) => (
              <tr key={`${item.type}-${item.id}`} className="border-b border-border/70 align-middle hover:bg-surface/70">
                <td className="px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">{item.title || "Untitled"}</p>
                    <p className="mt-0.5 max-w-72 truncate font-mono text-[9px] text-muted">/{item.slug}</p>
                    {item.secondary && <p className="mt-0.5 truncate text-[10px] text-muted">{item.secondary}</p>}
                  </div>
                </td>
                <td className="px-3 py-2.5"><span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">{LABELS[item.type]}</span></td>
                <td className="px-3 py-2.5"><span className={`admin-status ${item.active ? "bg-rd-green/10 text-rd-green" : "bg-surface-2 text-muted"}`}>{item.active ? "Visible" : "Hidden"}</span></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{formatDate(item.updatedAt)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Link href={adminPath(item.type)} className="admin-action border border-border bg-background text-muted-strong hover:border-primary hover:text-primary">Edit</Link>
                    {item.active && <Link href={publicPath(item, collectionSlugs)} target="_blank" className="admin-icon-button" title="Open public detail page" aria-label={`Open ${item.title}`}><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-8 text-center text-muted">No content matches the current search and filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
