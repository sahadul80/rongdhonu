"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useState, type FormEvent } from "react";
import { MessageSquareQuote, Plus, Save, Trash2, X } from "lucide-react";
import { validateReviewForm, type ReviewFormValue } from "@/lib/formValidation";

interface ReviewRow extends ReviewFormValue {
  id: number;
  work_id: number | null;
  sort_order: number;
  active: boolean;
}

const BLANK: ReviewFormValue & { workId: string } = { name: "", role: "", roleBn: "", textEn: "", textBn: "", workId: "" };

export default function ReviewsEditorPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [workOptions, setWorkOptions] = useState<{id:number;title:string}[]>([]);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reviews");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load reviews.");
      setReviews(Array.isArray(data.reviews) ? data.reviews.map((item: Record<string, unknown>) => ({
        id: Number(item.id),
        name: typeof item.name === "string" ? item.name : "",
        role: typeof item.role === "string" ? item.role : "",
        roleBn: typeof item.role_bn === "string" ? item.role_bn : "",
        textEn: typeof item.text_en === "string" ? item.text_en : "",
        textBn: typeof item.text_bn === "string" ? item.text_bn : "",
        work_id: item.work_id == null ? null : Number(item.work_id),
        sort_order: Number(item.sort_order) || 0,
        active: item.active !== false,
      })) : []);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not load reviews." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); void fetch("/api/admin/work").then(r => r.json()).then(d => setWorkOptions(Array.isArray(d.work) ? d.work.map((w: Record<string, unknown>) => ({ id: Number(w.id), title: typeof w.title === "string" ? w.title : "" })) : [])).catch(() => setWorkOptions([])); }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateReviewForm(draft);
    if (!validation.ok) return setMessage({ ok: false, text: validation.message });

    const response = await fetch("/api/admin/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, workId: draft.workId ? Number(draft.workId) : null }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage({ ok: false, text: data.error || "Could not add review." });
    setDraft(BLANK);
    setCreating(false);
    setMessage({ ok: true, text: "Review added." });
    void load();
  }

  async function saveReview(review: ReviewRow) {
    const validation = validateReviewForm(review);
    if (!validation.ok) return setMessage({ ok: false, text: validation.message });
    const response = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: review.name, role: review.role, roleBn: review.roleBn, textEn: review.textEn, textBn: review.textBn, workId: review.work_id, active: review.active, sortOrder: review.sort_order }),
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? { ok: true, text: "Review saved." } : { ok: false, text: data.error || "Could not save review." });
    if (!response.ok) void load();
  }

  async function deleteReview(id: number) {
    const response = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (response.ok) {
      setReviews((current) => current.filter((review) => review.id !== id));
      setDeletingId(null);
      setMessage({ ok: true, text: "Review removed." });
    } else {
      const data = await response.json().catch(() => ({}));
      setMessage({ ok: false, text: data.error || "Could not delete review." });
    }
  }

  if (loading) return <AdminLoadingSkeleton title="Loading reviews" variant="table" rows={5} />;

  return (
    <div className="admin-page">
      <div className="flex flex-row items-center justify-between">
        <div className="min-w-0">
          <span className="flex flex-row items-center gap-2"><MessageSquareQuote className="h-auto w-auto text-primary" aria-hidden="true" /><p className="admin-page-title">Reviews</p></span>
          <p className="admin-page-subtitle hidden sm:inline">Client testimonials. Public review cards use the same data and scroll side by side on small screens.</p>
        </div>
        <div>
          <button type="button" onClick={() => { setCreating((current) => !current); setMessage(null); }} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600 disabled:opacity-60">
            {creating ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {creating ? "Cancel" : "Add"}
          </button>
        </div>
      </div>

      {message && <p role={message.ok ? "status" : "alert"} className={`rounded-lg px-3 py-2 text-xs font-semibold ${message.ok ? "bg-rd-green/10 text-rd-green" : "bg-rd-red/10 text-rd-red"}`}>{message.text}</p>}

      {creating && (
        <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
          <form onSubmit={handleCreate} className="admin-panel p-3 sm:p-4">
            <div className="mb-3"><h2 className="text-sm font-bold text-foreground">New review</h2><p className="text-[10px] text-muted">Validation runs in TypeScript before the request is sent.</p></div>
            <ReviewFields value={draft} onChange={setDraft} workOptions={workOptions} />
            <button type="submit" className="admin-action mt-3 bg-primary text-primary-foreground"><Plus className="h-4 w-4" aria-hidden="true" />Add review</button>
          </form>
        </div>
      )}

      <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
        <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-foreground">Saved reviews</h2><p className="text-[10px] text-muted">{reviews.length} record{reviews.length === 1 ? "" : "s"}</p></div></div>
        <div className="admin-scroll-panel min-h-0 flex-1 space-y-2 pr-1">
          {reviews.length ? reviews.map((review) => (
            <ReviewCard key={review.id} review={review} workOptions={workOptions} deleting={deletingId === review.id} onDeleteRequest={() => setDeletingId(review.id)} onDeleteCancel={() => setDeletingId(null)} onDelete={() => void deleteReview(review.id)} onSaved={saveReview} onChange={(patch) => setReviews((current) => current.map((item) => item.id === review.id ? { ...item, ...patch } : item))} />
          )) : <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-border bg-surface p-5 text-center text-xs text-muted">No reviews yet. Add the first review above.</div>}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, workOptions, onChange, onSaved, onDeleteRequest, onDeleteCancel, onDelete, deleting }: { review: ReviewRow; workOptions: {id:number;title:string}[]; onChange: (patch: Partial<ReviewRow>) => void; onSaved: (review: ReviewRow) => Promise<void>; onDeleteRequest: () => void; onDeleteCancel: () => void; onDelete: () => void; deleting: boolean }) {
  return (
    <article className={`rounded-xl border p-3 ${review.active ? "border-border bg-background" : "border-dashed border-border bg-surface/60"}`}>
      <div className="grid gap-2 lg:grid-cols-[1fr_1fr_auto]">
        <Field label="Reviewer" value={review.name} onChange={(value) => onChange({ name: value })} />
        <Field label="Role" value={review.role} onChange={(value) => onChange({ role: value })} />
        <label className="admin-label lg:min-w-28"><span>Visibility</span><button type="button" onClick={() => onChange({ active: !review.active })} className={`admin-status min-h-10 justify-center rounded-lg border ${review.active ? "border-rd-green/25 bg-rd-green/10 text-rd-green" : "border-border bg-surface-2 text-muted"}`}>{review.active ? "Visible" : "Hidden"}</button></label>
      </div>
      <div className="mt-2 grid gap-2 lg:grid-cols-2">
        <label className="admin-label"><span>Related work</span><select className="admin-input" value={review.work_id ? String(review.work_id) : ""} onChange={(event) => onChange({ work_id: event.target.value ? Number(event.target.value) : null })}><option value="">General review</option>{workOptions.map((work) => <option key={work.id} value={String(work.id)}>{work.title}</option>)}</select></label>
        <Field label="Role in Bangla" value={review.roleBn} onChange={(value) => onChange({ roleBn: value })} />
        <Field label="Sort order" value={String(review.sort_order)} onChange={(value) => onChange({ sort_order: Math.max(0, Math.min(9999, Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0)) })} inputMode="numeric" />
      </div>
      <div className="mt-2 grid gap-2 lg:grid-cols-2">
        <TextArea label="Review (English)" value={review.textEn} onChange={(value) => onChange({ textEn: value })} />
        <TextArea label="Review (Bangla)" value={review.textBn} onChange={(value) => onChange({ textBn: value })} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-2">
        {deleting ? (
          <div className="flex items-center gap-2 rounded-lg bg-rd-red/10 px-2.5 py-1.5 text-[10px] font-semibold text-rd-red"><span>Delete this review?</span><button type="button" onClick={onDelete} className="rounded-md bg-rd-red px-2 py-1 text-white">Delete</button><button type="button" onClick={onDeleteCancel} className="rounded-md border border-border bg-background px-2 py-1 text-muted-strong">Cancel</button></div>
        ) : (
          <button type="button" onClick={onDeleteRequest} className="admin-action border border-border text-muted-strong hover:border-rd-red/40 hover:text-rd-red"><Trash2 className="h-4 w-4" aria-hidden="true" />Delete</button>
        )}
        <button type="button" onClick={() => void onSaved(review)} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600"><Save className="h-4 w-4" aria-hidden="true" />Save</button>
      </div>
    </article>
  );
}

function Field({ label, value, onChange, inputMode }: { label: string; value: string | null; onChange: (value: string) => void; inputMode?: "numeric" | "text" }) {
  return <label className="admin-label"><span>{label}</span><input className="admin-input" value={value ?? ""} onChange={(event) => onChange(event.target.value)} inputMode={inputMode ?? "text"} /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string) => void }) {
  return <label className="admin-label"><span>{label}</span><textarea className="admin-textarea" rows={3} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></label>;
}

function ReviewFields({ value, onChange, workOptions }: { value: ReviewFormValue & { workId: string }; onChange: (value: ReviewFormValue & { workId: string }) => void; workOptions: {id:number;title:string}[] }) {
  return (
    <div className="grid gap-2 lg:grid-cols-2">
      <Field label="Reviewer" value={value.name} onChange={(name) => onChange({ ...value, name })} />
      <label className="admin-label"><span>Related work</span><select className="admin-input" value={value.workId} onChange={(event) => onChange({ ...value, workId: event.target.value })}><option value="">General review</option>{workOptions.map((work) => <option key={work.id} value={String(work.id)}>{work.title}</option>)}</select></label>
      <Field label="Role" value={value.role} onChange={(role) => onChange({ ...value, role })} />
      <Field label="Role in Bangla" value={value.roleBn} onChange={(roleBn) => onChange({ ...value, roleBn })} />
      <TextArea label="Review (English)" value={value.textEn} onChange={(textEn) => onChange({ ...value, textEn })} />
      <div className="lg:col-span-2"><TextArea label="Review (Bangla)" value={value.textBn} onChange={(textBn) => onChange({ ...value, textBn })} /></div>
    </div>
  );
}
