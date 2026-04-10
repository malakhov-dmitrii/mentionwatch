import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { keywords } from "@/lib/schema";
import { verifyApiKey, unauthorized } from "@/lib/api-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyApiKey(request);
  if (!auth) return unauthorized();

  const { id } = await params;

  const [deleted] = await db
    .delete(keywords)
    .where(and(eq(keywords.id, id), eq(keywords.userId, auth.userId)))
    .returning();

  if (!deleted) {
    return Response.json(
      { error: { code: "keyword_not_found", message: `Keyword ${id} not found` } },
      { status: 404 }
    );
  }

  return new Response(null, { status: 204 });
}
