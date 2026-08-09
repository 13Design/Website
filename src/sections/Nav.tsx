import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Asterisk, EASE, Magnetic } from "./shared";

const LINKS = [
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Work", to: "/work" },
  { label: "Founding clients", to: "/founding-clients" },
];

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="13 Design Studio — home">
      <Asterisk className="h-5 w-5 transition-transform duration-700 group-hover:rotate-180" />
      <span className="font-display text-[19px] font-semibold leading-none tracking-tight">13</span>
      <span className="font-mono2 hidden text-[10px] uppercase tracking-[0.32em] text-black/50 transition-colors duration-300 group-hover:text-black sm:block">
        Design Studio
      </span>
    </Link>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* scroll progress */}
      <motion.div
        aria-hidden="true"
        className="fixed left-0 top-0 z-[85] h-[2px] w-full origin-left bg-black"
        style={{ scaleX: progress }}
      />

      <header className="fixed inset-x-0 top-0 z-[75] px-3 pt-3 sm:px-5 sm:pt-4">
        <motion.nav
          aria-label="Primary"
          initial={reduce ? false : { y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className={`mx-auto flex max-w-[1440px] items-center justify-between rounded-full px-4 py-3 transition-all duration-500 sm:px-6 ${
            scrolled
              ? "border border-black/10 bg-white/70 shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl"
              : "border border-transparent bg-transparent"
          }`}
        >
          <Logo />

          <ul className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => (
              <li key={l.label}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `link-line font-mono2 text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 hover:text-black ${
                      isActive ? "text-black" : "text-black/55"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Magnetic strength={0.25}>
              <Link
                to="/contact"
                className="group hidden items-center gap-2 rounded-full border border-black bg-black px-5 py-2.5 text-[13px] font-medium text-white transition-colors duration-300 hover:bg-transparent hover:text-black sm:inline-flex"
              >
                Contact us
              </Link>
            </Magnetic>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/60 backdrop-blur transition-colors hover:border-black/50 lg:hidden"
            >
              <span
                aria-hidden="true"
                className={`absolute h-px w-4 bg-black transition-transform duration-300 ${
                  open ? "translate-y-0 rotate-45" : "-translate-y-[3.5px]"
                }`}
              />
              <span
                aria-hidden="true"
                className={`absolute h-px w-4 bg-black transition-transform duration-300 ${
                  open ? "translate-y-0 -rotate-45" : "translate-y-[3.5px]"
                }`}
              />
            </button>
          </div>
        </motion.nav>
      </header>

      {/* mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-[70] flex flex-col justify-between overflow-hidden bg-[#f1f1f1]/95 px-6 pb-10 pt-28 backdrop-blur-2xl"
          >
            <div className="kgrain on-light" aria-hidden="true" />
            <nav aria-label="Mobile" className="relative">
              <ul className="flex flex-col">
                {[{ label: "Home", to: "/" }, ...LINKS, { label: "Contact us", to: "/contact" }].map(
                  (l, i) => (
                    <li key={l.label} className="overflow-hidden border-b border-black/10">
                      <motion.div
                        initial={{ y: reduce ? 0 : "110%" }}
                        animate={{ y: 0 }}
                        exit={{ y: reduce ? 0 : "110%" }}
                        transition={{ duration: 0.7, delay: 0.08 + i * 0.06, ease: EASE }}
                      >
                        <Link to={l.to} className="flex items-baseline justify-between py-5">
                          <span className="font-display text-4xl font-medium tracking-tight">
                            {l.label}
                          </span>
                          <span className="font-mono2 text-[11px] text-black/40">
                            0{i + 1}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  )
                )}
              </ul>
            </nav>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
              className="font-mono2 relative text-[11px] uppercase tracking-[0.25em] text-black/40"
            >
              Vinnytsia — working with founders everywhere
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
