"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  ContactRound,
  Eye,
  FileText,
  HomeIcon,
  ImageIcon,
  MessageSquareQuote,
  Repeat2,
  RefreshCw,
  Users,
} from "lucide-react";
import Avatar from "./Avatar";
import AdminReviewRail from "./AdminReviewRail";
import AdminLoadingSkeleton from "./AdminLoadingSkeleton";
import AnalyticsChart from "./AnalyticsChart";
import VisitorAnalyticsTable from "./VisitorAnalyticsTable";
import ContentOverviewTable from "./ContentOverviewTable";
import AdminActionButton from "./AdminActionButton";
import type { DashboardSummary } from "@/lib/dashboard";
import AdminPageHeader from "./AdminPageHeader";

const SECTIONS = [
  { href: "/admin/business", title: "Business", desc: "Identity, contact and brand assets", icon: BriefcaseBusiness },
  { href: "/admin/services", title: "Services", desc: "Catalogue and visibility", icon: FileText },
  { href: "/admin/team", title: "Our Team", desc: "People, photos and profiles", icon: Users },
  { href: "/admin/work", title: "Our Work", desc: "Portfolio and reviews", icon: BriefcaseBusiness },
  { href: "/admin/reviews", title: "Reviews", desc: "Client feedback and ratings", icon: MessageSquareQuote },
  { href: "/admin/hero-images", title: "Pictures", desc: "Banner and process visuals", icon: ImageIcon },
  { href: "/admin/submissions", title: "Enquiries", desc: "Incoming customer messages", icon: ContactRound },
] as const;

export default function DashboardClient() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [refreshing, setRefreshing] = useState(false);

  async function loadSummary(nextDays = days, showLoading = false) {
    setError(null);
    if (showLoading) setRefreshing(true);
    try {
      const response = await fetch(`/api/admin/dashboard?days=${nextDays}`, { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body?.error === "string" ? body.error : "Dashboard data temporarily unavailable.");
      setSummary(body as DashboardSummary);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dashboard data temporarily unavailable.");
    } finally {
      if (showLoading) setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadSummary(days, true);
  }, [days]);

  if (!summary && !error) {
    return <AdminLoadingSkeleton title="Loading dashboard" variant="dashboard" rows={5} />;
  }

  if (!summary) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <p className="admin-page-subtitle">Workspace overview</p>
            <h1 className="admin-page-title mt-1">Dashboard</h1>
          </div>
        </div>
        <div className="admin-panel grid min-h-48 place-items-center p-6 text-center">
          <div>
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-rd-red/25 bg-rd-red/10 text-rd-red">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-base font-black text-foreground">Dashboard unavailable</h2>
            <p className="mt-2 max-w-md text-xs leading-5 text-muted">{error}</p>
            <AdminActionButton type="button" onClick={() => void loadSummary(days, true)} loading={refreshing} loadingLabel="Reloading…" className="admin-action mt-4 bg-primary text-primary-foreground">Reload dashboard</AdminActionButton>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Unique visitors", value: summary.counts.visitors, icon: Eye, href: "#visitor-analytics" },
    { label: "Visits", value: summary.counts.visits, icon: BarChart3, href: "#visitor-analytics" },
    { label: "Returning", value: summary.counts.returningVisitors, icon: Repeat2, href: "#visitor-analytics" },
    { label: "Reviews", value: summary.counts.reviews, icon: MessageSquareQuote, href: "/admin/reviews" },
    { label: "New website reviews", value: summary.counts.pendingUserReviews, icon: MessageSquareQuote, href: "/admin/reviews" },
    { label: "Enquiries", value: summary.counts.enquiries, icon: ContactRound, href: "/admin/submissions" },
    { label: "New enquiries", value: summary.counts.newEnquiries, icon: ContactRound, href: "/admin/submissions" },
    { label: "Services", value: summary.counts.activeServices, icon: FileText, href: "/admin/services" },
    { label: "Our Work", value: summary.counts.activeWork, icon: BriefcaseBusiness, href: "/admin/work" },
    { label: "Team", value: summary.counts.activeTeam, icon: Users, href: "/admin/team" },
  ];

  return (
    <div className="admin-page">
      <AdminPageHeader
        icon={<HomeIcon className="h-4 w-4" />}
        title="Dashboard"
        subtitle="Compact website analytics and CMS control center."
        actions={<AdminActionButton type="button" onClick={() => void loadSummary(days, true)} loading={refreshing} loadingLabel="Refreshing…" icon={<RefreshCw className="h-4 w-4" />} className="admin-action border border-border bg-background text-muted-strong">Refresh</AdminActionButton>}
      >
        <select className="admin-select admin-toolbar-filter" value={days} onChange={(event) => setDays(Number(event.target.value) as 7 | 30 | 90)} aria-label="Analytics range">
          <option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option>
        </select>
        <span className="admin-toolbar-meta">{summary.counts.visits.toLocaleString()} visits · {summary.counts.newEnquiries.toLocaleString()} new enquiries · {summary.counts.pendingUserReviews.toLocaleString()} new reviews</span>
      </AdminPageHeader>

      <section aria-label="Website metrics" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="metric-card glass-surface rounded-xl p-2.5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-muted sm:text-[11px]">{label}</span>
              <span className="metric-mark grid h-7 w-7 place-items-center rounded-lg"><Icon className="h-3.5 w-3.5" aria-hidden="true" /></span>
            </div>
            <strong className="mt-1 block text-xl font-black tabular-nums text-foreground sm:text-2xl">{value.toLocaleString()}</strong>
          </Link>
        ))}
      </section>

      <section id="visitor-analytics" className="grid gap-2.5 lg:grid-cols-3">
        <AnalyticsChart title="Visitor frequency" subtitle="Visits recorded over time." points={summary.charts.visitors} valueLabel={`${summary.counts.visits.toLocaleString()} visits`} compact />
        <AnalyticsChart title="Review frequency" subtitle="Published reviews created over time." points={summary.charts.reviews} valueLabel={`${summary.counts.reviews.toLocaleString()} total`} compact />
        <AnalyticsChart title="Enquiry frequency" subtitle="Incoming enquiries over time." points={summary.charts.enquiries} valueLabel={`${summary.counts.enquiries.toLocaleString()} total`} compact />
      </section>

      <ContentOverviewTable content={summary.content} collectionSlugs={summary.collectionSlugs} />

      <VisitorAnalyticsTable />

      <section className="grid min-h-0 gap-2.5 lg:grid-cols-[0.78fr_1.22fr]">
        <section className="admin-panel glass-surface flex min-h-0 flex-col p-3" aria-labelledby="team-snapshot-title">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 id="team-snapshot-title" className="text-sm font-bold text-foreground">Team snapshot</h2>
              <p className="mt-0.5 text-[10px] text-muted">Current public order.</p>
            </div>
            <Link href="/admin/team" className="text-[10px] font-bold text-primary">Manage</Link>
          </div>
          <div className="admin-scroll-panel mt-2 pr-1">
            {summary.team.length ? (
              <ul className="grid gap-1.5">
                {summary.team.map((member) => (
                  <li key={member.id} className="glass-panel flex min-w-0 items-center gap-2 p-2">
                    <Avatar name={member.name || "?"} photoUrl={member.photoUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-foreground">{member.name || "Unnamed"}</p>
                      <p className="truncate text-[10px] text-muted">{member.role || "Role not provided"}</p>
                    </div>
                    <span className={`admin-status ${member.active ? "bg-rd-green/10 text-rd-green" : "bg-surface-2 text-muted"}`}>{member.active ? "Live" : "Hidden"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid min-h-24 place-items-center rounded-xl border border-dashed border-border bg-surface p-4 text-center text-xs text-muted">No team profiles yet.</div>
            )}
          </div>
        </section>

        <AdminReviewRail reviews={summary.latestReviews} />
      </section>

      <section className="admin-panel glass-surface admin-manage-panel p-3" aria-labelledby="manage-website-title">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 id="manage-website-title" className="text-sm font-bold text-foreground">Manage website</h2>
            <p className="mt-0.5 text-[10px] text-muted">Open the dedicated editor for the complete collection.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
          {SECTIONS.map(({ href, title, icon: Icon }) => (
            <Link key={href} href={href} className="glass-panel group flex min-h-16 items-center gap-2 rounded-lg p-2 transition hover:border-primary/40 hover:bg-primary/5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-3.5 w-3.5" aria-hidden="true" /></span>
              <h3 className="truncate text-[10px] font-bold text-foreground">{title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
