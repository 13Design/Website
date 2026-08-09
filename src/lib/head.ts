import { useEffect } from "react";

const SITE = "13 Design Studio";
const HOME_TITLE = `${SITE} — Product design for AI-native & AI-built products`;
const BASE_URL = "https://13design.org";

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

/**
 * Per-route document head. Sets the title, description, canonical, and OG/Twitter
 * title+url+description so client-side navigation and JS-capable crawlers get
 * route-specific metadata. `title` "" keeps the full homepage title; `path`
 * defaults to the current location.
 */
export function useHead({
  title,
  description,
  path,
}: {
  title?: string;
  description?: string;
  path?: string;
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE}` : HOME_TITLE;
    const url = BASE_URL + (path ?? (typeof window !== "undefined" ? window.location.pathname : "/"));

    document.title = fullTitle;
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setCanonical(url);

    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
      setMeta('meta[property="og:description"]', "property", "og:description", description);
      setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    }
  }, [title, description, path]);
}
