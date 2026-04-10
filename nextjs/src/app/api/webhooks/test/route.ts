import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "../../../../../auth-schema";
import { verifyApiKey, unauthorized } from "@/lib/api-auth";
import { hmacSign, generateId } from "@/lib/crypto";

export async function POST(request: Request) {
  const auth = await verifyApiKey(request);
  if (!auth) return unauthorized();

  const [userData] = await db
    .select({ webhookUrl: user.webhookUrl, webhookSecret: user.webhookSecret })
    .from(user)
    .where(eq(user.id, auth.userId))
    .limit(1);

  if (!userData?.webhookUrl) {
    return Response.json(
      {
        error: {
          code: "webhook_not_configured",
          message: "Set a webhook URL first: POST /api/webhooks",
        },
      },
      { status: 400 }
    );
  }

  const testPayload = {
    id: generateId("mw_evt"),
    keyword: "test-keyword",
    source: "mentionwatch",
    type: "test",
    title: "Test webhook from MentionWatch",
    text: "This is a test payload to verify your webhook endpoint is working correctly.",
    author: "mentionwatch",
    url: "https://mentionwatch.mlh.one",
    source_url: null,
    timestamp: new Date().toISOString(),
    delivered_at: new Date().toISOString(),
  };

  const body = JSON.stringify(testPayload);
  const signature = await hmacSign(body, userData.webhookSecret || "");

  try {
    const resp = await fetch(userData.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MentionWatch-Signature": signature,
      },
      body,
      redirect: "manual",
    });

    return Response.json({
      data: {
        sent: true,
        status: resp.status,
        url: userData.webhookUrl,
      },
    });
  } catch (err) {
    return Response.json(
      {
        error: {
          code: "webhook_delivery_failed",
          message: `Failed to deliver test webhook: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      },
      { status: 502 }
    );
  }
}
