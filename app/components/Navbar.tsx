"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "./LanguageContext";



export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("services");
  const { t } = useLanguage();
  const links = [["services", "#services"], ["process", "#process"], ["about", "#about"], ["contact", "#contact"]] as const;

  useEffect(() => {
    const sectionIds = ["services", "process", "about", "contact"] as const;
    let frame = 0;
    const updateActive = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const marker = window.scrollY + 140;
        let current: typeof sectionIds[number] = "services";
        for (const id of sectionIds) {
          const section = document.getElementById(id);
          if (section && section.offsetTop <= marker) current = id;
        }
        setActiveSection(current);
        frame = 0;
      });
    };
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-200 ${
          scrolled
            ? "border-border/80 bg-background/95 shadow-sm backdrop-blur-md"
            : "border-transparent bg-background/80 backdrop-blur-sm"
        }`}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-rainbow opacity-55" />
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-6">
          <Link href="/" aria-label={`${"Rong Dhonu Renovation Limited"} home`} className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <BrandLogo size={39} className="sm:hidden" />
            <BrandLogo size={43} className="hidden sm:flex" />
          </Link>

          <div className="hidden items-center gap-1 md:flex" aria-label="Section links">
            {links.map(([label, href]) => {
              const id = href.slice(1);
              const active = activeSection === id;
              return (
                <a
                  key={label}
                  href={href}
                  aria-current={active ? "location" : undefined}
                  className={`relative rounded-md px-3 py-2 text-[11px] font-black uppercase tracking-[0.13em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active ? "text-primary" : "text-muted hover:text-foreground"
                  }`}
                >
                  {t(label as "services" | "process" | "about" | "contact")}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary transition-transform duration-150 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageToggle />
            <ThemeToggle />
            <a
              href="#contact"
              className="btn-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em]"
            >
              Get in Touch
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="flex flex-col gap-1" aria-hidden="true">
                <span className="h-0.5 w-4 bg-current" />
                <span className="h-0.5 w-4 bg-current" />
                <span className="h-0.5 w-4 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </nav>
      <MobileMenu
        isOpen={mobileMenuOpen}
        activeSection={activeSection}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
