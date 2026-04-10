import crypto from "crypto";

export function generateId(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(12);
  let id = "";
  for (const b of bytes) id += chars[b % chars.length];
  return `${prefix}_${id}`;
}

/** HMAC-SHA256 with sha256= prefix (for outbound webhook signatures) */
export async function hmacSign(
  payload: string,
  secret: string
): Promise<string> {
  const hex = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `sha256=${hex}`;
}

/** HMAC-SHA256 bare hex (for Creem webhook verification) */
export async function hmacSignRaw(
  payload: string,
  secret: string
): Promise<string> {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// SSRF protection: block private/reserved IPs
const BLOCKED_PATTERNS = [
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\./,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/169\.254\./,
  /^https?:\/\/0\./,
  /^https?:\/\/\[::1\]/,
  /^https?:\/\/\[fc/i,
  /^https?:\/\/\[fd/i,
  /^https?:\/\/\[fe80:/i,
];

export function isValidWebhookUrl(url: string): {
  valid: boolean;
  reason?: string;
} {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      return { valid: false, reason: "Webhook URL must use HTTPS" };
    }

    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(url)) {
        return { valid: false, reason: "Webhook URL must be a public endpoint" };
      }
    }

    if (!parsed.hostname.includes(".")) {
      return { valid: false, reason: "Webhook URL must be a public endpoint" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Invalid URL format" };
  }
}

export function validateKeyword(keyword: string): {
  valid: boolean;
  reason?: string;
} {
  if (!keyword || typeof keyword !== "string") {
    return { valid: false, reason: "Keyword is required" };
  }
  const trimmed = keyword.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { valid: false, reason: "Keyword must be 1-100 characters" };
  }
  if (!/^[a-zA-Z0-9\s\-_.]+$/.test(trimmed)) {
    return {
      valid: false,
      reason:
        "Keyword must be alphanumeric, spaces, hyphens, dots, or underscores",
    };
  }
  return { valid: true };
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return Response.json(
    { error: { code, message, ...extra } },
    { status, headers: { "Content-Type": "application/json" } }
  );
}
