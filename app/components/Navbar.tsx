"use client";

import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";
import BrandLogo from "./BrandLogo";

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
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-neutral-800 bg-black/90 backdrop-blur-md" : "bg-transparent"}`}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          <BrandLogo size={52} showTagline />
          <div className="hidden items-center gap-6 text-xs font-bold uppercase tracking-widest md:flex lg:gap-8">
            {links.map(([label, href]) => (
              <a key={label} href={href} className="text-neutral-400 transition-colors hover:text-amber-500">
                {label}
              </a>
            ))}
          </div>
          <a href="#contact" className="hidden rounded-sm bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-500 md:block">
            Get in Touch
          </a>
          <button onClick={() => setMobileMenuOpen(true)} className="text-2xl text-white md:hidden" aria-label="Open menu">
            ☰
          </button>
        </div>
      </nav>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
