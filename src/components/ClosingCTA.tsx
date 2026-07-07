import { ArrowUpRight, Mail } from 'lucide-react';
import Reveal from './Reveal';
import type { Route } from '../lib/router';

type Props = {
  title?: string;
  body?: string;
  onNavigate: (r: Route) => void;
  ctaLabel?: string;
  ctaRoute?: Route;
};

export default function ClosingCTA({
  title = "Let's make your product feel inevitable.",
  body = "Tell us where you are, what's coming up, and what's bothering you. We'll give you an honest read on whether we're the right fit.",
  onNavigate,
  ctaLabel = 'Contact us',
  ctaRoute = '/contact',
}: Props) {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden grain border-t border-ink-700/40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,116,76,0.10),transparent_60%)] blur-2xl" />
      </div>
      <div className="mx-auto max-w-edge px-5 lg:px-8 text-center">
        <Reveal>
          <h2 className="font-display font-medium text-bone-50 text-[clamp(2.2rem,6vw,5rem)] leading-[0.98] tracking-tightest text-balance mx-auto max-w-3xl">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={1} className="mt-7 max-w-xl mx-auto">
          <p className="text-lg text-bone-300 leading-relaxed text-pretty">{body}</p>
        </Reveal>
        <Reveal delay={2} className="mt-10">
          <button
            onClick={() => onNavigate(ctaRoute)}
            className="group inline-flex items-center gap-2.5 bg-ember-500 hover:bg-ember-400 text-ink-950 font-medium px-7 py-4 rounded-full transition-all duration-300 hover:gap-3.5 text-base"
          >
            <Mail size={18} />
            {ctaLabel}
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
