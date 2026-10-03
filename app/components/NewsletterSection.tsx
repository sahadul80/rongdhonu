"use client";

import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";
import PublicFormConsent from "./PublicFormConsent";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import { localizeService } from "@/app/data/services";
import { validateContactForm } from "@/lib/formValidation";
import type { CmsService } from "@/app/types/public-cms";

const BLANK = { name: "", email: "", phone: "", serviceInterest: "", message: "" };
const DRAFT_KEY = "rd_contact_form_draft";

export default function NewsletterSection({ embedded = false }: { embedded?: boolean }) {
  const [form, setForm] = useState(BLANK);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const { t, language } = useLanguage();
  const { ref: servicesRef, data } = useLazyPublicData<{ services: CmsService[] }>("/api/public/services", { rootMargin: "200px 0px" });
  const services = data?.services ?? [];

  useEffect(() => {
    let active = true;
    void fetch("/api/public/profile", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!active || !data.profile) return;
        setForm((current) => ({
          ...current,
          name: current.name || String(data.profile.name ?? ""),
          email: current.email || String(data.profile.email ?? ""),
          phone: current.phone || String(data.profile.phone ?? ""),
        }));
      })
      .catch(() => undefined);

    try {
      const params = new URLSearchParams(window.location.search);
      const draft = window.sessionStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<typeof BLANK>;
        setForm((current) => ({ ...current, ...parsed }));
        window.sessionStorage.removeItem(DRAFT_KEY);
      }
      if (params.get("form") === "contact" || params.get("identity") || params.get("identityError")) {
        window.setTimeout(() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
        params.delete("form");
        params.delete("identity");
        params.delete("identityError");
        const nextQuery = params.toString();
        const clean = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
        window.history.replaceState({}, "", clean);
      }
    } catch {
      // Storage/history can be blocked; normal form usage still works.
    }

    return () => { active = false; };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateContactForm(form);
    if (!validation.ok) { setError(validation.message === "Enter a valid email address." ? t("errInvalidEmail") : t("errRequired")); return; }
    if (!consent) { setError("Please accept the form consent before submitting."); return; }
    setStatus("submitting"); setError(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, consentAccepted: true, website: new FormData(event.currentTarget).get("website") ?? "" }) });
      const result = await res.json();
      if (!res.ok) { setError(result.code === "invalid_email" ? t("errInvalidEmail") : result.code === "required" ? t("errRequired") : result.code === "consent_required" ? "Please accept the form consent before submitting." : t("errGeneric")); setStatus("error"); return; }
      setStatus("done");
    } catch { setError(t("errNetwork")); setStatus("error"); }
  }

  const sectionClassName = embedded ? "h-full min-w-0" : "section-shell section-y";
  const cardClassName = embedded ? "newsletter-section__card swatch-card relative h-full min-w-0 bg-surface p-4 text-center sm:p-5 lg:p-6" : "newsletter-section__card swatch-card relative mx-auto max-w-3xl bg-surface p-5 text-center sm:p-7";

  return (
    <section id="contact-form" ref={servicesRef} className={sectionClassName}>
      <div className={cardClassName}>
        <div className="mx-auto flex flex-row items-center gap-3 text-center sm:gap-4">
          <BrandLogo size={48} />
          <span className="section-title section-title--sm">{t("discussProject")}</span>
        </div>
        <p className="section-lead mx-auto text-center">{t("newsletterText")}</p>
        {status === "done" ? <div className="mt-5 border border-rd-green/40 bg-rd-green/10 p-4 text-sm font-black text-rd-green">{t("thankYou")}<span className="mt-1 block text-[10px] font-semibold">{t("profileSavedText")}</span></div> : (
          <form onSubmit={handleSubmit} className="mx-auto mt-5 flex max-w-xl flex-col gap-2.5 text-left">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden opacity-0" />
            <div className="grid gap-3 sm:grid-cols-2"><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("formName")} autoComplete="name" className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary" /><input type="text" inputMode="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t("formEmail")} autoComplete="email" className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary" /></div>
            <div className="grid gap-3 sm:grid-cols-2"><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("formPhone")} autoComplete="tel" className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary" /><select value={form.serviceInterest} onChange={(e) => setForm({ ...form, serviceInterest: e.target.value })} className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"><option value="">{t("formService")}</option>{services.map((s) => <option key={s.id} value={s.name}>{localizeService(s, language).name}</option>)}</select></div>
            <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("formMessage")} className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary" />
            {error && <p role="alert" className="text-xs font-bold text-red-500">{error}</p>}
            <PublicFormConsent consent={consent} onConsentChange={(value) => { setConsent(value); if (value) setError(null); }} draft={form} draftKey={DRAFT_KEY} returnTo={() => `${window.location.pathname}?form=contact#contact-form`} disabled={status === "submitting"} />
            <button type="submit" disabled={status === "submitting"} className="btn-primary self-center px-5 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-60">{status === "submitting" ? t("formSending") : t("startEnquiry")}</button>
          </form>
        )}
      </div>
    </section>
  );
}
