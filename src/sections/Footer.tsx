import { Link } from "react-router";
import { ArrowUpRight, Asterisk, KGrain, Reveal } from "./shared";

const COLS = [
  {
    title: "Pages",
    links: [
      { label: "Services", to: "/services" },
      { label: "About", to: "/about" },
      { label: "Work", to: "/work" },
      { label: "Contact", to: "/contact" },
      { label: "Founding clients", to: "/founding-clients" },
    ],
  },
  {
    title: "Get in touch",
    links: [
      { label: "Contact us", to: "/contact" },
      { label: "hello@13design.org", href: "mailto:hello@13design.org" },
    ],
  },
];

const SOCIALS = [
  { label: "X", href: "https://x.com/13design_studio" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/a13design-studio" },
];

export default function Footer() {
  return (
    <footer className="on-ink relative overflow-hidden bg-[#0c0c0c] text-white">
      {/* kinetic grain */}
      <KGrain dark />
      <div
        aria-hidden="true"
        className="blob-drift d2 pointer-events-none absolute -left-24 bottom-0 h-[380px] w-[380px] rounded-full bg-white/[0.05] blur-[110px]"
      />

      <div className="relative z-[4] mx-auto max-w-[1440px] px-5 pb-10 pt-20 sm:px-8 lg:px-12 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          {/* brand */}
          <div className="lg:col-span-6">
            <Reveal>
              <Link to="/" className="group inline-flex items-center gap-4" aria-label="13 Design Studio — home">
                <Asterisk className="h-10 w-10 transition-transform duration-700 group-hover:rotate-180" />
                <span className="font-display text-[64px] font-semibold leading-none tracking-tighter lg:text-[88px]">
                  13
                </span>
                <span className="font-mono2 text-[11px] uppercase tracking-[0.32em] text-white/60 transition-colors group-hover:text-white">
                  Design Studio
                </span>
              </Link>
              <p className="mt-6 max-w-[40ch] text-[14.5px] leading-[1.7] text-white/50">
                A digital product design agency for AI-native and AI-built products. Based in
                Vinnytsia, partnering with founders everywhere.
              </p>
              <p className="font-mono2 mt-8 text-[11px] uppercase tracking-[0.24em] text-white/40">
                Vinnytsia, Ukraine
              </p>
            </Reveal>
          </div>

          {/* link columns */}
          {COLS.map((col, ci) => (
            <nav key={col.title} aria-label={col.title} className="lg:col-span-3">
              <Reveal delay={0.08 * (ci + 1)}>
                <h3 className="font-mono2 text-[10px] uppercase tracking-[0.28em] text-white/40">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {"to" in l ? (
                        <Link
                          to={l.to!}
                          className="link-line text-[14px] text-white/65 transition-colors hover:text-white"
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          className="link-line text-[14px] text-white/65 transition-colors hover:text-white"
                        >
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </nav>
          ))}

          {/* socials */}
          <div className="lg:col-span-1">
            <Reveal delay={0.32}>
              <h3 className="font-mono2 text-[10px] uppercase tracking-[0.28em] text-white/40">Social</h3>
              <ul className="mt-5 space-y-3">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-[14px] text-white/65 transition-colors hover:text-white"
                      aria-label={`${s.label} (opens in a new tab)`}
                    >
                      <span className="link-line">{s.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono2 text-[11px] tracking-[0.14em] text-white/40">
            © 2026 13 Design Studio. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              to="/terms"
              className="link-line font-mono2 text-[11px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
            >
              Terms &amp; agreement
            </Link>
            <Link
              to="/privacy"
              className="link-line font-mono2 text-[11px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
