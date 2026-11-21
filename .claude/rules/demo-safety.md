---
paths:
  - "app/**"
  - "components/**"
  - "lib/**"
---
# Demo safety

- New or modified external API calls must have a total 10-second deadline, including retries and streaming. Use `AbortSignal.timeout(10_000)` combined with caller cancellation; clear manual timers on every exit.
- Catch startup, network, timeout, parsing, and mid-stream failures. Return a deterministic, clearly labeled saved fallback with the same UI contract; never expose raw upstream errors or secrets.
- Do not fire `core_action_completed` for fallbacks, partial streams, cancellations, or errors. Never invent users to make the demo look active.
- Guard optional data before property access, iteration, and rendering. Use explicit loading, empty, and error states plus nullish defaults; no literal `undefined`, unsafe non-null assertions, or missing nested data that can crash a render.
- Verify success, timeout, missing credentials, empty data, and interrupted-stream paths. Rules are guidance, not runtime enforcement: flag existing violations rather than claiming they are fixed. The existing generation route has a 20-second deadline; changing it requires a separate authorized app edit.
