import { ArrowUpRight, BlurBlob, ClipLines, Reveal, SectionTag } from "./shared";

const GROUPS = [
  {
    num: "01",
    title: "Teams building AI-native products",
    body: "A startup or new venture with AI at the center — an agent, a model, a workflow that acts on someone's behalf. You need the interaction design that generic UI patterns don't have answers for: trust, uncertainty, handoff, control.",
    tags: ["AI UX & Product Design", "Product Point of View", "Strategy & Product Direction"],
  },
  {
    num: "02",
    title: "Businesses adding AI to an existing product",
    body: "A mature business bringing AI into the core of an existing product — new features, new workflows, a genuine shift in what the product does. You need it designed with the same care as the rest of the product, not bolted on.",
    tags: ["AI Integration UX", "UX Rescue Sprint", "Product Finishing", "Design System & Ongoing Maintenance"],
  },
  {
    num: "03",
    title: "For either",
    body: "Some of what we do applies regardless of where you're starting from — and these are the engagements that move between both worlds.",
    tags: ["UX Audit Before a Raise or Launch", "Fractional Product Partner"],
  },
];

export default function WhoWeWorkWith() {
  return (
    <section id="work" aria-labelledby="work-heading" className="relative scroll-mt-24 overflow-hidden border-b border-black/10">
      <BlurBlob className="d2 left-[55%] top-[6%] h-[380px] w-[380px]" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <SectionTag num="02" label="Who we work with" />

        <h2
          id="work-heading"
          className="font-display mt-8 max-w-[16ch] text-[clamp(2.5rem,6vw,5.25rem)] font-medium leading-[1.0] tracking-[-0.04em] lg:mt-12"
        >
          <ClipLines lines={["Two starting points.", "One outcome."]} />
        </h2>

        <div className="mt-14 grid gap-4 lg:mt-24 lg:grid-cols-3 lg:gap-5">
          {GROUPS.map((g, i) => (
            <Reveal key={g.num} delay={i * 0.12} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/55 p-7 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-black hover:bg-black hover:text-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.18)] lg:p-9">
                {/* hover blob inside card */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.08] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between">
                  <span className="font-mono2 text-[11px] tracking-[0.2em] text-black/40 transition-colors duration-500 group-hover:text-white/50">
                    {g.num}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-black/25 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <h3 className="font-display relative mt-10 text-[26px] font-medium leading-[1.15] tracking-[-0.02em] lg:mt-16 lg:text-[28px]">
                  {g.title}
                </h3>
                <p className="relative mt-5 text-[15px] leading-[1.7] text-black/55 transition-colors duration-500 group-hover:text-white/65">
                  {g.body}
                </p>
                <ul className="relative mt-auto flex flex-wrap gap-2 pt-9">
                  {g.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-black/15 bg-white/60 px-3.5 py-1.5 text-[12px] text-black/60 backdrop-blur transition-colors duration-500 group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white/70"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
