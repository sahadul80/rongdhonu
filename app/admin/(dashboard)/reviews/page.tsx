"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import AdminActionButton from "../AdminActionButton";
import AdminActionFeedback from "../AdminActionFeedback";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, EyeOff, MessageSquareQuote, Plus, Save, Search, Star, Trash2, Users, X } from "lucide-react";
import { validateReviewForm, type ReviewFormValue } from "@/lib/formValidation";
import AdminPageHeader from "../AdminPageHeader";

interface AdminReview extends ReviewFormValue {
  rating: number | null;
  id: number;
  work_id: number | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}
interface UserReview {
  id: number;
  work_id: number;
  name: string;
  email: string;
  rating: number;
  review_text: string;
  status: "pending" | "visible" | "hidden";
  created_at: string;
  updated_at: string;
  work_title: string | null;
  work_slug: string | null;
}
interface WorkOption { id: number; title: string; }
type Tab = "admin" | "user";

const BLANK: ReviewFormValue & { workId: string } = { slug: "", name: "", rating: null, role: "", roleBn: "", textEn: "", textBn: "", workId: "" };

function stars(rating: number) {
  return <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? "fill-current text-rd-amber" : "text-muted/25"}`} aria-hidden="true" />)}</span>;
}

export default function ReviewsPage() {
  const [tab, setTab] = useState<Tab>("admin");
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [workOptions, setWorkOptions] = useState<WorkOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [adminResponse, userResponse, workResponse] = await Promise.all([
        fetch("/api/admin/reviews", { cache: "no-store" }),
        fetch("/api/admin/user-reviews", { cache: "no-store" }),
        fetch("/api/admin/work", { cache: "no-store" }),
      ]);
      const [adminData, userData, workData] = await Promise.all([
        adminResponse.json().catch(() => ({})),
        userResponse.json().catch(() => ({})),
        workResponse.json().catch(() => ({})),
      ]);
      if (!adminResponse.ok) throw new Error(adminData.error || "Could not load admin reviews.");
      if (!userResponse.ok) throw new Error(userData.error || "Could not load website reviews.");
      setAdminReviews(Array.isArray(adminData.reviews) ? adminData.reviews.map((item: Record<string, unknown>) => ({
        id: Number(item.id), slug: String(item.slug ?? ""), name: String(item.name ?? ""), rating: item.rating == null ? null : Number(item.rating),
        role: String(item.role ?? ""), roleBn: String(item.role_bn ?? ""), textEn: String(item.text_en ?? ""), textBn: String(item.text_bn ?? ""),
        work_id: item.work_id == null ? null : Number(item.work_id), sort_order: Number(item.sort_order ?? 0), active: item.active !== false, created_at: String(item.created_at ?? ""),
      })) : []);
      setUserReviews(Array.isArray(userData.reviews) ? userData.reviews : []);
      setWorkOptions(Array.isArray(workData.work) ? workData.work.map((w: Record<string, unknown>) => ({ id: Number(w.id), title: String(w.title ?? "") })) : []);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not load reviews." });
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const filteredAdminReviews = useMemo(() => adminReviews.filter((review) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [review.name, review.slug, review.role, review.textEn, review.textBn].some((value) => value.toLowerCase().includes(q));
    const matchesVisibility = filter === "all" || (filter === "visible" ? review.active : !review.active);
    return matchesSearch && matchesVisibility;
  }), [adminReviews, filter, search]);

  const filteredUserReviews = useMemo(() => userReviews.filter((review) => {
    const q = search.trim().toLowerCase();
    const matchesStatus = filter === "all" || review.status === filter;
    const matchesSearch = !q || [review.name, review.email, review.review_text, review.work_title ?? ""].some((value) => value.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  }), [userReviews, filter, search]);

  async function createReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setActionKey("create"); setMessage(null);
    const prepared = { ...draft, slug: draft.slug || `${draft.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "review"}-${Date.now().toString(36).slice(-5)}` };
    const validation = validateReviewForm(prepared);
    if (!validation.ok) { setMessage({ ok: false, text: validation.message }); setActionKey(null); return; }
    try {
      const response = await fetch("/api/admin/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...prepared, workId: prepared.workId ? Number(prepared.workId) : null }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not add review.");
      setDraft(BLANK); setCreating(false); setMessage({ ok: true, text: "Admin review published." }); await load();
    } catch (error) { setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not add review." }); }
    finally { setActionKey(null); }
  }

  async function saveReview(review: AdminReview) {
    setActionKey(`save:${review.id}`); setMessage(null);
    const validation = validateReviewForm(review);
    if (!validation.ok) { setMessage({ ok: false, text: validation.message }); setActionKey(null); return; }
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: review.slug, name: review.name, rating: review.rating, role: review.role, roleBn: review.roleBn, textEn: review.textEn, textBn: review.textBn, workId: review.work_id, active: review.active, sortOrder: review.sort_order }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save review.");
      setMessage({ ok: true, text: "Admin review saved." });
    } catch (error) { setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not save review." }); }
    finally { setActionKey(null); }
  }

  async function deleteReview(id: number) {
    setActionKey(`delete:${id}`);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete review.");
      setAdminReviews((items) => items.filter((item) => item.id !== id)); setDeleting(null); setMessage({ ok: true, text: "Admin review deleted." });
    } catch (error) { setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not delete review." }); }
    finally { setActionKey(null); }
  }

  async function setUserVisibility(id: number, status: "visible" | "hidden") {
    setActionKey(`user:${id}:${status}`); setMessage(null);
    const previous = userReviews.find((r) => r.id === id)?.status;
    setUserReviews((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    try {
      const response = await fetch("/api/admin/user-reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update website review visibility.");
      setMessage({ ok: true, text: status === "visible" ? "Website review is now visible." : "Website review is now hidden." });
    } catch (error) {
      if (previous) setUserReviews((items) => items.map((item) => item.id === id ? { ...item, status: previous } : item));
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not update website review visibility." });
    } finally { setActionKey(null); }
  }

  if (loading) return <AdminLoadingSkeleton title="Loading reviews" variant="table" rows={6} />;

  return <div className="admin-page">
    <AdminPageHeader
      hasSearch
      icon={<MessageSquareQuote className="h-4 w-4" />}
      title="Reviews"
      subtitle="Editorial reviews are admin-managed; website reviews are user-owned and only their visibility can be moderated."
      actions={tab === "admin" ? <AdminActionButton type="button" onClick={() => { setCreating((v) => !v); setMessage(null); }} className="admin-action bg-primary text-primary-foreground" icon={creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}>{creating ? "Cancel" : "Add admin review"}</AdminActionButton> : undefined}
    >
      <div className="admin-toolbar-tabs" role="tablist" aria-label="Review sources">
        <button type="button" role="tab" aria-selected={tab === "admin"} onClick={() => setTab("admin")} className={tab === "admin" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"}><MessageSquareQuote className="inline h-4 w-4" /><p className="hidden sm:inline">Admin</p></button>
        <button type="button" role="tab" aria-selected={tab === "user"} onClick={() => setTab("user")} className={tab === "user" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"}><Users className="inline h-4 w-4" /><p className="hidden sm:inline">Website</p>{userReviews.filter((r) => r.status === "pending").length > 0 ? <span className="grid max-h-4 max-w-4 rounded-full bg-rd-red text-[8px] font-black text-white ring-2 ring-background">{userReviews.filter((r) => r.status === "pending").length}</span> : null}</button>
      </div>
      <div className="admin-toolbar-search">
        <Search className="pointer-events-none search-icon" aria-hidden="true" />
        <input className="admin-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === "admin" ? "Search reviewer, slug, role or review…" : "Search reviewer, email, work or text…"} aria-label="Search reviews" />
      </div>
      <select className="admin-select admin-toolbar-filter" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter reviews">
        {tab === "admin" ? <><option value="all">All Visibility</option><option value="visible">Visible</option><option value="hidden">Hidden</option></> : <><option value="all">All Visibility</option><option value="pending">Pending</option><option value="visible">Visible</option><option value="hidden">Hidden</option></>}
      </select>
      <span className="admin-toolbar-meta">{tab === "admin" ? filteredAdminReviews.length : filteredUserReviews.length} shown</span>
    </AdminPageHeader>
    <div className="admin-sticky-feedback"><AdminActionFeedback message={message} /></div>

    {tab === "admin" ? <section className="admin-scroll-panel min-h-0 grid sm:grid-cols-2 gap-2">
      {creating && <form onSubmit={createReview} className="admin-panel shrink-0 p-3 sm:p-4"><div className="mb-3"><h2 className="text-sm font-bold">New admin review</h2><p className="text-[10px] text-muted">This review is editorial content controlled by the CMS.</p></div><ReviewFields value={draft} onChange={setDraft} workOptions={workOptions} /><AdminActionButton type="submit" loading={actionKey === "create"} loadingLabel="Publishing…" className="admin-action mt-3 bg-primary text-primary-foreground"><Plus className="h-4 w-4" />Publish review</AdminActionButton></form>}
      {filteredAdminReviews.map((review) => <article key={review.id} className="admin-review-editor rounded-2xl border border-border bg-background p-3 sm:p-4">
        <div className="rounded-2xl border border-border bg-primary/[0.03] p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">Admin review</p>
              <h2 className="mt-1 text-sm font-black text-foreground">Edit client feedback</h2>
              <p className="mt-1 text-[10px] leading-4 text-muted">Editorial review content controlled by the CMS. Changes are published to the selected work after saving.</p>
            </div>
            <span className={`admin-status shrink-0 ${review.active ? "bg-rd-green/10 text-rd-green" : "bg-surface-2 text-muted"}`}>{review.active ? "Visible" : "Hidden"}</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Name" value={review.name} onChange={(v) => setAdminReviews((items) => items.map((x) => x.id === review.id ? { ...x, name: v } : x))} />
            <Field label="Role" value={review.role} onChange={(v) => setAdminReviews((items) => items.map((x) => x.id === review.id ? { ...x, role: v } : x))} />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="admin-label"><span>Related work</span><select className="admin-input" value={review.work_id ? String(review.work_id) : ""} onChange={(e) => setAdminReviews((items) => items.map((x) => x.id === review.id ? { ...x, work_id: e.target.value ? Number(e.target.value) : null } : x))}><option value="">General review</option>{workOptions.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}</select></label>
            <Field label="Role in Bangla" value={review.roleBn} onChange={(v) => setAdminReviews((items) => items.map((x) => x.id === review.id ? { ...x, roleBn: v } : x))} />
          </div>

          <div className="mt-3">
            <span className="admin-label"><span>Rating</span></span>
            <AdminReviewRating rating={review.rating} onChange={(rating) => setAdminReviews((items) => items.map((x) => x.id === review.id ? { ...x, rating } : x))} />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <TextArea label="Your review (English)" value={review.textEn} onChange={(v) => setAdminReviews((items) => items.map((x) => x.id === review.id ? { ...x, textEn: v } : x))} />
            <TextArea label="Your review (Bangla)" value={review.textBn} onChange={(v) => setAdminReviews((items) => items.map((x) => x.id === review.id ? { ...x, textBn: v } : x))} />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Field label="Internal slug" value={review.slug} onChange={(v) => setAdminReviews((items) => items.map((x) => x.id === review.id ? { ...x, slug: v } : x))} />
            <label className="admin-label"><span>Visibility</span><button type="button" onClick={() => setAdminReviews((items) => items.map((x) => x.id === review.id ? { ...x, active: !x.active } : x))} className={`admin-status min-h-10 justify-center rounded-lg border px-4 ${review.active ? "border-rd-green/25 bg-rd-green/10 text-rd-green" : "border-border bg-surface-2 text-muted"}`}>{review.active ? "Visible" : "Hidden"}</button></label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <div className="mr-auto text-[9px] text-muted">{review.rating != null ? `Rated ${Math.round(review.rating)} of 5` : "No rating selected"}</div>
            {deleting === review.id ? <div className="flex flex-wrap items-center gap-2 rounded-lg bg-rd-red/10 px-2 py-1 text-[10px] font-semibold text-rd-red">Delete review? <button type="button" onClick={() => void deleteReview(review.id)} className="rounded-md bg-rd-red px-2 py-1 text-white"><p className="hidden sm:inline">Delete</p></button><button type="button" onClick={() => setDeleting(null)} className="rounded-md border border-border bg-background px-2 py-1 text-muted-strong">Cancel</button></div> : <button type="button" onClick={() => setDeleting(review.id)} className="admin-action border border-border text-muted-strong hover:border-rd-red/40 hover:text-rd-red"><Trash2 className="h-4 w-4" />Delete</button>}
            <AdminActionButton type="button" loading={actionKey === `save:${review.id}`} loadingLabel="Saving…" onClick={() => void saveReview(review)} className="admin-action bg-primary text-primary-foreground"><span className="flex flex-row gap-2"><Save className="h-4 w-4" /><p className="hidden sm:inline">Save</p></span></AdminActionButton>
          </div>
        </div>
      </article>)}
      {!filteredAdminReviews.length && <Empty text={adminReviews.length ? "No admin reviews match the current filter." : "No admin-authored reviews yet."} />}
    </section> : <section className="admin-scroll-panel min-h-0 grid sm:grid-cols-2 gap-2">
      <div className="admin-scroll-panel min-h-0 flex-1 space-y-2 pr-1">
        {filteredUserReviews.map((review) => <article key={review.id} className={`rounded-xl border p-3 ${review.status === "pending" ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-black text-foreground">{review.name}</span><span className={`admin-status ${review.status === "visible" ? "bg-rd-green/10 text-rd-green" : review.status === "pending" ? "bg-primary/10 text-primary" : "bg-surface-2 text-muted"}`}>{review.status}</span><span className="admin-status bg-surface-2 text-muted">Website user</span></div><p className="mt-1 break-all text-[10px] text-muted">{review.email}</p>{review.work_title && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">{review.work_title}</p>}</div><div className="shrink-0">{stars(review.rating)}</div></div>
          <blockquote className="mt-3 rounded-lg bg-surface p-3 text-xs leading-5 text-muted-strong">“{review.review_text}”</blockquote>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2"><time className="text-[9px] text-muted" dateTime={review.created_at}>{new Date(review.created_at).toLocaleString()}</time><div className="flex flex-wrap gap-1.5"><AdminActionButton type="button" loading={actionKey === `user:${review.id}:visible`} loadingLabel="Showing…" onClick={() => void setUserVisibility(review.id, "visible")} className="admin-action border border-border bg-background text-muted-strong"><Check className="h-3.5 w-3.5" />Show</AdminActionButton><AdminActionButton type="button" loading={actionKey === `user:${review.id}:hidden`} loadingLabel="Hiding…" onClick={() => void setUserVisibility(review.id, "hidden")} className="admin-action border border-border bg-background text-muted-strong"><EyeOff className="h-3.5 w-3.5" />Hide</AdminActionButton></div></div>
        </article>)}
        {!filteredUserReviews.length && <Empty text="No website reviews match the current filter." />}
      </div>
    </section>}
  </div>;
}

function ReviewFields({ value, onChange, workOptions }: { value: ReviewFormValue & { workId: string }; onChange: (value: ReviewFormValue & { workId: string }) => void; workOptions: WorkOption[] }) {
  return <div className="grid gap-2 lg:grid-cols-2"><Field label="Slug" value={value.slug} onChange={(v) => onChange({ ...value, slug: v })} /><Field label="Reviewer" value={value.name} onChange={(v) => onChange({ ...value, name: v })} /><Field label="Rating (0–5)" value={value.rating == null ? "" : String(value.rating)} onChange={(v) => onChange({ ...value, rating: v === "" ? null : Number(v) })} /><label className="admin-label"><span>Related work</span><select className="admin-input" value={value.workId} onChange={(e) => onChange({ ...value, workId: e.target.value })}><option value="">General review</option>{workOptions.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}</select></label><Field label="Role" value={value.role} onChange={(v) => onChange({ ...value, role: v })} /><Field label="Role in Bangla" value={value.roleBn} onChange={(v) => onChange({ ...value, roleBn: v })} /><TextArea label="Review (English)" value={value.textEn} onChange={(v) => onChange({ ...value, textEn: v })} /><TextArea label="Review (Bangla)" value={value.textBn} onChange={(v) => onChange({ ...value, textBn: v })} /></div>;
}
function AdminReviewRating({ rating, onChange }: { rating: number | null; onChange: (rating: number | null) => void }) {
  return <div className="mt-2 inline-flex items-center gap-1 rounded-xl border border-border bg-background p-1.5" role="radiogroup" aria-label="Review rating">{[1, 2, 3, 4, 5].map((value) => {
    const selected = rating != null && value <= Math.round(rating);
    return <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value === 1 ? "" : "s"}`} onClick={() => onChange(value)} className={`grid h-8 w-8 place-items-center rounded-lg transition ${selected ? "bg-rd-amber/12 text-rd-amber" : "text-muted/35 hover:bg-surface-2 hover:text-rd-amber"}`}>
      <Star className={`h-4 w-4 ${selected ? "fill-current" : ""}`} aria-hidden="true" />
    </button>;
  })}</div>;
}

function Field({ label, value, onChange }: { label: string; value: string | number | null; onChange: (value: string) => void }) { return <label className="admin-label"><span>{label}</span><input className="admin-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string) => void }) { return <label className="admin-label"><span>{label}</span><textarea className="admin-textarea" rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} /></label>; }
function Empty({ text }: { text: string }) { return <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-border bg-surface p-5 text-center text-xs text-muted">{text}</div>; }
