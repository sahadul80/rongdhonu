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
    <section className="bg-black px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl border border-neutral-800 bg-neutral-950 p-6 text-center sm:p-10">
        <BrandLogo size={72} showTagline />
        <h2 className="mt-6 text-2xl font-black uppercase text-white sm:text-4xl">
          DISCUSS YOUR <span className="text-amber-500">PROJECT</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
          Leave your email and start a conversation about your painting, color,
          surface or decorative finishing requirements.
        </p>

        {submitted ? (
          <div className="mt-7 border border-green-600/40 bg-green-950/30 p-4 text-sm font-black text-green-400">
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
              className="flex-1 rounded-sm border border-neutral-700 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-amber-500"
            />
            <button
              type="submit"
              className="rounded-sm bg-amber-500 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-amber-400"
            >
              Start Enquiry
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
