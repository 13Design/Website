export type Audience = 'ai-native' | 'existing' | 'either';

export type Service = {
  id: string;
  name: string;
  audience: Audience;
  tag?: string;
  body: string;
};

export const services: Service[] = [
  // AI-native
  {
    id: 'ai-ux-product-design',
    name: 'AI UX & Product Design',
    audience: 'ai-native',
    tag: 'sprint · subscription · embedded',
    body: 'Interaction design for AI-native features — confidence and uncertainty states, human-in-the-loop controls, agent handoff, the moments a user decides whether to trust the output.',
  },
  {
    id: 'product-point-of-view',
    name: 'Product Point of View',
    audience: 'ai-native',
    tag: 'project-based',
    body: "A visual language distinct from the default AI-SaaS look. Product identity as a competitive moat, built for a product that's supposed to look like nobody else's.",
  },
  {
    id: 'strategy-product-direction',
    name: 'Strategy & Product Direction',
    audience: 'ai-native',
    tag: 'sprint · embedded',
    body: 'Working through what to build and in what order, before design starts — the decisions that determine whether the rest of the work matters.',
  },
  // Existing product
  {
    id: 'ai-integration-ux',
    name: 'AI Integration UX',
    audience: 'existing',
    tag: 'sprint · subscription · embedded',
    body: "Designing how a new AI feature sits inside a product that already has users, habits, and expectations — so it feels native to the product, not bolted on.",
  },
  {
    id: 'ux-rescue-sprint',
    name: 'UX Rescue Sprint',
    audience: 'existing',
    tag: 'fixed price · 1–2 weeks',
    body: "Audit against real user behavior. A prioritized list of what's actually costing you users. We fix the top offenders live, inside the sprint, and leave you a roadmap for what's next.",
  },
  {
    id: 'product-finishing',
    name: 'Product Finishing',
    audience: 'existing',
    tag: '2–4 weeks',
    body: "Whole-flow coherence: onboarding, checkout, settings, permissions. The states AI-assisted builds tend to skip — empty, loading, error, edge case. Ready to demo or onboard real customers without breaking.",
  },
  {
    id: 'design-system-maintenance',
    name: 'Design System & Ongoing Maintenance',
    audience: 'existing',
    tag: 'project-based · subscription',
    body: 'Components, spacing, tokens, and hand-off specs — so every new feature still looks like the same product as you keep shipping.',
  },
  // Either
  {
    id: 'in-team-designer',
    name: 'In-Team Designer',
    audience: 'either',
    body: "Extra design hands inside your team's process — your tools, your standups, your sprint cycles — for a specific project or a defined stretch of time. You set the direction; we execute. No hire, no recruiting cycle.",
  },
  {
    id: 'ux-audit-pre-raise',
    name: 'UX Audit Before a Raise or Launch',
    audience: 'either',
    body: 'A diagnostic tied directly to money on the line. Find where users fall out before investors or the market see it, with a prioritized, evidence-based fix plan.',
  },
  {
    id: 'fractional-product-partner',
    name: 'Fractional Product Partner',
    audience: 'either',
    tag: 'subscription',
    body: "A part-time design and product lead, ongoing — we help decide what to build and in what order, and keep it coherent as your team and product grow. On the pricing page this is the Embedded tier: same thing, month-to-month.",
  },
];

export const audienceGroups: {
  id: Audience;
  label: string;
  blurb: string;
  audienceServices: string[];
}[] = [
  {
    id: 'ai-native',
    label: "Teams building AI-native products",
    blurb:
      "A startup or new venture with AI at the center — an agent, a model, a workflow that acts on someone's behalf. You need the interaction design that generic UI patterns don't have answers for: trust, uncertainty, handoff, control.",
    audienceServices: ['ai-ux-product-design', 'product-point-of-view', 'strategy-product-direction'],
  },
  {
    id: 'existing',
    label: "Businesses adding AI to an existing product",
    blurb:
      "A mature business bringing AI into the core of an existing product — new features, new workflows, a genuine shift in what the product does. You need it designed with the same care as the rest of the product, not bolted on.",
    audienceServices: ['ai-integration-ux', 'ux-rescue-sprint', 'product-finishing', 'design-system-maintenance'],
  },
  {
    id: 'either',
    label: "For either",
    blurb:
      "Some of what we do applies regardless of where you're starting from — and these are the engagements that move between both worlds.",
    audienceServices: ['in-team-designer', 'ux-audit-pre-raise', 'fractional-product-partner'],
  },
];

export type ProcessStep = { n: string; title: string; body: string };

export const processSteps: ProcessStep[] = [
  {
    n: '1',
    title: 'Frame the problem before touching a screen',
    body: "Most design problems are decision problems wearing a costume. We get clear on what's actually happening before we design anything.",
  },
  {
    n: '2',
    title: 'Explore widely, decide deliberately',
    body: 'We draw on our own expertise to move fast through real options — not a single first idea. The value we add is choosing: keeping what\'s right for your users and your stage, and having a real reason for the rest.',
  },
  {
    n: '3',
    title: 'Design for coherence, not just for the next screen',
    body: 'A product should feel like one decision, made consistently, not a series of separate features stitched together. We design flows and systems, not isolated screens.',
  },
  {
    n: '4',
    title: "Stay in the work long enough to learn your taste",
    body: "The longer we work with a team, the better the decisions get — because we understand what \"right\" means for that specific product and that specific audience. That's why most relationships move toward ongoing work.",
  },
];

export type PricingRow = {
  engagement: string;
  whatItIs: string;
  investment: string;
};

export const pricingRows: PricingRow[] = [
  { engagement: 'UX Rescue Sprint', whatItIs: 'Fixed-scope audit + top fixes, 1–2 weeks', investment: 'Sprint' },
  { engagement: 'Product Finishing', whatItIs: 'Whole-flow coherence, 2–4 weeks', investment: 'Sprint' },
  { engagement: 'AI UX & Product Design', whatItIs: 'Interaction design for AI-native features', investment: 'Sprint / Subscription / Embedded' },
  { engagement: 'AI Integration UX', whatItIs: 'Designing AI into an existing product', investment: 'Sprint / Subscription / Embedded' },
  { engagement: 'Design System & Maintenance', whatItIs: 'System + hand-off specs, ongoing upkeep', investment: 'Sprint / Subscription' },
  { engagement: 'UX Audit (pre-raise / pre-launch)', whatItIs: 'Diagnostic + prioritized fix plan', investment: 'Sprint' },
  { engagement: 'In-Team Designer', whatItIs: 'Our expertise inside your team, no hire', investment: 'Embedded' },
  { engagement: 'Fractional Product Partner', whatItIs: 'Part-time design + product lead', investment: 'Subscription' },
];

export type SubTier = {
  id: 'lite' | 'standard' | 'embedded';
  name: string;
  price: string;
  cadence: string;
  description: string;
  daysPerMonth: string;
  includes: string[];
  featured?: boolean;
  /** Purchasable directly via Stripe Checkout. Embedded is call-first. */
  selfServe?: boolean;
};

export type IncludedItem = { n: string; title: string; body: string };

export const subscriptionTiers: SubTier[] = [
  {
    id: 'lite',
    name: 'Lite',
    price: '$800',
    cadence: '/mo',
    daysPerMonth: 'Up to 5 days / month',
    description: 'Best for a product that\'s mostly stable but still needs someone watching it.',
    selfServe: true,
    includes: [
      'Coherence audits — a regular pass across the product to catch drift before it compounds',
      'Small UI fixes — spacing, states, inconsistencies that pile up between bigger releases',
      'Async support through your existing tools (Slack, Linear, Figma, etc.)',
      'One review call per month to walk through priorities',
      'Response within 2 business days on async requests',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$2,500',
    cadence: '/mo',
    daysPerMonth: 'Up to 12 days / month',
    description: 'Best for teams shipping new features on a regular cadence.',
    selfServe: true,
    includes: [
      'Everything in Lite',
      'New feature design — full flows, not just individual screens',
      'Ongoing design-system maintenance — components, tokens, and specs kept current as the product evolves',
      'Biweekly working session with your team',
      'Priority turnaround on time-sensitive requests',
    ],
    featured: true,
  },
  {
    id: 'embedded',
    name: 'Embedded',
    price: '$4,500',
    cadence: '/mo',
    daysPerMonth: 'Up to 20 days / month',
    description: "Our closest equivalent to a fractional hire — structured around your team's cadence.",
    includes: [
      'Everything in Standard',
      'A seat in product planning and roadmap discussions',
      'Direct input on what gets built and in what order, not just how it looks',
      'Weekly syncs, embedded in your existing rituals (standups, sprint planning, etc.)',
      'Ownership of design quality across the whole product, not just what\'s assigned',
    ],
  },
];

export const subscriptionIncludedAtEveryTier: IncludedItem[] = [
  {
    n: '01',
    title: 'Direct access to the person doing the work',
    body: 'No account layer, no relayed updates — you talk directly to the designer on your project.',
  },
  {
    n: '02',
    title: 'Async communication through your existing tools',
    body: 'Slack, Linear, Figma, or whatever your team already uses — we work inside your workflow, not a separate portal.',
  },
  {
    n: '03',
    title: 'Design system consistency across everything we touch',
    body: "Every fix, feature, or flow stays aligned to your existing components and tokens, so nothing we ship looks bolted on.",
  },
  {
    n: '04',
    title: 'Monthly check-in on priorities and scope',
    body: 'A recurring moment to re-align on what matters most that month, so the work stays pointed at what actually moves the product forward.',
  },
  {
    n: '05',
    title: 'Month-to-month terms',
    body: 'Adjust or cancel at the end of any month — no annual contract, no early-termination fee.',
  },
];

export const subscriptionHowItWorks =
  "You choose a tier based on how much ongoing design support your team needs. Each month, we work inside that scope — feature design, coherence upkeep, design system maintenance, or embedded product partnership, depending on the tier.";

export const subscriptionHowItWorksBody =
  'No open-ended hourly billing. No surprise invoices. A fixed monthly rate, confirmed before you start, that you can adjust or cancel as your needs change.';

export const subscriptionWhyInstead =
  "A single sprint can fix what's broken today. A subscription means the same judgment that fixed it stays in place as you keep shipping — so the product doesn't quietly drift back into inconsistency six months later.";

export const subscriptionWhyInsteadBody =
  "Most of our subscription clients started with a sprint or audit first, then moved to a subscription once we'd shown the value on something concrete. That's a sensible way to start if you're not sure yet.";

export const beliefs = [
  'The question has moved from "who can build it fast" to "who can make it exceptional."',
  'Good output is abundant now. Judgment, taste, and coherence are the layer that isn\'t.',
  "Design is decisive thinking, not just generation — deciding what a product should and shouldn't do.",
  'A product built only for what AI can do today is already out of date. We design with where this is going.',
];

export const honestPart = [
  "Everything we design, we design ourselves. No part of the actual work — the flows, the screens, the decisions — is generated. That's not a marketing line; it's the reason to hire us instead of a tool. If a project really is just \"make me five screens\" with no judgment required, a generation tool can do that faster and cheaper than we can, and we'll tell you that instead of taking the work anyway.",
  "The person assigned to your project is whoever's the right fit for the problem, not whoever's next in line. Your point of contact stays constant either way — one person, through the whole relationship, who knows your product and answers you directly.",
  "We'll disagree with you sometimes, out loud. If we think a direction is wrong for your users, we'll say so before we build it, not after — even when it's not what you wanted to hear.",
  "The first few weeks are slower than they look. We're learning your product, your users, and your taste before we're making fast, confident calls — and we'd rather be upfront about that ramp-up than pretend it doesn't exist.",
];

export const aboutStudio =
  "13 Design Studio has spent years working closely with innovative companies on user experience. We're relaunching around a new reality: AI didn't remove the need for that work — it changed which parts of it matter most.\n\nWe work with startups building something new, and with mature companies bringing AI into products that already exist. Different stage, same conviction: the products that win are the ones a human actually thought through.";

export const aboutPositioning = "We're passionate about what's next.";

export const beliefIntro =
  "The question in our industry has changed. We built this studio around the answer.";

export const directAccessLine =
  "We offer three ways to engage, depending on what you need: sprints and fixed-scope projects for a specific, time-boxed problem — subscription for ongoing design support as you continue to ship — and embedded designers, our expertise inside your team, without a hire.";

/**
 * The working agreement — how 13 Design Studio engages a client. Plain-language
 * versions of the positions Anna confirmed: client owns work once paid in full;
 * mutual confidentiality by default and we'll sign a client NDA; founding
 * clients consent to case studies upfront, everyone else by written permission;
 * governed by Polish law. NOT a substitute for a signed contract.
 */
export const workingAgreement: TermsSection[] = [
  {
    n: '01',
    title: 'Working with 13 Design Studio',
    body: [
      "This sets out how we work with clients — what you own, how we handle confidentiality, when we show work publicly, and the law that governs it. It applies to every engagement unless we've signed something that says otherwise.",
      'It is the plain-language version of what a contract would say. Where a client needs the full document, we sign theirs or provide ours.',
    ],
  },
  {
    n: '02',
    title: 'You own the work once it is paid for',
    body: [
      'Everything we design for you — the flows, the screens, the source files, the final deliverables — becomes yours once the work it belongs to is paid for in full. Until then, we retain ownership of it.',
      "That is not a trap; it is the one piece of leverage a studio has, and it only ever matters if an invoice goes unpaid. Fonts, stock, and third-party tools keep whatever licence they came with — we will always flag anything that is not ours to hand over.",
    ],
  },
  {
    n: '03',
    title: 'Confidentiality runs both ways',
    body: [
      "By default, each of us keeps the other's non-public information private — your product, your roadmap, your metrics, and anything we see while working. That default is in place from the first conversation, so you can talk to us about a pre-launch or stealth product without paperwork first.",
      "If your company has its own NDA, we will sign it.",
    ],
  },
  {
    n: '04',
    title: 'Showing our work',
    body: [
      'We build our reputation on the work we do, so being able to show it matters — but never at your expense.',
      'Founding clients agree upfront that we can publish their work as a case study; that consent is part of the founding-client terms, and part of why those spots are priced the way they are. For everyone else, we ask in writing before anything goes public, and we hold work back for as long as you need us to.',
    ],
  },
  {
    n: '05',
    title: 'The law that governs this',
    body: [
      'This agreement is governed by the law of Poland, where the studio is based. If a dispute ever comes up that we cannot resolve directly, that is the jurisdiction it is settled in.',
      'We would always rather sort it out over a call first.',
    ],
  },
];

export type TermsSection = { n: string; title: string; body: string[] };

/**
 * Operational terms for the subscription tiers. Deliberately limited to how the
 * engagement runs — not a legal contract. No IP, liability, or confidentiality
 * clauses here; those need a lawyer, not a website.
 */
export const subscriptionTerms: TermsSection[] = [
  {
    n: '01',
    title: 'What you are actually buying',
    body: [
      "A subscription reserves a share of the studio's capacity for your product each month. You are buying reserved attention from a small team that knows your product — not a block of hours from whoever is free.",
      'That distinction is the whole point. It is why the same people are still there in month six, and why we can say no to work that will not help you.',
    ],
  },
  {
    n: '02',
    title: 'What "up to 5 / 12 / 20 days" means',
    body: [
      'A day means a working day of our attention on your product — not a timesheet entry. We do not bill by the hour, we do not track hours, and we will not send you a spreadsheet of six-minute increments.',
      'The number is a cap on how much of the month we hold for you: up to 5 days on Lite, up to 12 on Standard, up to 20 on Embedded. Some days are a long focused stretch; some are a review, a call, and two decisions that unblock your team. Both count as a day.',
      'We hold that capacity whether or not you use it. That is what reserves it.',
    ],
  },
  {
    n: '03',
    title: 'Unused days do not roll over',
    body: [
      'Each month starts fresh. If you use three of your five days, the other two do not carry into next month.',
      'This follows from the point above: you are reserving capacity, not filling a bank of hours. The capacity was held for you and staffed for you — a quiet month is not credit.',
      'If quiet months keep happening, tell us. Moving you down a tier is a better outcome for both of us than you paying for capacity you do not want.',
    ],
  },
  {
    n: '04',
    title: 'If a month needs more than the cap',
    body: [
      'We tell you before we do the work — never after. You will not receive an invoice for work you did not agree to.',
      'From there it is your call: we agree extra days for that month, quoted and confirmed in writing before we start them; or, if the cap is being hit regularly, we recommend moving up a tier, which is usually the cheaper answer.',
      'If neither suits, we stop at the cap and the overflow becomes the first thing we pick up next month.',
    ],
  },
  {
    n: '05',
    title: 'How fast we respond',
    body: [
      'On Lite, we reply to async requests within two business days, with one review call a month to walk through priorities.',
      'On Standard, time-sensitive requests get priority turnaround, plus a biweekly working session with your team.',
      'On Embedded, we are in your weekly rituals — standups, sprint planning — so most things are answered in the room rather than in a queue.',
    ],
  },
  {
    n: '06',
    title: 'Billing',
    body: [
      'Subscriptions are paid by card through Stripe. You are charged when you subscribe and on the same date each month after that.',
      'Stripe emails you a receipt and an invoice for every payment, so your finance team gets what it needs without asking us for it.',
    ],
  },
  {
    n: '07',
    title: 'Changing or cancelling',
    body: [
      'Everything is month-to-month. There is no annual contract and no early-termination fee.',
      'You can cancel yourself from the billing portal — the link is on your confirmation page and on every invoice. You keep access until the end of the month you have already paid for, and you are not charged again.',
      'To move between tiers, tell us before your renewal date and we will switch you for the next cycle.',
    ],
  },
  {
    n: '08',
    title: 'What is in scope',
    body: [
      'We design: flows, screens, interaction patterns, design systems, and specs your developers will not fight.',
      'We are not a development shop. We work alongside your engineers, human or AI-assisted, but we do not ship your production code.',
      'If what you need is genuinely outside that, we will say so rather than take the work anyway.',
    ],
  },
  {
    n: '09',
    title: 'Embedded is scoped on a call',
    body: [
      'Embedded is the closest thing we offer to a fractional hire — a seat in your planning and roadmap decisions. It only works when the fit is right, so it is not available to subscribe to directly.',
      'We scope it on a call first. Nothing is charged before that conversation.',
    ],
  },
];

export const subscriptionFaq = [
  {
    q: 'Is there a minimum commitment?',
    a: "No. One month is the minimum. There's no annual contract and no early-termination fee — if it isn't working, you cancel at the end of the month and that's the end of it.",
  },
  {
    q: 'How do I cancel?',
    a: "Yourself, from the billing portal — the link is on your confirmation page and every invoice. You can cancel, update your card, or download past invoices there without emailing us. You keep access until the end of the month you've already paid for.",
  },
  {
    q: 'Can I switch tiers later?',
    a: "Yes — at the end of any month, in either direction. Tell us before your renewal date and we'll move you onto the new tier for the next cycle. Most teams start on Standard and adjust once they see how much they actually use.",
  },
  {
    q: 'How and when am I billed?',
    a: "By card, through Stripe. You're charged when you subscribe and on the same date each month after that. Stripe emails you a receipt and a proper invoice every time, so your accountant gets what they need without asking us.",
  },
  {
    q: "Why can't I subscribe to Embedded directly?",
    a: "Because it's the closest thing we offer to a fractional hire — a seat in your planning and roadmap decisions. That only works if the fit is genuinely right, so we scope it on a call first. Nothing is charged before that conversation.",
  },
  {
    q: 'What happens right after I subscribe?',
    a: "We email you within one business day to introduce ourselves and book a kickoff call. Then we get access to your product, your Figma, and wherever your team works — Slack, Linear, whatever you already use. Work starts with the priorities you send us.",
  },
  {
    q: "Which tier should I pick?",
    a: "Lite if the product is broadly stable and just needs someone watching it. Standard if you're shipping new features on a regular cadence. Embedded if you want design in the room for planning, not just execution. If you're unsure, ask us — we'd rather put you in the right tier than the bigger one.",
  },
];

export const homeFaq = [
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
    q: "What does \"embedded designer\" actually mean?",
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
