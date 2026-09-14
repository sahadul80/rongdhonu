"use client";

import { useState } from "react";
import BrandLogo from "./BrandLogo";
import { useLanguage } from "./LanguageContext";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="bg-background px-4 py-7 sm:py-10">
      <div className="swatch-card relative mx-auto max-w-3xl bg-surface p-5 text-center sm:p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-rainbow" />
        <BrandLogo size={58} showTagline />
        <h2 className="h2-fluid title-scroll-fx mt-4 font-black uppercase text-foreground">
          {t("discussProject")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {t("newsletterText")}
        </p>

        {submitted ? (
          <div className="mt-5 border border-rd-green/40 bg-rd-green/10 p-4 text-sm font-black text-rd-green">
            {t("thankYou")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-7 flex max-w-lg flex-col gap-2 sm:flex-row sm:gap-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            <button
              type="submit"
              className="btn-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest"
            >
              {t("startEnquiry")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
