"use client";

import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

const links = [
  ["Services", "#services"],
  ["Process", "#process"],
  ["About", "#about"],
  ["Contact", "#contact"],
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled((current) => {
          const next = window.scrollY > 40;
          return current === next ? current : next;
        });
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-border bg-background/90 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-rainbow opacity-60" />
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          <BrandLogo size={52} showTagline />
          <div className="hidden items-center gap-6 text-xs font-bold uppercase tracking-widest md:flex lg:gap-8">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="group relative text-muted transition-colors hover:text-foreground"
              >
                {label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-rainbow transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <a
              href="#contact"
              className="rounded-sm bg-rd-red px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-rd-pink"
            >
              Get in Touch
            </a>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-2xl text-foreground"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
