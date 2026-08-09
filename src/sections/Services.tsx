import { ArrowUpRight, Asterisk, ClipLines, Reveal, SectionTag } from "./shared";

const SERVICES = [
  {
    num: "01",
    title: "AI UX & Product Design",
    meta: "sprint · embedded",
    body: "Interaction design for AI-native features — confidence and uncertainty states, human-in-the-loop controls, agent handoff, the moments a user decides whether to trust the output.",
  },
  {
    num: "02",
    title: "UX Rescue Sprint",
    meta: "fixed price · 1–2 weeks",
    body: "Audit against real user behavior. A prioritized list of what's actually costing you users. We fix the top offenders live, inside the sprint, and leave you a roadmap for what's next.",
  },
  {
    num: "03",
    title: "Product Finishing",
    meta: "2–4 weeks",
    body: "Whole-flow coherence: onboarding, checkout, settings, permissions. The states AI-assisted builds tend to skip — empty, loading, error, edge case. Ready to demo or onboard real customers without breaking.",
  },
  {
    num: "04",
    title: "Fractional Product Partner",
    meta: "ongoing",
    body: "A part-time design and product lead, ongoing — we help decide what to build and in what order, and keep it coherent as your team and product grow.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="on-ink relative scroll-mt-24 overflow-hidden bg-[#0c0c0c] text-white"
    >
      {/* animated grain panel */}
      <div className="grain-panel absolute inset-0" aria-hidden="true" />
      {/* hairline grid */}
      <div className="v-grid-w pointer-events-none absolute inset-0" aria-hidden="true" />
      {/* drifting white blur */}
      <div aria-hidden="true" className="blob-drift pointer-events-none absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-white/[0.05] blur-[110px]" />
      <div aria-hidden="true" className="blob-drift d2 pointer-events-none absolute -right-24 bottom-16 h-[380px] w-[380px] rounded-full bg-white/[0.06] blur-[110px]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <SectionTag num="03" label="What we do" dark />
            <h2
              id="services-heading"
              className="font-display mt-8 text-[clamp(2.5rem,6vw,5.25rem)] font-medium leading-[1.0] tracking-[-0.04em] lg:mt-12"
            >
              <ClipLines lines={["What we change, briefly."]} />
            </h2>
          </div>
          <Reveal delay={0.2}>
            <a
              href="/services"
              className="group inline-flex items-center gap-2 pb-2 text-[15px] text-white/70 transition-colors hover:text-white"
            >
              <span className="link-line">All services</span>
              <span className="transition-transform duration-400 group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
        </div>

        <div id="services-list" className="mt-14 grid gap-4 lg:mt-24 lg:grid-cols-2 lg:gap-5">
          {SERVICES.map((s, i) => (
            <Reveal key={s.num} delay={(i % 2) * 0.1} className="h-full">
              <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-7 backdrop-blur-md transition-all duration-500 hover:border-white hover:bg-white hover:text-black lg:p-10">
                {/* watermark number */}
                <span
                  aria-hidden="true"
                  className="text-outline-w pointer-events-none absolute -right-3 -top-8 select-none font-display text-[120px] font-semibold leading-none opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:[-webkit-text-stroke:1px_rgba(0,0,0,0.15)]"
                >
                  {s.num}
                </span>

                <div className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <h3 className="font-display max-w-[14ch] text-[26px] font-medium leading-[1.12] tracking-[-0.02em] lg:text-[30px]">
                      {s.title}
                    </h3>
                    <span className="font-mono2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55 backdrop-blur transition-colors duration-500 group-hover:border-black/25 group-hover:bg-transparent group-hover:text-black/60">
                      {s.meta}
                    </span>
                  </div>
                  <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.7] text-white/55 transition-colors duration-500 group-hover:text-black/65">
                    {s.body}
                  </p>
                </div>

                <div className="relative mt-10 flex items-center justify-between border-t border-white/12 pt-5 transition-colors duration-500 group-hover:border-black/15">
                  <span className="font-mono2 flex items-center gap-2 text-[11px] tracking-[0.2em] text-white/35 transition-colors duration-500 group-hover:text-black/45">
                    <Asterisk className="h-3 w-3" />
                    {s.num} / 04
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-white/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-black" />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
