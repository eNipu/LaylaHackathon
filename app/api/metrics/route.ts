import { readMetrics } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await readMetrics(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Metrics storage is unavailable. Check DATABASE_URL." }, { status: 503 });
  }
}
