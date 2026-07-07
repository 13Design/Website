import type { ReactNode } from 'react';
import Reveal from './Reveal';
import SectionMarker from './SectionMarker';
import { ArrowUpRight, Mail } from 'lucide-react';
import type { Route } from '../lib/router';

type Props = {
  marker: string;
  markerLabel?: string;
  title: ReactNode;
  body?: ReactNode;
  actions?: 'contact' | 'services' | 'pricing' | 'none';
  onNavigate?: (r: Route) => void;
};

export default function PageHeader({ marker, markerLabel, title, body, actions = 'contact', onNavigate }: Props) {
  return (
    <section className="relative pt-36 lg:pt-44 pb-16 lg:pb-20">
      <div className="mx-auto max-w-edge px-5 lg:px-8">
        <Reveal>
          <SectionMarker n={marker} label={markerLabel} />
        </Reveal>
        <Reveal delay={1} className="mt-8">
          <h1 className="font-display font-medium text-bone-50 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] tracking-tightest text-balance max-w-4xl">
            {title}
          </h1>
        </Reveal>
        {body && (
          <Reveal delay={2} className="mt-8 max-w-2xl">
            <p className="text-lg lg:text-xl text-bone-300 leading-relaxed text-pretty">{body}</p>
          </Reveal>
        )}
        {actions !== 'none' && onNavigate && (
          <Reveal delay={3} className="mt-10 flex flex-col sm:flex-row gap-3.5">
            {actions === 'contact' && (
              <>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="group inline-flex items-center justify-center gap-2 bg-ember-500 hover:bg-ember-400 text-ink-950 font-medium px-6 py-3.5 rounded-full transition-all duration-300 hover:gap-3"
                >
                  <Mail size={17} />
                  Contact us
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <a
                  href="mailto:hello@13design.studio"
                  className="group inline-flex items-center justify-center gap-2 border border-ink-600 hover:border-bone-300 text-bone-100 px-6 py-3.5 rounded-full transition-all duration-300 hover:gap-3"
                >
                  <Mail size={17} />
                  Email us
                </a>
              </>
            )}
            {actions === 'services' && (
              <button
                onClick={() => onNavigate('/services')}
                className="group inline-flex items-center justify-center gap-2 bg-ember-500 hover:bg-ember-400 text-ink-950 font-medium px-6 py-3.5 rounded-full transition-all duration-300 hover:gap-3"
              >
                See all services
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            )}
            {actions === 'pricing' && (
              <button
                onClick={() => onNavigate('/pricing')}
                className="group inline-flex items-center justify-center gap-2 bg-ember-500 hover:bg-ember-400 text-ink-950 font-medium px-6 py-3.5 rounded-full transition-all duration-300 hover:gap-3"
              >
                See pricing
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
