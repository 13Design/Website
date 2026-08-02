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
        text: `${hi} This is your private channel with 13 Design Studio — your direct line to the designer on your project. Here's how we work together.`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*📨 How to request design*\n" +
          "• Type `/design-request <what you need>` right here, or add a card to *📥 Design requests* on " +
          boardLink +
          ".\n" +
          "• One card per request. Include the goal, plus any links (Figma, staging, Loom) and assets.\n" +
          "• Order the list by priority — *we always start from the top.*",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*🔁 How work flows*\n" +
          "📥 Design requests → 🎨 In progress → 👀 In review → ✅ Done. We move your cards across the board and post updates here as they progress.",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*💬 Feedback & questions*\n" +
          "• Design feedback → *comment on the card* (keeps it with the work).\n" +
          "• Quick questions & chat → *right here in Slack*.",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*📦 When a request is done*\n" +
          "We post it here with the files and links, plus *Approve* and *Request changes* buttons — approve when you're happy, or ask for tweaks and we'll reopen it.",
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "We'll email you within one business day to book a kickoff call — but don't wait, send your first request whenever you're ready.",
        },
      ],
    },
  ];
}
