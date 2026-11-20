import { createHash } from "node:crypto";
import { createClient, type Client } from "@libsql/client";
import type { Metrics, UsageEvent } from "./event-schema";

let client: Client | undefined;
let ready: Promise<void> | undefined;
async function database() {
  if (!client) {
    const url = process.env.DATABASE_URL || "file:events.db";
    if ((process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) && (url.startsWith("file:") || url === ":memory:")) {
      throw new Error("A shared DATABASE_URL is required on serverless hosts.");
    }
    client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  }
  const db = client;
  ready ??= db.batch([
    `CREATE TABLE IF NOT EXISTS visitors (
      anon_user_id TEXT PRIMARY KEY, utm_source TEXT, utm_medium TEXT,
      utm_campaign TEXT, utm_content TEXT, ref TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS events (
      event_id TEXT PRIMARY KEY, anon_user_id TEXT NOT NULL, event TEXT NOT NULL,
      utm_source TEXT, utm_content TEXT, ref TEXT, timestamp TEXT NOT NULL
    )`,
    "CREATE INDEX IF NOT EXISTS events_kind_user ON events(event, anon_user_id)",
    "CREATE INDEX IF NOT EXISTS events_recent ON events(event, timestamp DESC)",
  ], "write").then(() => {}).catch(error => { ready = undefined; throw error; });
  await ready;
  return db;
}

export async function saveEvent(event: UsageEvent) {
  // Demo responses never contribute to the primary activation metric.
  if (event.event === "core_action_completed" && event.mode !== "live") return;
  const db = await database();
  await db.batch([
    {
      sql: "INSERT OR IGNORE INTO visitors VALUES (?, ?, ?, ?, ?, ?)",
      args: [event.anon_user_id, event.utm_source, event.utm_medium, event.utm_campaign, event.utm_content, event.ref],
    },
    {
      sql: `INSERT OR IGNORE INTO events
        SELECT ?, anon_user_id, ?, utm_source, utm_content, ref, ? FROM visitors WHERE anon_user_id = ?`,
      args: [event.event_id, event.event, new Date().toISOString(), event.anon_user_id],
    },
  ], "write");
}

export async function readMetrics(): Promise<Metrics> {
  const db = await database();
  const [totals, channels, recent] = await db.batch([
    `SELECT COUNT(*) AS visitors,
      COUNT(DISTINCT CASE WHEN e.anon_user_id IS NOT NULL THEN v.anon_user_id END) AS active,
      COUNT(DISTINCT CASE WHEN v.ref IS NOT NULL AND v.ref != v.anon_user_id THEN v.anon_user_id END) AS referrals,
      (SELECT COUNT(DISTINCT anon_user_id) FROM events WHERE event = 'share_or_conversion_clicked') AS shares
      FROM visitors v LEFT JOIN
      (SELECT DISTINCT anon_user_id FROM events WHERE event = 'core_action_completed') e
      ON v.anon_user_id = e.anon_user_id`,
    `SELECT COALESCE(v.utm_source, 'direct') AS source, COALESCE(v.utm_content, 'unassigned') AS creative,
      COUNT(DISTINCT v.anon_user_id) AS visitors, COUNT(DISTINCT e.anon_user_id) AS active
      FROM visitors v LEFT JOIN events e ON e.anon_user_id = v.anon_user_id AND e.event = 'core_action_completed'
      GROUP BY v.utm_source, v.utm_content ORDER BY visitors DESC LIMIT 50`,
    "SELECT event_id, anon_user_id, timestamp FROM events WHERE event = 'core_action_completed' ORDER BY timestamp DESC LIMIT 10",
  ], "read");
  const row = totals.rows[0];
  const visitors = Number(row.visitors);
  const active = Number(row.active);
  return {
    visitors, active, activation: visitors ? Math.round(active / visitors * 1000) / 10 : 0,
    referrals: Number(row.referrals), shares: Number(row.shares),
    channels: channels.rows.map(r => ({ source: String(r.source), creative: String(r.creative), visitors: Number(r.visitors), active: Number(r.active) })),
    recent: recent.rows.map(r => ({
      id: createHash("sha256").update(String(r.anon_user_id)).digest("hex").slice(0, 8),
      timestamp: String(r.timestamp),
    })),
    updatedAt: new Date().toISOString(),
  };
}
