// Crypto utilities, SSRF protection, ID generation

export function generateId(prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  for (const b of bytes) id += chars[b % chars.length];
  return `${prefix}_${id}`;
}

export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256=${hex}`;
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

export function isValidWebhookUrl(url: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Webhook URL must use HTTPS' };
    }

    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(url)) {
        return { valid: false, reason: 'Webhook URL must be a public endpoint' };
      }
    }

    if (!parsed.hostname.includes('.')) {
      return { valid: false, reason: 'Webhook URL must be a public endpoint' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

export function validateKeyword(keyword: string): { valid: boolean; reason?: string } {
  if (!keyword || typeof keyword !== 'string') {
    return { valid: false, reason: 'Keyword is required' };
  }
  const trimmed = keyword.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { valid: false, reason: 'Keyword must be 1-100 characters' };
  }
  if (!/^[a-zA-Z0-9\s\-_.]+$/.test(trimmed)) {
    return { valid: false, reason: 'Keyword must be alphanumeric, spaces, hyphens, dots, or underscores' };
  }
  return { valid: true };
}

export function errorResponse(code: string, message: string, status: number, extra?: Record<string, unknown>) {
  return Response.json(
    { error: { code, message, ...extra } },
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}
