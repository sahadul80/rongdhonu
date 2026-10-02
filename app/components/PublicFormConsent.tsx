"use client";

import Link from "next/link";
import { Apple, CheckCircle2, Loader2, ShieldCheck, Webhook } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageContext";

type PublicProfileDraft = Record<string, unknown>;

interface Props {
  consent: boolean;
  onConsentChange: (value: boolean) => void;
  draftKey: string;
  draft: PublicProfileDraft;
  returnTo: () => string;
  disabled?: boolean;
  compact?: boolean;
}

export default function PublicFormConsent({ consent, onConsentChange, draftKey, draft, returnTo, disabled = false, compact = false }: Props) {
  const [providers, setProviders] = useState({ google: false, apple: false });
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);
  const [saved, setSaved] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    let active = true;
    void fetch("/api/public/auth/providers", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (active) setProviders({ google: Boolean(data.google), apple: Boolean(data.apple) }); })
      .catch(() => undefined);
    void fetch("/api/public/profile", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (active) setSaved(Boolean(data.profile)); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function clearSaved() {
    try {
      await fetch("/api/public/profile", { method: "DELETE" });
      setSaved(false);
    } catch {
      // Ignore a best-effort cookie clearing failure.
    }
  }

  function begin(provider: "google" | "apple") {
    if (!consent) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      // OAuth still works when session storage is blocked.
    }
    setLoadingProvider(provider);
    const target = `/api/public/auth/${provider}/start?consent=1&returnTo=${encodeURIComponent(returnTo())}`;
    window.location.assign(target);
  }

  const hasProvider = providers.google || providers.apple;

  return <div className={`mt-3 rounded-xl border border-border bg-background/70 ${compact ? "p-3" : "p-3.5"}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.08em] text-muted"><ShieldCheck className="h-3.5 w-3.5" />{t("formConsent")}</span>
      {saved && <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rd-green"><CheckCircle2 className="h-3.5 w-3.5" />{t("savedBrowserProfile")}<button type="button" onClick={() => void clearSaved()} className="underline underline-offset-2 hover:no-underline">{t("clearSavedProfile")}</button></span>}
    </div>
    <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 text-[10px] leading-4 text-muted-strong">
      <input type="checkbox" checked={consent} onChange={(event) => onConsentChange(event.target.checked)} disabled={disabled} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
      <span>{t("formConsentText")} <Link href="/privacy#forms" target="_blank" className="font-bold text-primary underline underline-offset-2">{t("privacyDataNotice")}</Link></span>
    </label>
    {hasProvider && <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="mr-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.08em] text-muted">{t("useAccount")}</span>
      {providers.google && <button type="button" onClick={() => begin("google")} disabled={disabled || !consent || loadingProvider !== null} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-[10px] font-black text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-45" aria-label={t("useGoogle")}>
        {loadingProvider === "google" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Webhook className="h-3.5 w-3.5" />}{t("useGoogle")}
      </button>}
      {providers.apple && <button type="button" onClick={() => begin("apple")} disabled={disabled || !consent || loadingProvider !== null} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-[10px] font-black text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-45" aria-label={t("useApple")}>
        {loadingProvider === "apple" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Apple className="h-3.5 w-3.5" />}{t("useApple")}
      </button>}
      <span className="inline-flex items-center gap-1 text-[9px] text-muted"><CheckCircle2 className="h-3.5 w-3.5 text-rd-green" />{t("identitySecure")}</span>
    </div>}
  </div>;
}
