/* All copy sourced verbatim from the 13design.org codebase. */

export type Service = {
  id: string;
  name: string;
  tag?: string;
  body: string;
};

export const services: Service[] = [
  {
    id: "ai-ux-product-design",
    name: "AI UX & Product Design",
    tag: "sprint · embedded",
    body: "Interaction design for AI-native features — confidence and uncertainty states, human-in-the-loop controls, agent handoff, the moments a user decides whether to trust the output.",
  },
  {
    id: "product-point-of-view",
    name: "Product Point of View",
    tag: "project-based",
    body: "A visual language distinct from the default AI-SaaS look. Product identity as a competitive moat, built for a product that's supposed to look like nobody else's.",
  },
  {
    id: "strategy-product-direction",
    name: "Strategy & Product Direction",
    tag: "sprint · embedded",
    body: "Working through what to build and in what order, before design starts — the decisions that determine whether the rest of the work matters.",
  },
  {
    id: "ai-integration-ux",
    name: "AI Integration UX",
    tag: "sprint · embedded",
    body: "Designing how a new AI feature sits inside a product that already has users, habits, and expectations — so it feels native to the product, not bolted on.",
  },
  {
    id: "ux-rescue-sprint",
    name: "UX Rescue Sprint",
    tag: "fixed price · 1–2 weeks",
    body: "Audit against real user behavior. A prioritized list of what's actually costing you users. We fix the top offenders live, inside the sprint, and leave you a roadmap for what's next.",
  },
  {
    id: "product-finishing",
    name: "Product Finishing",
    tag: "2–4 weeks",
    body: "Whole-flow coherence: onboarding, checkout, settings, permissions. The states AI-assisted builds tend to skip — empty, loading, error, edge case. Ready to demo or onboard real customers without breaking.",
  },
  {
    id: "design-system-maintenance",
    name: "Design System & Ongoing Maintenance",
    tag: "project-based",
    body: "Components, spacing, tokens, and hand-off specs — so every new feature still looks like the same product as you keep shipping.",
  },
  {
    id: "ux-audit-pre-raise",
    name: "UX Audit Before a Raise or Launch",
    body: "A diagnostic tied directly to money on the line. Find where users fall out before investors or the market see it, with a prioritized, evidence-based fix plan.",
  },
  {
    id: "fractional-product-partner",
    name: "Fractional Product Partner",
    tag: "ongoing",
    body: "A part-time design and product lead, ongoing — we help decide what to build and in what order, and keep it coherent as your team and product grow.",
  },
];

export const audienceGroups = [
  {
    id: "ai-native",
    label: "Teams building AI-native products",
    blurb:
      "A startup or new venture with AI at the center — an agent, a model, a workflow that acts on someone's behalf. You need the interaction design that generic UI patterns don't have answers for: trust, uncertainty, handoff, control.",
    serviceIds: ["ai-ux-product-design", "product-point-of-view", "strategy-product-direction"],
  },
  {
    id: "existing",
    label: "Businesses adding AI to an existing product",
    blurb:
      "A mature business bringing AI into the core of an existing product — new features, new workflows, a genuine shift in what the product does. You need it designed with the same care as the rest of the product, not bolted on.",
    serviceIds: ["ai-integration-ux", "ux-rescue-sprint", "product-finishing", "design-system-maintenance"],
  },
  {
    id: "either",
    label: "For either",
    blurb:
      "Some of what we do applies regardless of where you're starting from — and these are the engagements that move between both worlds.",
    serviceIds: ["ux-audit-pre-raise", "fractional-product-partner"],
  },
];

export const homeServices = [
  services[0], // AI UX & Product Design
  services[4], // UX Rescue Sprint
  services[5], // Product Finishing
  services[8], // Fractional Product Partner
];

export const processSteps = [
  {
    n: "01",
    title: "Intro call",
    body: "A short call — no deck, no pitch. You tell us where the product stands and what's coming up; we tell you honestly whether we're the right fit.",
    chips: ["Live", "30 min · no deck, no pitch", "✓ Good fit"],
  },
  {
    n: "02",
    title: "Frame the problem",
    body: "Before we touch a screen, we get clear on what's actually happening. Most design problems are decision problems wearing a costume.",
    chips: ["The brief vs. the real problem", "Symptom → Real problem"],
  },
  {
    n: "03",
    title: "Explore, then decide",
    body: "We move fast through real options — not a single first idea. The value we add is choosing, and having a reason for what we keep and what we cut.",
    chips: ["Explore widely · decide deliberately"],
  },
  {
    n: "04",
    title: "Design for coherence",
    body: "We design flows and systems, not isolated screens — so the product feels like one decision made consistently, not features stitched together.",
    chips: ["Flows & systems · not screens"],
  },
  {
    n: "05",
    title: "Collaborate in the open",
    body: "You see the work as it moves. Feedback is direct and hands-on — no account layer, no junior hand-off — and quick answers happen in real time.",
    chips: ["Shared preview", "13 · On it"],
  },
  {
    n: "06",
    title: "Ship, then stay",
    body: "Delivered ready to build. And the longer we work together, the better the decisions get — which is why most relationships move toward ongoing work.",
    chips: ["Shipped", "Decisions keep getting better", "Ongoing by default · not a hand-off"],
  },
];

export const beliefs = [
  'The question has moved from "who can build it fast" to "who can make it exceptional."',
  "Good output is abundant now. Judgment, taste, and coherence are the layer that isn't.",
  "Design is decisive thinking, not just generation — deciding what a product should and shouldn't do.",
  "A product built only for what AI can do today is already out of date. We design with where this is going.",
];

export const beliefIntro =
  "The question in our industry has changed. We built this studio around the answer.";

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
    q: 'What does "embedded designer" actually mean?',
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

export const tickerItems = [
  "Designed by humans",
  "Founding client spots open",
  "Month-to-month — no lock-in",
  "AI-native & AI-built products",
  "Reply within one business day",
  "Vinnytsia — working with founders everywhere",
];

/* Hero — the final word cycles through these. */
export const heroRotating = ["trust.", "understand.", "come back.", "tell others."];

/* ——— About ——— */

export const aboutStudio = [
  "13 Design Studio has spent years working closely with innovative companies on user experience. We're relaunching around a new reality: AI didn't remove the need for that work — it changed which parts of it matter most.",
  "We work with startups building something new, and with mature companies bringing AI into products that already exist. Different stage, same conviction: the products that win are the ones a human actually thought through.",
];

export const aboutStudioExtended =
  "What we don't do is just as important: we don't outsource the design itself, and we don't disappear after hand-off — we stay close enough that the product keeps getting better.";

export const honestPart = [
  "Every flow, every screen, every decision is made by a person who knows your product and can tell you why it's there. That judgment is the thing you're hiring — it's exactly what generation tools don't have. And we design for humans and agents alike: interfaces people understand at first glance, structured so machines can navigate them without guessing.",
  "The person assigned to your project is whoever's the right fit for the problem, not whoever's next in line. Your point of contact stays constant either way — one person, through the whole relationship, who knows your product and answers you directly.",
  "We'll disagree with you sometimes, out loud. If we think a direction is wrong for your users, we'll say so before we build it, not after — even when it's not what you wanted to hear.",
  "The first few weeks are slower than they look. We're learning your product, your users, and your taste before we're making fast, confident calls — and we'd rather be upfront about that ramp-up than pretend it doesn't exist.",
];

export const aboutProcess = [
  {
    n: "1",
    title: "Frame the problem before touching a screen",
    body: "Most design problems are decision problems wearing a costume. We get clear on what's actually happening before we design anything.",
  },
  {
    n: "2",
    title: "Explore widely, decide deliberately",
    body: "We draw on our own expertise to move fast through real options — not a single first idea. The value we add is choosing: keeping what's right for your users and your stage, and having a real reason for the rest.",
  },
  {
    n: "3",
    title: "Design for coherence, not just for the next screen",
    body: "A product should feel like one decision, made consistently, not a series of separate features stitched together. We design flows and systems, not isolated screens.",
  },
  {
    n: "4",
    title: "Stay in the work long enough to learn your taste",
    body: 'The longer we work with a team, the better the decisions get — because we understand what "right" means for that specific product and that specific audience. That\'s why most relationships move toward ongoing work.',
  },
];

export const directAccessLine =
  "We offer three ways to engage, depending on what you need: sprints and fixed-scope projects for a specific, time-boxed problem — subscription for ongoing design support as you continue to ship — and embedded designers, our expertise inside your team, without a hire.";

/* ——— Work ——— */

export const workNoCases = {
  title: "Case studies are on the way.",
  body: "We're taking on our first founding clients now — full write-ups will land here as that work ships. In the meantime, we're happy to walk you through examples and our process directly.",
};

export const workClose = "Want to be one of our first case studies?";

/* ——— Founding clients ——— */

export const foundingYouGet = [
  "A reduced rate on your first engagement, in exchange for a case study and testimonial on completion",
  "Direct, hands-on access — no account layer, no junior hand-off",
  "First access to new service offerings as we build them out",
  "A say in how the case study is framed — nothing published without your review",
];

export const foundingWhoFor = [
  "Startups building AI-native features who need the interaction design layer solved",
  "Established businesses adding AI to an existing product who want it designed with real care",
  "Teams with an AI-generated MVP ready for whole-flow finishing",
  "Founders and product leads who can move at sprint pace and give direct, honest feedback",
];

export const foundingHowItWorks = [
  { n: "1", title: "Short intro call", body: "tell us where the product stands today." },
  { n: "2", title: "We confirm fit", body: "and scope a fixed-price first engagement." },
  { n: "3", title: "We work the engagement", body: "at founding-client rate." },
  { n: "4", title: "On completion", body: "case study, testimonial, and — if it's a fit — a path to an ongoing subscription." },
];

export const foundingStages = [
  "AI-native build",
  "AI-generated MVP",
  "Adding AI to an existing product",
  "Other",
];

export const foundingTimelines = ["ASAP", "This quarter", "Just exploring"];

/* ——— Contact ——— */

export const contactInstructions =
  "Share where your product is today, what challenges you're facing, and what's coming up (raise, launch, or growth push). A link to the live product is often the most valuable starting point.";

export const contactStages = [
  "Idea / prototype",
  "Just shipped",
  "Live with users",
  "Preparing to raise",
  "Preparing to launch",
  "Scaling",
];

export const contactLookingFor = [
  "UX Rescue Sprint",
  "Product Finishing",
  "AI UX & Product Design",
  "AI Integration UX",
  "Design System & Maintenance",
  "UX Audit (pre-raise / pre-launch)",
  "Fractional Product Partner",
  "Subscription (Lite / Standard / Product Partner)",
  "Not sure yet",
];
