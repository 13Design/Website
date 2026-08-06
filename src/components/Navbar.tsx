import { useEffect, useState } from 'react';
import { Menu, X, Mail } from 'lucide-react';
import type { Route } from '../lib/router';

// No "Home" entry: the logo on the left is the way home, as in the footer.
const NAV: { label: string; route: Route }[] = [
  { label: 'Services', route: '/services' },
  { label: 'About', route: '/about' },
  { label: 'Work', route: '/work' },
  { label: 'Founding clients', route: '/founding-clients' },
];

export default function Navbar({ route, onNavigate }: { route: Route; onNavigate: (r: Route) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (r: Route) => {
    setOpen(false);
    onNavigate(r);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ink-950/85 backdrop-blur-xl border-b border-ink-700/60'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-edge px-5 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <button
            onClick={() => go('/')}
            className="group flex items-center gap-2.5 shrink-0"
            aria-label="13 Design Studio — home"
          >
            <span className="font-display text-2xl font-semibold tracking-tightest text-bone-50">
              13
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-bone-400 group-hover:text-bone-200 transition-colors">
              Design Studio
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV.map((item) => (
              <button
                key={item.route}
                onClick={() => go(item.route)}
                className={`text-sm transition-colors ${
                  route === item.route
                    ? 'text-bone-50'
                    : 'text-bone-300 hover:text-bone-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => go('/contact')}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-ink-950 bg-ember-500 hover:bg-ember-400 transition-colors px-5 py-2.5 rounded-full"
            >
              <Mail size={15} />
              Contact us
            </button>
            <button
              className="lg:hidden text-bone-100 p-2 -mr-2"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-500 ${
          open ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
        } bg-ink-900/96 backdrop-blur-xl border-b border-ink-700/60`}
      >
        <div className="px-5 py-5 flex flex-col gap-0.5">
          {NAV.map((item) => (
            <button
              key={item.route}
              onClick={() => go(item.route)}
              className={`text-left text-lg font-display py-3.5 border-b border-ink-700/40 ${
                route === item.route ? 'text-bone-50' : 'text-bone-200'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => go('/contact')}
            className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-medium text-ink-950 bg-ember-500 px-5 py-3.5 rounded-full"
          >
            <Mail size={16} />
            Contact us
          </button>
        </div>
      </div>
    </header>
  );
}
