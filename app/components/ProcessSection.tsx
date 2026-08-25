import { PROCESS_STEPS } from "@/app/data/content";

const ACCENTS = ["text-rd-red", "text-rd-amber", "text-rd-green", "text-rd-blue", "text-rd-purple"] as const;

export default function ProcessSection() {
  return (
    <section id="process" className="bg-surface py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-14">
          <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3">
            <div className="h-px w-8 bg-rainbow sm:w-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-rd-amber sm:text-xs sm:tracking-[0.4em]">
              How We Work
            </span>
            <div className="h-px w-8 bg-rainbow sm:w-12" />
          </div>
          <h2 className="text-3xl font-black uppercase text-foreground sm:text-5xl">
            FROM <span className="text-rainbow">IDEA</span> TO FINISH
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {PROCESS_STEPS.map((step, index) => (
            <article key={step.number} className="border border-border bg-background p-4 sm:p-5">
              <div className={`text-xl font-black sm:text-2xl ${ACCENTS[index % ACCENTS.length]}`}>
                {step.number}
              </div>
              <h3 className="mt-4 text-sm font-black uppercase text-foreground sm:text-base">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
