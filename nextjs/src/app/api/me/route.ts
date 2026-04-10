import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { keywords, PLAN_LIMITS, type Plan } from "@/lib/schema";
import { user } from "@/lib/auth-schema";
import { verifyApiKey, unauthorized } from "@/lib/api-auth";

export async function GET(request: Request) {
  const auth = await verifyApiKey(request);
  if (!auth) return unauthorized();

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, auth.userId))
    .limit(1);

  if (!userData) {
    return Response.json(
      { error: { code: "user_not_found", message: "User not found" } },
      { status: 404 }
    );
  }

  const plan = (userData.plan || "starter") as Plan;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

  const keywordCount = await db
    .select()
    .from(keywords)
    .where(eq(keywords.userId, auth.userId));

  return Response.json({
    data: {
      email: userData.email,
      plan,
      keywords: { used: keywordCount.length, limit: limits.keywords },
      mentions: {
        used: userData.mentionsThisMonth || 0,
        limit: limits.mentions,
      },
      webhook_url: userData.webhookUrl || null,
      created_at: userData.createdAt,
    },
  });
}
