import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { checkoutSessions } from "@/lib/schema";
import { user } from "../../../../auth-schema";
import { auth } from "@/lib/auth";
import { hmacSignRaw, generateId } from "@/lib/crypto";

export async function POST(request: Request) {
  const signature = request.headers.get("creem-signature");
  if (!signature) {
    return Response.json(
      { error: { code: "missing_signature", message: "Missing creem-signature header" } },
      { status: 401 }
    );
  }

  const rawBody = await request.text();

  // Verify HMAC-SHA256 (bare hex, no prefix)
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CREEM_WEBHOOK_SECRET not configured");
    return Response.json(
      { error: { code: "internal_error", message: "Webhook verification not configured" } },
      { status: 500 }
    );
  }

  const computed = await hmacSignRaw(rawBody, secret);
  if (computed !== signature) {
    return Response.json(
      { error: { code: "invalid_signature", message: "Invalid webhook signature" } },
      { status: 401 }
    );
  }

  const event = JSON.parse(rawBody);
  if (event.event_type !== "checkout.completed") {
    return Response.json({ received: true });
  }

  const order = event.object;
  const checkoutId = order.checkout_id || order.id;

  if (!checkoutId) {
    return Response.json(
      { error: { code: "missing_checkout_id", message: "No checkout_id in payload" } },
      { status: 400 }
    );
  }

  // Idempotency: check if already provisioned
  const [existing] = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.checkoutId, checkoutId))
    .limit(1);

  if (existing) {
    return Response.json({ received: true, status: "already_provisioned" });
  }

  // Determine plan from product_id
  const productId = (order.product_id || "").toLowerCase();
  const plan = productId.includes("pro") ? "pro" : "starter";

  // Create user via Better Auth
  const email = order.customer?.email || `checkout-${checkoutId}@mentionwatch.com`;

  // Create user in Better Auth
  const newUser = await auth.api.signUpEmail({
    body: {
      email,
      password: generateId("pw"), // random password, user authenticates via API key
      name: email.split("@")[0],
    },
  });

  const userId = newUser?.user?.id;
  if (!userId) {
    console.error("Failed to create user for checkout", checkoutId);
    return Response.json(
      { error: { code: "user_creation_failed", message: "Failed to create user" } },
      { status: 500 }
    );
  }

  // Update user with plan and webhook secret
  const webhookSecret = generateId("mw_whsec");
  await db
    .update(user)
    .set({ plan, webhookSecret })
    .where(eq(user.id, userId));

  // Create API key via Better Auth
  const apiKeyResult = await auth.api.createApiKey({
    body: {
      prefix: "mw_live",
      name: `${plan}-key`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId: userId as any,
    },
  });

  const apiKey = apiKeyResult?.key || generateId("mw_live");

  // Store checkout session (for welcome page lookup)
  await db.insert(checkoutSessions).values({
    id: generateId("mw_cs"),
    checkoutId,
    apiKey,
    webhookSecret,
    plan,
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h TTL
  });

  return Response.json({ received: true, status: "provisioned" });
}
