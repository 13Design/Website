import { Link } from "react-router";
import { ArrowUpRight, Reveal, SectionTag } from "../sections/shared";
import { HeroRing, LegalSections, PageHero } from "../sections/pagekit";
import { privacyPolicy } from "../data/legal";
import { useHead } from "../lib/head";

export default function Privacy() {
  useHead({
    title: "Privacy",
    description:
      "Your data, handled plainly. We collect only what it takes to reply, use cookieless analytics, and never sell data — what we hold, why, and your rights.",
  });
  return (
    <main>
      <PageHero
        kicker="01 — Privacy"
        lines={[
          "Your data,",
          <em key="i" className="font-light italic text-black/50">handled plainly.</em>,
        ]}
        lede="We keep the stack small and collect only what it takes to reply to you. Cookieless analytics, no ad tracking, no data for sale — the plain-language version of what we hold, why, and the rights you have over it."
        aside={<HeroRing />}
      />

      {/* The policy */}
      <section className="relative border-t border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionTag num="02" label="The policy" />
              <Reveal delay={0.1} className="mt-8">
                <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.03] tracking-[-0.03em]">
                  What we hold, and why.
                </h2>
              </Reveal>
              <Reveal delay={0.2} className="mt-6">
                <p className="max-w-[34ch] text-[15px] leading-[1.7] text-black/55">
                  Written to be read before you get in touch. It doesn't limit any rights you have
                  under the data-protection law that applies to you — those come first.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <LegalSections sections={privacyPolicy} />
            </div>
          </div>
        </div>
      </section>

      {/* Ask */}
      <section className="relative overflow-hidden border-t border-black/10 bg-[#e9e9e9]">
        <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="rounded-[28px] border border-black/12 bg-white/60 p-8 backdrop-blur lg:p-12">
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium tracking-[-0.03em]">
              Want to see or remove your data?
            </h2>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.7] text-black/55">
              Email us and we'll tell you exactly what we hold, correct it, or delete it — no special
              form, just ask. We reply within one business day.
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
                to="/terms"
                className="link-line font-mono2 text-[12px] uppercase tracking-[0.2em] text-black/55 hover:text-black"
              >
                Read the terms →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
