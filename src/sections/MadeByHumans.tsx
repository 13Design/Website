import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Asterisk, ClipLines, Reveal, SectionTag, StarRing } from "./shared";

const STATEMENT = "Human judgment, on every screen.";

function Word({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  const y = useTransform(progress, range, [10, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  );
}

function ScrollStatement({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.5"],
  });
  const words = text.split(" ");

  if (reduce) {
    return <span>{text}</span>;
  }
  return (
    <span ref={ref}>
      {words.map((w, i) => (
        <Word
          key={i}
          word={w}
          progress={scrollYProgress}
          range={[i / words.length, Math.min(1, (i + 1.5) / words.length)]}
        />
      ))}
    </span>
  );
}

export default function MadeByHumans() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative scroll-mt-24 overflow-hidden bg-white"
    >
      {/* star ring ornament */}
      <StarRing className="spin-rev pointer-events-none absolute -left-24 top-24 h-[340px] w-[340px] text-black/[0.08]" />
      <span
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -right-8 top-10 select-none font-display text-[34vw] font-semibold leading-none lg:text-[22vw]"
      >
        05
      </span>

      <div className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-40">
        <SectionTag num="05" label="Made by humans" />

        <h2
          id="about-heading"
          className="font-display relative mt-12 max-w-[15ch] text-[clamp(2.6rem,7vw,6.5rem)] font-medium leading-[1.0] tracking-[-0.045em] lg:mt-16"
        >
          <ScrollStatement text={STATEMENT} />
        </h2>

        <div className="relative mt-14 grid gap-12 lg:mt-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="max-w-[52ch] text-[17px] leading-[1.75] text-black/65">
              Every choice — every flow, every screen, every decision — is made by a person who knows
              your product and can tell you why: why this flow, why this order, why this screen earns
              its place. That judgment is the thing you're hiring — and it's exactly what generation
              tools don't have.
            </p>
            <Asterisk className="spin-slow mt-10 h-10 w-10 text-black/80" />
          </Reveal>

          <div className="lg:col-span-6">
            <Reveal delay={0.1}>
              <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-[1.15] tracking-[-0.03em]">
                <ClipLines lines={["Designed by humans,", "for humans and agents."]} />
              </h3>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-[52ch] text-[15.5px] leading-[1.75] text-black/65">
                The next users of your product won't all be people. AI agents already read, compare,
                and act inside products — and they reward the same things humans do: clear hierarchy,
                honest labels, structure that means what it says. So we design for both — interfaces
                people understand at first glance, built so machines can navigate them without guessing.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex gap-4 rounded-xl border border-black/10 bg-[#f4f4f1]/70 p-5 backdrop-blur">
                <span aria-hidden="true" className="pulse-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                <p className="text-[14px] leading-[1.7] text-black/70">
                  Generated output lands close, but never quite settles. Deciding where everything
                  belongs — and why — is the work.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
