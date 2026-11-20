# Team alignment

## Goal
Ship within 26 hours with a ~3-person team. Real Active Users count DOUBLE; prioritize the core value moment, Works Live, Launch & Marketing, a 3-minute pitch, then Idea/Problem. Never invent usage or count fallback examples as real AI completions.

## Stack
Next.js App Router, TypeScript (strict), Tailwind CSS v4, shadcn/ui primitives, Vercel AI SDK with Anthropic, PostHog, optional Meta Pixel, SQLite/libSQL event storage.

## Commands
- `npm install`: install dependencies.
- `npm run dev`: local app on port 3000.
- `npm run lint`: ESLint.
- `npm test`: focused logic/API tests.
- `npm run test:e2e`: browser checks (install Chromium with `npx playwright install chromium` first).
- `npm run build`: production build.
- `npm start`: serve the production build.

## Strict rules
- Mobile-first: use `100dvh`, safe-area padding, 44px touch targets, and zero horizontal overflow. Check 375px layouts.
- Zero login wall before the core value moment.
- No heavy 3D/WebGL that slows mobile load. Prefer CSS transitions; use lightweight Framer Motion only when necessary.
- Every API route must have try/catch error handling, bounded inputs, and a clean fallback so live stage demos never crash. Handle streaming failures after headers as well as startup failures.
- Keep secrets server-only. Never commit `.env.local` or put an API key in a `NEXT_PUBLIC_` variable.
- Use the four events in `lib/event-schema.ts`. Deduplicate visitors and active users by `anon_user_id`; exclude demo fallbacks from active counts.
- Metrics are anonymous browser estimates, not verified human identities. Do not seed fake usage. Do not send prompts, generated text, or raw IDs to the public dashboard.
- Local SQLite is for a single persistent Node server. Configure a shared hosted `DATABASE_URL` and optional `DATABASE_AUTH_TOKEN` for serverless/multi-instance production.
- **Always run `npm run build` before finishing a task.**
