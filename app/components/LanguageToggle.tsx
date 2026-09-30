"use client";

import { useLanguage } from "./LanguageContext";

function Flag({ country }: { country: "gb" | "bd" }) {
  if (country === "bd") {
    return (
      <svg aria-hidden="true" viewBox="0 0 28 18" className="language-flag h-3.5 w-5.5 shrink-0 rounded-xs shadow-sm">
        <rect width="28" height="18" rx="1.5" fill="#006a4e" />
        <circle cx="13" cy="9" r="5.25" fill="#f42a41" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 28 18" className="language-flag h-3.5 w-5.5 shrink-0 rounded-xs shadow-sm">
      <rect width="28" height="18" rx="1.5" fill="#012169" />
      <path d="M0 0 28 18M28 0 0 18" stroke="#fff" strokeWidth="5" />
      <path d="M0 0 28 18M28 0 0 18" stroke="#c8102e" strokeWidth="2.4" />
      <path d="M14 0v18M0 9h28" stroke="#fff" strokeWidth="7" />
      <path d="M14 0v18M0 9h28" stroke="#c8102e" strokeWidth="4" />
    </svg>
  );
}

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className={`glass-toggle inline-flex items-center rounded-xl p-0.5 ${compact ? "gap-0" : "gap-0.5"}`} role="group" aria-label={t("language")}>
      <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} aria-label="English" title="English" className={`language-option tap-target flex h-10 items-center justify-center gap-1 rounded-xl px-2 transition-all ${language === "en" ? "is-active text-foreground" : "text-muted"}`}>
        <Flag country="gb" />
        {!compact && <span className="text-[9px] font-extrabold uppercase tracking-wider">EN</span>}
      </button>
      <button type="button" onClick={() => setLanguage("bn")} aria-pressed={language === "bn"} aria-label="বাংলা" title="বাংলা" className={`language-option tap-target flex h-10 items-center justify-center gap-1 rounded-xl px-2 transition-all ${language === "bn" ? "is-active text-foreground" : "text-muted"}`}>
        <Flag country="bd" />
        {!compact && <span className="text-[9px] font-extrabold uppercase tracking-wider">বাংলা</span>}
      </button>
    </div>
  );
}
