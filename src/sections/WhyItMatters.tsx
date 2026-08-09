import { Reveal, SectionTag } from "./shared";

const POINTS = [
  'The question has moved from "who can build it fast" to "who can make it exceptional."',
  "Good output is abundant now. Judgment, taste, and coherence are the layer that isn't.",
  "Design is decisive thinking, not just generation — deciding what a product should and shouldn't do.",
  "A product built only for what AI can do today is already out of date. We design with where this is going.",
];

export default function WhyItMatters() {
  return (
    <section
      aria-labelledby="why-heading"
      className="on-ink relative overflow-hidden border-y border-black bg-[#0c0c0c] text-white"
    >
      {/* animated grain + blur */}
      <div className="grain-panel absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="blob-drift pointer-events-none absolute right-[10%] top-[10%] h-[420px] w-[420px] rounded-full bg-white/[0.05] blur-[110px]"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionTag num="06" label="Why this matters" dark />
              <Reveal delay={0.1}>
                <p
                  id="why-heading"
                  className="mt-8 max-w-[40ch] text-[clamp(1.35rem,2.4vw,1.9rem)] font-light leading-[1.5] tracking-[-0.01em] text-white/70 lg:mt-12"
                >
                  The question in our industry has changed. We built this studio around the answer.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div aria-hidden="true" className="mt-12 hidden items-center gap-4 lg:flex">
                  <span className="h-px w-24 bg-white/25" />
                  <span className="font-mono2 text-[11px] uppercase tracking-[0.28em] text-white/40">
                    04 theses
                  </span>
                </div>
              </Reveal>
            </div>
          </div>

          <ol className="lg:col-span-7">
            {POINTS.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <li className="group flex gap-6 border-t border-white/12 py-8 transition-all duration-500 last:border-b hover:bg-white/[0.04] hover:pl-4 lg:gap-10 lg:py-10">
                  <span className="font-mono2 pt-1.5 text-[12px] tracking-[0.2em] text-white/35 transition-colors duration-500 group-hover:text-white">
                    0{i + 1}
                  </span>
                  <p className="font-display max-w-[34ch] text-[clamp(1.25rem,2.1vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.015em] text-white/85 transition-colors duration-500 group-hover:text-white">
                    {p}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
