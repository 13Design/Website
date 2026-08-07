// Shared one-time client onboarding.
//
// Provisions the client workspace — a private Trello request board (client
// invited + design team added + activity webhook), a private Slack channel
// (#<client>-design with team + client + welcome message), and a welcome
// email. Returns the ids created plus a list of any non-fatal failures so the
// caller can record what happened and alert the studio.
//
// Extracted so the invoice-based `subscribe-approve` flow runs the exact same
// provisioning the (now retired) paddle-webhook used to.

import {
  channelNameFor,
  designTeamSlackIds,
  designTeamTrelloIds,
  STUDIO_EMAIL,
  tierLabel,
} from "./config.ts";
import {
  addBoardMember,
  createBoardWebhook,
  inviteMemberByEmail,
  provisionBoard,
} from "./trello.ts";
import {
  createChannel,
  inviteClient,
  inviteLink,
  inviteUsers,
  postMessage,
} from "./slack.ts";
import { sendEmail, welcomeHtml } from "./email.ts";
import { channelWelcomeBlocks } from "./messages.ts";

/** URL Trello should call for a provisioned board's activity. */
export function trelloCallbackUrl(): string | null {
  const explicit = Deno.env.get("TRELLO_WEBHOOK_CALLBACK_URL");
  if (explicit) return explicit;
  const base = Deno.env.get("SUPABASE_URL");
  return base ? `${base}/functions/v1/trello-webhook` : null;
}

export type OnboardResult = {
  boardId: string | null;
  boardUrl: string | null;
  slackChannelId: string | null;
  slackChannelName: string | null;
  failures: string[];
};

export async function onboard(opts: {
  email: string;
  name: string;
  tier: string;
  /** Overrides the welcome-email subtitle; pass "" for direct (non-tier) clients. */
  planLabel?: string;
}): Promise<OnboardResult> {
  const failures: string[] = [];
  const clientLabel = opts.name || opts.email.split("@")[0];
  const firstName = opts.name.split(" ")[0] ?? "";

  let boardId: string | null = null;
  let boardUrl: string | null = null;

  // --- Trello: board + client invite + team + activity webhook ---
  try {
    const board = await provisionBoard(clientLabel);
    boardId = board.boardId;
    boardUrl = board.boardUrl;

    try {
      await inviteMemberByEmail(boardId, opts.email);
    } catch (err) {
      failures.push(`Trello client invite: ${err}`);
    }

    for (const memberId of designTeamTrelloIds()) {
      try {
        await addBoardMember(boardId, memberId);
      } catch (err) {
        failures.push(`Trello team add (${memberId}): ${err}`);
      }
    }

    const callback = trelloCallbackUrl();
    if (callback) {
      try {
        await createBoardWebhook(boardId, callback);
      } catch (err) {
        failures.push(`Trello board webhook: ${err}`);
      }
    } else {
      failures.push("Trello board webhook skipped: no callback URL configured");
    }
  } catch (err) {
    console.error("Trello provisioning failed:", err);
    failures.push(`Trello board: ${err}`);
  }

  // --- Slack: dedicated channel + team + client + welcome message ---
  let slackChannelId: string | null = null;
  let slackChannelName: string | null = null;
  try {
    const channel = await createChannel(channelNameFor(clientLabel));
    if (channel) {
      slackChannelId = channel.id;
      slackChannelName = channel.name;

      await inviteUsers(channel.id, designTeamSlackIds());

      const invited = await inviteClient(channel.id, opts.email);
      // Only a real problem if we couldn't add them AND there's no invite link
      // for the welcome email to carry — otherwise the link is the intended path.
      if (!invited.added && !inviteLink()) {
        failures.push(
          `Slack client invite failed (${invited.error ?? "unavailable"}) and no SLACK_INVITE_URL is set — add the client to their channel manually.`,
        );
      }

      await postMessage(
        channel.id,
        `Welcome to 13 Design Studio${firstName ? `, ${firstName}` : ""}!`,
        channelWelcomeBlocks(firstName, boardUrl),
      );
    } else {
      failures.push("Slack channel not created (check SLACK_BOT_TOKEN + scopes)");
    }
  } catch (err) {
    console.error("Slack provisioning failed:", err);
    failures.push(`Slack channel: ${err}`);
  }

  // --- Client welcome email ---
  const slackUrl = inviteLink();
  const sent = await sendEmail({
    to: opts.email,
    subject: "Welcome to 13 Design Studio — your workspace is ready",
    html: welcomeHtml({
      firstName,
      tierLabel: opts.planLabel !== undefined ? opts.planLabel : tierLabel(opts.tier),
      boardUrl,
      slackUrl,
    }),
    replyTo: STUDIO_EMAIL,
  });
  if (!sent) failures.push("Welcome email did not send (Resend)");

  return { boardId, boardUrl, slackChannelId, slackChannelName, failures };
}
