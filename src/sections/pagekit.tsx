import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Asterisk, BlurBlob, ClipLines, EASE, KGrain, Reveal } from "./shared";

/* Numbered legal sections (Terms / Privacy) — title + paragraphs per row. */
export function LegalSections({
  sections,
}: {
  sections: { n: string; title: string; body: string[] }[];
}) {
  return (
    <div>
      {sections.map((s, i) => (
        <Reveal key={s.n} delay={0.04 * i}>
          <div className="grid gap-3 border-t border-black/10 py-8 sm:grid-cols-12 sm:gap-8 lg:py-10">
            <div className="flex items-baseline gap-4 sm:col-span-4">
              <span className="font-mono2 shrink-0 text-[12px] tracking-[0.2em] text-black/40">{s.n}</span>
              <h3 className="font-display text-[clamp(1.2rem,2.1vw,1.7rem)] font-medium leading-[1.15] tracking-[-0.02em]">
                {s.title}
              </h3>
            </div>
            <div className="sm:col-span-8">
              {s.body.map((p, j) => (
                <p
                  key={j}
                  className={`max-w-[64ch] text-[15px] leading-[1.75] text-black/60 ${j > 0 ? "mt-4" : ""}`}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
      <div className="border-t border-black/10" />
    </div>
  );
}

/* Sub-page hero: kinetic grain, kicker, giant clip-reveal title, lede. */
export function PageHero({
  kicker,
  lines,
  lede,
  aside,
}: {
  kicker: string;
  lines: ReactNode[];
  lede?: string;
  aside?: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden">
      <KGrain />
      <BlurBlob className="right-[6%] top-[8%] h-[360px] w-[360px]" />
      <BlurBlob className="d2 left-[2%] top-[52%] h-[300px] w-[300px]" />
      <div aria-hidden="true" className="v-grid pointer-events-none absolute inset-0" />

      <div className="relative z-[4] mx-auto max-w-[1440px] px-5 pb-16 pt-36 sm:px-8 sm:pt-44 lg:px-12 lg:pb-24 lg:pt-56">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-mono2 mb-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.28em] text-black/50 lg:mb-14"
        >
          <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-black" />
          <span>{kicker}</span>
        </motion.div>

        <div className="flex items-end justify-between gap-10">
          <h1 className="font-display max-w-[14ch] text-[clamp(2.9rem,8.6vw,7.8rem)] font-medium leading-[0.96] tracking-[-0.045em]">
            <ClipLines delay={0.25} lines={lines} />
          </h1>
          {aside && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.9, ease: EASE }}
              className="mb-4 hidden shrink-0 lg:block"
            >
              {aside}
            </motion.div>
          )}
        </div>

        {lede && (
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
            className="mt-12 max-w-[52ch] text-[17px] leading-[1.7] text-black/60 lg:mt-16"
          >
            {lede}
          </motion.p>
        )}
      </div>
    </section>
  );
}

/* Giant outlined background word with slow parallax drift. */
export function GhostWord({ word, className = "" }: { word: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`text-outline pointer-events-none absolute select-none font-display font-semibold leading-none tracking-tighter ${className}`}
    >
      {word}
    </div>
  );
}

/* Rotating star ring used as hero aside. */
export function HeroRing() {
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="spin-slow h-full w-full text-black/60">
        <defs>
          <path id="page-ring" d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" />
        </defs>
        <text className="font-mono2 fill-current text-[9.5px] uppercase tracking-[0.24em]">
          <textPath href="#page-ring">13 Design Studio · Designed by humans ·</textPath>
        </text>
      </svg>
      <Asterisk className="spin-rev absolute inset-0 m-auto h-8 w-8 text-black" />
    </div>
  );
}

/* Numbered row — used for steps / lists across pages. */
export function NumberedRow({
  n,
  title,
  body,
  dark = false,
  delay = 0,
}: {
  n: string;
  title: string;
  body?: string;
  dark?: boolean;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div
        className={`group grid gap-4 border-t py-8 transition-colors duration-500 sm:grid-cols-12 sm:gap-8 lg:py-10 ${
          dark ? "border-white/12" : "border-black/10"
        }`}
      >
        <span
          className={`font-mono2 text-[12px] tracking-[0.2em] sm:col-span-2 ${
            dark ? "text-white/40" : "text-black/40"
          }`}
        >
          {n.padStart(2, "0")}
        </span>
        <h3
          className={`font-display text-[clamp(1.4rem,2.4vw,2rem)] font-medium leading-[1.1] tracking-[-0.02em] sm:col-span-5 ${
            dark ? "text-white" : "text-black"
          }`}
        >
          {title}
        </h3>
        {body && (
          <p
            className={`max-w-[52ch] text-[15px] leading-[1.7] sm:col-span-5 ${
              dark ? "text-white/55" : "text-black/55"
            }`}
          >
            {body}
          </p>
        )}
      </div>
    </Reveal>
  );
}

/* Bullet list with plus markers. */
export function PlusList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="space-y-0">
      {items.map((item, i) => (
        <Reveal key={item} delay={i * 0.06}>
          <li
            className={`flex items-start gap-4 border-t py-5 text-[15.5px] leading-[1.6] ${
              dark ? "border-white/12 text-white/70" : "border-black/10 text-black/70"
            }`}
          >
            <span
              aria-hidden="true"
              className={`font-mono2 mt-[1px] text-[13px] ${dark ? "text-white/40" : "text-black/40"}`}
            >
              +
            </span>
            <span className="max-w-[60ch]">{item}</span>
          </li>
        </Reveal>
      ))}
    </ul>
  );
}

/* ——— form primitives (frontend-only) ——— */
export const fieldCls =
  "w-full rounded-2xl border border-black/15 bg-white/70 px-5 py-4 text-[15px] text-black placeholder:text-black/35 backdrop-blur transition-colors duration-300 focus:border-black focus:outline-none";

export function Field({
  label,
  htmlFor,
  required = false,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="font-mono2 mb-2.5 flex items-baseline gap-2 text-[11px] uppercase tracking-[0.22em] text-black/55"
      >
        {label}
        {required && <span className="text-black/30">*</span>}
      </label>
      {children}
      {hint && <p className="mt-2 text-[12.5px] leading-[1.5] text-black/40">{hint}</p>}
    </div>
  );
}

export function SubmitNote() {
  return (
    <p className="font-mono2 text-[11px] leading-[1.7] tracking-[0.06em] text-black/40">
      We read every message personally and reply within one business day.
    </p>
  );
}

/* Honeypot — an off-screen field that bots auto-fill and humans never see.
   A non-empty value marks the submission as spam. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0">
      <label>
        Company website
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/* Build a mailto link from form state. */
export function mailtoFromForm(subject: string, fields: [string, string][]) {
  const body = fields
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k}:\n${v}`)
    .join("\n\n");
  return `mailto:hello@13design.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* Success panel shown after "send". */
export function SentPanel({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="grain-panel relative overflow-hidden rounded-[28px] border border-black/10 bg-white/60 p-10 text-center backdrop-blur lg:p-16"
    >
      <Asterisk className="spin-slow mx-auto h-10 w-10 text-black" />
      <h3 className="font-display mt-8 text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium tracking-[-0.03em]">
        {title}
      </h3>
      <p className="mx-auto mt-4 max-w-[44ch] text-[15px] leading-[1.7] text-black/55">{body}</p>
    </motion.div>
  );
}
