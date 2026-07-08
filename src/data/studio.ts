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
    id: 'embedded-designer',
    name: 'Embedded Designer',
    audience: 'either',
    body: "No hire, no recruiting cycle. Our design expertise, working inside your team's process — your tools, your standups, your sprint cycles — for a specific project or a defined stretch of time.",
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
    body: 'An embedded, part-time design and product lead, on a monthly subscription. We help decide what to build, in what order, and keep it coherent as your team and product grow.',
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
    audienceServices: ['embedded-designer', 'ux-audit-pre-raise', 'fractional-product-partner'],
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
  { engagement: 'Embedded Designer', whatItIs: 'Our expertise inside your team, no hire', investment: 'Embedded' },
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
};

export const subscriptionTiers: SubTier[] = [
  {
    id: 'lite',
    name: 'Lite',
    price: 'from €1,500',
    cadence: '/mo',
    daysPerMonth: 'Up to 3 days / month',
    description: 'Best for a product that\'s mostly stable but still needs someone watching it.',
    includes: [
      'Coherence audits and small UI fixes',
      'Async support through your existing tools',
      'One review call per month',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 'from €3,500',
    cadence: '/mo',
    daysPerMonth: 'Up to 8 days / month',
    description: 'Best for teams shipping new features on a regular cadence.',
    includes: [
      'Everything in Lite',
      'New feature design',
      'Ongoing design-system maintenance',
      'Biweekly working session',
    ],
    featured: true,
  },
  {
    id: 'embedded',
    name: 'Embedded',
    price: 'from €6,000',
    cadence: '/mo',
    daysPerMonth: 'Up to 15 days / month',
    description: "Our closest equivalent to a fractional hire — structured around your team's cadence.",
    includes: [
      'Everything in Standard',
      'A seat in product planning and roadmap discussions',
      'Direct input on what gets built and in what order',
      'Weekly syncs',
    ],
  },
];

export const subscriptionIncludedAtEveryTier = [
  'Direct access to the person doing the work — no account layer',
  'Async communication through your existing tools (Slack, Linear, Figma, etc.)',
  'Design system consistency across everything we touch',
  'Monthly check-in on priorities and scope',
  'Month-to-month terms — pause, adjust, or cancel at the end of any month',
];

export const pricingPhilosophy =
  'Figures are indicative starting points for the EU market and scale with team size and product complexity. We confirm a fixed number before any work begins. No open-ended hourly billing.';

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
