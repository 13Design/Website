import { useState, type FormEvent } from 'react';
import { ArrowUpRight, ArrowLeft, Check, Loader2, AlertCircle, Mail } from 'lucide-react';
import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import { supabase } from '../lib/supabase';
import {
  foundingWhatThisIs,
  foundingYouGet,
  foundingWeGet,
  foundingWhoFor,
  foundingWhoNote,
  foundingHowItWorks,
  foundingFormNote,
  foundingFallback,
} from '../data/pages';
import type { Route } from '../lib/router';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function FoundingClients({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      product_name: String(data.get('product_name') || '').trim(),
      product_kind: String(data.get('product_kind') || '').trim(),
      stage: String(data.get('stage') || '').trim(),
      what_feels_off: String(data.get('what_feels_off') || '').trim(),
      whats_next: String(data.get('whats_next') || '').trim(),
      anything_else: String(data.get('anything_else') || '').trim(),
      ok_to_share: consent,
    };

    if (!payload.name || !payload.email || !payload.product_name) {
      setStatus('error');
      setErrorMsg('Please fill in your name, email, and product name.');
      return;
    }

    const { error } = await supabase.from('founder_inquiries').insert(payload);

    if (error) {
      setStatus('error');
      setErrorMsg('Something went wrong sending your request. Please try again, or email hello@13design.studio.');
      return;
    }

    setStatus('success');
    form.reset();
    setConsent(false);
  };

  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="Founding clients"
        title={<>Founding client spots — open now.</>}
        body="We're taking on a small number of first projects at a founder rate, in exchange for a documented case study and a testimonial. Real work, real result, shared openly. It's a trade, not a discount."
        actions="none"
      />

      {/* What this is */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="02" label="What this is" />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={1}>
                <p className="text-lg lg:text-xl text-bone-200 leading-relaxed text-pretty">
                  {foundingWhatThisIs}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* You get / we get */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reveal>
              <div className="h-full rounded-2xl border border-ink-700/60 bg-ink-900 p-8 lg:p-9">
                <p className="text-[11px] uppercase tracking-[0.28em] text-ember-400 mb-6">You get</p>
                <ul className="space-y-5">
                  {foundingYouGet.map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="mt-0.5 shrink-0 h-6 w-6 rounded-full border border-ember-500/40 flex items-center justify-center">
                        <Check size={13} className="text-ember-400" />
                      </span>
                      <span className="text-bone-200 text-pretty">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="h-full rounded-2xl border border-ink-700/60 bg-ink-900 p-8 lg:p-9">
                <p className="text-[11px] uppercase tracking-[0.28em] text-bone-400 mb-6">We get</p>
                <ul className="space-y-5">
                  {foundingWeGet.map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="mt-0.5 shrink-0 h-6 w-6 rounded-full border border-ink-600 flex items-center justify-center">
                        <ArrowUpRight size={13} className="text-bone-300" />
                      </span>
                      <span className="text-bone-200 text-pretty">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="03" label="Who it's for" />
          </Reveal>
          <Reveal delay={1} className="mt-10">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              {foundingWhoFor.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="font-mono text-xs text-ember-500 pt-1.5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-bone-200 text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={2} className="mt-8">
            <p className="text-sm text-bone-400 italic">{foundingWhoNote}</p>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="04" label="How it works" />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-700/40 border border-ink-700/40 rounded-2xl overflow-hidden">
            {foundingHowItWorks.map((step, i) => (
              <Reveal key={step.n} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} className="bg-ink-900 p-7 lg:p-8">
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

      {/* Form */}
      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="05" label="Submit" />
          </Reveal>
          <Reveal delay={1} className="mt-8 max-w-2xl">
            <p className="text-bone-300 leading-relaxed text-pretty">{foundingFormNote}</p>
          </Reveal>

          <Reveal delay={2} className="mt-10 max-w-2xl">
            {status === 'success' ? (
              <div className="rounded-2xl border border-ember-500/30 bg-ink-900 p-10 text-center grain">
                <div className="mx-auto h-14 w-14 rounded-full bg-ember-500/15 border border-ember-500/40 flex items-center justify-center">
                  <Check size={26} className="text-ember-400" />
                </div>
                <h2 className="mt-6 font-display text-2xl lg:text-3xl font-medium text-bone-50 tracking-tighter2">
                  Request received.
                </h2>
                <p className="mt-4 text-bone-300 leading-relaxed max-w-md mx-auto text-pretty">
                  Thank you. We read every submission personally and reply within a
                  few days. If we're a fit, we'll send a link to book a short call.
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
                {status === 'error' && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Your name" name="name" required placeholder="Jordan Lee" />
                  <Field label="Email" name="email" type="email" required placeholder="jordan@company.com" />
                </div>
                <div className="mt-5">
                  <Field
                    label="Product name and link"
                    name="product_name"
                    required
                    placeholder="Vellum — vellum.ai"
                    hint="Live link or demo is great."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <SelectField
                    label="What are you building?"
                    name="product_kind"
                    options={['AI-native feature', 'AI-generated MVP', 'Both', 'Other']}
                    placeholder="Choose one"
                  />
                  <SelectField
                    label="Where are you?"
                    name="stage"
                    options={['Just shipped', 'Live with users', 'Preparing to raise', 'Preparing to launch', 'Scaling']}
                    placeholder="Choose one"
                  />
                </div>
                <div className="mt-5">
                  <TextareaField
                    label="What feels off?"
                    name="what_feels_off"
                    placeholder="The one or two things bothering you most about the product right now."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <Field
                    label="What's next?"
                    name="whats_next"
                    placeholder="A raise, a launch, a growth push — and rough timing."
                  />
                  <Field
                    label="Anything else?"
                    name="anything_else"
                    placeholder="Timeline, budget range, constraints."
                  />
                </div>

                <label className="mt-7 flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <span
                    className={`mt-0.5 shrink-0 h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                      consent ? 'border-ember-500 bg-ember-500' : 'border-ink-600 group-hover:border-bone-400'
                    }`}
                  >
                    {consent && <Check size={13} className="text-ink-950" />}
                  </span>
                  <span className="text-sm text-bone-400 leading-relaxed">
                    I'm comfortable with the work being shared publicly as a case study.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="mt-8 w-full group inline-flex items-center justify-center gap-2.5 bg-ember-500 hover:bg-ember-400 disabled:opacity-60 disabled:cursor-not-allowed text-ink-950 font-medium px-7 py-4 rounded-full transition-all duration-300 hover:gap-3.5"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending request…
                    </>
                  ) : (
                    <>
                      Submit founding request
                      <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </Reveal>

          <Reveal delay={3} className="mt-10 max-w-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-6">
              <p className="text-sm text-bone-400 leading-relaxed flex-1 text-pretty">
                {foundingFallback}
              </p>
              <button
                onClick={() => onNavigate('/contact')}
                className="group inline-flex items-center gap-2 text-sm text-bone-200 hover:text-ember-400 transition-colors shrink-0"
              >
                <Mail size={16} />
                <span className="link-underline">Contact us</span>
              </button>
            </div>
          </Reveal>
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
};

function Field({ label, name, type = 'text', placeholder, required, hint }: FieldProps) {
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
        className="w-full bg-ink-850 border border-ink-600 rounded-xl px-4 py-3 text-bone-100 placeholder:text-bone-500 focus:outline-none focus:border-ember-500/60 focus:bg-ink-800 transition-colors"
      />
      {hint && <p className="mt-1.5 text-xs text-bone-500">{hint}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm text-bone-300 mb-2">{label}</label>
      <div className="relative">
        <select
          name={name}
          defaultValue=""
          className="w-full appearance-none bg-ink-850 border border-ink-600 rounded-xl px-4 py-3 text-bone-100 focus:outline-none focus:border-ember-500/60 focus:bg-ink-800 transition-colors cursor-pointer"
        >
          <option value="" disabled className="text-bone-500">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-ink-850">{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-bone-500">▾</span>
      </div>
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
