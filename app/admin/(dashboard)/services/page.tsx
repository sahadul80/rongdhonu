"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useState } from "react";
import { Eye, EyeOff, FileText, Plus, Save, Search, Trash2, X } from "lucide-react";
import ImageUploadInput from "../ImageUploadInput";
import SuggestionInput from "../SuggestionInput";
import { validateServiceForm, type ServiceFormValue } from "@/lib/formValidation";
import AdminActionButton from "../AdminActionButton";
import AdminActionFeedback from "../AdminActionFeedback";
import AdminPageHeader from "../AdminPageHeader";

interface ServiceRow {
  id: string;
  slug: string;
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

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

const ACCENT_CLASS: Record<Accent, string> = {
  red: "bg-rd-red", orange: "bg-rd-orange", amber: "bg-rd-amber", green: "bg-rd-green", teal: "bg-rd-teal", blue: "bg-rd-blue", purple: "bg-rd-purple", pink: "bg-rd-pink",
};

const BLANK: ServiceFormValue = { slug: "", name: "", nameBn: "", category: "", categoryBn: "", description: "", descriptionBn: "", bestFor: "", bestForBn: "", accent: "red", imageUrl: null };

export default function ServicesEditorPage() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newService, setNewService] = useState(BLANK);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  async function load(silent = false) {
    if (!silent) setActionKey("load");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/services", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load services.");
      setServices(Array.isArray(data.services) ? data.services : []);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not load services." });
    } finally {
      setLoading(false);
      if (!silent) setActionKey(null);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prepared = { ...newService, slug: newService.slug || slugify(newService.name) };
    const validation = validateServiceForm(prepared);
    if (!validation.ok) { setMessage({ ok: false, text: validation.message }); return; }
    setActionKey("create");
    setMessage(null);
    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prepared),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not add service.");
      setNewService(BLANK);
      setCreating(false);
      setMessage({ ok: true, text: "Service added successfully." });
      await load(true);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not add service." });
    } finally {
      setActionKey(null);
    }
  }

  async function saveService(service: ServiceRow) {
    const validation = validateServiceForm({ slug: service.slug, name: service.name, nameBn: service.name_bn ?? "", category: service.category, categoryBn: service.category_bn ?? "", description: service.description, descriptionBn: service.description_bn ?? "", bestFor: service.best_for, bestForBn: service.best_for_bn ?? "", accent: service.accent, imageUrl: service.image_url });
    if (!validation.ok) { setMessage({ ok: false, text: validation.message }); return; }
    const key = `save:${service.id}`;
    setActionKey(key);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: service.slug, name: service.name, nameBn: service.name_bn, category: service.category, categoryBn: service.category_bn, description: service.description, descriptionBn: service.description_bn,
          bestFor: service.best_for, bestForBn: service.best_for_bn, accent: service.accent, imageUrl: service.image_url, active: service.active, sortOrder: service.sort_order,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        await load(true);
        throw new Error(data.error || "Could not save service.");
      }
      setMessage({ ok: true, text: `“${service.name || "Service"}” saved successfully.` });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not save service." });
    } finally {
      setActionKey(null);
    }
  }

  async function deleteService(id: string) {
    const service = services.find((item) => item.id === id);
    const key = `delete:${id}`;
    setActionKey(key);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete service.");
      setServices((current) => current.filter((service) => service.id !== id));
      setDeletingId(null);
      setMessage({ ok: true, text: `“${service?.name || "Service"}” removed successfully.` });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not delete service." });
    } finally {
      setActionKey(null);
    }
  }

  const categories = Array.from(new Set(services.map((service) => service.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const filteredServices = services.filter((service) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [service.name, service.slug, service.category, service.description].some((value) => value.toLowerCase().includes(q));
    const matchesVisibility = visibility === "all" || (visibility === "visible" ? service.active : !service.active);
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    return matchesSearch && matchesVisibility && matchesCategory;
  });

  if (loading) return <AdminLoadingSkeleton title="Loading services" variant="editor" rows={6} />;

  return (
    <div className="admin-page">
      <AdminPageHeader
        hasSearch
        icon={<FileText className="h-4 w-4" />}
        title="Services"
        subtitle="Manage the public service catalogue from one compact workspace."
        actions={
          <AdminActionButton type="button" onClick={() => { setCreating((current) => !current); setMessage(null); }} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600" icon={creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}>
            {creating ? "Close form" : "Add service"}
          </AdminActionButton>
        }
      >
        <div className="admin-toolbar-search">
          <Search className="pointer-events-none search-icon" aria-hidden="true" />
          <input className="admin-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search service, slug, category or description…" aria-label="Search services" />
        </div>
        <select className="admin-select admin-toolbar-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter service category"><option value="all">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
        <select className="admin-select admin-toolbar-filter" value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)} aria-label="Filter service visibility"><option value="all">All visibility</option><option value="visible">Visible</option><option value="hidden">Hidden</option></select>
        <span className="admin-toolbar-meta">{filteredServices.length} / {services.length}</span>
      </AdminPageHeader>
      <div className="admin-sticky-feedback"><AdminActionFeedback message={message} /></div>

      {creating && (
        <div className="admin-scroll-panel min-h-0">
          <form onSubmit={handleCreate} className="admin-panel p-3 sm:p-4">
            <div className="mb-3"><h2 className="text-sm font-bold text-foreground">New service</h2><p className="text-[10px] text-muted">All required checks run in TypeScript.</p></div>
            <ServiceFields value={newService} onChange={setNewService} />
            <AdminActionButton type="submit" loading={actionKey === "create"} loadingLabel="Adding…" icon={<Plus className="h-4 w-4" aria-hidden="true" />} className="admin-action mt-3 bg-primary text-primary-foreground">Add service</AdminActionButton>
          </form>
        </div>
      )}

      <div className="admin-scroll-panel">
        <div className="admin-scroll-panel min-h-0 grid gap-2 sm:grid-cols-2">
          {filteredServices.length ? filteredServices.map((service) => (
            <article key={service.id} className={`rounded-xl border p-3 ${service.active ? "border-border bg-background" : "border-dashed border-border bg-surface/60"}`}>
              <div className="admin-panel-header flex flex-row items-center justify-between p-2 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">{service.name}</h3>
                <div>
                  <span className={`admin-status-pill ${service.active ? "is-active" : "is-hidden"}`}>
                    {service.active ? <Eye className="h-3.5 w-3.5" aria-hidden="true" /> : <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />}
                    {service.active ? "Visible" : "Hidden"}
                  </span>
                  <button
                    type="button"
                    title={service.active ? "Hide this service from the website" : "Show this service on the website"}
                    aria-label={service.active ? `Hide ${service.name || "service"}` : `Show ${service.name || "service"}`}
                    onClick={() => setServices((current) => current.map((item) => item.id === service.id ? { ...item, active: !item.active } : item))}
                    className="admin-icon-button admin-icon-button--compact"
                  >
                    {service.active ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <Field label="Slug" value={service.slug} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, slug: value } : item))} />
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Service name" value={service.name} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, name: value } : item))} />
                <SuggestionInput label="Category" value={service.category} collection="services" field="category" onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, category: value } : item))} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Name in Bangla" value={service.name_bn} onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, name_bn: value || null } : item))} />
                <SuggestionInput label="Category in Bangla" value={service.category_bn ?? ""} collection="services" field="categoryBn" onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, category_bn: value || null } : item))} />
                <SuggestionInput label="Best for" value={service.best_for} collection="services" field="bestFor" onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, best_for: value } : item))} />
                <SuggestionInput label="Best for in Bangla" value={service.best_for_bn ?? ""} collection="services" field="bestForBn" onChange={(value) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, best_for_bn: value || null } : item))} />
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
                  <div className="flex items-center gap-2 rounded-lg bg-rd-red/10 px-2.5 py-1.5 text-[10px] font-semibold text-rd-red"><span>Delete this service?</span><AdminActionButton type="button" onClick={() => void deleteService(service.id)} loading={actionKey === `delete:${service.id}`} loadingLabel="Deleting…" className="rounded-md bg-rd-red px-2 py-1 text-white">Delete</AdminActionButton><button type="button" onClick={() => setDeletingId(null)} className="rounded-md border border-border bg-background px-2 py-1 text-muted-strong">Cancel</button></div>
                ) : <button type="button" onClick={() => setDeletingId(service.id)} className="admin-action border border-border text-muted-strong hover:border-rd-red/40 hover:text-rd-red"><Trash2 className="h-4 w-4" aria-hidden="true" />Delete</button>}
                <AdminActionButton type="button" onClick={() => void saveService(service)} loading={actionKey === `save:${service.id}`} loadingLabel="Saving…" icon={<Save className="h-4 w-4" aria-hidden="true" />} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600">Save</AdminActionButton>
              </div>
            </article>
          )) : <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-border bg-surface p-5 text-center text-xs text-muted">No services yet. Add the first service above.</div>}
        </div>
      </div>
    </div>
  );
}

function ServiceFields({ value, onChange }: { value: ServiceFormValue; onChange: (value: ServiceFormValue) => void }) {
  return <div>
    <div className="w-full"><Field label="Slug" value={value.slug} onChange={(slug) => onChange({ ...value, slug })} /></div>
    <div className="grid gap-2 lg:grid-cols-2">
      <Field label="Service name" value={value.name} onChange={(name) => onChange({ ...value, name })} />
      <SuggestionInput label="Category" value={value.category} collection="services" field="category" onChange={(category) => onChange({ ...value, category })} />
      <Field label="Name in Bangla" value={value.nameBn} onChange={(nameBn) => onChange({ ...value, nameBn })} />
      <SuggestionInput label="Category in Bangla" value={value.categoryBn} collection="services" field="categoryBn" onChange={(categoryBn) => onChange({ ...value, categoryBn })} />
      <div className="lg:col-span-2"><TextArea label="Description" value={value.description} onChange={(description) => onChange({ ...value, description })} /></div>
      <TextArea label="Description in Bangla" value={value.descriptionBn} onChange={(descriptionBn) => onChange({ ...value, descriptionBn })} />
      <SuggestionInput label="Best for" value={value.bestFor} collection="services" field="bestFor" onChange={(bestFor) => onChange({ ...value, bestFor })} />
      <SuggestionInput label="Best for in Bangla" value={value.bestForBn} collection="services" field="bestForBn" onChange={(bestForBn) => onChange({ ...value, bestForBn })} />
      <div><p className="admin-label"><span>Accent</span><span className="flex min-h-10 items-center gap-1.5">{ACCENTS.map((accent) => <button key={accent} type="button" onClick={() => onChange({ ...value, accent })} className={`h-7 w-7 rounded-full border-2 ${ACCENT_CLASS[accent]} ${value.accent === accent ? "border-foreground ring-2 ring-primary/20" : "border-transparent"}`} aria-label={`Use ${accent} accent`} />)}</span></p></div>
      <ImageUploadInput label="Image" value={value.imageUrl} onChange={(imageUrl) => onChange({ ...value, imageUrl })} />
    </div>
  </div>;
}

function Field({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string) => void }) {
  return <label className="admin-label"><span>{label}</span><input className="admin-input" value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string) => void }) {
  return <label className="admin-label"><span>{label}</span><textarea className="admin-textarea" rows={3} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></label>;
}
