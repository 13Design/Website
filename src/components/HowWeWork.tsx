import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  MessageSquareText,
  Pause,
  Play,
  Target,
  TrendingUp,
} from 'lucide-react';

/**
 * What working with us actually looks like, as an interactive walkthrough:
 * intro call → frame the problem → explore & decide → coherence → collaborate → ship & stay.
 *
 * Same engine as SubscriptionJourney — auto-advances while on screen, clicking a
 * step hands you manual control, and the scene micro-animations live in index.css
 * under the shared .j-* classes (they replay every time a scene becomes active).
 * Reduced motion: no autoplay, scenes settle immediately.
 */

const STEP_MS = 5200;

/** Delay for a scene element's entrance, e.g. style={d('0.8s')}. */
function d(delay = '0s'): CSSProperties {
  return { '--jd': delay } as CSSProperties;
}

function Line({ w, tone = 'bg-ink-600' }: { w: string; tone?: string }) {
  return <div className={`h-1.5 rounded-full ${tone}`} style={{ width: w }} />;
}

/* ----------------------------------- scenes ---------------------------------- */

function SceneIntro() {
  return (
    <div className="relative">
      <div className="j-rise w-64 rounded-2xl border border-ink-600/70 bg-ink-850 p-4 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.16em] text-bone-400">Intro call</span>
          <span className="flex items-center gap-1.5 text-[10px] text-bone-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="j-ping absolute inset-0 rounded-full bg-ember-500" style={d('1.2s')} />
              <span className="h-1.5 w-1.5 rounded-full bg-ember-500" />
            </span>
            Live
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div
            className="j-slide flex aspect-video items-end rounded-lg bg-gradient-to-br from-ink-700 to-ink-800 p-1.5"
            style={d('0.4s')}
          >
            <span className="h-1.5 w-8 rounded-full bg-bone-400/60" />
          </div>
          <div
            className="j-slide flex aspect-video items-end rounded-lg bg-gradient-to-br from-ember-600/25 to-ink-800 p-1.5"
            style={d('0.6s')}
          >
            <span className="h-1.5 w-6 rounded-full bg-ember-300/60" />
          </div>
        </div>
        <div
          className="j-fade mt-3 flex items-center gap-2 rounded-full border border-ink-600/70 bg-ink-800 px-3 py-1.5 text-[10px] text-bone-300"
          style={d('1s')}
        >
          <Calendar size={11} className="shrink-0 text-ember-400" /> 30 min · no deck, no pitch
        </div>
      </div>
      <div
        className="j-pop absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-ember-500 px-2.5 py-1 text-[10px] font-medium text-ink-950 shadow-lg"
        style={d('1.6s')}
      >
        <Check size={11} strokeWidth={3} /> Good fit
      </div>
    </div>
  );
}

function StickyNote({
  label,
  rotate,
  delay,
  accent = false,
  accentDelay,
}: {
  label: string;
  rotate: string;
  delay: string;
  accent?: boolean;
  accentDelay?: string;
}) {
  return (
    <div
      className={`j-rise relative h-[6.5rem] w-[6.5rem] ${rotate} rounded-lg p-2.5 shadow-lg shadow-black/30 ${
        accent
          ? 'border border-ember-500/40 bg-ember-500/10'
          : 'border border-ink-600/70 bg-ink-800'
      }`}
      style={d(delay)}
    >
      <Line w="72%" tone={accent ? 'bg-ember-300/60' : 'bg-bone-400/50'} />
      <div className="mt-1.5">
        <Line w="52%" tone={accent ? 'bg-ember-300/40' : 'bg-ink-600'} />
      </div>
      <span
        className={`absolute bottom-2.5 left-2.5 text-[8px] uppercase tracking-[0.14em] ${
          accent ? 'text-ember-300' : 'text-bone-500'
        }`}
      >
        {label}
      </span>
      {accent && (
        <div
          className="j-pop absolute -right-2.5 -top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-ember-500 text-ink-950 shadow-lg"
          style={d(accentDelay)}
        >
          <Target size={12} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

function SceneFrame() {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="j-fade mb-4 rounded-full border border-ink-600/70 bg-ink-800 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-bone-400"
        style={d('0.15s')}
      >
        The brief vs. the real problem
      </div>
      <div className="flex items-center gap-3">
        <StickyNote label="Symptom" rotate="-rotate-3" delay="0.4s" />
        <StickyNote
          label="Real problem"
          rotate="rotate-1"
          delay="0.65s"
          accent
          accentDelay="1.6s"
        />
        <StickyNote label="Symptom" rotate="rotate-3" delay="0.9s" />
      </div>
    </div>
  );
}

function OptionCard({
  delay,
  chosen = false,
  checkDelay,
  dimDelay,
}: {
  delay: string;
  chosen?: boolean;
  checkDelay?: string;
  dimDelay?: string;
}) {
  return (
    <div
      className={`j-rise relative w-[4.6rem] overflow-hidden rounded-xl border bg-ink-850 shadow-lg shadow-black/30 ${
        chosen ? 'border-ember-500/60' : 'border-ink-600/70'
      } ${dimDelay ? 'j-dim' : ''}`}
      style={{ ...(d(delay) as CSSProperties), ...(dimDelay ? ({ '--jdim': dimDelay } as CSSProperties) : {}) }}
    >
      <div className={`h-9 ${chosen ? 'bg-gradient-to-br from-ember-500/35 to-ink-700' : 'bg-ink-800'}`} />
      <div className="space-y-1.5 p-2">
        <Line w="80%" />
        <Line w="55%" />
      </div>
      {chosen && (
        <div
          className="j-pop absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ember-500 text-ink-950 shadow-lg"
          style={d(checkDelay)}
        >
          <Check size={12} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function SceneExplore() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-2.5">
        <OptionCard delay="0.35s" dimDelay="1.5s" />
        <OptionCard delay="0.5s" dimDelay="1.5s" />
        <OptionCard delay="0.65s" chosen checkDelay="1.7s" />
        <OptionCard delay="0.8s" dimDelay="1.5s" />
      </div>
      <p className="j-fade mt-5 text-[11px] uppercase tracking-[0.16em] text-bone-500" style={d('1.9s')}>
        Explore widely · decide deliberately
      </p>
    </div>
  );
}

function SceneCoherence() {
  // Four screens wired into one system; the connectors draw themselves in.
  const nodes = [
    { x: 26, y: 30, delay: '0.35s' },
    { x: 122, y: 22, delay: '0.55s' },
    { x: 122, y: 96, delay: '0.75s', accent: true },
    { x: 214, y: 60, delay: '0.95s' },
  ];
  const links = [
    { x1: 62, y1: 44, x2: 122, y2: 40, delay: '0.6s' },
    { x1: 62, y1: 48, x2: 122, y2: 104, delay: '0.85s' },
    { x1: 158, y1: 40, x2: 214, y2: 74, delay: '1.05s' },
    { x1: 158, y1: 108, x2: 214, y2: 82, delay: '1.25s' },
  ];
  return (
    <div className="j-rise">
      <svg viewBox="0 0 260 140" className="h-auto w-64">
        {links.map((l, i) => (
          <line
            key={i}
            className="j-draw"
            style={d(l.delay)}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#e8744c"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset="100"
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i} className="j-pop" style={d(n.delay)}>
            <rect
              x={n.x}
              y={n.y}
              width="36"
              height="28"
              rx="4"
              fill={n.accent ? '#e8744c' : '#161619'}
              stroke={n.accent ? 'none' : '#2e2e34'}
              strokeWidth="1"
            />
            <rect x={n.x + 6} y={n.y + 7} width="18" height="2.5" rx="1.25" fill={n.accent ? '#08080a' : '#3c3c44'} />
            <rect x={n.x + 6} y={n.y + 14} width="12" height="2.5" rx="1.25" fill={n.accent ? '#08080a' : '#2e2e34'} />
          </g>
        ))}
      </svg>
      <p className="j-fade mt-1 text-center text-[11px] uppercase tracking-[0.16em] text-bone-500" style={d('1.5s')}>
        Flows &amp; systems · not screens
      </p>
    </div>
  );
}

function SceneCollaborate() {
  return (
    <div className="relative">
      <div className="j-rise w-60 overflow-hidden rounded-xl border border-ink-600/70 bg-ink-850 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-1.5 border-b border-ink-700/60 bg-ink-800/80 px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
          <span className="mx-auto text-[8px] uppercase tracking-[0.16em] text-bone-500">Shared preview</span>
        </div>
        <div className="relative p-3">
          <div className="j-rise h-14 rounded-lg bg-gradient-to-br from-ember-500/25 via-ink-700 to-ink-800" style={d('0.4s')} />
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <div className="j-rise h-9 rounded-lg bg-ink-800" style={d('0.6s')} />
            <div className="j-rise h-9 rounded-lg bg-ink-800" style={d('0.7s')} />
          </div>
          {/* comment pin */}
          <div
            className="j-pop absolute right-5 top-6 flex h-6 w-6 items-center justify-center rounded-full rounded-br-sm bg-ember-500 text-ink-950 shadow-lg"
            style={d('1.1s')}
          >
            <MessageSquareText size={12} strokeWidth={2.5} />
          </div>
        </div>
      </div>
      <div
        className="j-slide absolute -bottom-3 -left-4 flex items-center gap-2 rounded-xl border border-ink-600/70 bg-ink-800 px-2.5 py-1.5 shadow-lg"
        style={d('1.5s')}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember-500 text-[8px] font-bold text-ink-950">
          13
        </span>
        <span className="flex items-center gap-1 text-[9px] text-bone-300">
          On it <ArrowRight size={9} className="text-ember-400" />
        </span>
      </div>
    </div>
  );
}

function SceneShip() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="j-rise w-56 overflow-hidden rounded-xl border border-ink-600/70 bg-ink-850 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-1.5 border-b border-ink-700/60 bg-ink-800/80 px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
            <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
            <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
            <div className="mx-auto h-2 w-20 rounded-full bg-ink-700" />
          </div>
          <div className="flex items-end gap-1.5 p-3" style={{ height: '4.5rem' }}>
            {['40%', '55%', '48%', '70%', '85%'].map((h, i) => (
              <div
                key={i}
                className="j-grow flex-1 rounded-t bg-gradient-to-t from-ember-600/40 to-ember-500"
                style={{ ...(d(`${0.5 + i * 0.12}s`) as CSSProperties), ['--jh' as string]: h }}
              />
            ))}
          </div>
        </div>
        <div
          className="j-pop absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-ember-500 px-2.5 py-1 text-[10px] font-medium text-ink-950 shadow-lg"
          style={d('1.35s')}
        >
          <Check size={11} strokeWidth={3} /> Shipped
        </div>
      </div>
      <div className="j-fade mt-4 flex items-center gap-1.5 text-sm text-bone-300" style={d('1.6s')}>
        <TrendingUp size={14} className="text-ember-400" /> Decisions keep getting better
      </div>
      <div className="j-rise mt-3 flex gap-2" style={d('1.8s')}>
        {['Ongoing by default', 'Not a hand-off'].map((t) => (
          <span
            key={t}
            className="rounded-full border border-ink-600/70 bg-ink-850 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-bone-400"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------- steps ----------------------------------- */

const STEPS: { title: string; blurb: string; scene: () => ReactNode }[] = [
  {
    title: 'Intro call',
    blurb:
      "A short call — no deck, no pitch. You tell us where the product stands and what's coming up; we tell you honestly whether we're the right fit.",
    scene: SceneIntro,
  },
  {
    title: 'Frame the problem',
    blurb:
      'Before we touch a screen, we get clear on what\'s actually happening. Most design problems are decision problems wearing a costume.',
    scene: SceneFrame,
  },
  {
    title: 'Explore, then decide',
    blurb:
      'We move fast through real options — not a single first idea. The value we add is choosing, and having a reason for what we keep and what we cut.',
    scene: SceneExplore,
  },
  {
    title: 'Design for coherence',
    blurb:
      'We design flows and systems, not isolated screens — so the product feels like one decision made consistently, not features stitched together.',
    scene: SceneCoherence,
  },
  {
    title: 'Collaborate in the open',
    blurb:
      'You see the work as it moves. Feedback is direct and hands-on — no account layer, no junior hand-off — and quick answers happen in real time.',
    scene: SceneCollaborate,
  },
  {
    title: 'Ship, then stay',
    blurb:
      'Delivered ready to build. And the longer we work together, the better the decisions get — which is why most relationships move toward ongoing work.',
    scene: SceneShip,
  },
];

/* --------------------------------- component --------------------------------- */

export default function HowWeWork() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Respect the OS motion setting: never auto-advance for those users.
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const autoplay = playing && inView && !reducedMotion;

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, autoplay]);

  const select = (i: number) => {
    setActive(i);
    setPlaying(false);
  };

  return (
    <div ref={rootRef} className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
      {/* Stage */}
      <div className="order-1 lg:order-2 lg:col-span-7">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900 grain sm:aspect-[16/10]">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,116,76,0.09),transparent_65%)] blur-2xl" />

          {STEPS.map((step, i) => (
            <div
              key={step.title}
              aria-hidden={active !== i}
              className={`j-scene flex items-center justify-center p-6 ${active === i ? 'is-active' : ''}`}
            >
              {step.scene()}
            </div>
          ))}

          <span className="absolute left-5 top-4 font-mono text-[11px] text-bone-500">
            {String(active + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause the walkthrough' : 'Play the walkthrough'}
            className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-ink-600/70 bg-ink-850/80 text-bone-300 backdrop-blur transition-colors hover:border-bone-300 hover:text-bone-50"
          >
            {playing ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="order-2 lg:order-1 lg:col-span-5">
        <div className="border-t border-ink-700/40">
          {STEPS.map((step, i) => {
            const isActive = active === i;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => select(i)}
                aria-current={isActive ? 'step' : undefined}
                className="group block w-full border-b border-ink-700/40 py-4 text-left lg:py-[1.15rem]"
              >
                <span className="flex items-baseline gap-4">
                  <span
                    className={`font-mono text-xs transition-colors duration-300 ${
                      isActive ? 'text-ember-500' : 'text-bone-500 group-hover:text-bone-400'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-display text-lg font-medium tracking-tighter2 transition-colors duration-300 lg:text-xl ${
                      isActive ? 'text-bone-50' : 'text-bone-400 group-hover:text-bone-200'
                    }`}
                  >
                    {step.title}
                  </span>
                </span>
                <span
                  className={`grid transition-all duration-500 ease-out ${
                    isActive ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <span className="overflow-hidden">
                    <span className="block pl-[2.35rem] text-sm leading-relaxed text-bone-400 text-pretty">
                      {step.blurb}
                    </span>
                    <span className="mt-3 ml-[2.35rem] block h-0.5 overflow-hidden rounded-full bg-ink-700">
                      {isActive && (
                        <span
                          key={active}
                          className={`j-progress-fill block h-full rounded-full bg-ember-500 ${
                            autoplay ? '' : 'is-paused'
                          }`}
                          style={{ '--jt': `${STEP_MS}ms` } as CSSProperties}
                        />
                      )}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
