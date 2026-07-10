import { ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import ClosingCTA from '../components/ClosingCTA';
import {
  subscriptionTiers,
  subscriptionIncludedAtEveryTier,
  subscriptionHowItWorks,
  subscriptionHowItWorksBody,
  subscriptionWhyInstead,
  subscriptionWhyInsteadBody,
} from '../data/studio';
import type { Route } from '../lib/router';

export default function Pricing({ onNavigate }: { onNavigate: (r: Route) => void }) {
  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="Subscription"
        title={<>Design support that stays.</>}
        body="For teams that ship continuously and need a design partner who's still there next month — not a project that ends. Subscriptions are month-to-month, with no long-term lock-in."
        actions="contact"
        onNavigate={onNavigate}
      />

      {/* How subscription works */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="02" label="How it works" />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={1}>
                <p className="text-lg lg:text-xl text-bone-200 leading-relaxed text-pretty">
                  {subscriptionHowItWorks}
                </p>
              </Reveal>
              <Reveal delay={2} className="mt-6">
                <p className="text-base lg:text-lg text-bone-400 leading-relaxed text-pretty">
                  {subscriptionHowItWorksBody}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription tiers */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="03" label="Subscription tiers" />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionTiers.map((tier, i) => (
              <Reveal key={tier.id} delay={((i % 3) + 1) as 1 | 2 | 3} className="flex flex-col">
                <div
                  className={`group relative flex-1 flex flex-col rounded-2xl border p-8 lg:p-9 transition-all duration-500 ${
                    tier.featured
                      ? 'border-ember-500/50 bg-ink-850'
                      : 'border-ink-700/60 bg-ink-900 hover:border-ember-500/30 hover:bg-ink-850'
                  }`}
                >
                  {tier.featured && (
                    <span className="absolute -top-3 left-8 text-[10px] uppercase tracking-[0.2em] text-ink-950 bg-ember-500 rounded-full px-3 py-1 font-medium">
                      Most common
                    </span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-2xl font-medium text-bone-50 tracking-tighter2">{tier.name}</h3>
                  </div>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl lg:text-4xl font-medium text-bone-50 tracking-tighter2">{tier.price}</span>
                    <span className="text-sm text-bone-400">{tier.cadence}</span>
                  </div>
                  <p className="mt-3 text-xs text-ember-300 uppercase tracking-[0.18em]">{tier.daysPerMonth}</p>
                  <p className="mt-4 text-sm text-bone-400 leading-relaxed text-pretty">{tier.description}</p>

                  <ul className="mt-7 space-y-3 border-t border-ink-700/50 pt-6 flex-1">
                    {tier.includes.map((inc) => (
                      <li key={inc} className="flex items-start gap-3 text-sm text-bone-300">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-ember-500 shrink-0" />
                        {inc}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => onNavigate('/contact')}
                    className={`mt-auto pt-8 w-full group/btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 hover:gap-3 ${
                      tier.featured
                        ? 'bg-ember-500 hover:bg-ember-400 text-ink-950'
                        : 'border border-ink-600 hover:border-bone-300 text-bone-100'
                    }`}
                  >
                    Subscribe
                    <ArrowUpRight size={15} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What's included at every tier */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="04" label="At every tier" />
          </Reveal>
          <Reveal delay={1} className="mt-7">
            <h2 className="font-display font-medium text-bone-50 text-[clamp(1.7rem,4vw,2.8rem)] leading-[1.05] tracking-tightest max-w-2xl text-balance">
              What's included, at every tier.
            </h2>
          </Reveal>

          <div className="mt-12 space-y-px bg-ink-700/40 border-y border-ink-700/40">
            {subscriptionIncludedAtEveryTier.map((item, i) => (
              <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="group grid grid-cols-12 gap-4 lg:gap-8 py-8 lg:py-9 bg-ink-950 transition-colors hover:bg-ink-900/50 -mx-3 px-3 lg:-mx-5 lg:px-5 rounded-lg">
                  <div className="col-span-12 lg:col-span-2">
                    <span className="font-mono text-xs text-ember-500">{item.n}</span>
                  </div>
                  <div className="col-span-12 lg:col-span-10">
                    <h3 className="font-display text-xl lg:text-2xl font-medium text-bone-50 tracking-tighter2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base text-bone-400 leading-relaxed text-pretty max-w-2xl">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why subscription */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40 overflow-hidden">
        <div className="pointer-events-none absolute top-1/2 -right-32 -translate-y-1/2 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,116,76,0.06),transparent_60%)] blur-3xl" />
        <div className="mx-auto max-w-edge px-5 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="05" label="Why subscription" />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={1}>
                <p className="text-lg lg:text-xl text-bone-200 leading-relaxed text-pretty">
                  {subscriptionWhyInstead}
                </p>
              </Reveal>
              <Reveal delay={2} className="mt-6">
                <p className="text-base lg:text-lg text-bone-400 leading-relaxed text-pretty">
                  {subscriptionWhyInsteadBody}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <ClosingCTA
        title="Not sure which tier fits?"
        body="Tell us how often you ship and how big your team is, and we'll recommend a starting point — no pressure to commit to more than you need."
        onNavigate={onNavigate}
      />
    </main>
  );
}
