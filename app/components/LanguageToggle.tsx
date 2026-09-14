"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="flex items-center rounded-full border border-border bg-surface p-0.5" aria-label={t("language")}>
      <Languages className="mx-1.5 h-3.5 w-3.5 text-muted" aria-hidden="true" />
      {(["en", "bn"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          className={`min-h-8 rounded-full px-2.5 text-[10px] font-black uppercase tracking-wider transition ${
            language === code ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          {code === "en" ? "EN" : "বাংলা"}
        </button>
      ))}
    </div>
  );
}
