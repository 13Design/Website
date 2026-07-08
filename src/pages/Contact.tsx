import { useState, type FormEvent } from 'react';
import { Mail, ArrowUpRight, ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import { supabase } from '../lib/supabase';
import { contactInstructions, contactStages, contactLookingFor } from '../data/pages';
import type { Route } from '../lib/router';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function Contact({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
      company: String(data.get('company') || '').trim(),
      product_url: String(data.get('product_url') || '').trim(),
      stage: String(data.get('stage') || '').trim(),
      looking_for: String(data.get('looking_for') || '').trim(),
      challenges: String(data.get('challenges') || '').trim(),
      whats_next: String(data.get('whats_next') || '').trim(),
      message: String(data.get('message') || '').trim(),
    };

    if (!payload.name || !payload.email) {
      setStatus('error');
      setErrorMsg('Please fill in your name and email so we can reply.');
      return;
    }

    const { error } = await supabase.from('contact_inquiries').insert(payload);

    if (error) {
      setStatus('error');
      setErrorMsg('Something went wrong sending your message. Please try again, or email hello@13design.studio.');
      return;
    }

    setStatus('success');
    form.reset();
  };

  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="Contact"
        title={<>Let's talk about your product.</>}
        body="The best first step is a direct, honest conversation. No pitch deck, no fluff — just a clear assessment of where you stand and what it will take to reach the next level."
        actions="none"
      />

      {/* What to share */}
      <section className="relative py-12 lg:py-16 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="02" label="What to share" />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={1}>
                <p className="text-lg text-bone-300 leading-relaxed text-pretty max-w-xl">
                  {contactInstructions}
                </p>
              </Reveal>
              <Reveal delay={2} className="mt-8">
                <ul className="space-y-4">
                  {[
                    'Your company or product name',
                    'Where your product is today',
                    'What kind of help you\'re looking for',
                    'What challenges you are facing',
                    "What's coming up — a raise, launch, or growth push",
                    'A link to the live product, if you have one',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="font-mono text-xs text-ember-500 pt-1.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-bone-200 text-pretty">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Form + email */}
      <section className="relative py-16 lg:py-20">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left — email fallback */}
            <div className="lg:col-span-4">
              <Reveal>
                <SectionMarker n="03" label="Or email us" />
              </Reveal>
              <Reveal delay={1} className="mt-7">
                <a
                  href="mailto:hello@13design.studio"
                  className="group block rounded-2xl border border-ink-700/60 bg-ink-900 p-7 transition-all duration-500 hover:border-bone-300/50 hover:bg-ink-850"
                >
                  <div className="h-11 w-11 rounded-full bg-ink-700/60 border border-ink-600 flex items-center justify-center">
                    <Mail size={20} className="text-bone-200" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium text-bone-50 tracking-tighter2">
                    Email us
                  </h3>
                  <p className="mt-2 text-sm text-bone-400 leading-relaxed">
                    Prefer to write it out? Send the details and we'll reply within
                    one business day.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm text-bone-200 group-hover:gap-3 transition-all">
                    hello@13design.studio
                    <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </a>
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
                      Message received.
                    </h2>
                    <p className="mt-4 text-bone-300 leading-relaxed max-w-md mx-auto text-pretty">
                      Thank you. We read every message personally and reply within
                      one business day. If we're a fit, we'll take it from there.
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
                        label="Company / product"
                        name="company"
                        placeholder="What you're building"
                      />
                    </div>
                    <div className="mt-5">
                      <Field
                        label="Product link"
                        name="product_url"
                        placeholder="https://yourproduct.com"
                        hint="A link to the live product, if you have one."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                      <SelectField label="Where is the product today?" name="stage" options={contactStages} placeholder="Choose one" />
                      <SelectField label="What are you looking for?" name="looking_for" options={contactLookingFor} placeholder="Choose one" />
                    </div>
                    <div className="mt-5">
                      <TextareaField
                        label="What challenges are you facing?"
                        name="challenges"
                        placeholder="The one or two things bothering you most right now."
                        rows={3}
                      />
                    </div>
                    <div className="mt-5">
                      <Field
                        label="What's coming up?"
                        name="whats_next"
                        placeholder="A raise, a launch, a growth push — and rough timing."
                      />
                    </div>
                    <div className="mt-5">
                      <TextareaField
                        label="Anything else?"
                        name="message"
                        placeholder="Open field — tell us whatever is useful."
                        rows={3}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="mt-8 w-full group inline-flex items-center justify-center gap-2.5 bg-ember-500 hover:bg-ember-400 disabled:opacity-60 disabled:cursor-not-allowed text-ink-950 font-medium px-7 py-4 rounded-full transition-all duration-300 hover:gap-3.5"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Sending message…
                        </>
                      ) : (
                        <>
                          <Mail size={18} />
                          Send message
                          <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </>
                      )}
                    </button>
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
