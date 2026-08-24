import { PROCESS_STEPS } from "@/app/data/content";

export default function ProcessSection() {
  return (
    <section id="process" className="bg-neutral-950 py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-14">
          <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3">
            <div className="h-px w-8 bg-amber-500 sm:w-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-500 sm:text-xs sm:tracking-[0.4em]">
              How We Work
            </span>
            <div className="h-px w-8 bg-amber-500 sm:w-12" />
          </div>
          <h2 className="text-3xl font-black uppercase text-white sm:text-5xl">
            FROM <span className="text-amber-500">IDEA</span> TO FINISH
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {PROCESS_STEPS.map((step) => (
            <article key={step.number} className="border border-neutral-800 bg-black p-4 sm:p-5">
              <div className="text-xl font-black text-red-600 sm:text-2xl">{step.number}</div>
              <h3 className="mt-4 text-sm font-black uppercase text-white sm:text-base">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 sm:text-sm">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
