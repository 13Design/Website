import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BlurBlob, ClipLines, EASE, Reveal, SectionTag } from "./shared";

const FAQS = [
  {
    q: "We're pre-launch with no real users yet — is it too early to work with you?",
    a: "No. Interaction patterns for AI features are easier to get right before they're live and load-bearing. Earlier is easier than after you've shipped the wrong one three times.",
  },
  {
    q: "Do you build, or only design?",
    a: "We design — flows, systems, interaction patterns, specs your developers won't fight. We work alongside your engineering team, human or AI-assisted; we're not a dev shop.",
  },
  {
    q: "What's the difference between a sprint and a subscription?",
    a: "A sprint has a fixed scope, timeline, and price — good for a specific problem. A subscription is ongoing, month-to-month design support — good for teams shipping continuously who want a design partner who stays.",
  },
  {
    q: 'What does "embedded designer" actually mean?',
    a: "You get our design expertise working inside your team's process — your tools, your standups, your sprint cycles — for a defined project or period. No recruiting, no onboarding overhead, no long-term hire.",
  },
  {
    q: "Do you only work with AI-native startups?",
    a: "No — we work with two kinds of teams: startups building AI-native from day one, and established businesses adding AI to the core of an existing product. Different starting points, same underlying work.",
  },
  {
    q: "Am I working with one person or a team?",
    a: "Both. You have one point of contact for the relationship — someone who knows your product and stays with you throughout. The designer actually doing the work is matched to what your project needs, so you get the right expertise for the problem rather than one generalist stretched across everything.",
  },
  {
    q: "How fast can we start?",
    a: "A sprint or audit can usually start within a week or two of a first conversation. Subscriptions and embedded engagements start with a short scoping call to confirm fit.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative scroll-mt-24 overflow-hidden border-b border-black/10 bg-[#ececea]">
      <BlurBlob className="left-[12%] top-[8%] h-[360px] w-[360px]" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionTag num="07" label="FAQ" />
              <h2
                id="faq-heading"
                className="font-display mt-8 text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.0] tracking-[-0.04em] lg:mt-12"
              >
                <ClipLines lines={["Questions", "we hear."]} />
              </h2>
              <Reveal delay={0.2}>
                <p className="mt-8 max-w-[30ch] text-[15px] leading-[1.7] text-black/50">
                  Something else on your mind?{" "}
                  <a href="/contact" className="link-line text-black">
                    Ask us directly
                  </a>
                  .
                </p>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-8">
            <ol className="border-t border-black/10">
              {FAQS.map((f, i) => {
                const isOpen = open === i;
                return (
                  <Reveal key={i} delay={Math.min(i * 0.05, 0.3)}>
                    <li className="border-b border-black/10">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-a-${i}`}
                        className="group flex w-full items-start gap-5 py-6 text-left lg:gap-8 lg:py-7"
                      >
                        <span
                          className={`font-mono2 pt-1 text-[11px] tracking-[0.2em] transition-colors duration-300 ${
                            isOpen ? "text-black" : "text-black/35"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-display flex-1 text-[18px] font-medium leading-[1.4] tracking-[-0.01em] transition-colors duration-300 lg:text-[21px] ${
                            isOpen ? "text-black" : "text-black/65 group-hover:text-black"
                          }`}
                        >
                          {f.q}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`relative mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-400 ${
                            isOpen
                              ? "rotate-45 border-black bg-black text-white"
                              : "border-black/20 bg-white/50 text-black/60 backdrop-blur group-hover:border-black/60"
                          }`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                          </svg>
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`faq-a-${i}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <p className="max-w-[62ch] pb-7 pl-10 text-[15px] leading-[1.75] text-black/55 lg:pl-14">
                              {f.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
