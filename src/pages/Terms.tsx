import { Link } from "react-router";
import { ArrowUpRight, Reveal, SectionTag } from "../sections/shared";
import { HeroRing, LegalSections, PageHero } from "../sections/pagekit";
import { workingAgreement } from "../data/legal";

export default function Terms() {
  return (
    <main>
      <PageHero
        kicker="01 — Terms & agreement"
        lines={[
          "The terms of",
          <em key="i" className="font-light italic text-black/50">working with us.</em>,
        ]}
        lede="How we engage as a studio — what you own, how we handle confidentiality, when we show work publicly, and the law that governs it. Written to be read before you start, not after."
        aside={<HeroRing />}
      />

      {/* Working agreement */}
      <section className="relative border-t border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionTag num="02" label="Working agreement" />
              <Reveal delay={0.1} className="mt-8">
                <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.03] tracking-[-0.03em]">
                  How we work with clients.
                </h2>
              </Reveal>
              <Reveal delay={0.2} className="mt-6">
                <p className="max-w-[34ch] text-[15px] leading-[1.7] text-black/55">
                  The plain-language version of what a contract would say. Where you need the full
                  document, we'll sign yours or provide ours.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <LegalSections sections={workingAgreement} />
            </div>
          </div>
        </div>
      </section>

      {/* Ask */}
      <section className="relative overflow-hidden border-t border-black/10 bg-[#e9e9e9]">
        <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="rounded-[28px] border border-black/12 bg-white/60 p-8 backdrop-blur lg:p-12">
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium tracking-[-0.03em]">
              Questions before we start?
            </h2>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.7] text-black/55">
              Ask us anything about how we work — ownership, confidentiality, or the shape of an
              engagement. A real person replies within one business day.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="mailto:hello@13design.org"
                className="group inline-flex items-center gap-3 rounded-full border border-black bg-black px-7 py-3.5 text-[14px] font-medium text-white transition-colors duration-300 hover:bg-transparent hover:text-black"
              >
                hello@13design.org
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <Link
                to="/privacy"
                className="link-line font-mono2 text-[12px] uppercase tracking-[0.2em] text-black/55 hover:text-black"
              >
                Read the privacy policy →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
