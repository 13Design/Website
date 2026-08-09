import { Link } from "react-router";
import { ArrowUpRight, ClipLines, KGrain, Reveal, SectionTag } from "../sections/shared";
import { GhostWord, HeroRing, PageHero } from "../sections/pagekit";
import Cta from "../sections/Cta";
import { audienceGroups, services } from "../data/content";

export default function Services() {
  return (
    <main>
      <PageHero
        kicker="01 — Services"
        lines={[
          "Services,",
          <em key="i" className="font-light italic text-black/50">in full.</em>,
        ]}
        lede="Everything we do, grouped by who it's for. Project-based or subscription. Start with the problem, not the deliverable."
        aside={<HeroRing />}
      />

      {audienceGroups.map((g, gi) => {
        const groupServices = g.serviceIds
          .map((sid) => services.find((s) => s.id === sid))
          .filter(Boolean) as typeof services;
        const dark = gi === 1;

        return (
          <section
            key={g.id}
            className={`relative overflow-hidden border-t ${
              dark ? "on-ink border-white/10 bg-[#0c0c0c] text-white" : "border-black/10"
            }`}
          >
            {dark && <KGrain dark />}
            {!dark && gi === 0 && (
              <GhostWord word="SERVICES" className="-right-8 top-10 text-[18vw] opacity-60" />
            )}

            <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-4">
                  <SectionTag num={`0${gi + 2}`} label={g.label} dark={dark} />
                  <Reveal delay={0.1} className="mt-8">
                    <p
                      className={`max-w-[38ch] text-[16px] leading-[1.7] ${
                        dark ? "text-white/55" : "text-black/55"
                      }`}
                    >
                      {g.blurb}
                    </p>
                  </Reveal>
                </div>

                <div className="lg:col-span-8">
                  {groupServices.map((svc, i) => (
                    <Reveal key={svc.id} delay={0.05 * i}>
                      <Link
                        to="/contact"
                        className={`group grid gap-4 border-t py-8 transition-colors duration-500 sm:grid-cols-12 sm:gap-8 lg:py-9 ${
                          dark ? "border-white/12 hover:bg-white/[0.03]" : "border-black/10 hover:bg-white/50"
                        }`}
                        aria-label={`${svc.name} — contact us about this service`}
                      >
                        <div className="sm:col-span-5">
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`font-mono2 text-[12px] tracking-[0.2em] ${
                                dark ? "text-white/40" : "text-black/40"
                              }`}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {svc.tag && (
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                                  dark ? "border-white/25 text-white/60" : "border-black/20 text-black/55"
                                }`}
                              >
                                {svc.tag}
                              </span>
                            )}
                          </div>
                          <h3
                            className={`font-display mt-3 text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-[1.08] tracking-[-0.02em] ${
                              dark ? "text-white" : "text-black"
                            }`}
                          >
                            {svc.name}
                          </h3>
                        </div>
                        <div className="flex items-start justify-between gap-6 sm:col-span-7">
                          <p
                            className={`max-w-[52ch] text-[15px] leading-[1.7] ${
                              dark ? "text-white/55" : "text-black/55"
                            }`}
                          >
                            {svc.body}
                          </p>
                          <ArrowUpRight
                            className={`mt-1 h-5 w-5 shrink-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 ${
                              dark ? "text-white/30 group-hover:text-white" : "text-black/25 group-hover:text-black"
                            }`}
                          />
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                  <div className={dark ? "border-t border-white/12" : "border-t border-black/10"} />
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* not sure which fits */}
      <section className="relative overflow-hidden border-t border-black/10">
        <KGrain />
        <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-24 text-center sm:px-8 lg:px-12 lg:py-36">
          <Reveal>
            <h2 className="font-display mx-auto max-w-[16ch] text-[clamp(2.2rem,6vw,4.8rem)] font-medium leading-[1.0] tracking-[-0.04em]">
              <ClipLines onView lines={["Not sure which fits?"]} />
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-[46ch] text-[16px] leading-[1.7] text-black/55">
              Tell us where the product is and what's coming up. We'll point you to the right
              engagement.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <Link
              to="/contact"
              className="group mt-10 inline-flex items-center gap-3 rounded-full border border-black bg-black px-8 py-4 text-[15px] font-medium text-white transition-colors duration-300 hover:bg-transparent hover:text-black"
            >
              Contact us
              <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Cta />
    </main>
  );
}
