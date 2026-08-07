// Trello REST client + provisioning/workflow helpers.
//
// Auth: TRELLO_KEY + TRELLO_TOKEN (studio account) on every request.
// Webhook signature verification additionally needs TRELLO_API_SECRET — the
// "OAuth secret" shown next to the API key at https://trello.com/power-ups/admin
// (this is NOT the token). Trello signs each webhook POST with it.

import {
  REQUEST_LIST,
  TRELLO_LISTS,
} from "./config.ts";

type Params = Record<string, string>;

export async function trello(
  method: "GET" | "POST" | "PUT",
  path: string,
  params: Params = {},
): Promise<Record<string, unknown>> {
  const key = Deno.env.get("TRELLO_KEY");
  const token = Deno.env.get("TRELLO_TOKEN");
  if (!key || !token) throw new Error("TRELLO_KEY / TRELLO_TOKEN not set");

  const qs = new URLSearchParams({ ...params, key, token });
  const res = await fetch(`https://api.trello.com/1${path}?${qs}`, { method });
  if (!res.ok) {
    throw new Error(`Trello ${method} ${path} → ${res.status}: ${await res.text()}`);
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Board provisioning
// ---------------------------------------------------------------------------

const WELCOME_CARD_TITLE = "👋 Start here — how this board works";
const WELCOME_CARD_DESC = `**Welcome to your 13 Design project board!**

This is where you follow the work as we do it. The flow:

1. Cards move across the board as we work: *${REQUEST_LIST}* → *In progress* → *In review* → *Done*.
2. When something's ready for you, it lands in *In review* — and we post it in your Slack channel.
3. From there you **approve it** or **request changes**, right in Slack.
4. Anything to add or flag? Drop a comment on the card, or message us in Slack.

No forms to fill in and nothing to chase — just follow along here and in Slack, and we'll keep it moving.`;

export type ProvisionedBoard = {
  boardId: string;
  boardUrl: string;
  /** List name → list id, for the four workflow lists. */
  listIds: Record<string, string>;
};

/** Creates the client's private board with the four workflow lists + welcome card. */
export async function provisionBoard(clientLabel: string): Promise<ProvisionedBoard> {
  const workspace = Deno.env.get("TRELLO_WORKSPACE_ID");
  const board = await trello("POST", "/boards/", {
    name: `${clientLabel} · 13 Design`,
    defaultLists: "false",
    prefs_permissionLevel: workspace ? "org" : "private",
    desc: "Your 13 Design project board — follow the work here as it moves from To do to In progress, In review, and Done.",
    ...(workspace ? { idOrganization: workspace } : {}),
  });
  const boardId = String(board.id);
  const boardUrl = String(board.url ?? board.shortUrl ?? "");

  const listIds: Record<string, string> = {};
  for (let i = 0; i < TRELLO_LISTS.length; i++) {
    const list = await trello("POST", "/lists", {
      idBoard: boardId,
      name: TRELLO_LISTS[i],
      pos: String((i + 1) * 1024),
    });
    listIds[TRELLO_LISTS[i]] = String(list.id);
  }

  const requestListId = listIds[REQUEST_LIST];
  if (requestListId) {
    await trello("POST", "/cards", {
      idList: requestListId,
      name: WELCOME_CARD_TITLE,
      desc: WELCOME_CARD_DESC,
    });
  }

  return { boardId, boardUrl, listIds };
}

type TrelloList = { id: string; name: string };

/** Returns the board's open lists, in board order. */
export async function boardLists(boardId: string): Promise<TrelloList[]> {
  const lists = (await trello("GET", `/boards/${boardId}/lists`, {
    fields: "name",
    filter: "open",
  })) as unknown as TrelloList[];
  return Array.isArray(lists) ? lists : [];
}

/**
 * Finds the list new requests should land in: an exact match on REQUEST_LIST,
 * else the first list whose name mentions "request", else the first list.
 */
export async function findRequestListId(boardId: string): Promise<string | null> {
  const lists = await boardLists(boardId);
  if (!lists.length) return null;
  const exact = lists.find((l) => l.name === REQUEST_LIST);
  if (exact) return exact.id;
  const fuzzy = lists.find((l) => l.name.toLowerCase().includes("request"));
  return (fuzzy ?? lists[0]).id;
}

/** Finds a list id by a case-insensitive keyword match on its name (emoji-tolerant). */
export async function findListId(boardId: string, keyword: string): Promise<string | null> {
  const lists = await boardLists(boardId);
  const m = lists.find((l) => l.name.toLowerCase().includes(keyword.toLowerCase()));
  return m?.id ?? null;
}

/** Moves a card to another list (used when a client requests changes). */
export async function moveCard(cardId: string, listId: string): Promise<void> {
  await trello("PUT", `/cards/${cardId}`, { idList: listId });
}

/** Invites the client to the board by email — Trello emails them the join link. */
export async function inviteMemberByEmail(boardId: string, email: string): Promise<void> {
  try {
    await trello("PUT", `/boards/${boardId}/members`, { email, type: "normal" });
  } catch (err) {
    // Re-inviting someone already on the board (or already invited) is a no-op,
    // not a failure — Trello 403s with "already invited" / "already a member".
    const msg = String(err).toLowerCase();
    if (msg.includes("already invited") || msg.includes("already a member")) return;
    throw err;
  }
}

/** Adds an existing Trello member (a designer) to the board. */
export async function addBoardMember(
  boardId: string,
  memberId: string,
  type: "normal" | "admin" = "normal",
): Promise<void> {
  try {
    await trello("PUT", `/boards/${boardId}/members/${memberId}`, { type });
  } catch (err) {
    // The studio account that created the board is already its sole admin, so
    // Trello refuses to "demote" them to a normal member. That's fine — they're
    // already on the board with full access; nothing to do.
    if (String(err).includes("Cannot demote sole admin")) return;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export async function createCard(opts: {
  listId: string;
  name: string;
  desc?: string;
  due?: string;
  memberIds?: string[];
}): Promise<{ id: string; url: string }> {
  const card = await trello("POST", "/cards", {
    idList: opts.listId,
    name: opts.name,
    ...(opts.desc ? { desc: opts.desc } : {}),
    ...(opts.due ? { due: opts.due } : {}),
    ...(opts.memberIds?.length ? { idMembers: opts.memberIds.join(",") } : {}),
    pos: "top",
  });
  return { id: String(card.id), url: String(card.url ?? card.shortUrl ?? "") };
}

/** Attaches a URL (e.g. a Slack file link) to a card. Best-effort. */
export async function attachUrl(cardId: string, url: string, name?: string): Promise<void> {
  await trello("POST", `/cards/${cardId}/attachments`, {
    url,
    ...(name ? { name } : {}),
  });
}

type Attachment = { id: string; name: string; url: string; isUpload: boolean };

/** Returns a card's attachments (used to relay the final design to Slack). */
export async function cardAttachments(cardId: string): Promise<Attachment[]> {
  const list = (await trello("GET", `/cards/${cardId}/attachments`, {
    fields: "name,url,isUpload",
  })) as unknown as Attachment[];
  return Array.isArray(list) ? list : [];
}

/** Archives a card (Trello "close"), leaving it recoverable from the board menu. */
export async function archiveCard(cardId: string): Promise<void> {
  await trello("PUT", `/cards/${cardId}`, { closed: "true" });
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

/**
 * Registers a webhook so Trello posts this board's card activity to
 * `callbackURL`. Idempotent-ish: Trello rejects an exact duplicate
 * (idModel + callbackURL) with 400 "already exists", which we swallow so
 * re-provisioning or a retry doesn't error.
 */
export async function createBoardWebhook(boardId: string, callbackURL: string): Promise<void> {
  try {
    await trello("POST", "/webhooks/", {
      idModel: boardId,
      callbackURL,
      description: `13 Design request sync · board ${boardId}`,
    });
  } catch (err) {
    const msg = String(err);
    if (msg.includes("already exists") || msg.includes("A webhook with that")) return;
    throw err;
  }
}

/**
 * Verifies a Trello webhook: base64(HMAC-SHA1(requestBody + callbackURL,
 * TRELLO_API_SECRET)) must equal the `x-trello-webhook` header. Returns false
 * (rather than throwing) when the secret is unset so the caller can decide.
 */
export async function verifyTrelloSignature(
  rawBody: string,
  callbackURL: string,
  header: string | null,
): Promise<boolean> {
  const secret = Deno.env.get("TRELLO_API_SECRET");
  if (!secret || !header) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody + callbackURL),
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  if (expected.length !== header.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ header.charCodeAt(i);
  }
  return diff === 0;
}
