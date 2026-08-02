// Supabase Edge Function: slack-events
//
// One endpoint for everything Slack sends us:
//   - Events API URL verification (so the same URL can be reused there)
//   - the `/design-request` slash command  → create a Trello request card
//   - the "Create design request" message shortcut (message_action) → same,
//     carrying the message text + file links onto the card
//   - the "Approve" button (block_actions) on a completion message → mark the
//     request approved and archive the card
//
// Every request is signature-verified with SLACK_SIGNING_SECRET. Slash commands
// and interactivity arrive as application/x-www-form-urlencoded; Events API as
// JSON. We branch on that.
//
// Point all three Slack "Request URL" fields (Event Subscriptions, Slash
// Commands, Interactivity & Shortcuts) at this function.
//
// Deploy: supabase functions deploy slack-events --no-verify-jwt --use-api

import { serviceClient } from "../_shared/db.ts";
import { REQUEST_LIST, defaultDesignerTrelloId, dueDateFor } from "../_shared/config.ts";
import {
  attachUrl,
  archiveCard,
  createCard,
  findListId,
  findRequestListId,
  moveCard,
} from "../_shared/trello.ts";
import { postMessage, verifySlackSignature } from "../_shared/slack.ts";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const CARD_LINK = "\n\n:point_right: You can add links, files, and priority order on the card.";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function ephemeral(text: string): Response {
  return json({ response_type: "ephemeral", text });
}

type Sub = {
  id: string;
  tier: string | null;
  trello_board_id: string | null;
  slack_channel_id: string | null;
};

async function subForChannel(
  supabase: SupabaseClient,
  channelId: string,
): Promise<Sub | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("id, tier, trello_board_id, slack_channel_id")
    .eq("slack_channel_id", channelId)
    .maybeSingle();
  return (data as Sub) ?? null;
}

/**
 * Creates the request card + design_requests row and returns a confirmation
 * string. Returns null with a reason when the channel isn't linked or the board
 * has no request list.
 */
async function createRequest(
  supabase: SupabaseClient,
  opts: {
    channelId: string;
    requesterId: string;
    text: string;
    fileLinks: { name: string; url: string }[];
  },
): Promise<{ text: string } | { error: string }> {
  const title = opts.text.trim().split("\n")[0].slice(0, 120) || "New design request";

  const sub = await subForChannel(supabase, opts.channelId);
  if (!sub?.trello_board_id) {
    return { error: "This channel isn't linked to a 13 Design board yet. Ping the studio and we'll sort it out." };
  }

  const listId = await findRequestListId(sub.trello_board_id);
  if (!listId) return { error: "Couldn't find the request list on your board. The studio has been notified." };

  const assignee = defaultDesignerTrelloId();
  const due = dueDateFor(sub.tier);
  const desc =
    `Requested by <@${opts.requesterId}> via Slack.\n\n${opts.text.trim()}` +
    (opts.fileLinks.length
      ? `\n\n**Attachments**\n${opts.fileLinks.map((f) => `- ${f.url}`).join("\n")}`
      : "");

  const card = await createCard({
    listId,
    name: title,
    desc,
    due,
    memberIds: assignee ? [assignee] : [],
  });

  for (const f of opts.fileLinks) {
    try {
      await attachUrl(card.id, f.url, f.name);
    } catch (err) {
      console.error("attach failed:", err);
    }
  }

  await supabase.from("design_requests").upsert(
    {
      subscription_id: sub.id,
      trello_card_id: card.id,
      trello_board_id: sub.trello_board_id,
      slack_channel_id: opts.channelId,
      source: "slack",
      title,
      status: REQUEST_LIST,
      assignee_trello_id: assignee,
      due_at: due,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trello_card_id" },
  );

  const dueLabel = new Date(due).toUTCString().replace(/ GMT$/, " UTC");
  return {
    text: `:white_check_mark: *Request created:* <${card.url}|${title}>\nTarget by *${dueLabel}* (per your plan's SLA).${CARD_LINK}`,
  };
}

// ---------------------------------------------------------------------------
// Interactivity: message shortcut (create) + Approve button
// ---------------------------------------------------------------------------

async function handleInteractivity(
  supabase: SupabaseClient,
  payload: Record<string, unknown>,
): Promise<Response> {
  const type = payload.type as string;

  // "Create design request" message shortcut.
  if (type === "message_action") {
    const channelId = (payload.channel as { id: string })?.id;
    const user = (payload.user as { id: string })?.id ?? "";
    const message = payload.message as { text?: string; files?: { name?: string; permalink?: string }[] };
    const text = message?.text ?? "";
    const fileLinks = (message?.files ?? [])
      .filter((f) => f.permalink)
      .map((f) => ({ name: f.name ?? "attachment", url: f.permalink! }));

    const result = await createRequest(supabase, { channelId, requesterId: user, text, fileLinks });
    if ("error" in result) {
      await postMessage(channelId, result.error);
    } else {
      await postMessage(channelId, result.text);
    }
    return new Response(null, { status: 200 });
  }

  // Approve / Request-changes buttons on a completion message.
  if (type === "block_actions") {
    const action = (payload.actions as { action_id: string; value: string }[])?.[0];
    const responseUrl = payload.response_url as string | undefined;
    const actor = (payload.user as { id: string })?.id ?? "";
    if (!action?.value || !["approve_request", "request_changes"].includes(action.action_id)) {
      return new Response(null, { status: 200 });
    }

    const cardId = action.value;
    const { data: reqRow } = await supabase
      .from("design_requests")
      .select("id, approved_at, title, trello_card_id, trello_board_id")
      .eq("trello_card_id", cardId)
      .maybeSingle();

    const row = reqRow as
      | { approved_at?: string; title?: string; trello_board_id?: string }
      | null;
    const title = row?.title ?? "your request";

    // Once approved, the request is closed — ignore further button taps.
    if (row?.approved_at) {
      await replaceMessage(responseUrl, `:white_check_mark: *${title}* was already approved. Nothing more to do!`);
      return new Response(null, { status: 200 });
    }

    if (action.action_id === "request_changes") {
      // Reopen: move the card back to review and let a future "Done" re-notify.
      let moved = false;
      try {
        const reviewList = row?.trello_board_id
          ? await findListId(row.trello_board_id, "review")
          : null;
        if (reviewList) {
          await moveCard(cardId, reviewList);
          moved = true;
        }
      } catch (err) {
        console.error("move on request-changes failed:", err);
      }
      await supabase
        .from("design_requests")
        .update({ completed_notified_at: null, updated_at: new Date().toISOString() })
        .eq("trello_card_id", cardId);

      await replaceMessage(
        responseUrl,
        `:pencil2: <@${actor}> requested changes on *${title}*.` +
          (moved ? " We've moved it back to *👀 In review*." : "") +
          " Add specifics in a card comment or here and we'll get on it.",
      );
      return new Response(null, { status: 200 });
    }

    // Approve.
    const now = new Date().toISOString();
    await supabase
      .from("design_requests")
      .update({ approved_at: now, approved_by: actor, updated_at: now })
      .eq("trello_card_id", cardId);

    let archived = false;
    try {
      await archiveCard(cardId);
      archived = true;
      await supabase
        .from("design_requests")
        .update({ archived_at: new Date().toISOString() })
        .eq("trello_card_id", cardId);
    } catch (err) {
      console.error("archive on approve failed:", err);
    }

    await replaceMessage(
      responseUrl,
      `:tada: *Approved!* <@${actor}> signed off on *${title}*.` +
        (archived ? " The card's been archived — thanks!" : ""),
    );
    return new Response(null, { status: 200 });
  }

  return new Response(null, { status: 200 });
}

/** Replaces the message the button lived on, via Slack's response_url. */
async function replaceMessage(responseUrl: string | undefined, text: string): Promise<void> {
  if (!responseUrl) return;
  try {
    await fetch(responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replace_original: true, text }),
    });
  } catch (err) {
    console.error("response_url update failed:", err);
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const raw = await req.text();
  const ok = await verifySlackSignature(
    raw,
    req.headers.get("x-slack-request-timestamp"),
    req.headers.get("x-slack-signature"),
  );
  if (!ok) return new Response("Invalid signature", { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  const supabase = serviceClient();

  // Events API (JSON): only needed for the URL-verification handshake.
  if (contentType.includes("application/json")) {
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(raw);
    } catch {
      return new Response("Bad payload", { status: 400 });
    }
    if (body.type === "url_verification") {
      return json({ challenge: body.challenge });
    }
    return json({ ok: true });
  }

  // Slash command / interactivity: urlencoded.
  const form = new URLSearchParams(raw);

  const payloadStr = form.get("payload");
  if (payloadStr) {
    try {
      const payload = JSON.parse(payloadStr) as Record<string, unknown>;
      return await handleInteractivity(supabase, payload);
    } catch (err) {
      console.error("interactivity error:", err);
      return new Response(null, { status: 200 });
    }
  }

  const command = form.get("command");
  if (command) {
    const channelId = form.get("channel_id") ?? "";
    const requesterId = form.get("user_id") ?? "";
    const text = form.get("text") ?? "";
    if (!text.trim()) {
      return ephemeral("Add a short description, e.g. `/design-request New onboarding empty state`.");
    }
    try {
      const result = await createRequest(supabase, { channelId, requesterId, text, fileLinks: [] });
      if ("error" in result) return ephemeral(result.error);
      return json({ response_type: "in_channel", text: result.text });
    } catch (err) {
      console.error("slash command error:", err);
      return ephemeral("Something went wrong creating your request. The studio has been notified.");
    }
  }

  return json({ ok: true });
});
