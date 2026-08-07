import { ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import ClosingCTA from '../components/ClosingCTA';
import { workNoCases, workClose } from '../data/pages';
import type { Route } from '../lib/router';

export default function Work({ onNavigate }: { onNavigate: (r: Route) => void }) {
  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="Work"
        title={<>Work, on the way.</>}
        body="We're taking on our first founding clients now — full case studies will land here as that work ships. The decisions behind the screens, not just the screens."
        actions="none"
      />

      {/* On the way */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="02" label="On the way" />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <Reveal delay={1} className="lg:col-span-7">
              <h2 className="font-display font-medium text-bone-50 text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.05] tracking-tightest text-balance">
                {workNoCases.title}
              </h2>
              <p className="mt-6 text-lg text-bone-300 leading-relaxed text-pretty max-w-xl">
                {workNoCases.body}
              </p>
            </Reveal>

            <Reveal delay={2} className="lg:col-span-5">
              <div className="rounded-2xl border border-ink-700/60 bg-ink-900/60 p-7 lg:p-8">
                <p className="text-[11px] uppercase tracking-[0.28em] text-ember-400 mb-4">
                  Be one of the first
                </p>
                <p className="text-bone-300 leading-relaxed text-pretty">
                  We're taking on a small number of founding clients on terms
                  that reflect it — the first case studies here will be their
                  work. Want your product to be one of them?
                </p>
                <button
                  onClick={() => onNavigate('/founding-clients')}
                  className="mt-6 group inline-flex items-center gap-2 text-sm text-bone-200 hover:text-ember-400 transition-colors"
                >
                  <span className="link-underline">Become a founding client</span>
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ClosingCTA
        title={workClose.title}
        body="Tell us where the product is and what's coming up. We'll give you an honest read on fit."
        ctaLabel="Contact us"
        onNavigate={onNavigate}
      />
    </main>
  );
}
