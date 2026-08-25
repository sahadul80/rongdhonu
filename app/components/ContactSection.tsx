import { BRAND } from "@/app/data/brand";

const contactRows = [
  ["Address", BRAND.address],
  ["Phone", BRAND.phone],
  ["Email", BRAND.email],
  ["Website", BRAND.website],
];

export default function ContactSection() {
  return (
    <section id="contact" className="bg-surface py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <div className="mb-3 flex items-center gap-2 sm:mb-5 sm:gap-3">
              <div className="h-px w-8 bg-rainbow sm:w-12" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-rd-red sm:text-xs sm:tracking-[0.4em]">
                Contact Us
              </span>
            </div>
            <h2 className="text-3xl font-black uppercase text-foreground sm:text-5xl">
              READY TO <span className="text-rainbow animate-rainbow">TRANSFORM?</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Tell us about the space, the finish you want and the type of work you need.
              We can then discuss the most suitable service approach.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`mailto:${BRAND.email}`}
                className="rounded-sm bg-rd-red px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rd-pink"
              >
                Email Us
              </a>
              <a
                href={`tel:${BRAND.phone.replace(/[^0-9+]/g, "")}`}
                className="rounded-sm border border-border px-5 py-3 text-[10px] font-black uppercase tracking-widest text-foreground hover:border-rd-amber hover:text-rd-amber"
              >
                Call Us
              </a>
            </div>
          </div>

          <div className="border border-border bg-background p-4 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-base font-black uppercase text-foreground sm:text-xl">Business Information</h3>
              <span className="text-[9px] font-black uppercase tracking-widest text-rd-amber">Dhaka</span>
            </div>
            <div className="divide-y divide-border">
              {contactRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[72px_1fr] gap-4 py-3 sm:grid-cols-[100px_1fr] sm:py-4">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted sm:text-[10px]">{label}</span>
                  <span className="text-xs leading-relaxed text-muted-strong sm:text-sm">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-border pt-5">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">Core Offering</span>
              <p className="mt-2 text-sm font-bold text-foreground">
                Painting · Color Schemes · Skim Coat · Marble · Ambrose · Texture
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
