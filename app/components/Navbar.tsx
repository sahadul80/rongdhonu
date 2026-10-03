"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "./LanguageContext";
import type { BusinessPublicSummary } from "@/app/types/public-cms";
import { BRAND } from "@/app/data/brand";

interface NavbarProps {
  business: BusinessPublicSummary | null;
}

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const navHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 64;
  const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  window.history.replaceState(null, "", `#${id}`);
}

export default function Navbar({ business }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("services");
  const { t } = useLanguage();
  const teamSlug = business?.teamSlug || "our-team";
  const workSlug = business?.workSlug || "our-work";
  const hasTeam = business?.hasTeam ?? false;
  const hasWork = business?.hasWork ?? false;

  const navLinks = useMemo(() => [
    ["services", "services"],
    ["process", "process"],
    ["about", "about"],
    ...(hasWork ? [["work", workSlug] as const] : []),
    ...(hasTeam ? [["team", teamSlug] as const] : []),
    ["contact", "contact"],
  ] as const, [hasTeam, hasWork, teamSlug, workSlug]);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateActive = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const marker = window.scrollY + 155;
        let current = "services";
        let highestTop = Number.NEGATIVE_INFINITY;

        for (const [, id] of navLinks) {
          const section = document.getElementById(id);
          if (!section) continue;
          const top = section.getBoundingClientRect().top + window.scrollY;
          if (top <= marker && top >= highestTop) {
            highestTop = top;
            current = id;
          }
        }

        if (window.scrollY < 80) current = "services";
        setActiveSection(current);
        frame = 0;
      });
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    window.addEventListener("hashchange", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("hashchange", updateActive);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [navLinks]);

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    scrollToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        aria-label={t("primaryNav")}
        className={`public-navbar fixed inset-x-0 top-0 ${
          scrolled ? "bg-background/92 backdrop-blur-xl" : "bg-background/72 backdrop-blur-lg"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-4 bg-linear-to-t from-primary/8 via-primary/3 to-transparent blur-[5px]" aria-hidden="true" />
        <div className="section-shell relative grid h-16 grid-cols-[auto_1fr_auto] items-center md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" aria-label={`${business?.name || BRAND.name} — ${t("homeAria")}`} className="shrink-0 justify-self-start rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <BrandLogo size={39} className="sm:hidden" />
            <BrandLogo size={43} className="hidden sm:flex" />
          </Link>

          <div className="hidden min-w-0 items-center justify-center gap-1 md:flex" aria-label={t("sectionLinks")}>
            {navLinks.map(([label, id]) => {
              const active = activeSection === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(event) => handleSectionClick(event, id)}
                  aria-current={active ? "location" : undefined}
                  className={`nav-section-link ${active ? "is-active" : ""}`}
                >
                  {t(label)}
                </a>
              );
            })}
          </div>

          <div className="col-start-3 flex items-center justify-self-end gap-1.5">
            <div className="hidden items-center gap-1 md:flex">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-1 md:hidden">
              <LanguageToggle compact />
              <ThemeToggle className="glass-toggle" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="glass-toggle tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/60 text-foreground backdrop-blur-xl"
                aria-label={t("openMenu")}
                aria-expanded={mobileMenuOpen}
              >
                <span className="flex w-4 flex-col gap-1"><span className="h-0.5 w-full bg-current" /><span className="h-0.5 w-full bg-current" /><span className="h-0.5 w-3/4 bg-current" /></span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu
        isOpen={mobileMenuOpen}
        activeSection={activeSection}
        onClose={() => setMobileMenuOpen(false)}
        business={business}
      />
    </>
  );
}
