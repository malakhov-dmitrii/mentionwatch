import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { keywords, PLAN_LIMITS, type Plan } from "@/lib/schema";
import { user } from "../../../../auth-schema";
import { verifyApiKey, unauthorized } from "@/lib/api-auth";
import { generateId, validateKeyword } from "@/lib/crypto";

export async function GET(request: Request) {
  const auth = await verifyApiKey(request);
  if (!auth) return unauthorized();

  const rows = await db
    .select()
    .from(keywords)
    .where(eq(keywords.userId, auth.userId));

  return Response.json({ data: rows });
}

export async function POST(request: Request) {
  const auth = await verifyApiKey(request);
  if (!auth) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.keyword) {
    return Response.json(
      { error: { code: "invalid_keyword", message: "Keyword is required" } },
      { status: 400 }
    );
  }

  const validation = validateKeyword(body.keyword);
  if (!validation.valid) {
    return Response.json(
      { error: { code: "invalid_keyword", message: validation.reason } },
      { status: 400 }
    );
  }

  // Check plan limit
  const [userData] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, auth.userId))
    .limit(1);

  const plan = (userData?.plan || "starter") as Plan;
  const limit = PLAN_LIMITS[plan]?.keywords || 5;

  const existing = await db
    .select()
    .from(keywords)
    .where(eq(keywords.userId, auth.userId));

  if (existing.length >= limit) {
    return Response.json(
      {
        error: {
          code: "keyword_limit_exceeded",
          message: `${plan} plan allows ${limit} keywords. You have ${existing.length}.`,
        },
      },
      { status: 403 }
    );
  }

  // Check duplicate
  const trimmed = body.keyword.trim().toLowerCase();
  const duplicate = existing.find(
    (k) => k.keyword.toLowerCase() === trimmed
  );
  if (duplicate) {
    return Response.json(
      {
        error: {
          code: "duplicate_keyword",
          message: `Keyword "${body.keyword}" already exists`,
        },
      },
      { status: 409 }
    );
  }

  const id = generateId("mw_kw");
  const [created] = await db
    .insert(keywords)
    .values({
      id,
      userId: auth.userId,
      keyword: body.keyword.trim(),
    })
    .returning();

  return Response.json({ data: created }, { status: 201 });
}
