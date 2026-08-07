// Shared configuration for the onboarding + request-workflow Edge Functions.
//
// Everything client-specific (team member ids, tokens, tuning) comes from
// function secrets so nothing sensitive lives in the repo. Read helpers here
// centralise the parsing so every function agrees on the same shapes.

export const STUDIO_EMAIL = "hello@13design.org";

export const TIER_LABELS: Record<string, string> = {
  lite: "Lite — $800/mo",
  standard: "Standard — $2,500/mo",
  "product-partner": "Product Partner — $4,500/mo",
};

export function tierLabel(tier: string | null | undefined): string {
  if (!tier) return "Subscription";
  return TIER_LABELS[tier] ?? tier;
}

// The four workflow lists, in board order. Index 0 is where new requests land;
// the last is the completed/approve-from state.
export const REQUEST_LIST = "📋 To do";
export const IN_PROGRESS_LIST = "🎨 In progress";
export const IN_REVIEW_LIST = "👀 In review";
export const DONE_LIST = "✅ Done";
export const TRELLO_LISTS = [REQUEST_LIST, IN_PROGRESS_LIST, IN_REVIEW_LIST, DONE_LIST];

/** True when a list name is the "completed" column (emoji-tolerant match). */
export function isDoneList(listName: string | null | undefined): boolean {
  if (!listName) return false;
  return listName.trim().toLowerCase().includes("done");
}

// ---------------------------------------------------------------------------
// SLA: business days from creation to the card's due date, per tier. Sourced
// from the published tier copy — Lite replies within 2 business days; Standard
// and Product Partner get priority turnaround (next business day).
// ---------------------------------------------------------------------------

const SLA_BUSINESS_DAYS: Record<string, number> = {
  lite: 2,
  standard: 1,
  "product-partner": 1,
};

export function slaBusinessDays(tier: string | null | undefined): number {
  return SLA_BUSINESS_DAYS[tier ?? ""] ?? 2;
}

/** Adds N business days (skipping Sat/Sun) to `from`, returning a new Date. */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay(); // 0 Sun … 6 Sat
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

/** Due date for a new request on `tier`, as an ISO string. */
export function dueDateFor(tier: string | null | undefined, from = new Date()): string {
  return addBusinessDays(from, slaBusinessDays(tier)).toISOString();
}

// ---------------------------------------------------------------------------
// Team roster (from secrets). Comma/space separated lists of ids.
// ---------------------------------------------------------------------------

function idList(name: string): string[] {
  return (Deno.env.get(name) ?? "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Trello member ids to add to every new client board. */
export function designTeamTrelloIds(): string[] {
  return idList("DESIGN_TEAM_TRELLO_MEMBER_IDS");
}

/** Slack user ids to invite to every new client channel. */
export function designTeamSlackIds(): string[] {
  return idList("DESIGN_TEAM_SLACK_USER_IDS");
}

/**
 * Trello member id new request cards are assigned to. Falls back to the first
 * configured team member so a card is never left unassigned.
 */
export function defaultDesignerTrelloId(): string | null {
  return Deno.env.get("DEFAULT_DESIGNER_TRELLO_ID") ?? designTeamTrelloIds()[0] ?? null;
}

/**
 * A Slack channel name from a client label: lowercase, hyphenated, suffixed
 * "-design", trimmed to Slack's 80-char limit. "Acme, Inc." → "acme-inc-design".
 */
export function channelNameFor(clientLabel: string): string {
  const base = clientLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "client";
  return `${base}-design`;
}
