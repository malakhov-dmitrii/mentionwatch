import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { mentions } from "@/lib/schema";
import { verifyApiKey, unauthorized } from "@/lib/api-auth";

export async function GET(request: Request) {
  const auth = await verifyApiKey(request);
  if (!auth) return unauthorized();

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

  const rows = await db
    .select()
    .from(mentions)
    .where(eq(mentions.userId, auth.userId))
    .orderBy(desc(mentions.createdAt))
    .limit(limit);

  return Response.json({ data: rows });
}
