// Slack Web API client + signature verification.
//
// Auth: SLACK_BOT_TOKEN (xoxb-…) with scopes:
//   channels:manage, groups:write   — create/manage the client channel
//   channels:read, groups:read       — resolve name collisions
//   chat:write                       — post messages
//   users:read, users:read.email     — look up the client by email
//   commands                         — slash command / shortcut entrypoints
// Slack Connect invites (external clients) also need the workspace to be on a
// paid plan; where that isn't available we fall back to SLACK_INVITE_URL.
//
// Request verification (events + interactivity) uses SLACK_SIGNING_SECRET.

type SlackResult = { ok: boolean; error?: string; [k: string]: unknown };

async function slackApi(method: string, body: Record<string, unknown>): Promise<SlackResult> {
  const token = Deno.env.get("SLACK_BOT_TOKEN");
  if (!token) {
    console.error("SLACK_BOT_TOKEN not set; skipping", method);
    return { ok: false, error: "no_token" };
  }
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as SlackResult;
  if (!json.ok) console.error(`Slack ${method} error:`, json.error);
  return json;
}

/**
 * Creates a private channel, returning its id. On name_taken (two clients with
 * the same slug) it retries with -2, -3… so provisioning never hard-fails.
 */
export async function createChannel(name: string): Promise<{ id: string; name: string } | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? name : `${name}-${attempt + 1}`;
    const res = await slackApi("conversations.create", { name: candidate, is_private: true });
    if (res.ok) {
      const ch = res.channel as { id: string; name: string };
      return { id: ch.id, name: ch.name };
    }
    if (res.error !== "name_taken") return null;
  }
  return null;
}

/** Invites internal users (designers) to the channel. Ignores already-in errors. */
export async function inviteUsers(channelId: string, userIds: string[]): Promise<void> {
  if (!userIds.length) return;
  const res = await slackApi("conversations.invite", {
    channel: channelId,
    users: userIds.join(","),
  });
  if (!res.ok && res.error !== "already_in_channel") {
    console.error("conversations.invite failed:", res.error);
  }
}

/** Resolves a Slack user id from an email (only works if they're in the workspace). */
export async function lookupUserByEmail(email: string): Promise<string | null> {
  const res = await slackApi("users.lookupByEmail", { email });
  if (!res.ok) return null;
  return (res.user as { id: string })?.id ?? null;
}

/**
 * Adds the client to their channel. Tries, in order: an existing workspace
 * member (invite directly), then a Slack Connect email invite (paid plans).
 * Returns how it went so onboarding can fall back to the standing invite link.
 */
export async function inviteClient(
  channelId: string,
  email: string,
): Promise<{ added: boolean; method: "member" | "connect" | "none"; error?: string }> {
  const existingId = await lookupUserByEmail(email);
  if (existingId) {
    await inviteUsers(channelId, [existingId]);
    return { added: true, method: "member" };
  }
  // Slack Connect: invite an external email into the shared channel.
  const res = await slackApi("conversations.inviteShared", { channel: channelId, emails: [email] });
  if (res.ok) return { added: true, method: "connect" };
  return { added: false, method: "none", error: res.error };
}

export async function postMessage(
  channelId: string,
  text: string,
  blocks?: unknown[],
): Promise<{ ts: string } | null> {
  const res = await slackApi("chat.postMessage", {
    channel: channelId,
    text,
    ...(blocks ? { blocks } : {}),
  });
  if (!res.ok) return null;
  return { ts: String(res.ts) };
}

/** Best-effort join link for the shared workspace (external clients on free plans). */
export function inviteLink(): string | null {
  return Deno.env.get("SLACK_INVITE_URL") ?? null;
}

/**
 * Posts an internal alert to the studio's ops channel (STUDIO_SLACK_CHANNEL_ID).
 * No-ops silently when that isn't configured — studio email always covers it.
 */
export async function notifyStudio(text: string): Promise<void> {
  const channel = Deno.env.get("STUDIO_SLACK_CHANNEL_ID");
  if (!channel) return;
  await slackApi("chat.postMessage", { channel, text });
}

// ---------------------------------------------------------------------------
// Request verification (events + interactivity + slash commands)
// ---------------------------------------------------------------------------

/**
 * Verifies Slack's v0 signature: `v0:${timestamp}:${rawBody}` HMAC-SHA256 with
 * the signing secret, hex, compared to `x-slack-signature`. Rejects requests
 * older than 5 minutes (replay protection).
 */
export async function verifySlackSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
): Promise<boolean> {
  const secret = Deno.env.get("SLACK_SIGNING_SECRET");
  if (!secret || !timestamp || !signature) return false;

  const ts = parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 60 * 5) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`v0:${timestamp}:${rawBody}`),
  );
  const expected =
    "v0=" +
    Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
