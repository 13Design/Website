// Shared Slack message content, so real onboarding and any test harness post the
// exact same client-facing copy.

/** The "how we work" welcome posted into a new client's channel at onboarding. */
export function channelWelcomeBlocks(firstName: string, boardUrl: string | null): unknown[] {
  const hi = firstName ? `Welcome, ${firstName}! :wave:` : "Welcome! :wave:";
  const boardLink = boardUrl ? `<${boardUrl}|your board>` : "your board";
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${hi} This is your private channel with 13 Design Studio — your direct line to the team on your project. Here's how we work together.`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*🔁 How the work flows*\n" +
          "We track everything on " + boardLink +
          ": *📋 To do → 🎨 In progress → 👀 In review → ✅ Done*. As we work, cards move across the board and we post updates right here.",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*✅ Reviewing the work*\n" +
          "When something's ready, we post it here with the files and links, plus *Approve* and *Request changes* buttons — approve when you're happy, or ask for tweaks and we'll reopen it.",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*💬 Feedback & questions*\n" +
          "• On a specific piece → *comment on its card* (keeps it with the work).\n" +
          "• Anything else → *right here in Slack*, anytime.",
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Nothing to set up on your end — just follow along here and on the board, and we'll keep it moving.",
        },
      ],
    },
  ];
}
