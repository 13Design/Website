import { ArrowUpRight, Mail } from 'lucide-react';
import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import {
  workingAgreement,
  subscriptionTerms,
  subscriptionTiers,
  type TermsSection,
} from '../data/studio';
import type { Navigate } from '../lib/router';

/** Shared renderer for a numbered, two-column terms list. */
function TermsList({ sections }: { sections: TermsSection[] }) {
  return (
    <div className="mt-12 space-y-px bg-ink-700/40 border-y border-ink-700/40">
      {sections.map((sec, i) => (
        <Reveal key={sec.n} delay={((i % 3) + 1) as 1 | 2 | 3}>
          <article className="grid grid-cols-12 gap-4 lg:gap-8 py-9 lg:py-10 bg-ink-950 -mx-3 px-3 lg:-mx-5 lg:px-5 rounded-lg">
            <div className="col-span-12 lg:col-span-3">
              <span className="font-mono text-xs text-ember-500">{sec.n}</span>
              <h3 className="mt-3 font-display text-lg lg:text-xl font-medium text-bone-50 tracking-tighter2 leading-tight text-pretty">
                {sec.title}
              </h3>
            </div>
            <div className="col-span-12 lg:col-span-9 space-y-4">
              {sec.body.map((para, j) => (
                <p key={j} className="text-base text-bone-300 leading-relaxed text-pretty max-w-2xl">
                  {para}
                </p>
              ))}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export default function Terms({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="Terms & agreement"
        title={<>The terms of working with us.</>}
        body="Two parts: how we engage as a studio — what you own, confidentiality, showing work, governing law — and how the subscription runs month to month. Written to be read before you start, not after."
        actions="none"
      />

      {/* The working agreement */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="02" label="Working agreement" />
          </Reveal>
          <Reveal delay={1} className="mt-7">
            <h2 className="font-display font-medium text-bone-50 text-[clamp(1.7rem,4vw,2.8rem)] leading-[1.05] tracking-tightest text-balance max-w-2xl">
              How we work with clients.
            </h2>
          </Reveal>
          <TermsList sections={workingAgreement} />
        </div>
      </section>

      {/* Subscription tier caps */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="03" label="Subscription terms" />
          </Reveal>
          <Reveal delay={1} className="mt-7">
            <h2 className="font-display font-medium text-bone-50 text-[clamp(1.7rem,4vw,2.8rem)] leading-[1.05] tracking-tightest text-balance max-w-2xl">
              How the subscription runs.
            </h2>
          </Reveal>

          {/* the caps at a glance */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-px bg-ink-700/40 border border-ink-700/40 rounded-2xl overflow-hidden">
            {subscriptionTiers.map((t, i) => (
              <Reveal key={t.id} delay={((i % 3) + 1) as 1 | 2 | 3} className="bg-ink-900 p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-medium text-bone-50 tracking-tighter2">
                    {t.name}
                  </h3>
                  <span className="font-display text-lg text-bone-300 tracking-tighter2">
                    {t.price}
                    <span className="text-xs text-bone-500">{t.cadence}</span>
                  </span>
                </div>
                <p className="mt-3 text-xs text-ember-300 uppercase tracking-[0.18em]">
                  {t.daysPerMonth}
                </p>
                <p className="mt-3 text-sm text-bone-400 leading-relaxed text-pretty">
                  {t.selfServe
                    ? 'Subscribe directly — card, month-to-month.'
                    : 'Scoped on a call before anything is charged.'}
                </p>
              </Reveal>
            ))}
          </div>

          <TermsList sections={subscriptionTerms} />

          <Reveal delay={1} className="mt-10">
            <p className="text-sm text-bone-500 leading-relaxed text-pretty max-w-2xl">
              These are the operational and engagement terms — how the work runs and how we
              treat each other. They are not a substitute for a contract; where a client needs
              one, we sign theirs or provide ours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Ask */}
      <section className="relative py-16 lg:py-20">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="rounded-2xl border border-ink-700/60 bg-ink-900 p-8 lg:p-10">
            <h2 className="font-display text-2xl lg:text-3xl font-medium text-bone-50 tracking-tighter2 text-balance">
              Anything here you'd want changed?
            </h2>
            <p className="mt-4 text-bone-300 leading-relaxed text-pretty max-w-xl">
              Ask before you subscribe, not after. If a term doesn't work for how your team
              operates, we'd rather hear it now — most of this is a default, not a rule.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate('/contact')}
                className="group inline-flex items-center justify-center gap-2.5 bg-ember-500 hover:bg-ember-400 text-ink-950 font-medium px-7 py-3.5 rounded-full transition-all duration-300 hover:gap-3.5"
              >
                <Mail size={17} />
                Ask us
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <button
                onClick={() => onNavigate('/pricing')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-600 hover:border-bone-300 text-bone-100 px-7 py-3.5 text-sm font-medium transition-colors"
              >
                Back to plans
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
