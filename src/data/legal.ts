export type LegalSection = { n: string; title: string; body: string[] };

/* Terms of engagement — the plain-language working agreement. */
export const workingAgreement: LegalSection[] = [
  {
    n: "01",
    title: "Who you're working with",
    body: [
      "The design services on this site are provided by Larysa Benedyk, a sole proprietor based in Vinnytsia, Ukraine, trading as 13 Design Studio (“we”, “us”). You can reach us any time at hello@13design.org.",
      "This sets out how we work with clients — what you own, how we handle confidentiality, when we show work publicly, and the law that governs it. It applies to every engagement unless we've signed something that says otherwise.",
      "It is the plain-language version of what a contract would say. Where a client needs the full document, we sign theirs or provide ours.",
    ],
  },
  {
    n: "02",
    title: "You own the work once it is paid for",
    body: [
      "Everything we design for you — the flows, the screens, the source files, the final deliverables — becomes yours once the work it belongs to is paid for in full. Until then, we retain ownership of it.",
      "That is not a trap; it is the one piece of leverage a studio has, and it only ever matters if an invoice goes unpaid. Fonts, stock, and third-party tools keep whatever licence they came with — we will always flag anything that is not ours to hand over.",
    ],
  },
  {
    n: "03",
    title: "Confidentiality runs both ways",
    body: [
      "By default, each of us keeps the other's non-public information private — your product, your roadmap, your metrics, and anything we see while working. That default is in place from the first conversation, so you can talk to us about a pre-launch or stealth product without paperwork first.",
      "If your company has its own NDA, we will sign it.",
    ],
  },
  {
    n: "04",
    title: "Showing our work",
    body: [
      "We build our reputation on the work we do, so being able to show it matters — but never at your expense.",
      "Founding clients agree upfront that we can publish their work as a case study; that consent is part of the founding-client terms, and part of why those spots are priced the way they are. For everyone else, we ask in writing before anything goes public, and we hold work back for as long as you need us to.",
    ],
  },
  {
    n: "05",
    title: "What we promise, and the limits",
    body: [
      "We do the work with professional care and skill, and we stand behind it. What we cannot promise is a specific business outcome: design moves the numbers, but so do a dozen things outside our hands.",
      "To the extent the law allows, we are not liable for indirect or consequential losses — lost profit, lost revenue, lost data caused by tools we do not control — and our total liability for any engagement is limited to the fees you paid us for it. None of this cuts into rights you have under mandatory consumer law, which always come first.",
    ],
  },
  {
    n: "06",
    title: "Changes to these terms",
    body: [
      "We may update these terms as the studio evolves — a new service, a clearer clause, a change the law requires. The current version always lives on this page, dated by its last change.",
      "If a change materially affects an active engagement, we tell you directly rather than expecting you to notice. Continuing to work with us after an update means the updated terms apply.",
    ],
  },
  {
    n: "07",
    title: "The law that governs this",
    body: [
      "This agreement is governed by the law of Ukraine, where the studio is based. If a dispute ever comes up that we cannot resolve directly, that is the jurisdiction it is settled in.",
      "We would always rather sort it out over a call first.",
    ],
  },
];

/* Privacy policy — plain-language version of what we hold and why. */
export const privacyPolicy: LegalSection[] = [
  {
    n: "01",
    title: "Who is responsible for your data",
    body: [
      "This site is run by 13 Design Studio, the trading name of Larysa Benedyk, a sole proprietor based in Vinnytsia, Ukraine. For anything you share with us here, we are the data controller.",
      "If you ever want to reach a human about your data — what we hold, or to have it changed or removed — email hello@13design.org. A real person answers, usually within one business day.",
    ],
  },
  {
    n: "02",
    title: "What we collect, and what we do not",
    body: [
      "From the contact and founding-client forms: your name, email, and whatever you choose to tell us — your company, your product link, your timeline, and the message itself. Nothing on those forms is required beyond what it takes to reply to you.",
      "We do not buy data about you, we run no advertising profiling of our own, and we do not ask for anything we do not need to do the work. There is one optional exception, and it is off unless you turn it on: if you accept ad measurement, X (Twitter) is told when you complete our contact form — the details are under “Cookies and tracking” below.",
    ],
  },
  {
    n: "03",
    title: "The tools we use to run this",
    body: [
      "We keep the stack small and name it plainly. Each of these processes some data on our behalf, under its own security terms:",
      "Netlify hosts the site. Supabase stores form submissions. Resend sends our email (our reply to you). Cloudflare provides privacy-first, cookieless web analytics — aggregate page counts only, no cookies and no profile of you. Our typefaces are served from the page, so loading it shares nothing beyond that with a font provider.",
      "One more only enters the picture if you opt in: X (Twitter) provides ad-conversion measurement. Nothing from X loads, and X learns nothing about you, unless you accept ad measurement — see the next section.",
      "Each of these has its own privacy policy governing what it does with data it processes.",
    ],
  },
  {
    n: "04",
    title: "Cookies and tracking",
    body: [
      "Our default is quiet. For traffic numbers we use Cloudflare Web Analytics, which is cookieless and measures pages in aggregate only — it never sets a cookie or builds a profile of you, and it runs whether or not you accept anything below.",
      "The one thing that can set a cookie is optional and stays off until you choose it: X's (Twitter's) conversion pixel. If you accept ad measurement, it loads, sets a cookie, and reports to X when you complete our contact form, so we can see which campaigns bring founders here. We do not send your email address or any of your form answers to X. If you decline — or simply never choose — it never loads, no cookie is set, and the site works exactly the same.",
      "That optional pixel is why you see a short banner on your first visit. You can change your choice any time from the “Ad measurement” control at the bottom of our Privacy page, or by emailing hello@13design.org. Apart from that one opt-in, there is nothing non-essential to consent to.",
    ],
  },
  {
    n: "05",
    title: "Why we are allowed to hold it",
    body: [
      "When you send a form, we rely on your consent and on our legitimate interest in answering you.",
      "We may also process limited data to keep the site secure and working, and keep certain records where tax and accounting law requires it.",
    ],
  },
  {
    n: "06",
    title: "How long we keep it",
    body: [
      "Inquiry data lives only as long as it is useful — while we are talking, and for a reasonable window after in case you come back. If a conversation goes nowhere, we clear it out.",
      "You can ask us to delete your data at any time — see your rights below.",
    ],
  },
  {
    n: "07",
    title: "Where your data goes",
    body: [
      "Some of the tools above are based in, or store data in, the United States. Where your information is transferred outside the EEA, it is covered by the safeguards those providers offer — standard contractual clauses and equivalent mechanisms.",
      "We do not transfer your data to anyone for their own independent use, and we never sell it.",
    ],
  },
  {
    n: "08",
    title: "Your rights over your data",
    body: [
      "You can ask us for a copy of what we hold, to correct it, to delete it, to limit what we do with it, or to receive it in a portable form. You can withdraw consent at any time, and object to processing we base on legitimate interest.",
      "To exercise any of these, email hello@13design.org — no special form, just ask. If you are in the EU or UK and think we have handled your data poorly, you have the right to complain to your local data-protection supervisory authority. If you are in Ukraine, where the studio is based, you may contact the Ukrainian Parliament Commissioner for Human Rights (the Ombudsman).",
    ],
  },
  {
    n: "09",
    title: "How we protect it",
    body: [
      "Data sits behind access controls with the providers named above; our database is locked down so the public forms can write to it but not read anything back.",
      "No system is perfect, but we keep the surface small on purpose — the less we collect and the fewer places it lives, the less there is to go wrong.",
    ],
  },
  {
    n: "10",
    title: "Changes, and how to reach us",
    body: [
      "If this policy changes, the current version always lives on this page. For anything about your data — a question, a request, or a concern — email hello@13design.org.",
      "This is the plain-language version of how we handle data day to day; it is written to be read, not to hide anything in the small print.",
    ],
  },
];
