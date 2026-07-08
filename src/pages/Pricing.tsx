import { ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import ClosingCTA from '../components/ClosingCTA';
import {
  pricingRows,
  subscriptionTiers,
  subscriptionIncludedAtEveryTier,
  pricingPhilosophy,
} from '../data/studio';
import type { Route } from '../lib/router';

export default function Pricing({ onNavigate }: { onNavigate: (r: Route) => void }) {
  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="Subscription"
        title={<>Pricing, on the table.</>}
        body="Project-based or subscription. No open-ended hourly billing. We confirm a fixed number before any work begins."
        actions="contact"
        onNavigate={onNavigate}
      />

      {/* Engagement table */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="02" label="Engagements" />
          </Reveal>

          <Reveal delay={1} className="mt-10">
            <div className="overflow-x-auto rounded-2xl border border-ink-700/50">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="border-b border-ink-700/50 bg-ink-900/60">
                    <th className="py-4 px-5 lg:px-7 text-[11px] uppercase tracking-[0.24em] text-bone-400 font-medium">Engagement</th>
                    <th className="py-4 px-5 lg:px-7 text-[11px] uppercase tracking-[0.24em] text-bone-400 font-medium">What it is</th>
                    <th className="py-4 px-5 lg:px-7 text-[11px] uppercase tracking-[0.24em] text-bone-400 font-medium text-right">Available as</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row, i) => (
                    <tr
                      key={row.engagement}
                      className="border-b border-ink-700/40 last:border-b-0 transition-colors hover:bg-ink-900/40"
                    >
                      <td className="py-5 px-5 lg:px-7">
                        <span className="font-mono text-[10px] text-ember-500 mr-2">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-display text-base lg:text-lg font-medium text-bone-50 tracking-tighter2">{row.engagement}</span>
                      </td>
                      <td className="py-5 px-5 lg:px-7 text-sm text-bone-400">{row.whatItIs}</td>
                      <td className="py-5 px-5 lg:px-7 text-right">
                        <span
                          className={`text-sm font-medium ${
                            row.investment.includes('Subscription') ? 'text-ember-400' : 'text-bone-200'
                          }`}
                        >
                          {row.investment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Subscription tiers */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="03" label="Subscription tiers" />
          </Reveal>
          <Reveal delay={1} className="mt-7">
            <h2 className="font-display font-medium text-bone-50 text-[clamp(1.7rem,4vw,2.8rem)] leading-[1.05] tracking-tightest max-w-2xl text-balance">
              Month-to-month. No open-ended hourly billing.
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionTiers.map((tier, i) => (
              <Reveal key={tier.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div
                  className={`group relative h-full flex flex-col rounded-2xl border p-8 lg:p-9 transition-all duration-500 ${
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
                    className={`mt-8 group/btn inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all duration-300 hover:gap-3 ${
                      tier.featured
                        ? 'bg-ember-500 hover:bg-ember-400 text-ink-950'
                        : 'border border-ink-600 hover:border-bone-300 text-bone-100'
                    }`}
                  >
                    <span className="link-underline">Subscribe</span>
                    <ArrowUpRight size={15} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={2} className="mt-10">
            <p className="text-sm text-bone-400 leading-relaxed max-w-3xl border-l-2 border-ember-500/40 pl-5 text-pretty">
              {pricingPhilosophy}
            </p>
          </Reveal>
        </div>
      </section>

      {/* What's included at every tier */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="04" label="At every tier" />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={1}>
                <ul className="space-y-4">
                  {subscriptionIncludedAtEveryTier.map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="font-mono text-xs text-ember-500 pt-1.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-bone-200 text-pretty leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <ClosingCTA
        title="Want a number for your project?"
        body="Share what you're working on and what's coming up. We'll come back with a fixed scope and a fixed price — not an estimate."
        onNavigate={onNavigate}
      />
    </main>
  );
}
