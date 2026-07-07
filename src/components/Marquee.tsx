import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
};

export default function Marquee({
  children,
  className = '',
  speed = 40,
  pauseOnHover = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(speed);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onResize = () => {
      const w = el.scrollWidth / 2;
      setDuration(Math.max(18, Math.min(80, w / 55)));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div ref={ref} className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className={`inline-flex ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        style={{ animation: `marquee ${duration}s linear infinite` }}
      >
        <div className="inline-flex">{children}</div>
        <div className="inline-flex" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
