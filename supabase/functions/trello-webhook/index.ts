// Supabase Edge Function: trello-webhook
//
// Registered per board by paddle-webhook at onboarding. Trello POSTs card
// activity here; we mirror it into the client's Slack channel:
//   - a card moved between lists  → a status ping ("… moved to 👀 In review")
//   - a card moved to "✅ Done"    → a completion message with the final files
//     and an *Approve* button (handled back in slack-events)
//
// Idempotency:
//   - every action is deduped on Trello's `action.id` via processed_events
//   - the completion message is additionally guarded by
//     design_requests.completed_notified_at, so re-delivery can't double-post
//
// Trello signs each POST: base64(HMAC-SHA1(body + callbackURL, TRELLO_API_SECRET))
// in `x-trello-webhook`. The callbackURL must byte-match what was registered, so
// it comes from the same TRELLO_WEBHOOK_CALLBACK_URL (or SUPABASE_URL fallback)
// that paddle-webhook used to create the webhook. Trello also probes the URL
// with HEAD when the webhook is created — we answer 200.
//
// Deploy: supabase functions deploy trello-webhook --no-verify-jwt --use-api

import { serviceClient, claimEvent } from "../_shared/db.ts";
import { isDoneList } from "../_shared/config.ts";
import { cardAttachments, verifyTrelloSignature } from "../_shared/trello.ts";
import { postMessage } from "../_shared/slack.ts";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

function callbackUrl(): string {
  return (
    Deno.env.get("TRELLO_WEBHOOK_CALLBACK_URL") ??
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/trello-webhook`
  );
}

type CardRef = { id: string; name: string; shortLink?: string };
type ListRef = { id: string; name: string };

function cardUrl(card: CardRef): string {
  return card.shortLink ? `https://trello.com/c/${card.shortLink}` : "";
}

async function subForBoard(supabase: SupabaseClient, boardId: string) {
  const { data } = await supabase
    .from("subscriptions")
    .select("id, slack_channel_id")
    .eq("trello_board_id", boardId)
    .maybeSingle();
  return (data as { id: string; slack_channel_id: string | null }) ?? null;
}

/** Upserts the request row so status stays current even for cards born in Trello. */
async function recordStatus(
  supabase: SupabaseClient,
  opts: { subId: string | null; channelId: string | null; boardId: string; card: CardRef; status: string },
) {
  await supabase.from("design_requests").upsert(
    {
      subscription_id: opts.subId,
      trello_card_id: opts.card.id,
      trello_board_id: opts.boardId,
      slack_channel_id: opts.channelId,
      source: "trello",
      title: opts.card.name,
      status: opts.status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trello_card_id" },
  );
}

function completionBlocks(card: CardRef, files: { name: string; url: string }[]): unknown[] {
  const url = cardUrl(card);
  const blocks: unknown[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:sparkles: *${card.name}* is ready for review!` + (url ? `\n<${url}|Open the card>` : ""),
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: files.length
          ? "*Files & links:*\n" + files.map((f) => `• <${f.url}|${f.name}>`).join("\n")
          : "*Deliverables* are on the card — open it to view or download.",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*What happens next:*\n" +
          "• :white_check_mark: *Approve* — you're happy, we'll archive it and you're done.\n" +
          "• :pencil2: *Request changes* — we'll reopen it; add specifics in a card comment or here.",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Approve ✅", emoji: true },
          style: "primary",
          action_id: "approve_request",
          value: card.id,
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Request changes ✏️", emoji: true },
          action_id: "request_changes",
          value: card.id,
        },
        ...(url
          ? [{ type: "button", text: { type: "plain_text", text: "View on Trello" }, url }]
          : []),
      ],
    },
  ];
  return blocks;
}

Deno.serve(async (req) => {
  // Trello's webhook-creation probe.
  if (req.method === "HEAD") return new Response(null, { status: 200 });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const raw = await req.text();
  const valid = await verifyTrelloSignature(raw, callbackUrl(), req.headers.get("x-trello-webhook"));
  if (!valid) {
    console.error("Trello signature verification failed");
    return new Response("Invalid signature", { status: 401 });
  }

  let body: { action?: { id: string; type: string; data?: Record<string, unknown> } };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const action = body.action;
  if (!action) return new Response(JSON.stringify({ ok: true }), { status: 200 });

  const supabase = serviceClient();

  try {
    // We only act on card moves between lists.
    const data = action.data ?? {};
    const card = data.card as CardRef | undefined;
    const listBefore = data.listBefore as ListRef | undefined;
    const listAfter = data.listAfter as ListRef | undefined;
    const board = data.board as { id: string } | undefined;

    if (action.type !== "updateCard" || !card || !listAfter || !listBefore || !board) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // Dedup on Trello's action id.
    if (!(await claimEvent(supabase, "trello", action.id))) {
      return new Response(JSON.stringify({ ok: true, deduped: true }), { status: 200 });
    }

    const sub = await subForBoard(supabase, board.id);
    const channelId = sub?.slack_channel_id ?? null;

    await recordStatus(supabase, {
      subId: sub?.id ?? null,
      channelId,
      boardId: board.id,
      card,
      status: listAfter.name,
    });

    if (!channelId) {
      // No Slack channel to notify (unlinked board) — status recorded, done.
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (isDoneList(listAfter.name)) {
      // Completion: post once, guarded by completed_notified_at.
      const { data: reqRow } = await supabase
        .from("design_requests")
        .select("completed_notified_at")
        .eq("trello_card_id", card.id)
        .maybeSingle();

      if ((reqRow as { completed_notified_at?: string })?.completed_notified_at) {
        return new Response(JSON.stringify({ ok: true, alreadyNotified: true }), { status: 200 });
      }

      let files: { name: string; url: string }[] = [];
      try {
        // All attachments — uploaded files and links (Figma, staging, Loom).
        files = (await cardAttachments(card.id))
          .filter((a) => a.url)
          .map((a) => ({ name: a.name || a.url, url: a.url }));
      } catch (err) {
        console.error("fetch attachments failed:", err);
      }

      await postMessage(
        channelId,
        `:sparkles: ${card.name} is ready for review — approve it right here.`,
        completionBlocks(card, files),
      );
      await supabase
        .from("design_requests")
        .update({ completed_notified_at: new Date().toISOString() })
        .eq("trello_card_id", card.id);
    } else {
      // Ordinary move: a lightweight status ping.
      const url = cardUrl(card);
      await postMessage(
        channelId,
        `:arrow_right: *${card.name}* moved to *${listAfter.name}*.` + (url ? ` <${url}|View>` : ""),
      );
    }
  } catch (err) {
    console.error("trello-webhook handler error:", err);
    // 200 anyway: a 500 makes Trello retry, and our dedup already consumed the
    // action id, so a retry would be skipped — the studio email/logs surface it.
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
