"use client";

import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "./LanguageContext";
import { useModalScrollLock } from "./useModalScrollLock";
import type { BusinessPublicSummary } from "@/app/types/public-cms";

interface MobileMenuProps {
  isOpen: boolean;
  activeSection: string;
  onClose: () => void;
  business: BusinessPublicSummary | null;
}

export default function MobileMenu({ isOpen, activeSection, onClose, business }: MobileMenuProps) {
  const { t } = useLanguage();
  useModalScrollLock(isOpen);
  if (!isOpen) return null;

  const teamSlug = business?.teamSlug || "our-team";
  const workSlug = business?.workSlug || "our-work";
  const links = [
    ["services", "#services"],
    ["process", "#process"],
    ...(business?.hasTeam ? [["team", `#${teamSlug}`] as const] : []),
    ...(business?.hasWork ? [["work", `#${workSlug}`] as const] : []),
    ["about", "#about"],
    ["contact", "#contact"],
  ] as const;

  return (
    <div className="mobile-menu-layer fixed inset-0 flex items-start justify-end overflow-hidden">
      <button type="button" aria-label={t("closeMenu")} className="mobile-menu-backdrop fixed inset-0 cursor-default bg-black/45" onClick={onClose} />
      <aside aria-label={t("mobileNav")} className="mobile-menu-panel fixed right-0 top-0 h-dvh w-[min(22rem,92vw)] overflow-y-auto bg-surface px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl overscroll-contain">
        <div className="absolute inset-y-0 left-0 w-px bg-rainbow" />
        <div className="flex h-10 items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{t("menu")}</span>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button type="button" onClick={onClose} className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border text-xl text-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t("closeMenuShort")}>&times;</button>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-1">
          {links.map(([label, href]) => {
            const id = href.slice(1);
            const active = activeSection === id;
            return (
              <a key={label} href={href} onClick={onClose} aria-current={active ? "location" : undefined} className={`relative flex min-h-11 items-center rounded-lg px-3 py-3 text-xs font-black uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "bg-primary/10 text-primary" : "text-muted-strong hover:bg-background hover:text-primary"}`}>
                {t(label as "services" | "process" | "team" | "work" | "about" | "contact")}
                <span aria-hidden="true" className={`absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary transition-transform ${active ? "scale-y-100" : "scale-y-0"}`} />
              </a>
            );
          })}
          <a href="#contact" onClick={onClose} className="btn-primary mt-3 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.12em]">{t("requestConsultation")}</a>
        </div>
      </aside>
    </div>
  );
}
