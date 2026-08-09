import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Asterisk, BlurBlob, ClipLines, EASE, KGrain, Magnetic } from "./shared";
import { heroRotating, tickerItems } from "../data/content";

/**
 * The final hero word cycles — trust. / understand. / come back. / tell others. —
 * with a soft crossfade (no vertical move, so it never clips inside ClipLines).
 * Reduced motion: settles on the first word.
 */
const HERO_LONGEST = heroRotating.reduce((a, b) => (b.length > a.length ? b : a));

function RotatingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % heroRotating.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <em className="relative inline-block font-light italic text-black/50">
      {/* reserve width for the longest word so nothing reflows on change */}
      <span aria-hidden="true" className="invisible">
        {HERO_LONGEST}
      </span>
      {/* keyed remount → each new word fades in (old is replaced instantly) */}
      <motion.span
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
        className="absolute inset-0"
      >
        {heroRotating[i]}
      </motion.span>
    </em>
  );
}

function RotatingBadge() {
  return (
    <div aria-hidden="true" className="relative hidden h-36 w-36 lg:block">
      <svg viewBox="0 0 120 120" className="spin-slow h-full w-full">
        <defs>
          <path id="badge-circle" d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" />
        </defs>
        <text className="font-mono2 fill-black/55 text-[9.5px] uppercase tracking-[0.24em]">
          <textPath href="#badge-circle">
            Designed by humans · 13 Design Studio · Est. for the AI era ·
          </textPath>
        </text>
      </svg>
      <Asterisk className="spin-rev absolute inset-0 m-auto h-8 w-8" />
    </div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const numeralY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 240]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="top" aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* kinetic grain — the hero layer */}
      <KGrain />

      {/* vertical grid lines */}
      <div aria-hidden="true" className="v-grid pointer-events-none absolute inset-0" />

      {/* drifting blurred shapes */}
      <BlurBlob className="left-[8%] top-[12%] h-[420px] w-[420px]" />
      <BlurBlob className="d2 right-[4%] top-[48%] h-[360px] w-[360px]" />

      {/* giant parallax numeral */}
      <motion.div
        aria-hidden="true"
        style={{ y: numeralY, opacity: fade }}
        className="text-outline pointer-events-none absolute -right-6 top-24 select-none font-display text-[44vw] font-semibold leading-none tracking-tighter lg:-right-10 lg:text-[30vw]"
      >
        13
      </motion.div>

      <div className="relative z-[4] mx-auto max-w-[1440px] px-5 pb-16 pt-32 sm:px-8 sm:pt-40 lg:px-12 lg:pb-24 lg:pt-52">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-mono2 mb-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.28em] text-black/50 lg:mb-14"
        >
          <span className="text-black">01</span>
          <span aria-hidden="true" className="h-px w-14 bg-black/25" />
          <span>13 Design Studio</span>
        </motion.div>

        <div className="flex items-end justify-between gap-10">
          <h1
            id="hero-heading"
            className="font-display max-w-[13ch] text-[clamp(3rem,9.4vw,8.5rem)] font-medium leading-[0.95] tracking-[-0.045em]"
          >
            <ClipLines
              delay={0.25}
              lines={[
                <>We turn AI products</>,
                <>into products people</>,
                <RotatingWord key="rot" />,
              ]}
            />
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.9, ease: EASE }}
            className="mb-4 shrink-0"
          >
            <RotatingBadge />
          </motion.div>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:items-end">
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
            className="max-w-[46ch] text-[17px] leading-[1.65] text-black/60 lg:col-span-6"
          >
            A digital product design studio for the AI era. We take AI-native features and AI-generated
            MVPs and make them feel intentional — the kind of product investors demo with confidence and
            first users understand at first glance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
            className="flex flex-wrap items-center gap-4 lg:col-span-6 lg:justify-end"
          >
            <Magnetic strength={0.22}>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 rounded-full border border-black bg-black px-7 py-3.5 text-[14px] font-medium text-white transition-colors duration-300 hover:bg-transparent hover:text-black"
              >
                Contact us
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.22}>
              <a
                href="mailto:hello@13design.org"
                className="inline-flex items-center gap-3 rounded-full border border-black/15 bg-white/50 px-7 py-3.5 text-[14px] font-medium text-black/70 backdrop-blur transition-colors duration-300 hover:border-black hover:text-black"
              >
                Email us
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.15 }}
          className="mt-12 flex items-center gap-3 text-[13px] text-black/45 lg:mt-16"
        >
          <span aria-hidden="true" className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-black" />
          A product design agency for AI-native and AI-built products
        </motion.p>
      </div>

      {/* ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="marquee relative z-[4] overflow-hidden border-y border-black/10 bg-white/40 py-4 backdrop-blur-sm"
        aria-label="Studio facts"
      >
        <div className="marquee-track flex w-max items-center">
          {[0, 1].map((dup) => (
            <div key={dup} aria-hidden={dup === 1} className="flex items-center">
              {tickerItems.map((item) => (
                <span
                  key={`${dup}-${item}`}
                  className="font-mono2 flex items-center gap-8 pr-8 text-[11px] uppercase tracking-[0.24em] text-black/45"
                >
                  {item}
                  <Asterisk className="h-3 w-3 text-black/30" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
