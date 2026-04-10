import { hmacSign } from "./crypto";

export const RETRY_DELAYS = [0, 10_000, 60_000, 300_000]; // 4 attempts: immediate, 10s, 60s, 5min

export interface WebhookPayload {
  id: string;
  keyword: string;
  source: string;
  type: string;
  title: string;
  text: string;
  author: string;
  url: string;
  source_url: string | null;
  timestamp: string;
  delivered_at: string;
}

export async function deliverWebhook(
  webhookUrl: string,
  webhookSecret: string,
  payload: WebhookPayload,
  retryDelays = RETRY_DELAYS
): Promise<{ success: boolean; attempts: number; lastError?: string }> {
  const body = JSON.stringify(payload);
  const signature = await hmacSign(body, webhookSecret);

  for (let attempt = 0; attempt < retryDelays.length; attempt++) {
    const delay = retryDelays[attempt];
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MentionWatch-Signature": signature,
        },
        body,
        redirect: "manual", // SSRF hardening: don't follow redirects
      });

      if (resp.ok) {
        return { success: true, attempts: attempt + 1 };
      }
    } catch {
      // network error, retry
    }
  }

  return {
    success: false,
    attempts: retryDelays.length,
    lastError: "All delivery attempts failed",
  };
}
