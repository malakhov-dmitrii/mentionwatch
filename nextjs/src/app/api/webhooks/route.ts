import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "../../../../auth-schema";
import { verifyApiKey, unauthorized } from "@/lib/api-auth";
import { isValidWebhookUrl } from "@/lib/crypto";

export async function GET(request: Request) {
  const auth = await verifyApiKey(request);
  if (!auth) return unauthorized();

  const [userData] = await db
    .select({ webhookUrl: user.webhookUrl, webhookSecret: user.webhookSecret })
    .from(user)
    .where(eq(user.id, auth.userId))
    .limit(1);

  return Response.json({
    data: {
      url: userData?.webhookUrl || null,
      secret: userData?.webhookSecret ? "[configured]" : null,
    },
  });
}

export async function POST(request: Request) {
  const auth = await verifyApiKey(request);
  if (!auth) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.url) {
    return Response.json(
      { error: { code: "invalid_webhook_url", message: "URL is required" } },
      { status: 400 }
    );
  }

  const validation = isValidWebhookUrl(body.url);
  if (!validation.valid) {
    return Response.json(
      { error: { code: "invalid_webhook_url", message: validation.reason } },
      { status: 400 }
    );
  }

  await db
    .update(user)
    .set({ webhookUrl: body.url })
    .where(eq(user.id, auth.userId));

  return Response.json({ data: { url: body.url } });
}
