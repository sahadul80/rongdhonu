"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import AdminActionButton from "../AdminActionButton";
import AdminActionFeedback from "../AdminActionFeedback";
import AdminPageHeader from "../AdminPageHeader";
import ContentDetailModal from "@/app/components/ContentDetailModal";
import { useEffect, useMemo, useState } from "react";
import { Archive, CalendarDays, ChevronRight, Inbox, Mail, MailOpen, Phone, RefreshCw, Search, UserRound } from "lucide-react";

interface Submission { id: number; name: string; email: string; phone: string | null; service_interest: string | null; message: string; status: "new" | "read" | "archived"; created_at: string; }
type ActionMode = "mail" | "call" | null;
const STATUS_META = { new: "bg-primary/10 text-primary", read: "bg-rd-green/10 text-rd-green", archived: "bg-surface-2 text-muted" } as const;

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Submission["status"]>("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode>(null);

  async function load() {
    setActionKey("load"); setLoading(true);
    try {
      const response = await fetch("/api/admin/submissions", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load enquiries.");
      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
    } catch (error) { setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not load enquiries." }); }
    finally { setLoading(false); setActionKey(null); }
  }
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => submissions.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = !q || [item.name, item.email, item.phone ?? "", item.service_interest ?? "", item.message].some((v) => v.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  }), [submissions, search, statusFilter]);

  async function markRead(id: number) {
    const previous = submissions.find((item) => item.id === id)?.status;
    if (previous !== "new") return true;
    setSubmissions((items) => items.map((item) => item.id === id ? { ...item, status: "read" } : item));
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "read" }) });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Could not mark enquiry as read.");
      return true;
    } catch (error) {
      if (previous) setSubmissions((items) => items.map((item) => item.id === id ? { ...item, status: previous } : item));
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not mark enquiry as read." }); return false;
    }
  }

  async function openAction(item: Submission, mode: Exclude<ActionMode, null>) {
    setSelected(item); setActionMode(mode);
    await markRead(item.id);
  }

  async function setStatus(id: number, status: Submission["status"]) {
    setActionKey(`status:${id}:${status}`);
    const previous = submissions.find((item) => item.id === id)?.status;
    setSubmissions((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update status.");
      if (selected?.id === id) setSelected((current) => current ? { ...current, status } : null);
    } catch (error) {
      if (previous) setSubmissions((items) => items.map((item) => item.id === id ? { ...item, status: previous } : item));
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not update status." });
    } finally { setActionKey(null); }
  }

  if (loading) return <AdminLoadingSkeleton title="Loading enquiries" variant="table" rows={7} />;

  return <div className="admin-page">
    <AdminPageHeader
      hasSearch
      icon={<Inbox className="h-4 w-4" />}
      title="Enquiries"
      subtitle="Compact enquiry cards with protected details, mail/call actions and automatic read state."
      actions={<AdminActionButton type="button" onClick={() => void load()} loading={actionKey === "load"} loadingLabel="Refreshing…" icon={<RefreshCw className="h-4 w-4" />} className="admin-action border border-border bg-background text-muted-strong">Refresh</AdminActionButton>}
    >
      <div className="admin-toolbar-search"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true" /><input className="admin-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone, service or message…" aria-label="Search enquiries" /></div>
      <select className="admin-select admin-toolbar-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} aria-label="Filter enquiry status"><option value="all">All statuses</option><option value="new">New</option><option value="read">Read</option><option value="archived">Archived</option></select>
      <span className="admin-toolbar-meta">{filtered.length} shown</span>
    </AdminPageHeader>
    <div className="admin-sticky-feedback"><AdminActionFeedback message={message} /></div>
    <div className="admin-scroll-panel min-h-0 flex-1 space-y-2 pr-1">
      {filtered.map((submission) => <article key={submission.id} className={`rounded-xl border p-3 ${submission.status === "new" ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
        <div className="flex min-w-0 items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><UserRound className="h-4 w-4" aria-hidden="true" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-sm font-black text-foreground">{submission.name || "Unnamed sender"}</h2><span className={`admin-status ${STATUS_META[submission.status]}`}>{submission.status}</span></div><p className="mt-1 truncate text-[10px] text-muted">{submission.email}{submission.phone ? ` · ${submission.phone}` : ""}</p>{submission.service_interest && <p className="mt-1 truncate text-[9px] font-black uppercase tracking-wider text-primary">{submission.service_interest}</p>}</div><ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" /></div>
        <p className="mt-3 line-clamp-3 rounded-lg bg-surface p-3 text-xs leading-5 text-muted-strong">{submission.message || "No message provided."}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2"><time className="inline-flex items-center gap-1 text-[9px] text-muted" dateTime={submission.created_at}><CalendarDays className="h-3 w-3" />{new Date(submission.created_at).toLocaleString()}</time><div className="flex gap-1.5"><button type="button" onClick={() => void openAction(submission, "mail")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[10px] font-black text-muted-strong hover:border-primary hover:text-primary"><Mail className="h-3.5 w-3.5" />Mail</button>{submission.phone && <button type="button" onClick={() => void openAction(submission, "call")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[10px] font-black text-muted-strong hover:border-primary hover:text-primary"><Phone className="h-3.5 w-3.5" />Call</button>}<button type="button" onClick={() => void openAction(submission, "mail")} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[10px] font-black text-primary-foreground"><MailOpen className="h-3.5 w-3.5" />Open</button></div></div>
      </article>)}
      {!filtered.length && <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-border bg-surface p-5 text-center text-xs text-muted">No enquiries match the current filters.</div>}
    </div>

    <ContentDetailModal open={Boolean(selected)} title={selected ? `Enquiry from ${selected.name}` : "Enquiry"} onClose={() => { setSelected(null); setActionMode(null); }}>
      {selected && <div className="space-y-3 p-4 sm:p-5">
        <div className="rounded-xl border border-border bg-surface p-3"><div className="flex flex-wrap items-center gap-2"><span className="admin-status bg-surface-2 text-muted">{selected.status}</span><span className="text-[9px] text-muted">{new Date(selected.created_at).toLocaleString()}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-lg bg-background p-2.5"><p className="text-[9px] font-black uppercase tracking-wider text-muted">Name</p><p className="mt-1 wrap-break-word text-xs font-bold text-foreground">{selected.name}</p></div><div className="rounded-lg bg-background p-2.5"><p className="text-[9px] font-black uppercase tracking-wider text-muted">Service</p><p className="mt-1 wrap-break-word text-xs font-bold text-foreground">{selected.service_interest || "—"}</p></div><div className="rounded-lg bg-background p-2.5"><p className="text-[9px] font-black uppercase tracking-wider text-muted">Email</p><p className="mt-1 break-all text-xs font-bold text-foreground">{selected.email}</p></div><div className="rounded-lg bg-background p-2.5"><p className="text-[9px] font-black uppercase tracking-wider text-muted">Phone</p><p className="mt-1 wrap-break-word text-xs font-bold text-foreground">{selected.phone || "—"}</p></div></div><div className="mt-2 rounded-lg bg-background p-3"><p className="text-[9px] font-black uppercase tracking-wider text-muted">Message</p><p className="mt-2 whitespace-pre-wrap wrap-break-word text-xs leading-6 text-muted-strong">{selected.message}</p></div></div>
        <div className="rounded-xl border border-border bg-surface p-2"><div className="mb-2 grid grid-cols-2 gap-1 rounded-lg bg-background p-1"><button type="button" onClick={() => setActionMode("mail")} className={`rounded-md px-3 py-2 text-xs font-black ${actionMode === "mail" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"}`}><Mail className="mr-1.5 inline h-3.5 w-3.5" />Send mail</button><button type="button" onClick={() => setActionMode("call")} disabled={!selected.phone} className={`rounded-md px-3 py-2 text-xs font-black disabled:opacity-40 ${actionMode === "call" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"}`}><Phone className="mr-1.5 inline h-3.5 w-3.5" />Call</button></div>{actionMode === "mail" ? <div className="rounded-lg bg-background p-3"><p className="text-[10px] font-bold text-muted">Ready to reply to</p><p className="mt-1 break-all text-sm font-black text-foreground">{selected.email}</p><a href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(`Re: Enquiry from ${selected.name}`)}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[10px] font-black text-primary-foreground"><Mail className="h-3.5 w-3.5" />Open mail app</a></div> : <div className="rounded-lg bg-background p-3">{selected.phone ? <><p className="text-[10px] font-bold text-muted">Ready to call</p><p className="mt-1 text-sm font-black text-foreground">{selected.phone}</p><a href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[10px] font-black text-primary-foreground"><Phone className="h-3.5 w-3.5" />Call now</a></> : <p className="text-xs text-muted">No phone number was provided.</p>}</div>}</div>
        <div className="flex flex-wrap justify-end gap-1.5"><AdminActionButton type="button" loading={actionKey?.startsWith(`status:${selected.id}:`) === true} onClick={() => void setStatus(selected.id, selected.status === "archived" ? "read" : "archived")} className="admin-action border border-border bg-background text-muted-strong"><Archive className="h-3.5 w-3.5" />{selected.status === "archived" ? "Restore" : "Archive"}</AdminActionButton>{selected.status !== "new" && <AdminActionButton type="button" loading={actionKey === `status:${selected.id}:new`} onClick={() => void setStatus(selected.id, "new")} className="admin-action border border-border bg-background text-muted-strong">Mark new</AdminActionButton>}</div>
      </div>}
    </ContentDetailModal>
  </div>;
}
