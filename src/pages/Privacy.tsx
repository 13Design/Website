import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Reveal, SectionTag } from "../sections/shared";
import { HeroRing, LegalSections, PageHero } from "../sections/pagekit";
import { privacyPolicy } from "../data/legal";
import { useHead } from "../lib/head";
import { getConsent, grantConsent, denyConsent, type ConsentValue } from "../lib/consent";

/** Let visitors see and change their ad-measurement choice at any time. */
function AdMeasurementControl() {
  const [choice, setChoice] = useState<ConsentValue | null>(() => getConsent());

  const turnOn = () => {
    grantConsent(); // loads the pixel immediately — no reload needed
    setChoice("granted");
  };
  const turnOff = () => {
    denyConsent();
    setChoice("denied");
    // A pixel already loaded this page only stops after a reload.
    window.location.reload();
  };

  const on = choice === "granted";
  const label = on ? "on" : "off";

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
      <span className="font-mono2 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-black/55">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${on ? "bg-black" : "bg-black/25"}`}
          aria-hidden="true"
        />
        Ad measurement is {label}
      </span>
      {on ? (
        <button
          type="button"
          onClick={turnOff}
          className="inline-flex items-center rounded-full border border-black/15 px-5 py-2.5 text-[13px] font-medium text-black/70 transition-colors duration-300 hover:border-black/40 hover:text-black"
        >
          Turn off
        </button>
      ) : (
        <button
          type="button"
          onClick={turnOn}
          className="inline-flex items-center rounded-full border border-black bg-black px-5 py-2.5 text-[13px] font-medium text-white transition-colors duration-300 hover:bg-transparent hover:text-black"
        >
          Turn on
        </button>
      )}
    </div>
  );
}

export default function Privacy() {
  useHead({
    title: "Privacy",
    description:
      "Your data, handled plainly. We collect only what it takes to reply, use cookieless analytics with ad measurement strictly opt-in, and never sell data — what we hold, why, and your rights.",
  });
  return (
    <main>
      <PageHero
        kicker="01 — Privacy"
        lines={[
          "Your data,",
          <em key="i" className="font-light italic text-black/50">handled plainly.</em>,
        ]}
        lede="We keep the stack small and collect only what it takes to reply to you. Cookieless analytics, ad measurement strictly opt-in, no data for sale — the plain-language version of what we hold, why, and the rights you have over it."
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

            <div className="mt-10 border-t border-black/10 pt-7">
              <h3 className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-black/40">
                Ad measurement
              </h3>
              <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.7] text-black/55">
                The only non-essential thing on this site is X's conversion pixel, and it stays off
                until you turn it on. Change your choice here any time — it takes effect immediately.
              </p>
              <AdMeasurementControl />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
