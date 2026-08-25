"use client";

import { useState } from "react";
import BrandLogo from "./BrandLogo";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="bg-background px-4 py-14 sm:py-20">
      <div className="relative mx-auto max-w-3xl border border-border bg-surface p-6 text-center sm:p-10">
        <div className="absolute inset-x-0 top-0 h-1 bg-rainbow" />
        <BrandLogo size={72} showTagline />
        <h2 className="mt-6 text-2xl font-black uppercase text-foreground sm:text-4xl">
          DISCUSS YOUR <span className="text-rainbow animate-rainbow">PROJECT</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Leave your email and start a conversation about your painting, color,
          surface or decorative finishing requirements.
        </p>

        {submitted ? (
          <div className="mt-7 border border-rd-green/40 bg-rd-green/10 p-4 text-sm font-black text-rd-green">
            Thank you. Your enquiry has been received.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-7 flex max-w-lg flex-col gap-2 sm:flex-row sm:gap-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-rd-amber"
            />
            <button
              type="submit"
              className="rounded-sm bg-rd-amber px-5 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-rd-yellow"
            >
              Start Enquiry
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
