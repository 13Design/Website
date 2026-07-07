// Verbatim copy for 13 Design Studio, mapped to typed data structures.
// Source: src/content/13-design-studio-website-copy_(2).md

export type Audience = 'ai-native' | 'ai-generated';

export type Service = {
  id: string;
  name: string;
  audience: Audience | 'also';
  tag?: string;
  body: string;
};

export const services: Service[] = [
  {
    id: 'ai-ux-product-design',
    name: 'AI UX & Product Design',
    audience: 'ai-native',
    body:
      'Interaction design for AI-native features — confidence and uncertainty states, human-in-the-loop controls, agent handoff, the moments a user decides whether to trust the output.',
  },
  {
    id: 'product-point-of-view',
    name: 'Product Point of View',
    audience: 'ai-native',
    body:
      "A visual language distinct from the default AI-SaaS look. Product identity as a competitive moat.",
  },
  {
    id: 'fractional-product-partner',
    name: 'Fractional Product Partner',
    audience: 'ai-native',
    tag: 'available as subscription',
    body:
      'Embedded, part-time design + product lead, on subscription. We help decide what to build, in what order, and keep it coherent as the team grows.',
  },
  {
    id: 'ux-rescue-sprint',
    name: 'UX Rescue Sprint',
    audience: 'ai-generated',
    tag: 'fixed scope',
    body:
      "Audit against real user behavior. Prioritized list of what's costing you users. We fix the top offenders live. Roadmap for what's next.",
  },
  {
    id: 'product-finishing',
    name: 'Product Finishing',
    audience: 'ai-generated',
    tag: 'fixed scope',
    body:
      "Whole-flow coherence: onboarding, checkout, settings, permissions. The states generation tools skip — empty, loading, error, edge case. Ready to demo or onboard real customers.",
  },
  {
    id: 'design-system-maintenance',
    name: 'Design System & Ongoing Maintenance',
    audience: 'ai-generated',
    tag: 'available as subscription',
    body:
      'Components, spacing, tokens, hand-off specs. Keeps every new feature looking like the same product as you keep shipping.',
  },
  {
    id: 'ux-audit-pre-raise',
    name: 'UX Audit Before a Raise or Launch',
    audience: 'also',
    body:
      'Diagnostic. Find where users fall out before investors or the market see it. Prioritized, evidence-based fix plan.',
  },
];

export const audienceGroups: { id: Audience; label: string; blurb: string; audienceServices: string[] }[] = [
  {
    id: 'ai-native',
    label: 'Teams building AI into their product',
    blurb:
      'Designing agent behavior, model-driven features, and AI-native interaction patterns — trust, uncertainty, handoff, human override.',
    audienceServices: ['ai-ux-product-design', 'product-point-of-view', 'fractional-product-partner'],
  },
  {
    id: 'ai-generated',
    label: 'Teams with an AI-generated product',
    blurb:
      'An MVP built by an AI tool or fast build sprint, now needing whole-flow coherence, a visual identity of its own, and an ongoing system to keep it consistent.',
    audienceServices: ['ux-rescue-sprint', 'product-finishing', 'design-system-maintenance'],
  },
];

export type ProcessStep = { n: string; title: string; body: string };

export const processSteps: ProcessStep[] = [
  {
    n: '1',
    title: 'Frame the problem',
    body: "Get clear on why the product exists and where it's losing people.",
  },
  {
    n: '2',
    title: 'Decide, then design',
    body: 'Explore directions fast, apply judgment, commit to one.',
  },
  {
    n: '3',
    title: 'Build coherence',
    body: 'Make the product feel like one product, end to end.',
  },
  {
    n: '4',
    title: 'Embed and iterate',
    body: "Learn your taste over repeated rounds; the relationship compounds.",
  },
];

export type PricingRow = {
  engagement: string;
  whatItIs: string;
  investment: string;
  subscriptionTier?: 'lite' | 'standard' | 'embedded';
};

export const pricingRows: PricingRow[] = [
  {
    engagement: 'UX Rescue Sprint',
    whatItIs: 'Fixed-scope audit + top fixes, 1–2 weeks',
    investment: 'Project-based',
  },
  {
    engagement: 'Product Finishing',
    whatItIs: 'Whole-flow coherence, 2–4 weeks',
    investment: 'Project-based',
  },
  {
    engagement: 'AI UX & Product Design',
    whatItIs: 'Interaction design for AI-native features, project-based',
    investment: 'Project-based',
  },
  {
    engagement: 'Design System & Maintenance',
    whatItIs: 'System + hand-off specs, ongoing upkeep',
    investment: 'Subscription',
    subscriptionTier: 'standard',
  },
  {
    engagement: 'UX Audit (pre-raise)',
    whatItIs: 'Diagnostic + prioritized fix plan',
    investment: 'Project-based',
  },
  {
    engagement: 'Fractional Product Partner',
    whatItIs: 'Embedded, monthly subscription',
    investment: 'Subscription',
    subscriptionTier: 'embedded',
  },
];

export type SubTier = {
  id: 'lite' | 'standard' | 'embedded';
  name: string;
  price: string;
  cadence: string;
  description: string;
  includes: string[];
  featured?: boolean;
};

export const subscriptionTiers: SubTier[] = [
  {
    id: 'lite',
    name: 'Lite',
    price: 'from €1,800',
    cadence: '/mo',
    description: 'A few days a month: coherence upkeep, small fixes, always-on support.',
    includes: [
      'Up to ~2 working days / week of design time',
      'Coherence upkeep across new and existing features',
      'Small fixes, polish, and visual consistency passes',
      'Always-on async support channel (Slack or email)',
      'Bi-weekly review of anything the team ships',
      'Component kit kept in sync with the product',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 'from €4,500',
    cadence: '/mo',
    description: 'Regular feature work plus design-system maintenance.',
    includes: [
      'Up to ~3 working days / week of design time',
      'Regular feature design work end to end',
      'Design-system maintenance + new components as needed',
      'Full component kit with hand-off specs for engineering',
      'Async + one weekly sync review',
      'UX QA on shipped features',
      'Onboarding, empty, loading, error, and edge-case states covered',
    ],
    featured: true,
  },
  {
    id: 'embedded',
    name: 'Embedded',
    price: 'from €8,500',
    cadence: '/mo',
    description: 'Part-time design + product lead, in the room for product decisions.',
    includes: [
      'Up to ~4 working days / week of design + product time',
      'Embedded design and product lead in your squad',
      'In the room for product decisions — what to build, in what order',
      'Roadmap input and prioritization alongside the founder',
      'Full design-system ownership and governance',
      'Async + two weekly sync reviews',
      'Mentorship and design review for in-house designers',
      'Keeps the product coherent as the team grows',
    ],
  },
];

export const pricingPhilosophy =
  'Subscriptions are month-to-month. Figures are indicative starting points for the EU market; we confirm a fixed number before any work begins. No open-ended hourly billing.';

export const beliefs = [
  'When good output becomes abundant, exceptional experiences win.',
  'Human judgment, taste, and coherence remain the premium layer.',
  'Design is about decisive thinking, not just generation.',
];

export const honestPart = [
  "We use AI tools every day to work faster and smarter. What we deliver is the irreplaceable layer above the tools — the judgment and taste that transform generated output into exceptional experiences.",
  "We stay focused on our lane. When the work becomes pure screen production, AI is often the more efficient choice. We concentrate on the decisions that genuinely elevate products and businesses.",
];

export const aboutStudio =
  "We are led by a product designer and founder who actively builds AI products. This hands-on experience allows us to work with founders as peers — discussing real priorities, trade-offs, and what it truly takes to ship successful AI products.\n\nWe combine high craft in UX and UI with strong product thinking and practical shipping expertise.";

export const aboutPositioning =
  'A focused product design studio for the AI era.';

export const beliefIntro =
  'The question in our industry has changed from "who can build it fast" to "who can make it exceptional." We built our studio around the second question.';

export const directAccessLine =
  "Small by design. The team that scopes the work is the team that ships it — no relay of notes, no dilution between the first conversation and the final handoff. We stay close, answer directly, and keep every decision in one place. The work stays coherent because the thinking never gets handed off.";
