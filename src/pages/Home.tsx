import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, Mail, Plus, Minus } from 'lucide-react';
import Reveal from '../components/Reveal';
import Marquee from '../components/Marquee';
import SectionMarker from '../components/SectionMarker';
import ClosingCTA from '../components/ClosingCTA';
import { audienceGroups, services, processSteps, beliefs, homeFaq } from '../data/studio';
import type { Route } from '../lib/router';

const ROTATING = ['trust.', 'understand.', 'come back.', 'tell others.'];

/**
 * Positioning band, not a service list — the services section sits directly
 * below, so repeating them here bought nothing. Every claim is one the site
 * already makes elsewhere; nothing here is aspirational.
 */
const MARQUEE_ITEMS = [
  'Designed by humans, never generated',
  'Founding client spots open',
  'Month-to-month — no lock-in',
  'AI-native & AI-built products',
  'Reply within one business day',
  'Kraków — working with founders everywhere',
];

export default function Home({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const [word, setWord] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const id = setInterval(() => setWord((w) => (w + 1) % ROTATING.length), 2600);
    return () => clearInterval(id);
  }, []);

  const previewServices = services.filter((s) =>
    ['ai-ux-product-design', 'product-finishing', 'ux-rescue-sprint', 'fractional-product-partner'].includes(s.id),
  );

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden grain pt-28 pb-12">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[120vw] h-[70vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,116,76,0.12),transparent_60%)] blur-3xl" />
          <div className="absolute bottom-0 right-[-10%] w-[55vw] h-[45vh] bg-[radial-gradient(ellipse_at_center,rgba(232,116,76,0.06),transparent_70%)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(8,8,10,0.5)_85%)]" />
        </div>

        <div className="mx-auto max-w-edge w-full px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="01" label="13 Design Studio" />
          </Reveal>

          <Reveal delay={1} className="mt-9">
            <h1 className="font-display font-medium text-bone-50 text-[clamp(2.6rem,8.5vw,7.8rem)] leading-[0.92] tracking-tightest text-balance">
              We turn AI products
              <br />
              into products people{' '}
              <span className="relative inline-block align-baseline">
                <span
                  key={word}
                  className="inline-block italic font-light text-ember-400 animate-fade-up"
                >
                  {ROTATING[word]}
                </span>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={2} className="mt-9 max-w-2xl">
            <p className="text-lg lg:text-xl text-bone-300 leading-relaxed text-pretty">
              A digital product design studio for the AI era. We take AI-native
              features and AI-generated MVPs and make them feel intentional — the
              kind of product investors demo with confidence and first users
              understand at first glance.
            </p>
          </Reveal>

          <Reveal delay={3} className="mt-11 flex flex-col sm:flex-row gap-3.5">
            <button
              onClick={() => onNavigate('/contact')}
              className="group inline-flex items-center justify-center gap-2.5 bg-ember-500 hover:bg-ember-400 text-ink-950 font-medium px-7 py-4 rounded-full transition-all duration-300 hover:gap-3.5"
            >
              <Mail size={18} />
              Contact us
              <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <a
              href="mailto:hello@13design.studio"
              className="group inline-flex items-center justify-center gap-2.5 border border-ink-600 hover:border-bone-300 text-bone-100 px-7 py-4 rounded-full transition-all duration-300 hover:gap-3.5"
            >
              <Mail size={18} />
              Email us
            </a>
          </Reveal>

          <Reveal delay={4} className="mt-12">
            <p className="text-sm text-bone-500 flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-ember-500" />
              A product design agency for AI-native and AI-built products
            </p>
          </Reveal>
        </div>

        {/* Marquee */}
        <Reveal delay={5} className="mt-14 lg:mt-20">
          <div className="border-y border-ink-700/50 py-5 bg-ink-900/30">
            <Marquee>
              {MARQUEE_ITEMS.map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-6 px-6 text-sm uppercase tracking-[0.2em] text-bone-400"
                >
                  {m}
                  <span className="text-ember-500/60">/</span>
                </span>
              ))}
            </Marquee>
          </div>
        </Reveal>
      </section>

      {/* ── Who we work with ─────────────────────────────── */}
      <section className="relative py-24 lg:py-32 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="02" label="Who we work with" />
          </Reveal>
          <Reveal delay={1} className="mt-8">
            <h2 className="font-display font-medium text-bone-50 text-[clamp(1.9rem,5vw,3.6rem)] leading-[1.02] tracking-tightest max-w-3xl text-balance">
              Two starting points. One outcome.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {audienceGroups.map((g, i) => (
              <Reveal key={g.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <button
                  onClick={() => onNavigate('/services')}
                  className="group relative h-full w-full text-left rounded-2xl border border-ink-700/60 bg-ink-900 p-8 lg:p-9 transition-all duration-500 hover:border-ember-500/40 hover:bg-ink-850 overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(232,116,76,0.08),transparent_55%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="relative flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-ember-500">0{i + 1}</span>
                      <ArrowUpRight size={20} className="text-bone-500 group-hover:text-ember-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <h3 className="mt-6 font-display text-xl lg:text-2xl font-medium text-bone-50 tracking-tighter2 leading-tight">
                      {g.label}
                    </h3>
                    <p className="mt-4 text-sm text-bone-400 leading-relaxed text-pretty">{g.blurb}</p>
                    <div className="mt-auto pt-6 flex flex-wrap gap-2">
                      {g.audienceServices.map((sid) => {
                        const svc = services.find((s) => s.id === sid);
                        return svc ? (
                          <span
                            key={sid}
                            className="text-xs text-bone-300 border border-ink-600 rounded-full px-3 py-1.5"
                          >
                            {svc.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services preview ─────────────────────────────── */}
      <section className="relative py-24 lg:py-32 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <Reveal>
                <SectionMarker n="03" label="What we do" />
              </Reveal>
              <Reveal delay={1} className="mt-8">
                <h2 className="font-display font-medium text-bone-50 text-[clamp(1.9rem,5vw,3.6rem)] leading-[1.02] tracking-tightest max-w-2xl text-balance">
                  What we change, briefly.
                </h2>
              </Reveal>
            </div>
            <Reveal delay={2}>
              <button
                onClick={() => onNavigate('/services')}
                className="group inline-flex items-center gap-2 text-sm text-bone-300 hover:text-bone-50 transition-colors"
              >
                <span className="link-underline">All services</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {previewServices.map((s, i) => (
              <Reveal key={s.id} delay={((i % 2) + 1) as 1 | 2}>
                <div className="group h-full rounded-2xl border border-ink-700/60 bg-ink-900 p-8 lg:p-9 transition-all duration-500 hover:border-ember-500/40 hover:bg-ink-850">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl lg:text-2xl font-medium text-bone-50 tracking-tighter2 leading-tight">
                      {s.name}
                    </h3>
                    {s.tag && (
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-ember-300 border border-ember-500/30 rounded-full px-2.5 py-1">
                        {s.tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-bone-400 leading-relaxed text-pretty">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How we work ──────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <Reveal>
            <SectionMarker n="04" label="How we work" />
          </Reveal>
          <Reveal delay={1} className="mt-8">
            <h2 className="font-display font-medium text-bone-50 text-[clamp(1.9rem,5vw,3.6rem)] leading-[1.02] tracking-tightest max-w-3xl text-balance">
              Four steps, until it feels inevitable.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-700/40 border border-ink-700/40 rounded-2xl overflow-hidden">
            {processSteps.map((step, i) => (
              <Reveal key={step.n} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} className="bg-ink-900 p-7 lg:p-8">
                <span className="font-mono text-xs text-ember-500">{step.n}</span>
                <h3 className="mt-4 font-display text-lg lg:text-xl font-medium text-bone-50 tracking-tighter2 leading-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-bone-400 leading-relaxed text-pretty">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Made by humans ───────────────────────────────────
          Inverted on purpose. The page runs on one dark note from top to
          bottom; this is the sharpest claim we make, so it changes volume
          instead of scrolling past at the same level as everything else. */}
      <section className="relative py-28 lg:py-36 bg-bone-50 overflow-hidden grain">
        <div className="pointer-events-none absolute top-1/2 -right-32 -translate-y-1/2 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,116,76,0.14),transparent_60%)] blur-3xl" />
        <div className="mx-auto max-w-edge px-5 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="05" label="Made by humans" tone="light" />
              </Reveal>
              <Reveal delay={1} className="mt-8">
                <h2 className="font-display font-medium text-ink-950 text-[clamp(1.9rem,5vw,3.6rem)] leading-[1.02] tracking-tightest text-balance">
                  Everything we design, we design ourselves.
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={2}>
                <p className="text-lg lg:text-xl text-ink-500 leading-relaxed text-pretty max-w-xl">
                  No part of the actual work — the flows, the screens, the decisions — is generated. That's not a marketing line; it's the reason to hire us instead of a tool. If a project really is just "make me five screens" with no judgment required, a generation tool can do that faster and cheaper, and we'll tell you that instead of taking the work anyway.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why this matters ─────────────────────────────── */}
      <section className="relative py-24 lg:py-32 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker n="06" label="Why this matters" />
              </Reveal>
              <Reveal delay={1} className="mt-7">
                <p className="text-lg text-bone-300 leading-relaxed text-pretty max-w-md">
                  The question in our industry has changed. We built this studio around the answer.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <ul className="space-y-px bg-ink-700/40 border-y border-ink-700/40">
                {beliefs.map((b, i) => (
                  <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                    <li className="group flex gap-6 py-7 bg-ink-950 transition-colors hover:bg-ink-900/50">
                      <span className="font-mono text-xs text-ember-500 pt-2 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="font-display text-lg lg:text-xl font-medium text-bone-100 leading-snug tracking-tighter2 text-pretty">
                        {b}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 border-b border-ink-700/40">
        <div className="mx-auto max-w-edge px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <SectionMarker n="07" label="FAQ" />
              </Reveal>
              <Reveal delay={1} className="mt-7">
                <h2 className="font-display font-medium text-bone-50 text-[clamp(1.7rem,4vw,2.8rem)] leading-[1.05] tracking-tightest text-balance">
                  Questions we hear.
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <div className="border-y border-ink-700/40">
                {homeFaq.map((item, i) => (
                  <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                    <div className="border-b border-ink-700/40 last:border-b-0">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                      >
                        <span className="font-display text-base lg:text-lg font-medium text-bone-100 tracking-tighter2 text-pretty">
                          {item.q}
                        </span>
                        <span className="shrink-0 text-bone-400 group-hover:text-ember-400 transition-colors">
                          {openFaq === i ? <Minus size={18} /> : <Plus size={18} />}
                        </span>
                      </button>
                      <div
                        className={`grid transition-all duration-400 ease-out ${
                          openFaq === i ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <p className="overflow-hidden text-sm text-bone-400 leading-relaxed text-pretty pr-8">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClosingCTA onNavigate={onNavigate} />
    </main>
  );
}
