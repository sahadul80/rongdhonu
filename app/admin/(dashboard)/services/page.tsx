"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useState } from "react";
import { FileText, Plus, Save, Trash2, X } from "lucide-react";
import ImageUploadInput from "../ImageUploadInput";
import { validateServiceForm, type ServiceFormValue } from "@/lib/formValidation";

interface ServiceRow {
  id: string;
  name: string;
  name_bn: string | null;
  category: string;
  category_bn: string | null;
  description: string;
  description_bn: string | null;
  best_for: string;
  best_for_bn: string | null;
  accent: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
}

const ACCENTS = ["red", "orange", "amber", "green", "teal", "blue", "purple", "pink"] as const;
type Accent = typeof ACCENTS[number];

const ACCENT_CLASS: Record<Accent, string> = {
  red: "bg-rd-red", orange: "bg-rd-orange", amber: "bg-rd-amber", green: "bg-rd-green", teal: "bg-rd-teal", blue: "bg-rd-blue", purple: "bg-rd-purple", pink: "bg-rd-pink",
};

const BLANK: ServiceFormValue = { name: "", nameBn: "", category: "", categoryBn: "", description: "", descriptionBn: "", bestFor: "", bestForBn: "", accent: "red", imageUrl: null };

export default function ServicesEditorPage() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newService, setNewService] = useState(BLANK);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/services");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load services.");
      setServices(Array.isArray(data.services) ? data.services : []);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not load services." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateServiceForm(newService);
    if (!validation.ok) return setMessage({ ok: false, text: validation.message });
    const response = await fetch("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newService) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage({ ok: false, text: data.error || "Could not add service." });
    setNewService(BLANK);
    setCreating(false);
    setMessage({ ok: true, text: "Service added." });
    void load();
  }

  async function saveService(service: ServiceRow) {
    const validation = validateServiceForm({ name: service.name, nameBn: service.name_bn ?? "", category: service.category, categoryBn: service.category_bn ?? "", description: service.description, descriptionBn: service.description_bn ?? "", bestFor: service.best_for, bestForBn: service.best_for_bn ?? "", accent: service.accent, imageUrl: service.image_url });
    if (!validation.ok) return setMessage({ ok: false, text: validation.message });
    const response = await fetch(`/api/admin/services/${service.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      name: service.name, nameBn: service.name_bn, category: service.category, categoryBn: service.category_bn, description: service.description, descriptionBn: service.description_bn,
      bestFor: service.best_for, bestForBn: service.best_for_bn, accent: service.accent, imageUrl: service.image_url, active: service.active, sortOrder: service.sort_order,
    }) });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? { ok: true, text: "Service saved." } : { ok: false, text: data.error || "Could not save service." });
    if (!response.ok) void load();
  }

  async function deleteService(id: string) {
    const response = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (response.ok) {
      setServices((current) => current.filter((service) => service.id !== id));
      setDeletingId(null);
      setMessage({ ok: true, text: "Service removed." });
    } else {
      const data = await response.json().catch(() => ({}));
      setMessage({ ok: false, text: data.error || "Could not delete service." });
    }
  }

  if (loading) return <AdminLoadingSkeleton title="Loading services" variant="editor" rows={6} />;

  return (
    <div className="admin-page h-full min-h-0 overflow-hidden">
      <div className="flex flex-row items-center justify-between">
        <div className="min-w-0">
          <span className="flex flex-row items-center gap-2"><FileText className="h-auto w-auto text-primary" aria-hidden="true" />Services</span><p className="admin-page-subtitle hidden sm:inline">Compact catalogue management. Empty Bangla fields fall back to English on the public site.</p>
        </div>
        <div>  
          <button type="button" onClick={() => { setCreating((current) => !current); setMessage(null); }} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600 disabled:opacity-60">
            {creating ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}{creating ? "Cancel" : "Add"}
          </button>
        </div>
      </div>

      {message && <p role={message.ok ? "status" : "alert"} className={`rounded-lg px-3 py-2 text-xs font-semibold ${message.ok ? "bg-rd-green/10 text-rd-green" : "bg-rd-red/10 text-rd-red"}`}>{message.text}</p>}

      {creating && (
        <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
          <form onSubmit={handleCreate} className="admin-panel p-3 sm:p-4">
            <div className="mb-3"><h2 className="text-sm font-bold text-foreground">New service</h2><p className="text-[10px] text-muted">All required checks run in TypeScript.</p></div>
            <ServiceFields value={newService} onChange={setNewService} />
            <button type="submit" className="admin-action mt-3 bg-primary text-primary-foreground"><Plus className="h-4 w-4" aria-hidden="true" />Add service</button>
          </form>
        </div>
      )}

      <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
        <div className="mb-3"><h2 className="text-sm font-bold text-foreground">Saved services</h2><p className="text-[10px] text-muted">{services.length} record{services.length === 1 ? "" : "s"}</p></div>
        <div className="admin-scroll-panel min-h-0 flex-1 space-y-2 pr-1">
          {services.length ? services.map((service) => (
            <article key={service.id} className={`rounded-xl border p-3 ${service.active ? "border-border bg-background" : "border-dashed border-border bg-surface/60"}`}>
              <div className="grid gap-2 lg:grid-cols-[1.4fr_0.8fr_auto]">
                <Field label="Service name" value={service.name} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, name: value } : item))} />
                <Field label="Category" value={service.category} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, category: value } : item))} />
                <label className="admin-label"><span>Visibility</span><button type="button" onClick={() => setServices((current) => current.map((item) => item.id === service.id ? { ...item, active: !item.active } : item))} className={`admin-status min-h-10 justify-center rounded-lg border ${service.active ? "border-rd-green/25 bg-rd-green/10 text-rd-green" : "border-border bg-surface-2 text-muted"}`}>{service.active ? "Visible" : "Hidden"}</button></label>
              </div>
              <div className="mt-2 grid gap-2 lg:grid-cols-4">
                <Field label="Name in Bangla" value={service.name_bn} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, name_bn: value || null } : item))} />
                <Field label="Category in Bangla" value={service.category_bn} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, category_bn: value || null } : item))} />
                <Field label="Best for" value={service.best_for} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, best_for: value } : item))} />
                <Field label="Best for in Bangla" value={service.best_for_bn} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, best_for_bn: value || null } : item))} />
              </div>
              <div className="mt-2 grid gap-2 lg:grid-cols-2">
                <TextArea label="Description" value={service.description} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, description: value } : item))} />
                <TextArea label="Description in Bangla" value={service.description_bn} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, description_bn: value || null } : item))} />
              </div>
              <div className="mt-2 grid gap-3 lg:grid-cols-[auto_1fr]">
                <div><p className="admin-label"><span>Accent</span><span className="flex min-h-10 items-center gap-1.5">{ACCENTS.map((accent) => <button key={accent} type="button" aria-label={`Use ${accent} accent`} onClick={() => setServices((current) => current.map((item) => item.id === service.id ? { ...item, accent } : item))} className={`h-6 w-6 rounded-full border-2 ${ACCENT_CLASS[accent]} ${service.accent === accent ? "border-foreground ring-2 ring-primary/20" : "border-transparent"}`} />)}</span></p></div>
                <ImageUploadInput label="Service image" value={service.image_url} onChange={(image_url) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, image_url } : item))} />
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-border pt-2">
                {deletingId === service.id ? (
                  <div className="flex items-center gap-2 rounded-lg bg-rd-red/10 px-2.5 py-1.5 text-[10px] font-semibold text-rd-red"><span>Delete this service?</span><button type="button" onClick={() => void deleteService(service.id)} className="rounded-md bg-rd-red px-2 py-1 text-white">Delete</button><button type="button" onClick={() => setDeletingId(null)} className="rounded-md border border-border bg-background px-2 py-1 text-muted-strong">Cancel</button></div>
                ) : <button type="button" onClick={() => setDeletingId(service.id)} className="admin-action border border-border text-muted-strong hover:border-rd-red/40 hover:text-rd-red"><Trash2 className="h-4 w-4" aria-hidden="true" />Delete</button>}
                <button type="button" onClick={() => void saveService(service)} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600"><Save className="h-4 w-4" aria-hidden="true" />Save</button>
              </div>
            </article>
          )) : <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-border bg-surface p-5 text-center text-xs text-muted">No services yet. Add the first service above.</div>}
        </div>
      </div>
    </div>
  );
}

function ServiceFields({ value, onChange }: { value: ServiceFormValue; onChange: (value: ServiceFormValue) => void }) {
  return <div className="grid gap-2 lg:grid-cols-2">
    <Field label="Service name" value={value.name} onChange={(name) => onChange({ ...value, name })} />
    <Field label="Category" value={value.category} onChange={(category) => onChange({ ...value, category })} />
    <Field label="Name in Bangla" value={value.nameBn} onChange={(nameBn) => onChange({ ...value, nameBn })} />
    <Field label="Category in Bangla" value={value.categoryBn} onChange={(categoryBn) => onChange({ ...value, categoryBn })} />
    <div className="lg:col-span-2"><TextArea label="Description" value={value.description} onChange={(description) => onChange({ ...value, description })} /></div>
    <TextArea label="Description in Bangla" value={value.descriptionBn} onChange={(descriptionBn) => onChange({ ...value, descriptionBn })} />
    <Field label="Best for" value={value.bestFor} onChange={(bestFor) => onChange({ ...value, bestFor })} />
    <Field label="Best for in Bangla" value={value.bestForBn} onChange={(bestForBn) => onChange({ ...value, bestForBn })} />
    <div><p className="admin-label"><span>Accent</span><span className="flex min-h-10 items-center gap-1.5">{ACCENTS.map((accent) => <button key={accent} type="button" onClick={() => onChange({ ...value, accent })} className={`h-7 w-7 rounded-full border-2 ${ACCENT_CLASS[accent]} ${value.accent === accent ? "border-foreground ring-2 ring-primary/20" : "border-transparent"}`} aria-label={`Use ${accent} accent`} />)}</span></p></div>
    <ImageUploadInput label="Image" value={value.imageUrl} onChange={(imageUrl) => onChange({ ...value, imageUrl })} />
  </div>;
}

function Field({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string) => void }) {
  return <label className="admin-label"><span>{label}</span><input className="admin-input" value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string) => void }) {
  return <label className="admin-label"><span>{label}</span><textarea className="admin-textarea" rows={3} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></label>;
}
