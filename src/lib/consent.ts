/**
 * Consent-gated X (Twitter) Ads conversion tracking.
 *
 * The site's privacy stance is "nothing loads that follows you off the page
 * unless you say yes." So the X base pixel (twq('config', …)) is NOT in
 * index.html — it is injected here, once, and only after the visitor grants
 * consent. Until then nothing from ads-twitter.com is requested and no cookie
 * is set. Declining is sticky and the pixel never loads.
 *
 * The conversion event tag is `tw-<pixelId>-<eventId>`; the pixel id is the
 * middle token, so the base config id is derived from the event tag by default.
 */

const EVENT_TAG =
  (import.meta.env.VITE_X_EVENT_ID as string | undefined) ?? "tw-reoqk-reqjq";

// `tw-reoqk-reqjq` → config id `reoqk`
const PIXEL_ID =
  (import.meta.env.VITE_X_PIXEL_ID as string | undefined) ??
  EVENT_TAG.split("-")[1] ??
  "";

const CONSENT_KEY = "td:consent:x-ads"; // "granted" | "denied"
const PENDING_KEY = "td:consent:x-ads:pending-conversion"; // "1" while a conversion waits on consent

export type ConsentValue = "granted" | "denied";

type Twq = ((command: string, ...args: unknown[]) => void) & {
  version?: string;
  queue?: unknown[];
  exe?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    twq?: Twq;
  }
}

function safeGet(store: Storage | undefined, key: string): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSet(store: Storage | undefined, key: string, value: string): void {
  try {
    store?.setItem(key, value);
  } catch {
    /* private mode / storage disabled — nothing to do */
  }
}

function safeRemove(store: Storage | undefined, key: string): void {
  try {
    store?.removeItem(key);
  } catch {
    /* ignore */
  }
}

const ls = (): Storage | undefined =>
  typeof window !== "undefined" ? window.localStorage : undefined;
const ss = (): Storage | undefined =>
  typeof window !== "undefined" ? window.sessionStorage : undefined;

/** Returns the stored choice, or null if the visitor hasn't decided yet. */
export function getConsent(): ConsentValue | null {
  const v = safeGet(ls(), CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

let pixelLoaded = false;

/** Inject the X base pixel exactly once. Called only after consent is granted. */
function loadPixel(): void {
  if (pixelLoaded || !PIXEL_ID || typeof document === "undefined") return;
  pixelLoaded = true;

  // Official X (uwt.js) bootstrap — queues commands until the script loads.
  const w = window;
  if (!w.twq) {
    const twq = function (...args: unknown[]) {
      if (twq.exe) twq.exe(...args);
      else twq.queue!.push(args);
    } as Twq;
    twq.version = "1.1";
    twq.queue = [];
    w.twq = twq;

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://static.ads-twitter.com/uwt.js";
    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(s, first);
  }

  w.twq!("config", PIXEL_ID);
}

/** Grant consent: persist it, load the pixel, and flush any pending conversion. */
export function grantConsent(): void {
  safeSet(ls(), CONSENT_KEY, "granted");
  loadPixel();
  if (safeGet(ss(), PENDING_KEY) === "1") {
    safeRemove(ss(), PENDING_KEY);
    fireConversion();
  }
}

/** Decline: persist it and ensure nothing loads. */
export function denyConsent(): void {
  safeSet(ls(), CONSENT_KEY, "denied");
  safeRemove(ss(), PENDING_KEY);
}

function fireConversion(): void {
  if (typeof window === "undefined" || !window.twq) return;
  // email_address stays null by design — we do not send hashed visitor email
  // to X for ad matching. Populating it would be a separate, deliberate choice.
  window.twq("event", EVENT_TAG, { email_address: null });
}

/**
 * Record a completed inquiry as an X conversion.
 *  - consent granted  → fire now
 *  - not decided yet   → remember it; fire if/when they accept this session
 *  - declined          → do nothing
 */
export function trackConversion(): void {
  const consent = getConsent();
  if (consent === "granted") {
    loadPixel(); // no-op if already loaded (e.g. reload after grant)
    fireConversion();
  } else if (consent === null) {
    safeSet(ss(), PENDING_KEY, "1");
  }
  // denied → intentionally nothing
}

/** On boot, if consent was already granted in a prior visit, load the pixel. */
export function initConsentedTracking(): void {
  if (getConsent() === "granted") loadPixel();
}

/**
 * Clear a prior choice so the visitor can decide again. A pixel already loaded
 * this page can only stop after a reload, so callers should reload afterwards.
 */
export function resetConsent(): void {
  safeRemove(ls(), CONSENT_KEY);
  safeRemove(ss(), PENDING_KEY);
}
