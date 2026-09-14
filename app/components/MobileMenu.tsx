"use client";

import { useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "./LanguageContext";

interface MobileMenuProps {
  isOpen: boolean;
  activeSection: string;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, activeSection, onClose }: MobileMenuProps) {
  const { t } = useLanguage();
  const links = [["services", "#services"], ["process", "#process"], ["about", "#about"], ["contact", "#contact"]] as const;
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        className="fixed inset-0 z-40 cursor-default bg-black/45"
        onClick={onClose}
      />
      <aside
        aria-label="Mobile navigation"
        className="fixed right-0 top-0 z-50 h-dvh w-[min(20rem,88vw)] overflow-y-auto border-l border-border bg-surface px-4 py-4 shadow-2xl"
      >
        <div className="absolute inset-y-0 left-0 w-px bg-rainbow" />
        <div className="flex h-10 items-center justify-between border-b border-border pb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{t("menu")}</span>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={onClose}
              className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border text-xl text-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1">
          {links.map(([label, href]) => {
            const id = href.slice(1);
            const active = activeSection === id;
            return (
              <a
                key={label}
                href={href}
                onClick={onClose}
                aria-current={active ? "location" : undefined}
                className={`relative flex min-h-11 items-center rounded-lg px-3 py-3 text-xs font-black uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? "bg-primary/10 text-primary" : "text-muted-strong hover:bg-background hover:text-primary"
                }`}
              >
                {t(label as "services" | "process" | "about" | "contact")}
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary transition-transform ${
                    active ? "scale-y-100" : "scale-y-0"
                  }`}
                />
              </a>
            );
          })}
          <a
            href="#contact"
            onClick={onClose}
            className="btn-primary mt-3 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.12em]"
          >
            {t("requestConsultation")}
          </a>
        </div>
      </aside>
    </>
  );
}
