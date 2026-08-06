import { CalendarDays, ArrowUpRight, ArrowLeft, Mail } from 'lucide-react';
import Reveal from '../components/Reveal';
import { subscriptionTiers } from '../data/studio';
import type { Navigate } from '../lib/router';

export default function Subscribe({ onNavigate, tier }: { onNavigate: Navigate; tier?: string | null }) {
  // The Product Partner tier's id used to be 'embedded'; honour old links.
  const tierId = tier === 'embedded' ? 'product-partner' : tier;
  const selectedTier = tierId ? subscriptionTiers.find((t) => t.id === tierId) : undefined;

  return (
    <main>
      <section className="relative py-24 lg:py-32">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,116,76,0.08),transparent_65%)] blur-3xl" />
        <div className="mx-auto max-w-edge px-5 lg:px-8 relative">
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-2xl border border-ember-500/30 bg-ink-900 p-10 lg:p-12 text-center grain">
              <div className="mx-auto h-14 w-14 rounded-full bg-ember-500/15 border border-ember-500/40 flex items-center justify-center">
                <CalendarDays size={26} className="text-ember-400" />
              </div>

              <h1 className="mt-7 font-display font-medium text-bone-50 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05] tracking-tightest text-balance">
                Subscriptions are coming soon.
              </h1>

              {selectedTier && (
                <p className="mt-4 text-ember-300 text-sm uppercase tracking-[0.18em]">
                  {selectedTier.name}
                </p>
              )}

              <p className="mt-5 text-bone-300 leading-relaxed text-pretty max-w-md mx-auto">
                We're putting the finishing touches on self-serve subscriptions. In the meantime we're
                taking on clients directly — tell us about your product and we'll take it from there.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('/contact', selectedTier ? { tier: selectedTier.id } : undefined)}
                  className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 bg-ember-500 hover:bg-ember-400 text-ink-950 font-medium px-7 py-3.5 rounded-full transition-all duration-300 hover:gap-3.5"
                >
                  <Mail size={17} />
                  Talk to us
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <button
                  onClick={() => onNavigate('/')}
                  className="inline-flex items-center gap-2 text-bone-300 hover:text-bone-50 transition-colors text-sm"
                >
                  <ArrowLeft size={16} />
                  Back to home
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
