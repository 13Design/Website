import { useState, type FormEvent } from "react";
import { ArrowUpRight, Asterisk, KGrain, Magnetic, Reveal, SectionTag } from "../sections/shared";
import { Field, HeroRing, Honeypot, NumberedRow, PageHero, SentPanel, SubmitNote, fieldCls, mailtoFromForm } from "../sections/pagekit";
import {
  foundingHowItWorks,
  foundingStages,
  foundingTimelines,
  foundingWhoFor,
  foundingYouGet,
} from "../data/content";
import { supabase } from "../lib/supabase";

export default function FoundingClients() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const data = new FormData(e.currentTarget);

    // Honeypot — bots fill this hidden field; humans never do. Feign success.
    if (String(data.get("company_website") || "").trim() !== "") {
      setSent(true);
      return;
    }

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      product_name: String(data.get("product_name") || "").trim(),
      product_url: String(data.get("product_url") || "").trim(),
      product_kind: String(data.get("stage") || "").trim(),
      what_feels_off: String(data.get("what_feels_off") || "").trim(),
      timeline: String(data.get("timeline") || "").trim(),
    };

    if (!payload.name || !payload.email) {
      setError("Please add your name and email so we can reply.");
      return;
    }
    setError("");

    // No backend configured (e.g. a preview build) → open the email client.
    if (!supabase) {
      window.location.href = mailtoFromForm("Founding client application — 13 Design Studio", [
        ["Name", payload.name],
        ["Email", payload.email],
        ["Company / product", payload.product_name],
        ["Link to live product", payload.product_url],
        ["Stage", payload.product_kind],
        ["Timeline", payload.timeline],
        ["Most pressing problem", payload.what_feels_off],
      ]);
      setSent(true);
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("founder_inquiries").insert(payload);
    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong sending your application. Please try again, or email hello@13design.org.");
      return;
    }
    setSent(true);
  };

  return (
    <main>
      <PageHero
        kicker="01 — Founding clients"
        lines={[
          "We're taking on a small",
          "number of",
          <em key="i" className="font-light italic text-black/50">founding clients.</em>,
        ]}
        lede="13 Design Studio is relaunching. Rather than pad this site with borrowed credibility, we're being direct about it — and looking for a handful of teams to build the first case studies with, on terms that reflect that."
        aside={<HeroRing />}
      />

      {/* What it means */}
      <section className="relative border-t border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionTag num="02" label="What it means" />
            </div>
            <div className="lg:col-span-8">
              <ul className="space-y-0">
                {foundingYouGet.map((item, i) => (
                  <Reveal key={i} delay={0.06 * i}>
                    <li className="flex items-start gap-5 border-t border-black/10 py-6">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/25"
                      >
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
                          <path d="M2 6.5 4.8 9 10 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="max-w-[58ch] text-[16.5px] leading-[1.65] text-black/75">{item}</span>
                    </li>
                  </Reveal>
                ))}
              </ul>
              <div className="border-t border-black/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Who we're looking for — dark grain */}
      <section className="on-ink relative overflow-hidden border-t border-white/10 bg-[#0c0c0c] text-white">
        <KGrain dark />
        <Asterisk className="spin-slow pointer-events-none absolute -right-16 top-10 h-56 w-56 text-white/[0.06]" />
        <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <SectionTag num="03" label="Who we're looking for" dark />
          <ul className="mt-12 grid gap-x-14 md:grid-cols-2">
            {foundingWhoFor.map((item, i) => (
              <Reveal key={i} delay={0.06 * i}>
                <li className="flex items-start gap-5 border-t border-white/12 py-6">
                  <span className="font-mono2 mt-1 shrink-0 text-[12px] tracking-[0.2em] text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[16.5px] leading-[1.65] text-white/75">{item}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <SectionTag num="04" label="How it works" />
          <div className="mt-12">
            {foundingHowItWorks.map((s, i) => (
              <NumberedRow key={s.n} n={s.n} title={s.title} body={s.body} delay={0.05 * i} />
            ))}
            <div className="border-t border-black/10" />
          </div>
        </div>
      </section>

      {/* Apply */}
      <section className="relative overflow-hidden border-t border-black/10 bg-[#e9e9e9]">
        <KGrain />
        <div className="relative z-[4] mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <SectionTag num="05" label="Apply" />
              <Reveal delay={0.1} className="mt-8">
                <p className="max-w-[34ch] text-[15.5px] leading-[1.7] text-black/55">
                  This is where it starts. Tell us about your product, and be one of the first names
                  on our Work page — the ones we'll be proud of.
                </p>
              </Reveal>
              <Reveal delay={0.2} className="mt-8">
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
                  <h3 className="font-display mt-5 text-[20px] font-medium tracking-[-0.02em]">
                    Prefer email?
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.65] text-black/55">
                    Send the same details to our inbox — it lands in the same queue, read by the same
                    people.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[14px] text-black/75 transition-all duration-300 group-hover:gap-3 group-hover:text-black">
                    hello@13design.org
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Reveal delay={0.1}>
                {sent ? (
                  <SentPanel
                    title="Application received."
                    body="Thank you. We read every submission personally and reply within a few days with a link to book a short call."
                  />
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-[28px] border border-black/12 bg-white/60 p-7 backdrop-blur lg:p-10"
                  >
                    <Honeypot />
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label="Name" htmlFor="fc-name" required>
                        <input id="fc-name" name="name" required placeholder="Jordan Lee" className={fieldCls} autoComplete="name" />
                      </Field>
                      <Field label="Email" htmlFor="fc-email" required>
                        <input id="fc-email" name="email" type="email" required placeholder="jordan@company.com" className={fieldCls} autoComplete="email" />
                      </Field>
                      <Field label="Company / product name" htmlFor="fc-product">
                        <input id="fc-product" name="product_name" placeholder="What you're building" className={fieldCls} autoComplete="organization" />
                      </Field>
                      <Field label="Link to live product" htmlFor="fc-url">
                        <input id="fc-url" name="product_url" type="url" placeholder="https://yourproduct.com" className={fieldCls} />
                      </Field>
                      <Field label="What stage are you at?" htmlFor="fc-stage">
                        <select id="fc-stage" name="stage" defaultValue="" className={fieldCls}>
                          <option value="" disabled>Choose one</option>
                          {foundingStages.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Timeline" htmlFor="fc-timeline">
                        <select id="fc-timeline" name="timeline" defaultValue="" className={fieldCls}>
                          <option value="" disabled>Choose one</option>
                          {foundingTimelines.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="What's the most pressing problem right now?" htmlFor="fc-off">
                          <textarea
                            id="fc-off"
                            name="what_feels_off"
                            rows={4}
                            placeholder="The one or two things that matter most right now."
                            className={`${fieldCls} resize-none`}
                          />
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
                          {submitting ? "Sending…" : "Apply as a founding client"}
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
