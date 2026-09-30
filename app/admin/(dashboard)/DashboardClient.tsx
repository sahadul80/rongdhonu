"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, BriefcaseBusiness, ContactRound, FileText, HomeIcon, ImageIcon, MessageSquareQuote, Users } from "lucide-react";
import Avatar from "./Avatar";
import AdminReviewRail from "./AdminReviewRail";
import AdminLoadingSkeleton from "./AdminLoadingSkeleton";
import type { DashboardSummary } from "@/lib/dashboard";

const SECTIONS = [
  { href: "/admin/business", title: "Business", desc: "Identity, contact and brand assets", icon: BriefcaseBusiness },
  { href: "/admin/services", title: "Services", desc: "Catalogue and visibility", icon: FileText },
  { href: "/admin/team", title: "Our Team", desc: "People, photos and profile modals", icon: Users },
  { href: "/admin/work", title: "Our Work", desc: "Portfolio entries and related reviews", icon: BriefcaseBusiness },
  { href: "/admin/reviews", title: "Reviews", desc: "Client feedback", icon: MessageSquareQuote },
  { href: "/admin/hero-images", title: "Pictures", desc: "Banner and process visuals", icon: ImageIcon },
  { href: "/admin/submissions", title: "Enquiries", desc: "Incoming customer messages", icon: ContactRound },
] as const;

export default function DashboardClient() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/dashboard")
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(typeof body?.error === "string" ? body.error : "Dashboard data temporarily unavailable.");
        return body as DashboardSummary;
      })
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Dashboard data temporarily unavailable.");
      });

    return () => { cancelled = true; };
  }, []);

  if (!summary && !error) return <AdminLoadingSkeleton title="Loading dashboard" variant="dashboard" rows={5} />;

  if (!summary) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div><p className="admin-page-subtitle">Workspace overview</p><h1 className="admin-page-title mt-1">Dashboard</h1></div>
        </div>
        <div className="admin-panel grid min-h-48 place-items-center p-6 text-center">
          <div><div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-rd-red/25 bg-rd-red/10 text-rd-red"><Activity className="h-5 w-5" aria-hidden="true" /></div><h2 className="mt-3 text-base font-black text-foreground">Dashboard unavailable</h2><p className="mt-2 max-w-md text-xs leading-5 text-muted">{error}</p><button type="button" onClick={() => window.location.reload()} className="admin-action mt-4 bg-primary text-primary-foreground">Reload dashboard</button></div>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Services", value: summary.counts.activeServices, total: summary.counts.services, href: "/admin/services", tone: "sky", state: summary.counts.services ? `${summary.counts.activeServices}/${summary.counts.services} live` : "No entries" },
    { label: "Team", value: summary.counts.activeTeam, total: summary.counts.team, href: "/admin/team", tone: "emerald", state: summary.counts.team ? `${summary.counts.activeTeam}/${summary.counts.team} visible` : "No entries" },
    { label: "Reviews", value: summary.counts.activeReviews, total: summary.counts.reviews, href: "/admin/reviews", tone: "violet", state: summary.counts.reviews ? `${summary.counts.activeReviews}/${summary.counts.reviews} live` : "No entries" },
    { label: "Our Work", value: summary.counts.activeWork, total: summary.counts.work, href: "/admin/work", tone: "blue", state: summary.counts.work ? `${summary.counts.activeWork}/${summary.counts.work} live` : "No entries" },
    { label: "New enquiries", value: summary.counts.newEnquiries, total: null, href: "/admin/submissions", tone: summary.counts.newEnquiries ? "amber" : "slate", state: summary.counts.newEnquiries ? "Needs attention" : "All caught up" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="min-w-0">
          <span className="admin-page-title flex items-center gap-2"><HomeIcon className="h-auto w-auto text-primary" aria-hidden="true" />Dashboard</span>
          <p className="admin-page-subtitle">Compact website controls, publication status and activity at a glance.</p>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <section aria-label="Content indicators" className="admin-metrics-rail grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Link key={metric.label} href={metric.href} className={`metric-card metric-${metric.tone} glass-surface rounded-xl p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:p-3.5`}>
              <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold text-muted">{metric.label}</span><span className="metric-mark grid h-7 w-7 place-items-center rounded-lg"><span className="h-2 w-2 rounded-full bg-current" /></span></div>
              <div className="mt-1 flex items-baseline gap-1.5"><strong className="text-2xl font-black tabular-nums text-foreground sm:text-3xl">{metric.value}</strong>{metric.total !== null && <span className="text-[10px] text-muted">of {metric.total}</span>}</div>
              {metric.total !== null && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="metric-fill h-full rounded-full" style={{ width: `${metric.total ? Math.min(100, (metric.value / metric.total) * 100) : 0}%` }} /></div>}
              <p className="mt-1.5 text-[10px] font-semibold text-muted">{metric.state}</p>
            </Link>
          ))}
        </section>

        <div className="admin-dashboard-panels grid min-h-0 gap-3 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="admin-panel glass-surface flex min-h-0 flex-col p-3 sm:p-4">
            <div><h2 className="text-sm font-bold text-foreground">Team snapshot</h2><p className="mt-1 text-[11px] text-muted">Current display order.</p></div>
            <div className="admin-scroll-panel mt-3 pr-1">
              {summary.team.length ? <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">{summary.team.slice(0, 6).map((member) => <li key={member.id} className="glass-panel flex min-w-0 items-center gap-2 p-2"><Avatar name={member.name || "?"} photoUrl={member.photoUrl} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-foreground">{member.name || "Unnamed"}</p><p className="truncate text-[10px] text-muted">{member.role || "Role not provided"}</p></div><span className={`admin-status ${member.active ? "bg-rd-green/10 text-rd-green" : "bg-surface-2 text-muted"}`}>{member.active ? "Live" : "Hidden"}</span></li>)}</ul> : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-border bg-surface p-4 text-center text-xs text-muted">No team profiles yet.</div>}
            </div>
          </section>
          <AdminReviewRail reviews={summary.latestReviews} />
        </div>

        <section className="admin-panel glass-surface admin-manage-panel p-3 sm:p-4">
          <div className="mb-2 flex items-end justify-between gap-3"><div><h2 className="text-sm font-bold text-foreground">Manage website</h2><p className="mt-1 text-[11px] text-muted">Every editor stays inside the same compact screen shell.</p></div><span className="hidden text-[10px] text-muted sm:inline">Select a workspace</span></div>
          <div className="admin-manage-rail grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{SECTIONS.map(({ href, title, desc, icon: Icon }) => <Link key={href} href={href} className="glass-panel group rounded-xl p-2.5 transition hover:border-primary/40 hover:bg-primary/5 sm:p-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" aria-hidden="true" /></span><h3 className="mt-2 text-xs font-bold text-foreground">{title}</h3><p className="mt-1 hidden text-[10px] leading-4 text-muted sm:block">{desc}</p></Link>)}</div>
        </section>
      </div>
    </div>
  );
}
