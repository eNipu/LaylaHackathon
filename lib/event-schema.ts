import { z } from "zod";

export const eventNames = ["landing_view", "core_action_started", "core_action_completed", "share_or_conversion_clicked"] as const;
export type EventName = (typeof eventNames)[number];
export const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref"] as const;
export type Attribution = Record<(typeof attributionKeys)[number], string | null>;
export function firstTouch(search: string): Attribution {
  const params = new URLSearchParams(search);
  return Object.fromEntries(attributionKeys.map(key => [key, params.get(key)?.slice(0, 200) || null])) as Attribution;
}
export const eventSchema = z.object({
  event_id: z.uuid(),
  anon_user_id: z.uuid(),
  event: z.enum(eventNames),
  timestamp: z.iso.datetime(),
  utm_source: z.string().max(200).nullable(),
  utm_medium: z.string().max(200).nullable(),
  utm_campaign: z.string().max(200).nullable(),
  utm_content: z.string().max(200).nullable(),
  ref: z.string().max(200).nullable(),
  mode: z.enum(["live", "demo"]).optional(),
});
export type UsageEvent = z.infer<typeof eventSchema>;
export type Metrics = {
  visitors: number;
  active: number;
  activation: number;
  referrals: number;
  shares: number;
  channels: { source: string; creative: string; visitors: number; active: number }[];
  recent: { id: string; timestamp: string }[];
  updatedAt: string;
};
