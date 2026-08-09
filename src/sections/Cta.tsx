import { useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Asterisk, ClipLines, Magnetic, Reveal } from "./shared";

export default function Cta({
  kicker = "Founding client spots open",
  lines,
  body = "Tell us where you are, what's coming up, and what's bothering you. We'll come back with a clear starting point.",
}: {
  kicker?: string;
  lines?: ReactNode[];
  body?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, reduce ? 0 : -60]);

  return (
    <section ref={ref} aria-labelledby="cta-heading" className="relative overflow-hidden">
      {/* slow outline marquee backdrop */}
      <div
        aria-hidden="true"
        className="marquee pointer-events-none absolute top-1/2 -translate-y-1/2 overflow-hidden whitespace-nowrap opacity-70"
      >
        <div className="marquee-track slow flex w-max">
          {[0, 1].map((dup) => (
            <span
              key={dup}
              className="text-outline pr-16 font-display text-[22vw] font-semibold leading-none tracking-tighter lg:text-[16vw]"
            >
              LET'S TALK — LET'S TALK —&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* spinning asterisk */}
      <Asterisk className="spin-slow pointer-events-none absolute left-[6%] top-[12%] h-24 w-24 text-black/20" />

      <motion.div
        style={{ y: drift }}
        className="relative z-[4] mx-auto max-w-[1440px] px-5 py-32 sm:px-8 lg:px-12 lg:py-52"
      >
        <Reveal y={16}>
          <p className="font-mono2 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-black/50">
            <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-black" />
            {kicker}
          </p>
        </Reveal>

        <h2
          id="cta-heading"
          className="font-display mt-10 max-w-[14ch] text-[clamp(2.8rem,8vw,7.5rem)] font-medium leading-[0.98] tracking-[-0.045em]"
        >
          <ClipLines
            onView
            lines={
              lines ?? [
                "Let's make your",
                "product feel",
                <em key="i" className="font-light italic text-black/50">inevitable.</em>,
              ]
            }
          />
        </h2>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-end">
          <Reveal delay={0.15} className="lg:col-span-6">
            <p className="max-w-[46ch] text-[17px] leading-[1.7] text-black/60">{body}</p>
          </Reveal>
          <Reveal delay={0.25} className="lg:col-span-6 lg:justify-self-end">
            <div className="flex flex-wrap items-center gap-4">
              <Magnetic strength={0.22}>
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 rounded-full border border-black bg-black px-8 py-4 text-[15px] font-medium text-white transition-colors duration-300 hover:bg-transparent hover:text-black"
                >
                  Contact us
                  <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Magnetic>
              <a
                href="mailto:hello@13design.org"
                className="link-line font-mono2 text-[12px] uppercase tracking-[0.2em] text-black/60 transition-colors hover:text-black"
              >
                hello@13design.org
              </a>
            </div>
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
}
