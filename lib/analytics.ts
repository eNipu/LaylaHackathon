"use client";

import type { PostHog } from "posthog-js";
import { firstTouch, type Attribution, type EventName } from "./event-schema";
type Identity = { anon_user_id: string; attribution: Attribution };
let identity: Identity | undefined;
let posthog: Pick<PostHog, "capture" | "identify"> | undefined;
const pending: { name: EventName; props: Record<string, unknown> }[] = [];
declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}
export function getIdentity(): Identity {
  if (identity) return identity;
  let stored: Identity | undefined;
  try {
    const parsed = JSON.parse(localStorage.getItem("launch_identity") || "null");
    if (parsed && /^[0-9a-f-]{36}$/i.test(parsed.anon_user_id) && parsed.attribution) stored = parsed;
  } catch { /* Private browsing can block storage. Use an in-memory identity. */ }
  identity = stored || { anon_user_id: crypto.randomUUID(), attribution: firstTouch(window.location.search) };
  try {
    localStorage.setItem("launch_identity", JSON.stringify(identity));
    localStorage.setItem("anon_user_id", identity.anon_user_id);
  } catch { /* In-memory fallback keeps the core interaction usable. */ }
  return identity;
}
export function connectPostHog(client: Pick<PostHog, "capture" | "identify">) {
  posthog = client;
  client.identify(getIdentity().anon_user_id);
  for (const item of pending.splice(0)) client.capture(item.name, item.props);
}
export function trackEvent(name: EventName, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const { anon_user_id, attribution } = getIdentity();
  const event = { ...props, event_id: crypto.randomUUID(), anon_user_id, ...attribution, event: name, timestamp: new Date().toISOString() };
  try {
    if (posthog) posthog.capture(name, event);
    else if (process.env.NEXT_PUBLIC_POSTHOG_KEY && pending.length < 50) pending.push({ name, props: event });
  } catch { /* Analytics must never block the demo. */ }
  try { window.fbq?.("trackCustom", name, { ...attribution, ...props }); } catch { /* Optional pixel. */ }
  void fetch("/api/events", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event), keepalive: true,
  }).catch(() => {});
}
