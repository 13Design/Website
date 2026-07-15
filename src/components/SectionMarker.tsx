type Props = {
  n: string;
  label?: string;
  className?: string;
};

/** Numbered section marker, e.g. "01 — Who we work with" */
export default function SectionMarker({ n, label, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="font-mono text-xs text-ember-500">{n}</span>
      {label && (
        <>
          <span className="h-px w-6 bg-ink-600" />
          <span className="text-[11px] uppercase tracking-[0.28em] text-bone-400">
            {label}
          </span>
        </>
      )}
    </div>
  );
}
