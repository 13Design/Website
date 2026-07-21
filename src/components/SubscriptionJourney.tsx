import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, Hash, MousePointer2, Pause, Play, Plus } from 'lucide-react';

/**
 * The subscription loop, as an interactive walkthrough:
 * subscribe → join Trello & Slack → request → collaborate → result → repeat.
 *
 * Auto-advances while on screen; clicking a step takes manual control (the
 * play button hands it back). Scene micro-animations live in index.css under
 * the .j-* classes and replay every time a scene becomes active. Reduced
 * motion: no autoplay, scenes settle immediately.
 */

const STEP_MS = 5200;

/** Delay for a scene element's entrance, e.g. style={d('0.8s')}. */
function d(delay: string): CSSProperties {
  return { '--jd': delay } as CSSProperties;
}

function Line({ w, tone = 'bg-ink-600' }: { w: string; tone?: string }) {
  return <div className={`h-1.5 rounded-full ${tone}`} style={{ width: w }} />;
}

/* ----------------------------------- scenes ---------------------------------- */

function SceneSubscribe() {
  return (
    <div className="relative">
      <div className="j-rise w-52 rounded-2xl border border-ink-600/70 bg-ink-850 p-5 shadow-2xl shadow-black/50">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.16em] text-bone-400">Standard</span>
          <span className="font-display text-lg font-medium text-bone-50">
            $2,500<span className="text-[10px] font-normal text-bone-400">/mo</span>
          </span>
        </div>
        <div className="mt-3.5 space-y-2">
          <Line w="82%" />
          <Line w="64%" />
          <Line w="73%" />
        </div>
        <div className="relative mt-4">
          <div className="rounded-full bg-ember-500 py-2 text-center text-xs font-medium text-ink-950">
            Subscribe
          </div>
          <span
            className="j-ping pointer-events-none absolute inset-0 rounded-full border-2 border-ember-400"
            style={d('1.45s')}
          />
        </div>
      </div>
      <MousePointer2
        size={17}
        className="j-cursor absolute bottom-8 left-1/2 -ml-8 fill-bone-100 text-bone-100 drop-shadow-lg"
        style={d('0.35s')}
      />
      <div
        className="j-pop absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ember-500 text-ink-950 shadow-lg"
        style={d('1.9s')}
      >
        <Check size={15} strokeWidth={3} />
      </div>
    </div>
  );
}

function InviteCard({
  glyph,
  name,
  action,
  delay,
  checkDelay,
}: {
  glyph: ReactNode;
  name: string;
  action: string;
  delay: string;
  checkDelay: string;
}) {
  return (
    <div
      className="j-rise relative w-36 rounded-2xl border border-ink-600/70 bg-ink-850 p-4 shadow-xl shadow-black/40"
      style={d(delay)}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-600/70 bg-ink-800 text-bone-200">
        {glyph}
      </div>
      <p className="mt-3 text-xs font-medium text-bone-100">{name}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-bone-500">Invitation</p>
      <div className="mt-3 rounded-full border border-ink-600 py-1.5 text-center text-[10px] font-medium text-bone-200">
        {action}
      </div>
      <div
        className="j-pop absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ember-500 text-ink-950"
        style={d(checkDelay)}
      >
        <Check size={12} strokeWidth={3} />
      </div>
    </div>
  );
}

function SceneInvites() {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="j-fade mb-4 rounded-full border border-ink-600/70 bg-ink-800 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-bone-400"
        style={d('0.2s')}
      >
        Two invites · your inbox
      </div>
      <div className="flex gap-4">
        <InviteCard
          glyph={
            <span className="flex gap-1">
              <span className="h-3.5 w-1.5 rounded-sm bg-bone-300" />
              <span className="mt-1 h-2.5 w-1.5 rounded-sm bg-bone-400" />
            </span>
          }
          name="Trello"
          action="Join your board"
          delay="0.45s"
          checkDelay="1.5s"
        />
        <InviteCard
          glyph={<Hash size={16} />}
          name="Slack"
          action="Join our Slack"
          delay="0.7s"
          checkDelay="1.85s"
        />
      </div>
    </div>
  );
}

function BoardColumn({
  title,
  children,
  className = '',
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-[6.6rem] rounded-xl border border-ink-700/70 bg-ink-850 p-2.5 ${className}`}>
      <p className="px-0.5 text-[8px] font-medium uppercase tracking-[0.16em] text-bone-500">
        {title}
      </p>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function GhostCard() {
  return (
    <div className="rounded-lg border border-ink-700/60 bg-ink-800/70 p-2">
      <Line w="85%" />
      <div className="mt-1.5">
        <Line w="55%" />
      </div>
    </div>
  );
}

function SceneRequest() {
  return (
    <div className="j-rise flex gap-3">
      <BoardColumn title="📥 Requests">
        <GhostCard />
        <div
          className="j-pop rounded-lg border border-ink-600/60 border-l-2 border-l-ember-500 bg-ink-800 p-2 shadow-lg shadow-black/30"
          style={d('0.9s')}
        >
          <Line w="90%" tone="bg-bone-300/70" />
          <div className="mt-1.5 flex items-center gap-1">
            <span className="h-1.5 w-6 rounded-full bg-ember-500/60" />
            <span className="h-1.5 w-4 rounded-full bg-ink-600" />
          </div>
        </div>
        <div
          className="j-fade flex items-center justify-center gap-1 rounded-lg border border-dashed border-ink-600/70 py-1 text-[9px] text-bone-500"
          style={d('1.6s')}
        >
          <Plus size={9} /> Add a card
        </div>
      </BoardColumn>
      <BoardColumn title="🎨 In progress">
        <GhostCard />
      </BoardColumn>
      <BoardColumn title="✅ Done" className="opacity-70">
        <GhostCard />
      </BoardColumn>
    </div>
  );
}

function SceneCollaborate() {
  return (
    <div className="relative">
      <div className="j-rise w-60 rounded-2xl border border-ink-600/70 bg-ink-850 p-4 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <Line w="55%" tone="bg-bone-300/70" />
          <span className="rounded-full bg-ink-700 px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] text-bone-300">
            In progress
          </span>
        </div>
        <div className="mt-4 space-y-3">
          <div className="j-slide flex items-start gap-2" style={d('0.55s')}>
            <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-bone-300" />
            <div className="flex-1 rounded-xl rounded-tl-sm bg-ink-800 p-2.5">
              <Line w="88%" />
              <div className="mt-1.5">
                <Line w="52%" />
              </div>
            </div>
          </div>
          <div className="j-slide flex items-start gap-2" style={d('1.15s')}>
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember-500 text-[8px] font-bold text-ink-950">
              13
            </span>
            <div className="flex-1 rounded-xl rounded-tl-sm border border-ember-500/25 bg-ember-500/10 p-2.5">
              <Line w="76%" tone="bg-ember-300/50" />
              <div className="mt-1.5">
                <Line w="60%" tone="bg-ember-300/35" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="j-pop absolute -right-6 -top-4 flex items-center gap-1.5 rounded-lg border border-ink-600/70 bg-ink-800 px-2.5 py-1.5 shadow-lg"
        style={d('1.8s')}
      >
        <Hash size={11} className="text-ember-400" />
        <span className="text-[9px] text-bone-300">13design · 1 new</span>
      </div>
    </div>
  );
}

function SceneResult() {
  return (
    <div className="relative">
      <div className="j-rise w-64 overflow-hidden rounded-xl border border-ink-600/70 bg-ink-850 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-1.5 border-b border-ink-700/60 bg-ink-800/80 px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
          <div className="mx-auto h-2 w-24 rounded-full bg-ink-700" />
        </div>
        <div className="p-3">
          <div className="j-rise flex items-center justify-between" style={d('0.35s')}>
            <span className="h-2 w-10 rounded-full bg-bone-300/60" />
            <span className="flex gap-2">
              <span className="h-1.5 w-6 rounded-full bg-ink-600" />
              <span className="h-1.5 w-6 rounded-full bg-ink-600" />
            </span>
          </div>
          <div
            className="j-rise mt-3 h-16 rounded-lg bg-gradient-to-br from-ember-500/35 via-ember-600/15 to-ink-700"
            style={d('0.6s')}
          />
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <div className="j-rise h-10 rounded-lg bg-ink-800" style={d('0.85s')} />
            <div className="j-rise h-10 rounded-lg bg-ink-800" style={d('1s')} />
          </div>
        </div>
      </div>
      <div
        className="j-pop absolute -bottom-3 right-4 flex items-center gap-1 rounded-full bg-ember-500 px-3 py-1 text-[10px] font-medium text-ink-950 shadow-lg"
        style={d('1.45s')}
      >
        <Check size={11} strokeWidth={3} /> Delivered
      </div>
    </div>
  );
}

function SceneRepeat() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
          <circle cx="48" cy="48" r="34" fill="none" stroke="#242428" strokeWidth="2.5" />
          <circle
            className="j-draw"
            style={d('0.3s')}
            cx="48"
            cy="48"
            r="34"
            fill="none"
            stroke="#e8744c"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset="100"
          />
        </svg>
        <div
          className="j-pop absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em] text-bone-200"
          style={d('1s')}
        >
          Repeat
        </div>
      </div>
      <p className="j-fade mt-4 text-sm text-bone-300" style={d('1.3s')}>
        Next request, same loop.
      </p>
      <div className="j-rise mt-3 flex gap-2" style={d('1.55s')}>
        {['Month-to-month', 'Cancel anytime'].map((t) => (
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
    title: 'Subscribe',
    blurb: 'Pick a tier and pay by card. Paddle sends the receipt and handles the tax — done in two minutes.',
    scene: SceneSubscribe,
  },
  {
    title: 'Join Trello & Slack',
    blurb: 'Two invites land in your inbox within minutes: your private request board, and our shared Slack.',
    scene: SceneInvites,
  },
  {
    title: 'Request design',
    blurb: 'One card per request — goal, links, assets. Order the list by priority; we always start from the top.',
    scene: SceneRequest,
  },
  {
    title: 'Collaborate',
    blurb: 'The card moves across the board as we work. Feedback lives in comments; quick answers happen in Slack.',
    scene: SceneCollaborate,
  },
  {
    title: 'Result',
    blurb: 'Polished, coherent, ready to ship — delivered on the card, with specs your developers won\'t fight.',
    scene: SceneResult,
  },
  {
    title: 'Repeat',
    blurb: 'Month-to-month, no contract. File the next request — or pause and pick it back up when you need us.',
    scene: SceneRepeat,
  },
];

/* --------------------------------- component --------------------------------- */

export default function SubscriptionJourney() {
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
