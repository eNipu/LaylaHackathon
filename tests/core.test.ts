import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID } from "node:crypto";
import { firstTouch, eventSchema, type UsageEvent } from "../lib/event-schema";
import { saveEvent, readMetrics } from "../lib/db";
import { POST as generate } from "../app/api/generate/route";
import { POST as events } from "../app/api/events/route";
import { isSameOrigin } from "../lib/request";

test("origin validation supports internal URL rewriting and rejects foreign hosts", () => {
  assert.equal(isSameOrigin(new Request("http://localhost:3100/api/events", { headers: { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100" } })), true);
  assert.equal(isSameOrigin(new Request("http://localhost:3100/api/events", { headers: { host: "127.0.0.1:3100", origin: "https://other.test" } })), false);
});
process.env.DATABASE_URL = ":memory:";
delete process.env.ANTHROPIC_API_KEY;
function event(user: string, name: UsageEvent["event"], overrides: Partial<UsageEvent> = {}): UsageEvent {
  return { event_id: randomUUID(), anon_user_id: user, event: name, timestamp: new Date().toISOString(), ...firstTouch(""), ...overrides };
}
test("attribution captures every requested first-touch field and bounds values", () => {
  assert.deepEqual(firstTouch("?utm_source=ig&utm_medium=social&utm_campaign=launch&utm_content=video&ref=abc"), {
    utm_source: "ig", utm_medium: "social", utm_campaign: "launch", utm_content: "video", ref: "abc",
  });
  assert.equal(firstTouch(`?utm_content=${"a".repeat(300)}`).utm_content?.length, 200);
  assert.equal(eventSchema.safeParse({ event: "fake" }).success, false);
});
test("database deduplicates users/events, keeps first touch, excludes demos, anonymizes feed", async () => {
  const a = randomUUID(), b = randomUUID();
  const landing = event(a, "landing_view", { utm_source: "instagram", utm_content: "creative-a" });
  await saveEvent(landing); await saveEvent(landing);
  await saveEvent(event(a, "core_action_completed", { mode: "live", utm_source: "changed" }));
  await saveEvent(event(a, "core_action_completed", { mode: "live" }));
  await saveEvent(event(b, "landing_view", { ref: a }));
  await saveEvent(event(b, "core_action_completed", { mode: "demo" }));
  await saveEvent(event(b, "share_or_conversion_clicked"));
  const metrics = await readMetrics();
  assert.equal(metrics.visitors, 2); assert.equal(metrics.active, 1);
  assert.equal(metrics.activation, 50); assert.equal(metrics.referrals, 1);
  assert.equal(metrics.shares, 1); assert.equal(metrics.recent.length, 2);
  assert.ok(!JSON.stringify(metrics).includes(a));
  assert.ok(metrics.channels.some(c => c.source === "instagram" && c.active === 1));
  assert.ok(!metrics.channels.some(c => c.source === "changed"));
});
test("generation rejects invalid input and missing credentials yield a labeled fallback", async () => {
  const request = (body: string) => new Request("http://localhost/api/generate", { method: "POST", body });
  assert.equal((await generate(request("{}"))).status, 400);
  assert.equal((await generate(request("null"))).status, 400);
  assert.equal((await generate(request("{"))).status, 400);
  assert.equal((await generate(request(JSON.stringify({ prompt: "a".repeat(2001) })))).status, 400);
  const response = await generate(request(JSON.stringify({ prompt: "Help students cook." })));
  const result = JSON.parse((await response.text()).trim());
  assert.equal(result.type, "fallback"); assert.ok(result.text.length > 30);
});
test("events reject malformed, oversized, and cross-origin requests", async () => {
  assert.equal((await events(new Request("http://localhost/api/events", { method: "POST", body: "{" }))).status, 400);
  assert.equal((await events(new Request("http://localhost/api/events", { method: "POST", body: "{}" }))).status, 400);
  assert.equal((await events(new Request("http://localhost/api/events", { method: "POST", body: "x".repeat(5000) }))).status, 413);
  assert.equal((await events(new Request("http://localhost/api/events", { method: "POST", headers: { origin: "https://other.test" }, body: "{}" }))).status, 403);
});
