import { useState, type FormEvent } from 'react';
import { FileText, ArrowUpRight, ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import { supabase } from '../lib/supabase';
import { subscriptionTiers } from '../data/studio';
import type { Navigate } from '../lib/router';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function Subscribe({ onNavigate, tier }: { onNavigate: Navigate; tier?: string | null }) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // The Product Partner tier's id used to be 'embedded'; honour old links.
  const tierId = tier === 'embedded' ? 'product-partner' : tier;
  const selectedTier = tierId ? subscriptionTiers.find((t) => t.id === tierId) : undefined;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — real users never fill this hidden field; bots do.
    if (String(data.get('company_website') || '').trim() !== '') {
      setStatus('success');
      form.reset();
      return;
    }

    if (!selectedTier) {
      setStatus('error');
      setErrorMsg('Please pick a plan on the pricing page first.');
      return;
    }

    const payload = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      company: String(data.get('company') || '').trim(),
      country: String(data.get('country') || '').trim(),
      billing_address: String(data.get('billing_address') || '').trim(),
      vat_id: String(data.get('vat_id') || '').trim(),
      note: String(data.get('note') || '').trim(),
      tier: selectedTier.id,
      status: 'pending' as const,
    };

    if (!payload.name || !payload.email) {
      setStatus('error');
      setErrorMsg('Please fill in your name and billing email so we can send the invoice.');
      return;
    }

    const { error } = await supabase.from('subscribe_requests').insert(payload);

    if (error) {
      setStatus('error');
      setErrorMsg("Something went wrong. Please try again, or email hello@13design.org.");
      return;
    }

    setStatus('success');
    form.reset();
  };

  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="Subscribe"
        title={<>Start your subscription.</>}
        body="Share the billing details we need to raise your first invoice. We confirm capacity and fit before anything is charged — you'll get the invoice by email once we do."
        actions="none"
      />

      <section className="relative py-16 lg:py-20">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left — how billing works */}
            <div className="lg:col-span-4">
              <Reveal>
                <SectionMarker n="02" label="How billing works" />
              </Reveal>
              <Reveal delay={1} className="mt-7">
                <ul className="space-y-4">
                  {[
                    'We confirm we have capacity and it\'s a fit — no charge before that.',
                    'You get an invoice by email, payable by bank transfer.',
                    'It renews monthly, month-to-month. Cancel anytime.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="font-mono text-xs text-ember-500 pt-1.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-bone-200 text-pretty text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={2} className="mt-7">
                <p className="text-xs text-bone-500 leading-relaxed">
                  Prefer to talk first? Email{' '}
                  <a href="mailto:hello@13design.org" className="link-underline text-bone-300">
                    hello@13design.org
                  </a>
                  .
                </p>
              </Reveal>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-8">
              <Reveal delay={1}>
                {status === 'success' ? (
                  <div className="rounded-2xl border border-ember-500/30 bg-ink-900 p-10 text-center grain">
                    <div className="mx-auto h-14 w-14 rounded-full bg-ember-500/15 border border-ember-500/40 flex items-center justify-center">
                      <Check size={26} className="text-ember-400" />
                    </div>
                    <h2 className="mt-6 font-display text-2xl lg:text-3xl font-medium text-bone-50 tracking-tighter2">
                      Request received.
                    </h2>
                    <p className="mt-4 text-bone-300 leading-relaxed max-w-md mx-auto text-pretty">
                      Thank you. We'll confirm capacity and fit, then email your first
                      invoice — usually within one business day. Nothing is charged until then.
                    </p>
                    <button
                      onClick={() => onNavigate('/')}
                      className="mt-8 inline-flex items-center gap-2 text-bone-300 hover:text-bone-50 transition-colors text-sm"
                    >
                      <ArrowLeft size={16} />
                      Back to home
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-ink-700/60 bg-ink-900/70 p-7 lg:p-9"
                  >
                    {selectedTier ? (
                      <div className="mb-7 flex items-start gap-3 rounded-xl border border-ember-500/30 bg-ember-500/[0.06] p-4">
                        <Check size={18} className="shrink-0 mt-0.5 text-ember-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-bone-100">
                            {selectedTier.name} — {selectedTier.price}
                            <span className="text-bone-400">{selectedTier.cadence}</span>
                          </p>
                          <p className="mt-1 text-xs text-bone-400 leading-relaxed">
                            {selectedTier.daysPerMonth}. Billed monthly, cancel anytime.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigate('/pricing')}
                          className="shrink-0 text-xs text-bone-400 hover:text-bone-100 underline underline-offset-4 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="mb-7 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-sm text-amber-200">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>
                          No plan selected.{' '}
                          <button
                            type="button"
                            onClick={() => onNavigate('/pricing')}
                            className="underline underline-offset-4 hover:text-amber-100"
                          >
                            Pick a plan
                          </button>{' '}
                          first.
                        </span>
                      </div>
                    )}

                    {status === 'error' && (
                      <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Honeypot — hidden from humans, catches naive bots */}
                    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                      <label htmlFor="sb-company-website">Company website</label>
                      <input type="text" id="sb-company-website" name="company_website" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Billing contact name" name="name" required placeholder="Jordan Lee" autoComplete="name" />
                      <Field label="Billing email" name="email" type="email" required placeholder="billing@company.com" autoComplete="email" hint="Where we send the invoice." />
                    </div>
                    <div className="mt-5">
                      <Field label="Company name" name="company" placeholder="Company Inc. (if billing to a company)" autoComplete="organization" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                      <Field label="Country" name="country" placeholder="e.g. United States" autoComplete="country-name" />
                      <Field label="Tax / VAT ID" name="vat_id" placeholder="If you have one (optional)" />
                    </div>
                    <div className="mt-5">
                      <TextareaField
                        label="Billing address"
                        name="billing_address"
                        placeholder="Street, city, postal code — as it should appear on the invoice."
                        rows={2}
                      />
                    </div>
                    <div className="mt-5">
                      <TextareaField
                        label="Anything else?"
                        name="note"
                        placeholder="PO number, billing quirks, start date — anything useful."
                        rows={2}
                      />
                    </div>
                    <p className="mt-4 text-xs text-bone-500 leading-relaxed">
                      Invoices are payable by bank transfer. Prefer to pay by card? Just
                      mention it above and we'll send a card link instead.
                    </p>

                    <button
                      type="submit"
                      disabled={status === 'submitting' || !selectedTier}
                      className="mt-8 w-full group inline-flex items-center justify-center gap-2.5 bg-ember-500 hover:bg-ember-400 disabled:opacity-60 disabled:cursor-not-allowed text-ink-950 font-medium px-7 py-4 rounded-full transition-all duration-300 hover:gap-3.5"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <FileText size={18} />
                          Request invoice
                          <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </>
                      )}
                    </button>
                    <p className="mt-3 text-center text-xs text-bone-500">
                      No charge yet — we send the invoice after confirming the fit.
                    </p>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  autoComplete?: string;
};

function Field({ label, name, type = 'text', placeholder, required, hint, autoComplete }: FieldProps) {
  return (
    <div>
      <label className="block text-sm text-bone-300 mb-2">
        {label} {required && <span className="text-ember-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-ink-850 border border-ink-600 rounded-xl px-4 py-3 text-bone-100 placeholder:text-bone-500 focus:outline-none focus:border-ember-500/60 focus:bg-ink-800 transition-colors"
      />
      {hint && <p className="mt-1.5 text-xs text-bone-500">{hint}</p>}
    </div>
  );
}

function TextareaField({
  label,
  name,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm text-bone-300 mb-2">{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-ink-850 border border-ink-600 rounded-xl px-4 py-3 text-bone-100 placeholder:text-bone-500 focus:outline-none focus:border-ember-500/60 focus:bg-ink-800 transition-colors resize-none"
      />
    </div>
  );
}
