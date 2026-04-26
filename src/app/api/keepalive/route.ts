import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.execute(sql`SELECT 1`);
  return Response.json({ ok: true, ts: new Date().toISOString() });
}
