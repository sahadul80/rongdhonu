"use client";

import { useState } from "react";
import BrandLogo from "./BrandLogo";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import { localizeService } from "@/app/data/services";
import { validateContactForm } from "@/lib/formValidation";
import type { CmsService } from "@/app/types/public-cms";

const BLANK = { name: "", email: "", phone: "", serviceInterest: "", message: "" };

export default function NewsletterSection({ embedded = false }: { embedded?: boolean }) {
  const [form, setForm] = useState(BLANK);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { ref: servicesRef, data } = useLazyPublicData<{ services: CmsService[] }>("/api/public/services", { rootMargin: "200px 0px" });
  const services = data?.services ?? [];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateContactForm(form);
    if (!validation.ok) { setError(validation.message === "Enter a valid email address." ? t("errInvalidEmail") : t("errRequired")); return; }
    setStatus("submitting"); setError(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await res.json();
      if (!res.ok) { setError(result.code === "invalid_email" ? t("errInvalidEmail") : result.code === "required" ? t("errRequired") : t("errGeneric")); setStatus("error"); return; }
      setStatus("done");
    } catch { setError(t("errNetwork")); setStatus("error"); }
  }

  const sectionClassName = embedded ? "h-full min-w-0" : "bg-background px-4 py-7 sm:py-10";
  const cardClassName = embedded ? "swatch-card relative h-full min-w-0 bg-surface p-5 text-center sm:p-7" : "swatch-card relative mx-auto max-w-3xl bg-surface p-5 text-center sm:p-7";

  return (
    <section ref={servicesRef} className={sectionClassName}>
      <div className={cardClassName}>
        <div className="absolute inset-x-0 top-0 h-1 bg-rainbow" /><BrandLogo size={58} showTagline />
        <h2 className="h2-fluid title-scroll-fx mt-4 font-black uppercase text-foreground">{t("discussProject")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{t("newsletterText")}</p>
        {status === "done" ? <div className="mt-5 border border-rd-green/40 bg-rd-green/10 p-4 text-sm font-black text-rd-green">{t("thankYou")}</div> : (
          <form onSubmit={handleSubmit} className="mx-auto mt-7 flex max-w-xl flex-col gap-3 text-left">
            <div className="grid gap-3 sm:grid-cols-2"><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("formName")} className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary" /><input type="text" inputMode="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t("formEmail")} className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary" /></div>
            <div className="grid gap-3 sm:grid-cols-2"><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("formPhone")} className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary" /><select value={form.serviceInterest} onChange={(e) => setForm({ ...form, serviceInterest: e.target.value })} className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"><option value="">{t("formService")}</option>{services.map((s) => <option key={s.id} value={s.name}>{localizeService(s, language).name}</option>)}</select></div>
            <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("formMessage")} className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary" />
            {error && <p className="text-xs font-bold text-red-500">{error}</p>}
            <button type="submit" disabled={status === "submitting"} className="btn-primary self-center px-5 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-60">{status === "submitting" ? t("formSending") : t("startEnquiry")}</button>
          </form>
        )}
      </div>
    </section>
  );
}
