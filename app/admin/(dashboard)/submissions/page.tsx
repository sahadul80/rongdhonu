"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useState } from "react";
import { Archive, Inbox, MailOpen, RefreshCw } from "lucide-react";

interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  service_interest: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

const STATUS_META = {
  new: { label: "New", icon: Inbox, classes: "bg-primary/10 text-primary" },
  read: { label: "Read", icon: MailOpen, classes: "bg-rd-green/10 text-rd-green" },
  archived: { label: "Archived", icon: Archive, classes: "bg-surface-2 text-muted" },
} as const;

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/submissions");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load enquiries.");
      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load enquiries.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function setStatus(id: number, status: Submission["status"]) {
    setSubmissions((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    const response = await fetch(`/api/admin/submissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) {
      setMessage("Could not update the enquiry status.");
      void load();
    }
  }

  if (loading) return <AdminLoadingSkeleton title="Loading enquiries" variant="table" rows={7} />;

  return (
    <div className="admin-page">
      <div className="flex flex-row items-center justify-between">
        <div className="min-w-0">
          <span className="flex flex-row items-center gap-2"><Inbox className="h-auto w-auto text-primary" aria-hidden="true" />Enquiries</span><p className="admin-page-subtitle hidden sm:inline">Incoming contact requests with compact status indicators and a scroll-only content area.</p>
        </div>
        <div>
          <button type="button" onClick={() => void load()} className="admin-action border border-border bg-background text-muted-strong hover:bg-surface-2"><RefreshCw className="h-4 w-4" aria-hidden="true" />Refresh</button>
        </div>
      </div>
      {message && <p role="alert" className="rounded-lg bg-rd-red/10 px-3 py-2 text-xs font-semibold text-rd-red">{message}</p>}

      <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
        <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-foreground">Customer messages</h2><p className="text-[10px] text-muted">{submissions.length} record{submissions.length === 1 ? "" : "s"}</p></div></div>
        <div className="admin-scroll-panel min-h-0 flex-1 space-y-2 pr-1">
          {submissions.length ? submissions.map((submission) => {
            const MetaIcon = STATUS_META[submission.status].icon;
            return <article key={submission.id} className={`rounded-xl border p-2 ${submission.status === "new" ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
              <div className="flex flex-1 items-start justify-between">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-foreground">{submission.name || "Unnamed sender"}</h3><span className={`admin-status ${STATUS_META[submission.status].classes}`}><MetaIcon className="h-3 w-3" aria-hidden="true" />{STATUS_META[submission.status].label}</span></div><p className="mt-1 truncate text-xs text-muted">{submission.email}{submission.phone ? ` · ${submission.phone}` : ""}</p>{submission.service_interest && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">{submission.service_interest}</p>}</div>
                <div className="shrink-0 flex flex-row items-center justify-end gap-1 border-border">{(Object.keys(STATUS_META) as Submission["status"][]).map((status) => <button key={status} type="button" onClick={() => void setStatus(submission.id, status)} className={`admin-nav-item p-0 ${submission.status === status ? "is-active" : ""}`}>{STATUS_META[status].label}</button>)}</div>
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-surface p-3 text-xs leading-5 text-muted-strong">{submission.message || "No message provided."}</p>
              <div className="flex w-full items-end justify-end"><time className="shrink-0 text-[9px] text-muted italic max-h-1.5" dateTime={submission.created_at}>{new Date(submission.created_at).toLocaleString()}</time></div>
            </article>;
          }) : <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-border bg-surface p-5 text-center text-xs text-muted">No enquiries yet.</div>}
        </div>
      </div>
    </div>
  );
}
