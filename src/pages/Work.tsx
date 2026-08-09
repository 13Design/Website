import { Link } from "react-router";
import { ArrowUpRight, Asterisk, KGrain, Reveal, SectionTag } from "../sections/shared";
import { GhostWord, HeroRing, PageHero } from "../sections/pagekit";
import Cta from "../sections/Cta";
import { workNoCases } from "../data/content";

/* Placeholder frames — the case-study grid, waiting for its first work. */
function EmptyFrame({ i }: { i: number }) {
  return (
    <Reveal delay={0.08 * i}>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.03]">
        <div className="kgrain on-dark" aria-hidden="true" />
        <span className="font-mono2 absolute left-6 top-6 text-[11px] tracking-[0.24em] text-white/30">
          {String(i + 1).padStart(2, "0")}
        </span>
        <Asterisk className="spin-slow absolute inset-0 m-auto h-12 w-12 text-white/15 transition-colors duration-500 group-hover:text-white/30" />
        <span className="font-mono2 absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.28em] text-white/25">
          Case study — soon
        </span>
      </div>
    </Reveal>
  );
}

import { useHead } from "../lib/head";

export default function Work() {
  useHead({
    title: "Work",
    description:
      "Case studies are on the way. We're taking on our first founding clients now — full write-ups land here as that work ships.",
  });
  return (
    <main>
      <PageHero
        kicker="01 — Work"
        lines={[
          "Work,",
          <em key="i" className="font-light italic text-black/50">on the way.</em>,
        ]}
        lede="We're taking on our first founding clients now — full case studies will land here as that work ships. The decisions behind the screens, not just the screens."
        aside={<HeroRing />}
      />

      {/* On the way */}
      <section className="on-ink relative overflow-hidden border-t border-white/10 bg-[#0c0c0c] text-white">
        <KGrain dark />
        <GhostWord word="SOON" className="text-outline-w -right-10 bottom-6 text-[20vw]" />

        <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <SectionTag num="02" label="On the way" dark />

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <h2 className="font-display max-w-[18ch] text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.04em]">
                {workNoCases.title}
              </h2>
              <p className="mt-7 max-w-[52ch] text-[16px] leading-[1.75] text-white/55">
                {workNoCases.body}
              </p>
            </Reveal>

            <Reveal delay={0.15} className="lg:col-span-5">
              <div className="rounded-[24px] border border-white/15 bg-white/[0.04] p-8 backdrop-blur lg:p-9">
                <p className="font-mono2 mb-5 text-[11px] uppercase tracking-[0.28em] text-white/45">
                  Be one of the first
                </p>
                <p className="text-[15px] leading-[1.75] text-white/65">
                  We're taking on a small number of founding clients on terms that reflect it — the
                  first case studies here will be their work. Want your product to be one of them?
                </p>
                <Link
                  to="/founding-clients"
                  className="group mt-7 inline-flex items-center gap-2 text-[14px] text-white/80 transition-colors hover:text-white"
                >
                  <span className="link-line">Become a founding client</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <EmptyFrame key={i} i={i} />
            ))}
          </div>
        </div>
      </section>

      <Cta
        kicker="Case studies in progress"
        lines={[
          "Want to be one of",
          "our first",
          <em key="i" className="font-light italic text-black/50">case studies?</em>,
        ]}
        body="Tell us where the product is and what's coming up. We'll give you an honest read on fit."
      />
    </main>
  );
}
