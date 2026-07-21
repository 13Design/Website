import Reveal from './Reveal';
import type { TermsSection } from '../data/studio';

/** Numbered, two-column terms list. Shared by the Terms and Refunds pages. */
export default function TermsList({ sections }: { sections: TermsSection[] }) {
  return (
    <div className="mt-12 space-y-px bg-ink-700/40 border-y border-ink-700/40">
      {sections.map((sec, i) => (
        <Reveal key={sec.n} delay={((i % 3) + 1) as 1 | 2 | 3}>
          <article className="grid grid-cols-12 gap-4 lg:gap-8 py-9 lg:py-10 bg-ink-950 -mx-3 px-3 lg:-mx-5 lg:px-5 rounded-lg">
            <div className="col-span-12 lg:col-span-3">
              <span className="font-mono text-xs text-ember-500">{sec.n}</span>
              <h3 className="mt-3 font-display text-lg lg:text-xl font-medium text-bone-50 tracking-tighter2 leading-tight text-pretty">
                {sec.title}
              </h3>
            </div>
            <div className="col-span-12 lg:col-span-9 space-y-4">
              {sec.body.map((para, j) => (
                <p key={j} className="text-base text-bone-300 leading-relaxed text-pretty max-w-2xl">
                  {para}
                </p>
              ))}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
