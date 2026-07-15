import { Check, ArrowLeft, Mail, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import { subscriptionTiers } from '../data/studio';
import type { Navigate } from '../lib/router';

export default function SubscribeSuccess({
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
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,116,76,0.08),transparent_65%)] blur-3xl" />
        <div className="mx-auto max-w-edge px-5 lg:px-8 relative">
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-2xl border border-ember-500/30 bg-ink-900 p-10 lg:p-12 text-center grain">
              <div className="mx-auto h-14 w-14 rounded-full bg-ember-500/15 border border-ember-500/40 flex items-center justify-center">
                <Check size={26} className="text-ember-400" />
              </div>

              <h1 className="mt-7 font-display font-medium text-bone-50 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05] tracking-tightest text-balance">
                You're subscribed.
              </h1>

              {plan && (
                <p className="mt-4 text-ember-300 text-sm uppercase tracking-[0.18em]">
                  {plan.name} — {plan.price}
                  {plan.cadence} · {plan.daysPerMonth}
                </p>
              )}

              <p className="mt-5 text-bone-300 leading-relaxed text-pretty max-w-md mx-auto">
                Payment went through and your subscription is active. Stripe has emailed
                you a receipt and invoice — check your inbox. We'll be in touch within one
                business day to kick things off and get you into our workflow.
              </p>

              <div className="mt-8 rounded-xl border border-ink-700/60 bg-ink-850 p-5 text-left">
                <p className="text-sm font-medium text-bone-100">What happens next</p>
                <ol className="mt-3 space-y-2.5">
                  {[
                    'We email you to introduce ourselves and schedule a kickoff call.',
                    'We get access to your product, Figma, and wherever your team works.',
                    'Work starts — you send priorities, we begin the first pass.',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-bone-300">
                      <span className="font-mono text-xs text-ember-500 pt-0.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-pretty">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('/')}
                  className="inline-flex items-center gap-2 text-bone-300 hover:text-bone-50 transition-colors text-sm"
                >
                  <ArrowLeft size={16} />
                  Back to home
                </button>
                <span className="hidden sm:block text-ink-600">·</span>
                <a
                  href="mailto:hello@13design.studio"
                  className="inline-flex items-center gap-2 text-bone-300 hover:text-bone-50 transition-colors text-sm"
                >
                  <Mail size={15} />
                  hello@13design.studio
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
