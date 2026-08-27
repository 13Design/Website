import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ArrowUpRight, KGrain, Magnetic, Reveal, SectionTag } from "../sections/shared";
import { Field, HeroRing, Honeypot, PageHero, SentPanel, SubmitNote, fieldCls, mailtoFromForm } from "../sections/pagekit";
import { contactInstructions, contactLookingFor, contactStages } from "../data/content";
import { supabase } from "../lib/supabase";
import { useHead } from "../lib/head";
import { trackConversion } from "../lib/consent";

const SHARE_POINTS = [
  "Your company or product name",
  "Where your product is today",
  "What kind of help you're looking for",
  "What challenges you are facing",
  "What's coming up — a raise, launch, or growth push",
  "A link to the live product, if you have one",
];

export default function Contact() {
  useHead({
    title: "Contact",
    description:
      "Tell us where your product is today and what's coming up. A direct, honest conversation — we reply within one business day.",
  });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const data = new FormData(e.currentTarget);

    // Honeypot — bots fill this hidden field; humans never do. Feign success.
    if (String(data.get("contact_ref") || "").trim() !== "") {
      setSent(true);
      return;
    }

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      product_url: String(data.get("product_url") || "").trim(),
      stage: String(data.get("stage") || "").trim(),
      looking_for: String(data.get("looking_for") || "").trim(),
      challenges: String(data.get("challenges") || "").trim(),
      whats_next: String(data.get("whats_next") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email) {
      setError("Please add your name and email so we can reply.");
      return;
    }
    setError("");

    // No backend configured (e.g. a preview build) → open the email client.
    if (!supabase) {
      window.location.href = mailtoFromForm("New inquiry — 13 Design Studio", [
        ["Name", payload.name],
        ["Email", payload.email],
        ["Company", payload.company],
        ["Product URL", payload.product_url],
        ["Stage", payload.stage],
        ["Looking for", payload.looking_for],
        ["Challenges", payload.challenges],
        ["What's next", payload.whats_next],
        ["Message", payload.message],
      ]);
      trackConversion();
      setSent(true);
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("contact_inquiries").insert(payload);
    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong sending your message. Please try again, or email hello@13design.org.");
      return;
    }
    trackConversion();
    setSent(true);
  };

  return (
    <main>
      <PageHero
        kicker="01 — Contact"
        lines={[
          "Let's talk about",
          <em key="i" className="font-light italic text-black/50">your product.</em>,
        ]}
        lede="The best first step is a direct, honest conversation. No pitch deck, no fluff — just a clear assessment of where you stand and what it will take to reach the next level."
        aside={<HeroRing />}
      />

      {/* What to share */}
      <section className="relative border-t border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionTag num="02" label="What to share" />
            </div>
            <div className="lg:col-span-8">
              <Reveal>
                <p className="max-w-[56ch] text-[17px] leading-[1.7] text-black/65">
                  {contactInstructions}
                </p>
              </Reveal>
              <div className="mt-10 grid gap-x-14 sm:grid-cols-2">
                {SHARE_POINTS.map((item, i) => (
                  <Reveal key={i} delay={0.05 * i}>
                    <div className="flex items-start gap-4 border-t border-black/10 py-5">
                      <span className="font-mono2 mt-[3px] shrink-0 text-[11px] tracking-[0.2em] text-black/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15px] leading-[1.6] text-black/70">{item}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form + email */}
      <section className="relative overflow-hidden border-t border-black/10 bg-[#e9e9e9]">
        <KGrain />
        <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* left — email card */}
            <div className="lg:col-span-4">
              <SectionTag num="03" label="Or email us" />
              <Reveal delay={0.1} className="mt-8">
                <a
                  href="mailto:hello@13design.org"
                  className="group block rounded-[24px] border border-black/12 bg-white/70 p-7 backdrop-blur transition-colors duration-300 hover:border-black/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-black text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </div>
                  <h3 className="font-display mt-5 text-[20px] font-medium tracking-[-0.02em]">Email us</h3>
                  <p className="mt-2 text-[14px] leading-[1.65] text-black/55">
                    Prefer to write it out? Send the details and we'll reply within one business day.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[14px] text-black/75 transition-all duration-300 group-hover:gap-3 group-hover:text-black">
                    hello@13design.org
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="font-mono2 mt-8 text-[11px] uppercase leading-[1.9] tracking-[0.2em] text-black/40">
                  Vinnytsia, Ukraine
                  <br />
                  Founders everywhere
                  <br />
                  <span className="inline-flex items-center gap-2">
                    <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-black" />
                    Replies within one business day
                  </span>
                </p>
              </Reveal>
            </div>

            {/* right — form */}
            <div className="lg:col-span-8">
              <Reveal delay={0.1}>
                {sent ? (
                  <>
                    <SentPanel
                      title="Message received."
                      body="Thank you. We read every message personally and reply within one business day, and take it from there."
                    />
                    <p className="mt-6 text-center">
                      <Link to="/" className="link-line font-mono2 text-[12px] uppercase tracking-[0.2em] text-black/55 hover:text-black">
                        ← Back to home
                      </Link>
                    </p>
                  </>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-[28px] border border-black/12 bg-white/60 p-7 backdrop-blur lg:p-10"
                  >
                    <Honeypot />
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label="Name" htmlFor="ct-name" required>
                        <input id="ct-name" name="name" required placeholder="Jordan Lee" className={fieldCls} autoComplete="name" />
                      </Field>
                      <Field label="Email" htmlFor="ct-email" required>
                        <input id="ct-email" name="email" type="email" required placeholder="jordan@company.com" className={fieldCls} autoComplete="email" />
                      </Field>
                      <Field label="Company" htmlFor="ct-company">
                        <input id="ct-company" name="company" placeholder="Company Inc." className={fieldCls} autoComplete="organization" />
                      </Field>
                      <Field label="Product URL" htmlFor="ct-url" hint="A link to the live product is often the most valuable starting point.">
                        <input id="ct-url" name="product_url" type="url" placeholder="https://yourproduct.com" className={fieldCls} />
                      </Field>
                      <Field label="Where is the product today?" htmlFor="ct-stage">
                        <select id="ct-stage" name="stage" defaultValue="" className={fieldCls}>
                          <option value="" disabled>Choose one</option>
                          {contactStages.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="What are you looking for?" htmlFor="ct-looking">
                        <select id="ct-looking" name="looking_for" defaultValue="" className={fieldCls}>
                          <option value="" disabled>Choose one</option>
                          {contactLookingFor.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="What challenges are you facing?" htmlFor="ct-challenges">
                          <textarea id="ct-challenges" name="challenges" rows={3} placeholder="What's not working, or what's costing you users?" className={`${fieldCls} resize-none`} />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="What's coming up?" htmlFor="ct-next" hint="A raise, a launch, a growth push — the moment this work needs to serve.">
                          <input id="ct-next" name="whats_next" placeholder="e.g. Raising our seed round in Q4" className={fieldCls} />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Anything else?" htmlFor="ct-message">
                          <textarea id="ct-message" name="message" rows={4} placeholder="Context, links, timelines — anything that helps." className={`${fieldCls} resize-none`} />
                        </Field>
                      </div>
                    </div>

                    {error && (
                      <p role="alert" className="mt-6 text-[13px] leading-[1.5] text-[#b23b3b]">
                        {error}
                      </p>
                    )}

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
                      <SubmitNote />
                      <Magnetic strength={0.18}>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="group inline-flex items-center gap-3 rounded-full border border-black bg-black px-8 py-4 text-[15px] font-medium text-white transition-colors duration-300 hover:bg-transparent hover:text-black disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-black disabled:hover:text-white"
                        >
                          {submitting ? "Sending…" : "Send message"}
                          <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </button>
                      </Magnetic>
                    </div>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
