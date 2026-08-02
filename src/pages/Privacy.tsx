import { ArrowUpRight, Mail } from 'lucide-react';
import Reveal from '../components/Reveal';
import PageHeader from '../components/PageHeader';
import SectionMarker from '../components/SectionMarker';
import TermsList from '../components/TermsList';
import { privacyPolicy } from '../data/studio';
import type { Navigate } from '../lib/router';

export default function Privacy({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <main>
      <PageHeader
        marker="01"
        markerLabel="Privacy"
        title={<>Your data, handled plainly.</>}
        body="We keep the stack small and collect only what it takes to reply to you and run a subscription. Cookieless analytics, no ad tracking, no data for sale. This is the plain-language version of what we hold, why, and the rights you have over it."
        actions="none"
      />

      <section className="relative py-16 lg:py-20 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="02" label="The policy" />
          </Reveal>
          <Reveal delay={1} className="mt-7">
            <h2 className="font-display font-medium text-bone-50 text-[clamp(1.7rem,4vw,2.8rem)] leading-[1.05] tracking-tightest text-balance max-w-2xl">
              What we hold, and why.
            </h2>
          </Reveal>

          <TermsList sections={privacyPolicy} />

          <Reveal delay={1} className="mt-10">
            <p className="text-sm text-bone-500 leading-relaxed text-pretty max-w-2xl">
              This is how we handle data day to day, written to be read before you get in touch.
              It does not limit any rights you have under the data-protection law that applies to
              you; where such rights apply, they come first.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Ask */}
      <section className="relative py-16 lg:py-20">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="rounded-2xl border border-ink-700/60 bg-ink-900 p-8 lg:p-10">
            <h2 className="font-display text-2xl lg:text-3xl font-medium text-bone-50 tracking-tighter2 text-balance">
              Want to see or remove your data?
            </h2>
            <p className="mt-4 text-bone-300 leading-relaxed text-pretty max-w-xl">
              Email us and we'll tell you exactly what we hold, correct it, or delete it — no
              special form, just ask. We reply within one business day.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:hello@13design.org"
                className="group inline-flex items-center justify-center gap-2.5 bg-ember-500 hover:bg-ember-400 text-ink-950 font-medium px-7 py-3.5 rounded-full transition-all duration-300 hover:gap-3.5"
              >
                <Mail size={17} />
                hello@13design.org
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <button
                onClick={() => onNavigate('/terms')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-600 hover:border-bone-300 text-bone-100 px-7 py-3.5 text-sm font-medium transition-colors"
              >
                Read the terms
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
