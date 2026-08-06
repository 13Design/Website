import { ArrowLeft, ArrowUpRight, Mail, RotateCcw } from 'lucide-react';
import Reveal from '../components/Reveal';
import { subscriptionTiers } from '../data/studio';
import type { Navigate } from '../lib/router';

export default function SubscribeCancel({
  onNavigate,
  tier,
}: {
  onNavigate: Navigate;
  tier?: string | null;
}) {
  const plan = tier ? subscriptionTiers.find((t) => t.id === tier) : undefined;

  return (
    <main>
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-2xl border border-ink-700/60 bg-ink-900 p-10 lg:p-12 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-ink-700/60 border border-ink-600 flex items-center justify-center">
                <RotateCcw size={24} className="text-bone-300" />
              </div>

              <h1 className="mt-7 font-display font-medium text-bone-50 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05] tracking-tightest text-balance">
                No rush.
              </h1>

              <p className="mt-5 text-bone-300 leading-relaxed text-pretty max-w-md mx-auto">
                Nothing has been set up and nothing is charged
                {plan ? <> — the {plan.name} plan is still there whenever you're ready.</> : '.'}{' '}
                Pick the form back up when it suits, or talk it through with us first.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                {plan?.selfServe && (
                  <button
                    onClick={() => onNavigate('/subscribe', { tier: plan.id })}
                    className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 bg-ember-500 hover:bg-ember-400 text-ink-950 font-medium px-7 py-3.5 rounded-full transition-all duration-300 hover:gap-3.5"
                  >
                    Back to the form
                    <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                )}
                <button
                  onClick={() => onNavigate('/contact', plan ? { tier: plan.id } : undefined)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-ink-600 hover:border-bone-300 text-bone-100 px-7 py-3.5 text-sm font-medium transition-colors"
                >
                  <Mail size={16} />
                  Talk to us first
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('/pricing')}
                  className="inline-flex items-center gap-2 text-bone-400 hover:text-bone-100 transition-colors text-sm"
                >
                  <ArrowLeft size={15} />
                  Back to plans
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
