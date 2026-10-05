"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Filter, RefreshCw, Search } from "lucide-react";
import AdminActionButton from "./AdminActionButton";
import type { VisitorAnalyticsRow } from "@/lib/dashboard";

type SortKey = keyof Pick<VisitorAnalyticsRow, "visitorId" | "firstSeenAt" | "lastSeenAt" | "visitCount" | "sessionCount" | "deviceType" | "browser" | "operatingSystem" | "country" | "city">;
type Direction = "asc" | "desc";

const headers: Array<{ key: SortKey; label: string }> = [
  { key: "visitorId", label: "Visitor" },
  { key: "firstSeenAt", label: "First seen" },
  { key: "lastSeenAt", label: "Last seen" },
  { key: "visitCount", label: "Visits" },
  { key: "sessionCount", label: "Sessions" },
  { key: "deviceType", label: "Device" },
  { key: "browser", label: "Browser" },
  { key: "operatingSystem", label: "OS" },
  { key: "country", label: "Country" },
  { key: "city", label: "City" },
];

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function VisitorAnalyticsTable() {
  const [rows, setRows] = useState<VisitorAnalyticsRow[]>([]);
  const [total, setTotal] = useState(0);
  const [devices, setDevices] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [device, setDevice] = useState("");
  const [country, setCountry] = useState("");
  const [returning, setReturning] = useState<"all" | "returning" | "new">("all");
  const [sort, setSort] = useState<SortKey>("lastSeenAt");
  const [direction, setDirection] = useState<Direction>("desc");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const limit = 40;

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ search, device, country, returning, sort, dir: direction, limit: String(limit), offset: String(offset) });
        const response = await fetch(`/api/admin/analytics/visitors?${params.toString()}`, { cache: "no-store" });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || "Could not load visitor data.");
        setRows(Array.isArray(body.rows) ? body.rows : []);
        setTotal(Number(body.total) || 0);
        setDevices(Array.isArray(body.facets?.devices) ? body.facets.devices : []);
        setCountries(Array.isArray(body.facets?.countries) ? body.facets.countries : []);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not load visitor data.");
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [search, device, country, returning, sort, direction, offset, refreshNonce]);

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset]);
  const pageCount = Math.max(1, Math.ceil(total / limit));

  function changeSort(key: SortKey) {
    setOffset(0);
    if (sort === key) setDirection((current) => current === "asc" ? "desc" : "asc");
    else { setSort(key); setDirection("desc"); }
  }

  return (
    <section className="admin-panel flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-sm font-black text-foreground">Individual visitor data</h2><p className="mt-1 text-[10px] text-muted">{total.toLocaleString()} visitor records. Click a header to sort ascending or descending.</p></div>
        <AdminActionButton type="button" onClick={() => setRefreshNonce((current) => current + 1)} loading={loading} loadingLabel="Refreshing…" icon={<RefreshCw className="h-4 w-4" />} className="admin-action border border-border bg-background text-muted-strong hover:bg-surface-2">Refresh</AdminActionButton>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-y border-border py-3">
        <label className="relative min-w-60 flex-1"><span className="sr-only">Search visitors</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input value={search} onChange={(event) => { setOffset(0); setSearch(event.target.value); }} placeholder="Search ID, browser, path, referrer, city, country..." className="admin-input pl-9" /></label>
        <label className="flex min-w-36 items-center gap-2 rounded-lg border border-border bg-background px-2"><Filter className="h-4 w-4 text-muted" /><span className="sr-only">Device</span><select className="min-h-9 bg-transparent text-xs text-foreground outline-none" value={device} onChange={(event) => { setOffset(0); setDevice(event.target.value); }}><option value="">All devices</option>{devices.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="min-w-40 rounded-lg border border-border bg-background px-3"><span className="sr-only">Country</span><select className="min-h-9 w-full bg-transparent text-xs text-foreground outline-none" value={country} onChange={(event) => { setOffset(0); setCountry(event.target.value); }}><option value="">All countries</option>{countries.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="min-w-36 rounded-lg border border-border bg-background px-3"><span className="sr-only">Visitor type</span><select className="min-h-9 w-full bg-transparent text-xs text-foreground outline-none" value={returning} onChange={(event) => { setOffset(0); setReturning(event.target.value as typeof returning); }}><option value="all">All visitors</option><option value="returning">Returning</option><option value="new">Single visit</option></select></label>
      </div>

      {error && <p className="mb-2 rounded-lg bg-rd-red/10 px-3 py-2 text-xs font-semibold text-rd-red">{error}</p>}

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border">
        <table className="min-w-312.5 w-full border-collapse text-left text-[11px]">
          <thead className="sticky top-0 z-10 bg-surface-2 text-muted-strong">
            <tr>{headers.map((header) => { const active = sort === header.key; return <th key={header.key} className="border-b border-border px-3 py-2.5 font-black uppercase tracking-wider"><button type="button" onClick={() => changeSort(header.key)} className="inline-flex items-center gap-1.5 text-left hover:text-primary">{header.label}{active ? direction === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" /> : <ArrowDownUp className="h-3 w-3 opacity-40" />}</button></th>; })}<th className="border-b border-border px-3 py-2.5 font-black uppercase tracking-wider">Details</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={headers.length + 1} className="p-8 text-center text-muted">Loading visitor records…</td></tr> : rows.length === 0 ? <tr><td colSpan={headers.length + 1} className="p-8 text-center text-muted">No visitor records match the current filters.</td></tr> : rows.map((row) => (
              <tr key={row.visitorId} className="border-b border-border/70 align-top hover:bg-surface/70">
                <td className="px-3 py-2.5"><p className="max-w-40 truncate font-bold text-foreground" title={row.visitorId}>{row.visitorId}</p><p className="mt-1 text-[10px] text-muted">{row.ipMasked || "IP unavailable"}</p></td>
                <td className="px-3 py-2.5 text-muted">{formatDate(row.firstSeenAt)}</td>
                <td className="px-3 py-2.5 text-muted">{formatDate(row.lastSeenAt)}</td>
                <td className="px-3 py-2.5 font-black text-foreground">{row.visitCount}</td>
                <td className="px-3 py-2.5 text-foreground">{row.sessionCount}</td>
                <td className="px-3 py-2.5">{row.deviceType || "—"}</td>
                <td className="px-3 py-2.5">{row.browser || "—"}</td>
                <td className="px-3 py-2.5">{row.operatingSystem || "—"}</td>
                <td className="px-3 py-2.5">{row.country || "—"}{row.region ? ` · ${row.region}` : ""}</td>
                <td className="px-3 py-2.5">{row.city || "—"}</td>
                <td className="px-3 py-2.5"><details><summary className="cursor-pointer text-primary">View</summary><div className="mt-2 grid min-w-72 gap-1 rounded-lg bg-surface p-2 text-[10px] leading-4 text-muted-strong"><p><b>Last path:</b> {row.lastPath || "—"}</p><p><b>Landing:</b> {row.landingPath || "—"}</p><p><b>Referrer:</b> {row.referrer || "Direct"}</p><p><b>Language:</b> {row.language || "—"}</p><p><b>Languages:</b> {row.languages || "—"}</p><p><b>Timezone:</b> {row.timezone || "—"}</p><p><b>Platform:</b> {row.platform || "—"}</p><p><b>Screen:</b> {row.screenWidth || "—"} × {row.screenHeight || "—"}</p><p><b>Viewport:</b> {row.viewportWidth || "—"} × {row.viewportHeight || "—"}</p><p><b>Cookies:</b> {row.cookiesEnabled == null ? "—" : row.cookiesEnabled ? "Enabled" : "Disabled"}</p><p className="break-all"><b>User agent:</b> {row.userAgent || "—"}</p></div></details></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted"><span>Page {page} of {pageCount}</span><div className="flex items-center gap-1"><button type="button" disabled={offset === 0} onClick={() => setOffset((current) => Math.max(0, current - limit))} className="admin-action border border-border bg-background disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button><button type="button" disabled={offset + limit >= total} onClick={() => setOffset((current) => current + limit)} className="admin-action border border-border bg-background disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button></div></div>
    </section>
  );
}
