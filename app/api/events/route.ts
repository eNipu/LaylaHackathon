import { eventSchema } from "@/lib/event-schema";
import { saveEvent } from "@/lib/db";
import { isSameOrigin } from "@/lib/request";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
    const text = await request.text();
    if (text.length > 4096) return Response.json({ error: "Event too large." }, { status: 413 });
    let body;
    try { body = JSON.parse(text); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
    const result = eventSchema.safeParse(body);
    if (!result.success) return Response.json({ error: "Invalid event." }, { status: 400 });
    await saveEvent(result.data);
    return Response.json({ stored: true });
  } catch {
    return Response.json({ stored: false, error: "Usage storage is unavailable. The app still works." }, { status: 503 });
  }
}
