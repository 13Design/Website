type Props = {
  n: string;
  label?: string;
  className?: string;
  /** Use "light" on inverted (bone) sections so the marker stays legible. */
  tone?: 'dark' | 'light';
};

/** Numbered section marker, e.g. "01 — Who we work with" */
export default function SectionMarker({ n, label, className = '', tone = 'dark' }: Props) {
  const light = tone === 'light';
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`font-mono text-xs ${light ? 'text-ember-600' : 'text-ember-500'}`}>{n}</span>
      {label && (
        <>
          <span className={`h-px w-6 ${light ? 'bg-ink-500/40' : 'bg-ink-600'}`} />
          <span
            className={`text-[11px] uppercase tracking-[0.28em] ${
              light ? 'text-ink-500' : 'text-bone-400'
            }`}
          >
            {label}
          </span>
        </>
      )}
    </div>
  );
}
