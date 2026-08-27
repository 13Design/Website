import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router";
import { EASE } from "./shared";
import { getConsent, grantConsent, denyConsent, initConsentedTracking } from "../lib/consent";

/**
 * A single, honest ask before any ad tracking loads. The site is fully usable
 * whether you accept or decline — declining just means the X conversion pixel
 * never loads. The choice is remembered, so this shows only until it's made.
 */
export default function ConsentBanner() {
  const reduce = useReducedMotion();
  // Only prompt people who haven't chosen yet (client-only SPA — safe at init).
  const [open, setOpen] = useState(() => getConsent() === null);

  useEffect(() => {
    // Load the pixel again on return visits where consent was already granted.
    initConsentedTracking();
  }, []);

  const accept = () => {
    grantConsent();
    setOpen(false);
  };
  const decline = () => {
    denyConsent();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label="Ad measurement consent"
          aria-live="polite"
          className="fixed inset-x-3 bottom-3 z-[140] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[420px]"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="rounded-[22px] border border-black/12 bg-white/85 p-6 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.35)] backdrop-blur">
            <p className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-black/40">
              Ad measurement
            </p>
            <p className="mt-3 text-[14px] leading-[1.65] text-black/70">
              With your OK, we load X's conversion pixel to see which campaigns bring founders
              here. It sets a cookie and reports back to X. Decline and it never loads — the site
              works exactly the same. Traffic counts stay cookieless either way.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={accept}
                className="inline-flex items-center rounded-full border border-black bg-black px-6 py-3 text-[14px] font-medium text-white transition-colors duration-300 hover:bg-transparent hover:text-black"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={decline}
                className="inline-flex items-center rounded-full border border-black/15 px-6 py-3 text-[14px] font-medium text-black/70 transition-colors duration-300 hover:border-black/40 hover:text-black"
              >
                Decline
              </button>
              <Link
                to="/privacy"
                onClick={() => setOpen(false)}
                className="link-line font-mono2 ml-auto text-[11px] uppercase tracking-[0.2em] text-black/45 hover:text-black"
              >
                Privacy →
              </Link>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
