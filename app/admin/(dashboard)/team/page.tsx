"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Users, X } from "lucide-react";
import ImageUploadInput from "../ImageUploadInput";
import { parseSortOrder, validateSortOrder, validateTeamForm, type TeamFormValue } from "@/lib/formValidation";

interface TeamRow {
  id: number;
  slug: string;
  name: string;
  name_bn: string | null;
  role: string;
  role_bn: string | null;
  bio: string | null;
  bio_bn: string | null;
  photo_url: string | null;
  sort_order: number;
  active: boolean;
}

const BLANK: TeamFormValue & { slug: string } = {
  slug: "team-member", name: "", nameBn: "", role: "", roleBn: "", bio: "", bioBn: "", photoUrl: null };
const PHOTO_MAX_PX = 480;

export default function TeamEditorPage() {
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/team");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load team.");
      setTeam(Array.isArray(data.team) ? data.team : []);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not load team." });
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateTeamForm(draft);
    if (!validation.ok) return setMessage({ ok: false, text: validation.message });
    const response = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage({ ok: false, text: data.error || "Could not add team member." });
    setDraft(BLANK);
    setCreating(false);
    setMessage({ ok: true, text: "Team member added." });
    void load();
  }

  async function saveMember(member: TeamRow) {
    const validation = validateTeamForm({ slug: member.slug, name: member.name, nameBn: member.name_bn ?? "", role: member.role, roleBn: member.role_bn ?? "", bio: member.bio ?? "", bioBn: member.bio_bn ?? "", photoUrl: member.photo_url });
    if (!validation.ok) return setMessage({ ok: false, text: validation.message });
    const order = validateSortOrder(member.sort_order);
    if (!order.ok) return setMessage({ ok: false, text: order.message });
    const response = await fetch(`/api/admin/team/${member.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      name: member.name, nameBn: member.name_bn, role: member.role, roleBn: member.role_bn, bio: member.bio, bioBn: member.bio_bn, photoUrl: member.photo_url,
      active: member.active, sortOrder: parseSortOrder(member.sort_order),
    }) });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? { ok: true, text: "Team member saved." } : { ok: false, text: data.error || "Could not save team member." });
    if (!response.ok) void load();
  }

  async function deleteMember(id: number) {
    const response = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    if (response.ok) {
      setTeam((current) => current.filter((member) => member.id !== id));
      setDeletingId(null);
      setMessage({ ok: true, text: "Team member removed." });
    } else setMessage({ ok: false, text: "Could not remove team member." });
  }

  if (loading) return <AdminLoadingSkeleton title="Loading team" variant="editor" rows={6} />;

  return (
    <div className="admin-page h-full min-h-0 overflow-hidden">
      <div className="flex flex-row items-center justify-between">
        <div className="min-w-0">
          <span className="flex flex-row items-center gap-2"><Users className="h-auto w-auto text-primary" aria-hidden="true" />Team</span><p className="admin-page-subtitle hidden sm:inline">Compact staff editor. Selecting a member on the website opens the full profile in a modal.</p></div>
          <div>
            <button type="button" onClick={() => { setCreating((current) => !current); setMessage(null); }} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600">{creating ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}{creating ? "Cancel" : "Add"}</button>
          </div>
      </div>

      {message && <p role={message.ok ? "status" : "alert"} className={`rounded-lg px-3 py-2 text-xs font-semibold ${message.ok ? "bg-rd-green/10 text-rd-green" : "bg-rd-red/10 text-rd-red"}`}>{message.text}</p>}

      {creating && 
      <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
        <form onSubmit={handleCreate} className="admin-panel p-3 sm:p-4"><div className="mb-3"><h2 className="text-sm font-bold text-foreground">New member</h2><p className="text-[10px] text-muted">Validation is handled in TypeScript before submission.</p></div><MemberFields value={draft} onChange={setDraft} /><button type="submit" className="admin-action mt-3 bg-primary text-primary-foreground"><Plus className="h-4 w-4" aria-hidden="true" />Add member</button></form>
      </div>}

      <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
        <div className="mb-3"><h2 className="text-sm font-bold text-foreground">Saved members</h2><p className="text-[10px] text-muted">{team.length} record{team.length === 1 ? "" : "s"}</p></div>
        <div className="admin-scroll-panel min-h-0 flex-1 space-y-2 pr-1">
          {team.length ? team.map((member) => <TeamCard key={member.id} member={member} deleting={deletingId === member.id} onDeleteRequest={() => setDeletingId(member.id)} onDeleteCancel={() => setDeletingId(null)} onDelete={() => void deleteMember(member.id)} onSave={saveMember} onChange={(patch) => setTeam((current) => current.map((item) => item.id === member.id ? { ...item, ...patch } : item))} />) : <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-border bg-surface p-5 text-center text-xs text-muted">No team members yet. Add the first member above.</div>}
        </div>
      </div>
    </div>
  );
}

function MemberFields({ value, onChange }: { value: TeamFormValue & { slug: string }; onChange: (value: TeamFormValue & { slug: string }) => void }) {
  return <div className="grid gap-2 lg:grid-cols-2">
    <Field label="Full name" value={value.name} onChange={(name) => onChange({ ...value, name })} />
    <Field label="Role" value={value.role} onChange={(role) => onChange({ ...value, role })} />
    <Field label="Name in Bangla" value={value.nameBn} onChange={(nameBn) => onChange({ ...value, nameBn })} />
    <Field label="Role in Bangla" value={value.roleBn} onChange={(roleBn) => onChange({ ...value, roleBn })} />
    <TextArea label="Short bio" value={value.bio} onChange={(bio) => onChange({ ...value, bio })} />
    <TextArea label="Short bio in Bangla" value={value.bioBn} onChange={(bioBn) => onChange({ ...value, bioBn })} />
    <div className="lg:col-span-2"><ImageUploadInput label="Photo" value={value.photoUrl} onChange={(photoUrl) => onChange({ ...value, photoUrl })} maxDimension={PHOTO_MAX_PX} /></div>
  </div>;
}

function TeamCard({ member, onChange, onSave, onDeleteRequest, onDeleteCancel, onDelete, deleting }: { member: TeamRow; onChange: (patch: Partial<TeamRow>) => void; onSave: (member: TeamRow) => Promise<void>; onDeleteRequest: () => void; onDeleteCancel: () => void; onDelete: () => void; deleting: boolean }) {
  return <article className={`rounded-xl border p-3 ${member.active ? "border-border bg-background" : "border-dashed border-border bg-surface/60"}`}>
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_15rem]">
      <MemberFields value={{ slug: member.slug, name: member.name, nameBn: member.name_bn ?? "", role: member.role, roleBn: member.role_bn ?? "", bio: member.bio ?? "", bioBn: member.bio_bn ?? "", photoUrl: member.photo_url }} onChange={(value) => onChange({ slug: value.slug, name: value.name, name_bn: value.nameBn || null, role: value.role, role_bn: value.roleBn || null, bio: value.bio || null, bio_bn: value.bioBn || null, photo_url: value.photoUrl })} />
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
        <label className="admin-label"><span>Visibility</span><button type="button" onClick={() => onChange({ active: !member.active })} className={`admin-status min-h-10 justify-center rounded-lg border ${member.active ? "border-rd-green/25 bg-rd-green/10 text-rd-green" : "border-border bg-surface-2 text-muted"}`}>{member.active ? "Visible on site" : "Hidden"}</button></label>
        <label className="admin-label"><span>Display order</span><input className="admin-input" inputMode="numeric" value={String(member.sort_order)} onChange={(event) => onChange({ sort_order: parseSortOrder(event.target.value) })} /></label>
      </div>
    </div>
    <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-border pt-2">
      {deleting ? <div className="flex items-center gap-2 rounded-lg bg-rd-red/10 px-2.5 py-1.5 text-[10px] font-semibold text-rd-red"><span>Remove this member?</span><button type="button" onClick={onDelete} className="rounded-md bg-rd-red px-2 py-1 text-white">Remove</button><button type="button" onClick={onDeleteCancel} className="rounded-md border border-border bg-background px-2 py-1 text-muted-strong">Cancel</button></div> : <button type="button" onClick={onDeleteRequest} className="admin-action border border-border text-muted-strong hover:border-rd-red/40 hover:text-rd-red"><Trash2 className="h-4 w-4" aria-hidden="true" />Delete</button>}
      <button type="button" onClick={() => void onSave(member)} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600"><Save className="h-4 w-4" aria-hidden="true" />Save changes</button>
    </div>
  </article>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="admin-label"><span>{label}</span><input className="admin-input" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="admin-label"><span>{label}</span><textarea className="admin-textarea" rows={3} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
