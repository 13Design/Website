import { Asterisk, KGrain, Reveal, SectionTag } from "../sections/shared";
import { HeroRing, NumberedRow, PageHero } from "../sections/pagekit";
import Cta from "../sections/Cta";
import {
  aboutProcess,
  aboutStudio,
  aboutStudioExtended,
  beliefIntro,
  beliefs,
  directAccessLine,
  honestPart,
} from "../data/content";

export default function About() {
  return (
    <main>
      <PageHero
        kicker="01 — About"
        lines={[
          "A studio built for",
          "the moment AI products",
          <em key="i" className="font-light italic text-black/50">grow up.</em>,
        ]}
        lede="We're passionate about what's next."
        aside={<HeroRing />}
      />

      {/* The studio */}
      <section className="relative border-t border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionTag num="02" label="The studio" />
            </div>
            <div className="lg:col-span-8">
              {aboutStudio.map((para, i) => (
                <Reveal key={i} delay={0.05 * i}>
                  <p
                    className={`max-w-[62ch] text-[clamp(1.15rem,1.9vw,1.5rem)] leading-[1.55] tracking-[-0.01em] text-black/80 ${
                      i > 0 ? "mt-7" : ""
                    }`}
                  >
                    {para}
                  </p>
                </Reveal>
              ))}
              <Reveal delay={0.15}>
                <p className="mt-7 max-w-[58ch] text-[16px] leading-[1.75] text-black/55">
                  {aboutStudioExtended}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* What we believe — dark grain panel */}
      <section className="on-ink relative overflow-hidden border-t border-white/10 bg-[#0c0c0c] text-white">
        <KGrain dark />
        <Asterisk className="spin-slow pointer-events-none absolute -left-16 bottom-10 h-56 w-56 text-white/[0.06]" />
        <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionTag num="03" label="What we believe" dark />
              <Reveal delay={0.1} className="mt-8">
                <p className="max-w-[34ch] text-[15.5px] leading-[1.7] text-white/55">{beliefIntro}</p>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              {beliefs.map((b, i) => (
                <Reveal key={i} delay={0.06 * i}>
                  <div className="group flex gap-6 border-t border-white/12 py-8 lg:py-9">
                    <span className="font-mono2 mt-2 shrink-0 text-[12px] tracking-[0.2em] text-white/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-display max-w-[26ch] text-[clamp(1.35rem,2.6vw,2rem)] font-medium leading-[1.2] tracking-[-0.02em] text-white/90 transition-colors duration-500 group-hover:text-white">
                      {b}
                    </p>
                  </div>
                </Reveal>
              ))}
              <div className="border-t border-white/12" />
            </div>
          </div>
        </div>
      </section>

      {/* The honest part */}
      <section className="relative overflow-hidden border-t border-black/10 bg-[#e9e9e9]">
        <KGrain />
        <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionTag num="04" label="The honest part" />
            </div>
            <div className="lg:col-span-8">
              {honestPart.map((para, i) => (
                <Reveal key={i} delay={0.05 * i}>
                  <p
                    className={`max-w-[62ch] text-[clamp(1.05rem,1.7vw,1.3rem)] leading-[1.65] text-black/75 ${
                      i > 0 ? "mt-7" : ""
                    }`}
                  >
                    {para}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="relative border-t border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <SectionTag num="05" label="How we work" />
          <Reveal delay={0.1}>
            <h2 className="font-display mt-10 max-w-[18ch] text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.04em]">
              Four steps, repeated.
            </h2>
          </Reveal>
          <div className="mt-12">
            {aboutProcess.map((s, i) => (
              <NumberedRow key={s.n} n={s.n} title={s.title} body={s.body} delay={0.05 * i} />
            ))}
            <div className="border-t border-black/10" />
          </div>
        </div>
      </section>

      {/* Direct access */}
      <section className="relative border-t border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <SectionTag num="06" label="Direct access" />
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-[64ch] text-[clamp(1.2rem,2.2vw,1.7rem)] leading-[1.5] tracking-[-0.01em] text-black/80">
              {directAccessLine}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-10 flex items-center gap-3 text-[14px] text-black/50">
              <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-black" />
              Team on purpose, not by accident.
            </p>
          </Reveal>
        </div>
      </section>

      <Cta />
    </main>
  );
}
