import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: 1 | 2 | 3 | 4 | 5;
  as?: 'div' | 'section' | 'li' | 'span';
  once?: boolean;
};

export default function Reveal({
  children,
  className = '',
  delay,
  as: Tag = 'div',
  once = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) obs.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const delayClass = delay ? ` reveal-delay-${delay}` : '';

  return (
    <Tag
      ref={ref as never}
      className={`reveal${delayClass} ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
