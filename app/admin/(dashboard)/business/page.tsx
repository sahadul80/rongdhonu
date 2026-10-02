"use client";

import AdminLoadingSkeleton from "../AdminLoadingSkeleton";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, Save, ShieldCheck } from "lucide-react";
import ImageUploadInput from "../ImageUploadInput";
import SuggestionInput from "../SuggestionInput";
import AdminActionButton from "../AdminActionButton";
import AdminActionFeedback from "../AdminActionFeedback";
import AdminPageHeader from "../AdminPageHeader";
import { validateBusinessForm, type BusinessFormValue } from "@/lib/formValidation";

interface Business extends BusinessFormValue {}

const EMPTY: Business = {
  name: "", shortName: "", tagline: "", phone: "", email: "", website: "", address: "", addressBn: null, mapQuery: "",
  logoUrl: null, logoReversedUrl: null, iconUrl: null, teamSlug: "our-team", workSlug: "our-work",
};

const INPUT = "admin-input";
const AREA = "admin-textarea";

export default function BusinessEditorPage() {
  const [form, setForm] = useState<Business>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/business")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load business information.");
        if (!cancelled && data.business) setForm(data.business);
      })
      .catch((error) => !cancelled && setStatus({ ok: false, text: error instanceof Error ? error.message : "Could not load business information." }))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  function update<K extends keyof Business>(key: K, value: Business[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  }

  async function handleSave() {
    const validation = validateBusinessForm(form);
    if (!validation.ok) {
      setStatus({ ok: false, text: validation.message });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      setStatus(response.ok ? { ok: true, text: "Business profile saved." } : { ok: false, text: data.error || "Could not save business profile." });
    } catch {
      setStatus({ ok: false, text: "Could not reach the server." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingSkeleton title="Loading business profile" variant="editor" rows={6} />;

  return (
    <div className="admin-page">
      <AdminPageHeader
        icon={<BriefcaseBusiness className="h-4 w-4" />}
        title="Business profile"
        subtitle="Manage identity, contact details and brand assets from one compact workspace."
        actions={<AdminActionButton type="button" onClick={handleSave} loading={saving} loadingLabel="Saving…" icon={<Save className="h-4 w-4" aria-hidden="true" />} className="admin-action bg-primary text-primary-foreground hover:bg-primary-600">Save</AdminActionButton>}
      />
      <div className="admin-sticky-feedback"><AdminActionFeedback message={status} /></div>

      <div className="admin-scroll-panel min-h-0 flex-1 pr-1">
        <div className="grid min-h-full content-start gap-3 pb-1 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="admin-panel p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-foreground">Core information</h2>
              <p className="text-[10px] text-muted">Used throughout the website.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Business name" value={form.name} onChange={(value) => update("name", value)} />
            <Field label="Short name" value={form.shortName} onChange={(value) => update("shortName", value)} />
            <SuggestionInput label="Tagline" value={form.tagline} collection="business" field="tagline" onChange={(value) => update("tagline", value)} />
            <Field label="Phone" value={form.phone} onChange={(value) => update("phone", value)} inputMode="tel" />
            <Field label="Email" value={form.email} onChange={(value) => update("email", value)} inputMode="email" />
            <Field label="Website" value={form.website} onChange={(value) => update("website", value)} />
            <SuggestionInput label="Map search text" value={form.mapQuery} collection="business" field="mapQuery" onChange={(value) => update("mapQuery", value)} />
            <Field label="Our Team slug" value={form.teamSlug} onChange={(value) => update("teamSlug", value)} hint="Used as the public Our Team section anchor ID." />
            <Field label="Our Work slug" value={form.workSlug} onChange={(value) => update("workSlug", value)} hint="Used as the public Our Work section anchor ID." />
            <SuggestionInput label="Address" value={form.address} collection="business" field="address" onChange={(value) => update("address", value)} />
            <div className="sm:col-span-2">
              <SuggestionInput label="Address in Bangla" value={form.addressBn ?? ""} collection="business" field="addressBn" onChange={(value) => update("addressBn", value || null)} />
            </div>
          </div>
        </section>

        <section className="admin-panel p-3 sm:p-4">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-foreground">Brand assets</h2>
            <p className="text-[10px] text-muted">Images are converted to base64 and stored directly with the CMS record. No upload path is used.</p>
          </div>
          <div className="space-y-3">
            <ImageUploadInput label="Logo" value={form.logoUrl} onChange={(value) => update("logoUrl", value)} />
            <ImageUploadInput label="Dark / reversed logo" value={form.logoReversedUrl} onChange={(value) => update("logoReversedUrl", value)} />
            <ImageUploadInput label="Icon / favicon" value={form.iconUrl} onChange={(value) => update("iconUrl", value)} maxDimension={512} />
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, hint, inputMode }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: string; inputMode?: "email" | "tel" | "text" }) {
  return (
    <label className="admin-label">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} className={AREA} rows={2} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} inputMode={inputMode ?? "text"} className={INPUT} />
      )}
      {hint && <span className="text-[10px] font-normal leading-4 text-muted">{hint}</span>}
    </label>
  );
}
