import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Loader2, AlertCircle, Mail, RotateCcw } from 'lucide-react';
import Reveal from '../components/Reveal';
import { subscriptionTiers } from '../data/studio';
import { startCheckout } from '../lib/checkout';
import type { Navigate } from '../lib/router';

export default function SubscribeCancel({
  onNavigate,
  tier,
}: {
  onNavigate: Navigate;
  tier?: string | null;
}) {
  const plan = tier ? subscriptionTiers.find((t) => t.id === tier) : undefined;
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const retry = async () => {
    if (!plan?.selfServe || busy) return;
    setBusy(true);
    setErrorMsg('');
    const { error } = await startCheckout(plan.id, ({ tier: t, txn }) =>
      onNavigate('/subscribe/success', { tier: t, txn }),
    );
    setErrorMsg(error);
    setBusy(false);
  };

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
                Checkout cancelled.
              </h1>

              <p className="mt-5 text-bone-300 leading-relaxed text-pretty max-w-md mx-auto">
                No payment was taken and nothing has been set up
                {plan ? <> — the {plan.name} plan is still there whenever you're ready.</> : '.'}{' '}
                If something got in the way or you'd rather talk it through first, we're happy
                to do that instead.
              </p>

              {errorMsg && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 text-left">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                {plan?.selfServe && (
                  <button
                    onClick={retry}
                    disabled={busy}
                    className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 bg-ember-500 hover:bg-ember-400 disabled:opacity-60 disabled:cursor-not-allowed text-ink-950 font-medium px-7 py-3.5 rounded-full transition-all duration-300 hover:gap-3.5"
                  >
                    {busy ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Opening checkout…
                      </>
                    ) : (
                      <>
                        Try again
                        <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </>
                    )}
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
