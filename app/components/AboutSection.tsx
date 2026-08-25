import { BRAND } from "@/app/data/brand";

const strengths = [
  ["01", "Color Planning", "Choose coordinated wall colors and finish combinations for the character of your space.", "text-rd-red"],
  ["02", "Surface Preparation", "Prepare walls properly, including skim coat work where required before finishing.", "text-rd-amber"],
  ["03", "Decorative Finishes", "Create distinctive surfaces through marble painting, Ambrose painting and texture work.", "text-rd-green"],
  ["04", "Transformation", "Bring the selected finish together into a consistent, polished renovation result.", "text-rd-blue"],
] as const;

export default function AboutSection() {
  return (
    <section id="about" className="bg-background py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-3 flex items-center gap-2 sm:mb-6 sm:gap-3">
              <div className="h-px w-8 bg-rainbow sm:w-12" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-rd-amber sm:text-xs sm:tracking-[0.4em]">
                About the Company
              </span>
            </div>
            <h2 className="text-3xl font-black uppercase leading-tight text-foreground sm:text-5xl">
              A FINISHING PARTNER FOR YOUR <span className="text-rainbow">SPACE</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
              {BRAND.name} is positioned around a simple promise: Color, Design and
              Transform. Our service offering focuses on painting, wall color schemes,
              surface preparation and decorative finishing work.
            </p>
            <div className="mt-7 border-l-2 border-rd-red pl-4 sm:mt-9 sm:pl-5">
              <p className="text-sm font-bold leading-relaxed text-muted-strong sm:text-base">
                The goal is not simply to apply paint—it is to create a finish that
                works with the space, the design and the client&apos;s intended result.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {strengths.map(([number, title, description, accent]) => (
              <article key={number} className="border border-border bg-surface p-4 sm:p-6">
                <div className={`text-xl font-black sm:text-2xl ${accent}`}>{number}</div>
                <h3 className="mt-4 text-sm font-black uppercase text-foreground sm:text-base">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
