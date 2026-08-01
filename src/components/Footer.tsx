import { Mail, ArrowUpRight } from 'lucide-react';
import type { Route } from '../lib/router';

// No "Home" entry: the wordmark above is the way home, same as the navbar logo.
const NAV_LINKS: { label: string; route: Route }[] = [
  { label: 'Services', route: '/services' },
  { label: 'Subscription', route: '/pricing' },
  { label: 'About', route: '/about' },
  { label: 'Work', route: '/work' },
  { label: 'Contact', route: '/contact' },
  { label: 'Founding clients', route: '/founding-clients' },
];

const DOC_LINKS: { label: string; route: Route }[] = [
  { label: 'Terms & agreement', route: '/terms' },
  { label: 'Refunds & cancellation', route: '/refunds' },
  { label: 'Privacy', route: '/privacy' },
];

const SOCIALS = [
  { label: 'X', href: 'https://x.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Dribbble', href: 'https://dribbble.com' },
];

export default function Footer({ onNavigate }: { onNavigate: (r: Route) => void }) {
  return (
    <footer className="relative bg-ink-950 border-t border-ink-700/50 grain">
      <div className="mx-auto max-w-edge px-5 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <button
              onClick={() => onNavigate('/')}
              className="group flex items-baseline gap-3"
              aria-label="13 Design Studio — home"
            >
              <span className="font-display text-5xl font-semibold text-bone-50 tracking-tightest">
                13
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-bone-400 group-hover:text-bone-200 transition-colors">
                Design Studio
              </span>
            </button>
            <p className="mt-5 text-bone-400 max-w-sm text-pretty leading-relaxed">
              A digital product design agency for AI-native and AI-built products.
              Based in Kraków, partnering with founders everywhere.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-bone-400">
              <span className="h-1.5 w-1.5 rounded-full bg-ember-500" />
              Kraków, Poland
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-bone-500 mb-5">Pages</p>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-6">
              {NAV_LINKS.map((l) => (
                <li key={l.route}>
                  <button
                    onClick={() => onNavigate(l.route)}
                    className="link-underline text-bone-300 hover:text-bone-50 transition-colors text-sm"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-bone-500 mb-5">Get in touch</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onNavigate('/contact')}
                className="group inline-flex items-center gap-2 text-sm text-bone-200 hover:text-ember-400 transition-colors w-fit"
              >
                <Mail size={16} />
                <span className="link-underline">Contact us</span>
              </button>
              <a
                href="mailto:hello@13design.org"
                className="group inline-flex items-center gap-2 text-sm text-bone-200 hover:text-ember-400 transition-colors w-fit"
              >
                <Mail size={16} />
                <span className="link-underline">hello@13design.org</span>
              </a>
            </div>
            <div className="mt-7">
              <p className="text-[11px] uppercase tracking-[0.28em] text-bone-500 mb-4">
                Documentation
              </p>
              <ul className="flex flex-col gap-3">
                {DOC_LINKS.map((l) => (
                  <li key={l.route}>
                    <button
                      onClick={() => onNavigate(l.route)}
                      className="link-underline text-bone-300 hover:text-bone-50 transition-colors text-sm"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex gap-5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center text-xs text-bone-400 hover:text-bone-100 transition-colors"
                >
                  {s.label}
                  <ArrowUpRight size={13} className="ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-ink-700/40 flex flex-col sm:flex-row justify-between gap-4 text-xs text-bone-500">
          <p>© {new Date().getFullYear()} 13 Design Studio. All rights reserved.</p>
          <p className="font-mono tracking-tight">Kraków — for founders everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
