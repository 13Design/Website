import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import ClosingCTA from '../components/ClosingCTA';
import { services, audienceGroups } from '../data/studio';
import type { Route } from '../lib/router';

export default function Services({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const alsoAvailable = services.filter((s) => s.audience === 'also');

  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="Services"
        title={<>Services, in full.</>}
        body="Everything we do, grouped by who it's for. Project-based or subscription. Start with the problem, not the deliverable."
        actions="contact"
        onNavigate={onNavigate}
      />

      {/* Two audiences */}
      {audienceGroups.map((g, gi) => (
        <section key={g.id} className="relative py-16 lg:py-20 border-b border-ink-700/40">
          <div className="mx-auto max-w-edge px-5 lg:px-8">
            <Reveal>
              <SectionMarker n={`0${gi + 2}`} label={g.label} />
            </Reveal>
            <Reveal delay={1} className="mt-7">
              <p className="text-lg text-bone-300 max-w-2xl leading-relaxed text-pretty">{g.blurb}</p>
            </Reveal>

            <div className="mt-12 space-y-px bg-ink-700/40 border-y border-ink-700/40">
              {g.audienceServices.map((sid, i) => {
                const svc = services.find((s) => s.id === sid);
                if (!svc) return null;
                return (
                  <Reveal key={svc.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
                    <div className="group grid grid-cols-12 gap-4 lg:gap-8 py-8 lg:py-9 bg-ink-950 transition-colors hover:bg-ink-900/60 -mx-3 px-3 lg:-mx-5 lg:px-5 rounded-lg">
                      <div className="col-span-12 lg:col-span-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-ember-500">{String(i + 1).padStart(2, '0')}</span>
                          {svc.tag && (
                            <span className="text-[10px] uppercase tracking-[0.18em] text-ember-300 border border-ember-500/30 rounded-full px-2.5 py-0.5">
                              {svc.tag}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 font-display text-2xl lg:text-3xl font-medium text-bone-50 tracking-tighter2 leading-tight">
                          {svc.name}
                        </h3>
                      </div>
                      <div className="col-span-12 lg:col-span-7 lg:col-start-6">
                        <p className="text-base lg:text-lg text-bone-300 leading-relaxed text-pretty">{svc.body}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* Also available */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="04" label="Also available" />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {alsoAvailable.map((svc, i) => (
              <Reveal key={svc.id} delay={((i % 2) + 1) as 1 | 2}>
                <div className="group h-full rounded-2xl border border-ink-700/60 bg-ink-900 p-8 transition-all duration-500 hover:border-ember-500/40 hover:bg-ink-850">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl lg:text-2xl font-medium text-bone-50 tracking-tighter2 leading-tight">
                      {svc.name}
                    </h3>
                  </div>
                  <p className="mt-4 text-bone-400 leading-relaxed text-pretty">{svc.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ClosingCTA
        title="Not sure which fits?"
        body="Tell us where the product is and what's coming up. We'll point you to the right engagement — or tell you if none of these are it."
        ctaLabel="Contact us"
        onNavigate={onNavigate}
      />
    </main>
  );
}
