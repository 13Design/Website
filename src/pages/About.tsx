import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import ClosingCTA from '../components/ClosingCTA';
import {
  aboutPositioning,
  aboutStudio,
  beliefIntro,
  beliefs,
  honestPart,
  directAccessLine,
  processSteps,
} from '../data/studio';
import { aboutStudioExtended } from '../data/pages';
import type { Route } from '../lib/router';

export default function About({ onNavigate }: { onNavigate: (r: Route) => void }) {
  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="About"
        title={<>A studio built for the moment AI products grow up.</>}
        body={aboutPositioning}
        actions="contact"
        onNavigate={onNavigate}
      />

      {/* The studio */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="02" label="The studio" />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={1}>
                {aboutStudio.split('\n\n').map((para, i) => (
                  <p
                    key={i}
                    className={`text-lg lg:text-xl text-bone-200 leading-relaxed text-pretty ${i > 0 ? 'mt-6' : ''}`}
                  >
                    {para}
                  </p>
                ))}
              </Reveal>
              <Reveal delay={2} className="mt-6">
                <p className="text-lg text-bone-300 leading-relaxed text-pretty">
                  {aboutStudioExtended}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* What we believe */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="03" label="What we believe" />
              </Reveal>
              <Reveal delay={1} className="mt-7">
                <p className="text-lg text-bone-300 leading-relaxed text-pretty max-w-md">
                  {beliefIntro}
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <ul className="space-y-px bg-ink-700/40 border-y border-ink-700/40">
                {beliefs.map((b, i) => (
                  <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                    <li className="group flex gap-6 py-8 bg-ink-950 transition-colors hover:bg-ink-900/50">
                      <span className="font-mono text-xs text-ember-500 pt-2 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="font-display text-xl lg:text-2xl font-medium text-bone-100 leading-snug tracking-tighter2 text-pretty">
                        {b}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The honest part */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40 overflow-hidden">
        <div className="pointer-events-none absolute top-1/2 -left-32 -translate-y-1/2 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,116,76,0.06),transparent_60%)] blur-3xl" />
        <div className="mx-auto max-w-edge px-5 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="04" label="The honest part" />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              {honestPart.map((para, i) => (
                <Reveal key={i} delay={((i % 2) + 1) as 1 | 2}>
                  <p
                    className={`text-lg lg:text-xl text-bone-200 leading-relaxed text-pretty ${
                      i > 0 ? 'mt-6' : ''
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
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="05" label="How we work" />
          </Reveal>
          <Reveal delay={1} className="mt-8">
            <h2 className="font-display font-medium text-bone-50 text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.05] tracking-tightest max-w-2xl text-balance">
              Four steps, repeated.
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-700/40 border border-ink-700/40 rounded-2xl overflow-hidden">
            {processSteps.map((step, i) => (
              <Reveal key={step.n} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} className="bg-ink-900 p-7">
                <span className="font-mono text-xs text-ember-500">{step.n}</span>
                <h3 className="mt-4 font-display text-lg font-medium text-bone-50 tracking-tighter2 leading-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-bone-400 leading-relaxed text-pretty">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Direct access */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="06" label="Direct access" />
          </Reveal>
          <Reveal delay={1} className="mt-7 max-w-3xl">
            <p className="text-lg lg:text-xl text-bone-200 leading-relaxed text-pretty">
              {directAccessLine}
            </p>
          </Reveal>
          <Reveal delay={2} className="mt-8 flex items-center gap-2.5 text-sm text-bone-400">
            <span className="h-1.5 w-1.5 rounded-full bg-ember-500" />
            Team on purpose, not by accident.
          </Reveal>
        </div>
      </section>

      <ClosingCTA onNavigate={onNavigate} />
    </main>
  );
}
