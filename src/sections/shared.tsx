import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { useLocation } from "react-router";
import Lenis from "lenis";

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- smooth scroll (Lenis) ---------- */
export function useLenis() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduce]);
}

export function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

/* ---------- kinetic grain layer ---------- */
export function KGrain({ dark = false, panel = false }: { dark?: boolean; panel?: boolean }) {
  return <div aria-hidden className={`kgrain ${panel ? "panel" : dark ? "on-dark" : "on-light"}`} />;
}

/* ---------- custom cursor ---------- */
export function Cursor() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 550, damping: 42, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 550, damping: 42, mass: 0.5 });
  const scale = useSpring(1, { stiffness: 350, damping: 26 });
  const transform = useMotionTemplate`translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%) scale(${scale})`;

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: Event) => {
      const t = e.target as HTMLElement;
      const hit = t.closest("a, button, [data-cursor]");
      scale.set(hit ? 3.1 : 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [reduce, x, y, scale]);

  if (reduce) return null;
  return <motion.div aria-hidden className="cursor-dot" style={{ transform }} />;
}

/* ---------- magnetic wrapper ---------- */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 16, mass: 0.4 });

  if (reduce) return <>{children}</>;
  return (
    <motion.div
      ref={ref}
      className="inline-block"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- clip-path line reveal (obys-style) ---------- */
export function ClipLines({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  stagger = 0.12,
  onView = false,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  onView?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const go = onView ? inView : true;

  return (
    <span ref={ref} className={`block ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.09em] -mb-[0.09em]">
          <motion.span
            className={`block will-change-transform ${lineClassName}`}
            initial={reduce ? false : { y: "112%" }}
            animate={go ? { y: "0%" } : undefined}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 1.15, ease: EASE, delay: delay + i * stagger }
            }
          >
            {l}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ---------- generic reveal ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 30,
  className = "",
  amount = 0.3,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- section tag ---------- */
export function SectionTag({ num, label, dark }: { num: string; label: string; dark?: boolean }) {
  return (
    <Reveal y={18}>
      <div
        className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] ${
          dark ? "text-white/50" : "text-neutral-500"
        }`}
      >
        <span>{num}</span>
        <span className={`h-px w-10 ${dark ? "bg-white/30" : "bg-neutral-400"}`} />
        <span>{label}</span>
      </div>
    </Reveal>
  );
}

/* ---------- graphics ---------- */
export function ArrowUpRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M3.5 12.5L12.5 3.5M12.5 3.5H4.5M12.5 3.5V11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Asterisk({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarRing({ className = "h-8 w-8", text = "DESIGN × CODE × MOTION × " }: { className?: string; text?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <svg viewBox="0 0 100 100" className="h-full w-full spin-slow">
        <defs>
          <path id="ringPath" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-current" style={{ fontSize: 10.2, letterSpacing: "0.24em", fontFamily: "IBM Plex Mono, monospace" }}>
          <textPath href="#ringPath">{text}</textPath>
        </text>
      </svg>
      <Asterisk className="absolute inset-0 m-auto h-[30%] w-[30%]" />
    </div>
  );
}

export function BlurBlob({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full bg-neutral-400/50 blur-[100px] blob-drift ${className}`}
    />
  );
}

/* ---------- rotating circular CTA badge ---------- */
export function OrbitBadge({
  href = "/contact",
  text = "LET'S TALK • LET'S TALK • ",
  className = "",
}: {
  href?: string;
  text?: string;
  className?: string;
}) {
  return (
    <a href={href} className={`group relative block h-28 w-28 md:h-36 md:w-36 ${className}`} aria-label="Let's talk">
      <svg viewBox="0 0 100 100" className="h-full w-full spin-slow text-[#0c0c0c] transition-transform duration-500 group-hover:scale-105">
        <defs>
          <path id="orbitPath" d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
        </defs>
        <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
        <text className="fill-current" style={{ fontSize: 9.4, letterSpacing: "0.3em", fontFamily: "IBM Plex Mono, monospace" }}>
          <textPath href="#orbitPath">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto flex h-[52%] w-[52%] items-center justify-center rounded-full bg-[#0c0c0c] text-white transition-transform duration-500 group-hover:scale-110">
        <ArrowUpRight className="h-5 w-5" />
      </span>
    </a>
  );
}
