import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Asterisk, ClipLines, EASE, Reveal, SectionTag } from "./shared";

const STEPS = [
  {
    num: "01",
    title: "Intro call",
    body: "A short call — no deck, no pitch. You tell us where the product stands and what's coming up; we tell you honestly whether we're the right fit.",
    chips: ["Live", "30 min · no deck, no pitch", "✓ Good fit"],
  },
  {
    num: "02",
    title: "Frame the problem",
    body: "Before we touch a screen, we get clear on what's actually happening. Most design problems are decision problems wearing a costume.",
    chips: ["The brief vs. the real problem", "Symptom → Real problem"],
  },
  {
    num: "03",
    title: "Explore, then decide",
    body: "We move fast through real options — not a single first idea. The value we add is choosing, and having a reason for what we keep and what we cut.",
    chips: ["Explore widely · decide deliberately"],
  },
  {
    num: "04",
    title: "Design for coherence",
    body: "We design flows and systems, not isolated screens — so the product feels like one decision made consistently, not features stitched together.",
    chips: ["Flows & systems · not screens"],
  },
  {
    num: "05",
    title: "Collaborate in the open",
    body: "You see the work as it moves. Feedback is direct and hands-on — no account layer, no junior hand-off — and quick answers happen in real time.",
    chips: ["Shared preview", "13 · On it"],
  },
  {
    num: "06",
    title: "Ship, then stay",
    body: "Delivered ready to build. And the longer we work together, the better the decisions get — which is why most relationships move toward ongoing work.",
    chips: ["Shipped", "Decisions keep getting better", "Ongoing by default · not a hand-off"],
  },
];

function MockPanel({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <div className="grain-panel relative h-full min-h-[340px] overflow-hidden rounded-2xl border border-black/10 bg-[#101010] p-6 text-white lg:min-h-[440px] lg:p-8">
      {/* drifting blur */}
      <div aria-hidden="true" className="blob-drift pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-white/[0.06] blur-[80px]" />

      <div className="relative flex items-center justify-between">
        <span className="font-mono2 text-[11px] tracking-[0.2em] text-white/40">
          {step.num} / 06
        </span>
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full border border-white/25" />
          <span className="h-2 w-2 rounded-full border border-white/25" />
          <span className="h-2 w-2 rounded-full bg-white" />
        </span>
      </div>

      {/* watermark */}
      <span
        aria-hidden="true"
        className="text-outline-w pointer-events-none absolute -bottom-10 -right-4 select-none font-display text-[190px] font-semibold leading-none"
      >
        {step.num}
      </span>

      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 lg:inset-x-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="mx-auto max-w-[380px] rounded-xl border border-white/15 bg-white/[0.06] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="font-mono2 text-[10px] uppercase tracking-[0.24em] text-white/50">
                  {step.title}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-white/50">
                  <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-white" />
                  {step.num === "01" ? "Live" : "13"}
                </span>
              </div>

              {/* skeleton bars */}
              <div aria-hidden="true" className="mt-5 space-y-2.5">
                <div className="h-2.5 w-3/4 rounded-full bg-white/15" />
                <div className="h-2.5 w-1/2 rounded-full bg-white/[0.08]" />
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="h-14 rounded-lg border border-white/10 bg-white/[0.05]" />
                  <div className="h-14 rounded-lg border border-white/20 bg-white/[0.12]" />
                </div>
              </div>

              <ul className="mt-5 flex flex-wrap gap-2">
                {step.chips.map((c, i) => (
                  <motion.li
                    key={c}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1, duration: 0.4, ease: EASE }}
                    className={`rounded-full border px-3 py-1.5 text-[11px] ${
                      i === 0
                        ? "border-white bg-white text-black"
                        : "border-white/20 bg-white/5 text-white/65"
                    }`}
                  >
                    {c}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Process() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduce || paused) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduce, paused, active]);

  return (
    <section
      aria-labelledby="process-heading"
      className="relative overflow-hidden border-b border-black/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* decorative outlined star, slow spin */}
      <Asterisk className="spin-slow pointer-events-none absolute -right-20 top-16 h-64 w-64 text-black/[0.07]" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <SectionTag num="04" label="How we work" />
        <h2
          id="process-heading"
          className="font-display mt-8 max-w-[16ch] text-[clamp(2.5rem,6vw,5.25rem)] font-medium leading-[1.0] tracking-[-0.04em] lg:mt-12"
        >
          <ClipLines lines={["What to expect,", "start to finish."]} />
        </h2>
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.7] text-black/55">
            From the first call to ongoing work — the shape of a project with us, one step at a time.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:mt-24 lg:grid-cols-2 lg:gap-16">
          {/* step list */}
          <Reveal>
            <ol className="border-t border-black/10">
              {STEPS.map((s, i) => {
                const isActive = i === active;
                return (
                  <li key={s.num} className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-expanded={isActive}
                      aria-controls={`process-step-${s.num}`}
                      className="group flex w-full items-baseline gap-5 py-5 text-left lg:py-6"
                    >
                      <span
                        className={`font-mono2 text-[11px] tracking-[0.2em] transition-colors duration-300 ${
                          isActive ? "text-black" : "text-black/35"
                        }`}
                      >
                        {s.num}
                      </span>
                      <span
                        className={`font-display flex-1 text-[20px] font-medium tracking-[-0.01em] transition-all duration-300 lg:text-[24px] ${
                          isActive ? "text-black" : "text-black/45 group-hover:text-black/80"
                        }`}
                      >
                        {s.title}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-px w-8 self-center transition-all duration-500 ${
                          isActive ? "bg-black" : "bg-black/15 group-hover:bg-black/40"
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          id={`process-step-${s.num}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.55, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-[52ch] pb-6 pl-11 pr-4 text-[15px] leading-[1.7] text-black/55 lg:pl-12">
                            {s.body}
                          </p>
                          {/* progress bar */}
                          <div className="mb-6 ml-11 h-px w-24 bg-black/15 lg:ml-12" aria-hidden="true">
                            <motion.div
                              key={active}
                              className="h-px bg-black"
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: paused || reduce ? 0.4 : 5, ease: "linear" }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          {/* visual panel */}
          <Reveal delay={0.15} className="lg:sticky lg:top-28 lg:self-start">
            <MockPanel step={STEPS[active]} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
