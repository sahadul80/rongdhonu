"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, Save, Trash2, Users, X } from "lucide-react";
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
  slug: "team-member",
  name: "",
  nameBn: "",
  role: "",
  roleBn: "",
  bio: "",
  bioBn: "",
  photoUrl: null,
};
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateTeamForm(draft);
    if (!validation.ok) return setMessage({ ok: false, text: validation.message });
    const response = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage({ ok: false, text: data.error || "Could not add team member." });
    setDraft(BLANK);
    setCreating(false);
    setMessage({ ok: true, text: "Team member added." });
    void load();
  }

  async function saveMember(member: TeamRow) {
    const validation = validateTeamForm({
      slug: member.slug,
      name: member.name,
      nameBn: member.name_bn ?? "",
      role: member.role,
      roleBn: member.role_bn ?? "",
      bio: member.bio ?? "",
      bioBn: member.bio_bn ?? "",
      photoUrl: member.photo_url,
    });
    if (!validation.ok) return setMessage({ ok: false, text: validation.message });
    const order = validateSortOrder(member.sort_order);
    if (!order.ok) return setMessage({ ok: false, text: order.message });
    const response = await fetch(`/api/admin/team/${member.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: member.name,
        nameBn: member.name_bn,
        role: member.role,
        roleBn: member.role_bn,
        bio: member.bio,
        bioBn: member.bio_bn,
        photoUrl: member.photo_url,
        active: member.active,
        sortOrder: parseSortOrder(member.sort_order),
      }),
    });
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
    } else {
      setMessage({ ok: false, text: "Could not remove team member." });
    }
  }

  if (loading) return <AdminLoadingSkeleton title="Loading team" variant="editor" rows={6} />;

  return (
    <div className="admin-page admin-team-page">
      <header className="admin-page-header">
        <div className="admin-page-heading">
          <div className="admin-page-heading__icon" aria-hidden="true"><Users className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h1 className="admin-page-title">Our Team</h1>
            <p className="admin-page-subtitle">Manage the people shown on the public “The People Behind the Finish” section.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating((current) => !current);
            setMessage(null);
          }}
          className={`admin-action admin-action--primary ${creating ? "admin-action--neutral" : ""}`}
          aria-expanded={creating}
        >
          {creating ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          {creating ? "Close form" : "Add member"}
        </button>
      </header>

      {message && (
        <div className={`admin-feedback ${message.ok ? "is-success" : "is-error"}`} role={message.ok ? "status" : "alert"}>
          <span className="admin-feedback__dot" aria-hidden="true" />
          <span>{message.text}</span>
        </div>
      )}

      {creating && (
        <section className="admin-panel team-create-panel" aria-labelledby="new-member-title">
          <div className="admin-panel-heading">
            <div>
              <h2 id="new-member-title">Add a team member</h2>
              <p>Keep the public profile concise. Validation runs in TypeScript before submission.</p>
            </div>
            <span className="admin-kicker">NEW PROFILE</span>
          </div>
          <form onSubmit={handleCreate} className="team-form">
            <MemberFields value={draft} onChange={setDraft} />
            <div className="admin-action-row admin-action-row--start">
              <button type="submit" className="admin-action admin-action--primary">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add member
              </button>
              <button type="button" className="admin-action admin-action--neutral" onClick={() => setDraft(BLANK)}>
                <X className="h-4 w-4" aria-hidden="true" />
                Clear form
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-panel admin-list-panel" aria-labelledby="saved-members-title">
        <div className="admin-panel-heading">
          <div>
            <h2 id="saved-members-title">Saved members</h2>
            <p>{team.length} record{team.length === 1 ? "" : "s"}. Use the controls inside each profile to edit visibility, order, content, or image.</p>
          </div>
          <span className="admin-count-badge">{team.length}</span>
        </div>

        <div className="team-admin-list">
          {team.length ? (
            team.map((member) => (
              <TeamCard
                key={member.id}
                member={member}
                deleting={deletingId === member.id}
                onDeleteRequest={() => setDeletingId(member.id)}
                onDeleteCancel={() => setDeletingId(null)}
                onDelete={() => void deleteMember(member.id)}
                onSave={saveMember}
                onChange={(patch) => setTeam((current) => current.map((item) => item.id === member.id ? { ...item, ...patch } : item))}
              />
            ))
          ) : (
            <div className="admin-empty-state">
              <Users className="h-6 w-6" aria-hidden="true" />
              <strong>No team members yet</strong>
              <span>Add the first member to populate the public team section.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MemberFields({ value, onChange }: { value: TeamFormValue & { slug: string }; onChange: (value: TeamFormValue & { slug: string }) => void }) {
  return (
    <div className="team-fields">
      <Field label="Full name" value={value.name} onChange={(name) => onChange({ ...value, name })} />
      <Field label="Role" value={value.role} onChange={(role) => onChange({ ...value, role })} />
      <Field label="Name in Bangla" value={value.nameBn} onChange={(nameBn) => onChange({ ...value, nameBn })} />
      <Field label="Role in Bangla" value={value.roleBn} onChange={(roleBn) => onChange({ ...value, roleBn })} />
      <TextArea label="Short bio" hint="Keep this to 2–4 sentences." value={value.bio} onChange={(bio) => onChange({ ...value, bio })} />
      <TextArea label="Short bio in Bangla" hint="Keep this to 2–4 sentences." value={value.bioBn} onChange={(bioBn) => onChange({ ...value, bioBn })} />
      <div className="team-fields__photo">
        <ImageUploadInput label="Profile photo" value={value.photoUrl} onChange={(photoUrl) => onChange({ ...value, photoUrl })} maxDimension={PHOTO_MAX_PX} />
      </div>
    </div>
  );
}

function TeamCard({
  member,
  onChange,
  onSave,
  onDeleteRequest,
  onDeleteCancel,
  onDelete,
  deleting,
}: {
  member: TeamRow;
  onChange: (patch: Partial<TeamRow>) => void;
  onSave: (member: TeamRow) => Promise<void>;
  onDeleteRequest: () => void;
  onDeleteCancel: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <article className={`team-admin-card ${member.active ? "is-active" : "is-hidden"}`}>
      <div className="team-admin-card__topline">
        <div className="team-admin-card__identity">
          <div className="team-admin-card__avatar" aria-hidden="true">
            {member.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- CMS image data can be a data URI.
              <img src={member.photo_url} alt="" />
            ) : (
              member.name.slice(0, 1).toUpperCase() || "?"
            )}
          </div>
          <div className="min-w-0">
            <strong>{member.name || "Unnamed member"}</strong>
            <span>{member.role || "Role not set"}</span>
          </div>
        </div>
        <div className="team-admin-card__status">
          <span className={`admin-status-pill ${member.active ? "is-active" : "is-hidden"}`}>
            {member.active ? <Eye className="h-3.5 w-3.5" aria-hidden="true" /> : <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />}
            {member.active ? "Visible" : "Hidden"}
          </span>
          <button
            type="button"
            title={member.active ? "Hide this member from the website" : "Show this member on the website"}
            aria-label={member.active ? `Hide ${member.name || "team member"}` : `Show ${member.name || "team member"}`}
            onClick={() => onChange({ active: !member.active })}
            className="admin-icon-button admin-icon-button--compact"
          >
            {member.active ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="team-admin-card__body">
        <MemberFields
          value={{
            slug: member.slug,
            name: member.name,
            nameBn: member.name_bn ?? "",
            role: member.role,
            roleBn: member.role_bn ?? "",
            bio: member.bio ?? "",
            bioBn: member.bio_bn ?? "",
            photoUrl: member.photo_url,
          }}
          onChange={(value) => onChange({
            slug: value.slug,
            name: value.name,
            name_bn: value.nameBn || null,
            role: value.role,
            role_bn: value.roleBn || null,
            bio: value.bio || null,
            bio_bn: value.bioBn || null,
            photo_url: value.photoUrl,
          })}
        />

        <aside className="team-admin-card__controls" aria-label={`Publishing controls for ${member.name || "team member"}`}>
          <div className="admin-control-box">
            <div>
              <span className="admin-control-label">Visibility</span>
              <small>{member.active ? "Shown on the public site" : "Hidden from the public site"}</small>
            </div>
            <button type="button" onClick={() => onChange({ active: !member.active })} className={`admin-toggle-control ${member.active ? "is-on" : ""}`}>
              <span className="admin-toggle-control__dot" aria-hidden="true" />
              <span>{member.active ? "Visible" : "Hidden"}</span>
            </button>
          </div>
          <label className="admin-control-box">
            <span>
              <span className="admin-control-label">Display order</span>
              <small>Lower numbers appear first</small>
            </span>
            <input
              className="admin-input admin-input--compact admin-order-input"
              inputMode="numeric"
              aria-label={`Display order for ${member.name || "team member"}`}
              value={String(member.sort_order)}
              onChange={(event) => onChange({ sort_order: parseSortOrder(event.target.value) })}
            />
          </label>
        </aside>
      </div>

      <div className="team-admin-card__actions">
        {deleting ? (
          <div className="admin-delete-confirm">
            <span>Remove this member?</span>
            <div className="admin-action-row">
              <button type="button" onClick={onDelete} className="admin-action admin-action--danger admin-action--compact">
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
              <button type="button" onClick={onDeleteCancel} className="admin-action admin-action--neutral admin-action--compact">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button type="button" onClick={onDeleteRequest} className="admin-action admin-action--danger admin-action--compact">
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
            <button type="button" onClick={() => void onSave(member)} className="admin-action admin-action--primary admin-action--compact">
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              Save changes
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="admin-label">
      <span>{label}</span>
      <input className="admin-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="admin-label">
      <span>{label}</span>
      <textarea className="admin-textarea" rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
      {hint ? <small className="admin-field-hint">{hint}</small> : null}
    </label>
  );
}
