/**
 * Single source of truth for landing-page copy and branding.
 * Swap these values at kickoff to re-skin the product; re-theme colors via `--accent` in app/globals.css.
 */
export const site = {
  brand: { name: "layla", mark: "l.", tagline: "Build & Launch" },
  status: "Live",
  hero: {
    eyebrow: "Small idea. Real momentum.",
    // Headline is split so the accent highlight can wrap the final phrase.
    headline: { lead: "Less planning.", highlight: "More first users." },
    subhead: "Turn the thing you want to build into a practical plan to reach the people who need it.",
  },
  generator: {
    label: "What are you building?",
    placeholder: "An idea, a problem, a half-formed thought…",
    exampleChip: "Try Example",
    cta: "Make my launch plan",
    ctaBusy: "Making your plan…",
    reassurance: "No account. No setup. Just a useful next step.",
    busyStatus: "Building your first-user launch plan…",
    resultTitle: "Your next move",
    resultLabel: "Your launch plan",
    resultPlaceholder: "Finding a useful place to start…",
  },
  proof: [
    { title: "Instant", body: "A useful result in seconds. No waiting room." },
    { title: "Verified", body: "Real usage, measured honestly. Never padded." },
    { title: "Free", body: "No signup or card before you see value." },
  ],
  footer: { left: "Layla / Build & Launch", right: "Useful beats unfinished." },
} as const;
