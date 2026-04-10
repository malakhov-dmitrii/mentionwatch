import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  generateId, hashApiKey, hmacSign,
  isValidWebhookUrl, validateKeyword, errorResponse,
} from './utils';
import { searchHN, hnHitToMention } from './hn';

type Bindings = {
  KV: KVNamespace;
  CREEM_API_KEY: string;
  CREEM_WEBHOOK_SECRET: string;
  LANDING_URL: string;
};

type Variables = {
  customer: CustomerData;
  customerId: string;
};

type CustomerData = {
  id: string;
  email: string;
  plan: 'starter' | 'pro';
  api_key_hash: string;
  webhook_secret: string;
  webhook_url?: string;
  keywords: { id: string; keyword: string; created_at: string }[];
  mentions_this_month: number;
  month_reset: string;
  created_at: string;
};

const PLAN_LIMITS = {
  starter: { keywords: 5, mentions: 5000 },
  pro: { keywords: 25, mentions: 50000 },
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// CORS for landing page
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Authorization', 'Content-Type'],
}));

// Rate limiting middleware (simple KV-based)
app.use('/api/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return next(); // Auth middleware will catch this

  const key = authHeader.replace('Bearer ', '');
  const rateKey = `rate:${key}:${Math.floor(Date.now() / 60000)}`; // per-minute bucket
  const count = parseInt((await c.env.KV.get(rateKey)) || '0');

  if (count >= 100) {
    const retryAfter = 60 - (Math.floor(Date.now() / 1000) % 60);
    return errorResponse('rate_limit', `100 requests/min exceeded. Retry after ${retryAfter} seconds.`, 429, { retry_after: retryAfter });
  }

  await c.env.KV.put(rateKey, String(count + 1), { expirationTtl: 120 });
  return next();
});

// Auth middleware (skip for creem webhook and welcome)
async function authMiddleware(c: any, next: () => Promise<void>) {
  const path = c.req.path;
  if (path === '/api/creem-webhook' || path === '/api/welcome' || path === '/') {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('auth_required', 'Include Authorization: Bearer <api_key> header', 401, { docs: '/docs#auth' });
  }

  const apiKey = authHeader.replace('Bearer ', '');
  const keyHash = await hashApiKey(apiKey);
  const customerId = await c.env.KV.get(`key:${keyHash}`);

  if (!customerId) {
    return errorResponse('invalid_api_key', 'API key not found. Check your key at /welcome', 401, { docs: '/docs#auth' });
  }

  const customerData = await c.env.KV.get(`customer:${customerId}`, 'json') as CustomerData | null;
  if (!customerData) {
    return errorResponse('invalid_api_key', 'Customer not found', 401);
  }

  c.set('customer', customerData);
  c.set('customerId', customerId);
  return next();
}

app.use('/api/keywords/*', authMiddleware);
app.use('/api/keywords', authMiddleware);
app.use('/api/webhooks/*', authMiddleware);
app.use('/api/webhooks', authMiddleware);
app.use('/api/mentions', authMiddleware);
app.use('/api/me', authMiddleware);

// ─── Routes ───

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'mentionwatch-api' }));

// GET /api/me
app.get('/api/me', (c) => {
  const customer = c.get('customer') as CustomerData;
  const limits = PLAN_LIMITS[customer.plan];
  return c.json({
    data: {
      id: customer.id,
      email: customer.email,
      plan: customer.plan,
      keywords_used: customer.keywords.length,
      keywords_limit: limits.keywords,
      mentions_used: customer.mentions_this_month,
      mentions_limit: limits.mentions,
      month_reset: customer.month_reset,
    },
  });
});

// ─── Keywords ───

app.get('/api/keywords', (c) => {
  const customer = c.get('customer') as CustomerData;
  const limits = PLAN_LIMITS[customer.plan];
  return c.json({
    data: customer.keywords,
    meta: { total: customer.keywords.length, limit: limits.keywords },
  });
});

app.post('/api/keywords', async (c) => {
  const customer = c.get('customer') as CustomerData;
  const customerId = c.get('customerId') as string;
  const limits = PLAN_LIMITS[customer.plan];

  const body = await c.req.json().catch(() => null);
  if (!body?.keyword) {
    return errorResponse('invalid_keyword', 'keyword field is required', 400, { docs: '/docs#keywords' });
  }

  const validation = validateKeyword(body.keyword);
  if (!validation.valid) {
    return errorResponse('invalid_keyword', validation.reason!, 400, { docs: '/docs#keywords' });
  }

  const keyword = body.keyword.trim().toLowerCase();

  // Check duplicate
  if (customer.keywords.some(k => k.keyword === keyword)) {
    return errorResponse('duplicate_keyword', `Keyword "${keyword}" already exists`, 409);
  }

  // Check limit
  if (customer.keywords.length >= limits.keywords) {
    return errorResponse('keyword_limit_exceeded',
      `${customer.plan} plan allows ${limits.keywords} keywords. You have ${customer.keywords.length}.`,
      403, { upgrade_url: '/pricing', docs: '/docs#limits' });
  }

  const kw = { id: generateId('kw'), keyword, created_at: new Date().toISOString() };
  customer.keywords.push(kw);
  await c.env.KV.put(`customer:${customerId}`, JSON.stringify(customer));

  return c.json({
    data: kw,
    meta: { remaining_keywords: limits.keywords - customer.keywords.length },
  }, 201);
});

app.delete('/api/keywords/:id', async (c) => {
  const customer = c.get('customer') as CustomerData;
  const customerId = c.get('customerId') as string;
  const kwId = c.req.param('id');

  const idx = customer.keywords.findIndex(k => k.id === kwId);
  if (idx === -1) {
    return errorResponse('keyword_not_found', `Keyword ${kwId} not found`, 404);
  }

  customer.keywords.splice(idx, 1);
  await c.env.KV.put(`customer:${customerId}`, JSON.stringify(customer));
  return new Response(null, { status: 204 });
});

// ─── Webhooks ───

app.get('/api/webhooks', (c) => {
  const customer = c.get('customer') as CustomerData;
  return c.json({
    data: {
      url: customer.webhook_url || null,
      updated_at: customer.created_at,
    },
  });
});

app.post('/api/webhooks', async (c) => {
  const customer = c.get('customer') as CustomerData;
  const customerId = c.get('customerId') as string;

  const body = await c.req.json().catch(() => null);
  if (!body?.url) {
    return errorResponse('invalid_webhook_url', 'url field is required', 400, { docs: '/docs#webhooks' });
  }

  const validation = isValidWebhookUrl(body.url);
  if (!validation.valid) {
    return errorResponse('invalid_webhook_url', validation.reason!, 400, { docs: '/docs#webhooks' });
  }

  customer.webhook_url = body.url;
  await c.env.KV.put(`customer:${customerId}`, JSON.stringify(customer));

  return c.json({
    data: { url: customer.webhook_url, updated_at: new Date().toISOString() },
  });
});

app.post('/api/webhooks/test', async (c) => {
  const customer = c.get('customer') as CustomerData;

  if (!customer.webhook_url) {
    return errorResponse('webhook_not_configured', 'Set a webhook URL first: POST /api/webhooks', 400, { docs: '/docs#webhooks' });
  }

  const testPayload = {
    id: generateId('mw_evt'),
    keyword: 'test-keyword',
    source: 'mentionwatch',
    type: 'test',
    title: 'Test webhook from MentionWatch',
    text: 'This is a test payload to verify your webhook endpoint is working correctly.',
    author: 'mentionwatch',
    url: 'https://mentionwatch.com',
    source_url: null,
    timestamp: new Date().toISOString(),
    delivered_at: new Date().toISOString(),
  };

  const body = JSON.stringify(testPayload);
  const signature = await hmacSign(body, customer.webhook_secret);

  try {
    const resp = await fetch(customer.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MentionWatch-Signature': signature,
        'X-MentionWatch-Event-Id': testPayload.id,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    return c.json({
      data: {
        status: resp.ok ? 'sent' : 'endpoint_error',
        url: customer.webhook_url,
        response_status: resp.status,
      },
    });
  } catch (err) {
    return c.json({
      data: {
        status: 'delivery_failed',
        url: customer.webhook_url,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
    }, 502);
  }
});

// ─── Mentions ───

app.get('/api/mentions', async (c) => {
  const customer = c.get('customer') as CustomerData;
  const customerId = c.get('customerId') as string;
  const since = c.req.query('since');
  const keyword = c.req.query('keyword');

  // Get recent mentions from KV (stored as a list)
  const mentionsRaw = await c.env.KV.get(`mentions:${customerId}`, 'json') as any[] | null;
  let mentions = mentionsRaw || [];

  if (since) {
    const sinceDate = new Date(since).getTime();
    mentions = mentions.filter((m: any) => new Date(m.timestamp).getTime() >= sinceDate);
  }

  if (keyword) {
    mentions = mentions.filter((m: any) => m.keyword === keyword.toLowerCase());
  }

  // Return last 100
  return c.json({
    data: mentions.slice(-100),
    meta: { total: mentions.length },
  });
});

// ─── Creem Webhook ───

app.post('/api/creem-webhook', async (c) => {
  const body = await c.req.text();
  const sig = c.req.header('creem-signature');

  if (!sig) {
    return errorResponse('auth_required', 'Missing creem-signature header', 400);
  }

  // Verify Creem HMAC-SHA256 signature
  const isValid = await verifyCreemSignature(body, sig, c.env.CREEM_WEBHOOK_SECRET);
  if (!isValid) {
    console.error('Creem webhook signature verification failed');
    return errorResponse('auth_required', 'Invalid creem signature', 400);
  }

  const event = JSON.parse(body);

  if (event.eventType === 'checkout.completed') {
    const order = event.object;
    const checkoutId = order.checkout_id || order.id;

    // Idempotency: skip if already provisioned for this checkout
    const existing = await c.env.KV.get(`checkout:${checkoutId}`);
    if (existing) {
      console.log(`Duplicate webhook for checkout ${checkoutId}, skipping`);
      return c.json({ received: true });
    }

    const email = order.customer?.email || '';
    const productId = order.product?.id || '';

    // Determine plan from product metadata or ID
    const plan = productId.includes('pro') ? 'pro' : 'starter';

    // Generate API key and webhook secret
    const apiKey = `mw_live_${generateId('')}`;
    const webhookSecret = `mw_whsec_${generateId('')}`;
    const customerId = generateId('cust');
    const keyHash = await hashApiKey(apiKey);

    const customerData: CustomerData = {
      id: customerId,
      email,
      plan: plan as 'starter' | 'pro',
      api_key_hash: keyHash,
      webhook_secret: webhookSecret,
      keywords: [],
      mentions_this_month: 0,
      month_reset: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      created_at: new Date().toISOString(),
    };

    // Store customer data
    await c.env.KV.put(`customer:${customerId}`, JSON.stringify(customerData));
    // Map API key hash to customer ID
    await c.env.KV.put(`key:${keyHash}`, customerId);
    // Store checkout-to-customer mapping for welcome page (keyed by checkout_id)
    // TTL handles cleanup — do NOT delete on read (prevents refresh/prefetch from burning creds)
    await c.env.KV.put(`checkout:${checkoutId}`, JSON.stringify({
      api_key: apiKey,
      webhook_secret: webhookSecret,
      plan,
      customer_id: customerId,
    }), { expirationTtl: 86400 }); // 24 hour expiry (not deleted on read)

    console.log(`New customer: ${customerId} (${email}, ${plan})`);
  }

  return c.json({ received: true });
});

// Welcome page data (called by landing page JS after Creem redirect)
// Creem redirects to: success_url?checkout_id=xxx&order_id=xxx&customer_id=xxx
app.get('/api/welcome', async (c) => {
  const checkoutId = c.req.query('checkout_id');
  if (!checkoutId) {
    return errorResponse('auth_required', 'checkout_id is required', 400);
  }

  const sessionData = await c.env.KV.get(`checkout:${checkoutId}`, 'json') as any;
  if (!sessionData) {
    return errorResponse('invalid_api_key', 'Checkout not found or expired. Check your email.', 404);
  }

  // Don't delete — TTL handles cleanup. Allows page refresh without losing credentials.
  return new Response(JSON.stringify({
    api_key: sessionData.api_key,
    webhook_secret: sessionData.webhook_secret,
    plan: sessionData.plan === 'pro' ? 'Pro ($49/mo)' : 'Starter ($19/mo)',
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store',
    },
  });
});

// ─── Cron: Poll HN ───

async function pollSources(env: Bindings) {
  // Get all customers from KV (list keys with prefix)
  const customerKeys = await env.KV.list({ prefix: 'customer:' });

  if (customerKeys.keys.length === 0) return;

  // Collect all keywords across customers
  const customerKeywords = new Map<string, { customerId: string; customer: CustomerData }[]>();

  for (const key of customerKeys.keys) {
    const customer = await env.KV.get(key.name, 'json') as CustomerData | null;
    if (!customer || !customer.webhook_url || customer.keywords.length === 0) continue;

    // Check monthly quota
    const limits = PLAN_LIMITS[customer.plan];
    if (customer.mentions_this_month >= limits.mentions) continue;

    const customerId = key.name.replace('customer:', '');

    for (const kw of customer.keywords) {
      const existing = customerKeywords.get(kw.keyword) || [];
      existing.push({ customerId, customer });
      customerKeywords.set(kw.keyword, existing);
    }
  }

  if (customerKeywords.size === 0) return;

  // Search HN for all unique keywords
  const hnResults = await searchHN([...customerKeywords.keys()]);

  // Process results
  for (const [keyword, hits] of hnResults) {
    const subscribers = customerKeywords.get(keyword);
    if (!subscribers) continue;

    for (const hit of hits) {
      const mention = hnHitToMention(hit, keyword);

      for (const { customerId, customer } of subscribers) {
        // Dedup: check if already delivered
        const dedupKey = `seen:${customerId}:${mention.external_id}`;
        const alreadySeen = await env.KV.get(dedupKey);
        if (alreadySeen) continue;

        // Deliver webhook
        const eventId = generateId('mw_evt');
        const payload = {
          id: eventId,
          ...mention,
          delivered_at: new Date().toISOString(),
        };

        const body = JSON.stringify(payload);
        const signature = await hmacSign(body, customer.webhook_secret);

        let delivered = false;
        const retryDelays = [0, 10000, 60000, 300000]; // immediate, 10s, 60s, 5min

        for (let attempt = 0; attempt < retryDelays.length; attempt++) {
          if (attempt > 0) {
            await new Promise(r => setTimeout(r, retryDelays[attempt]));
          }

          try {
            const resp = await fetch(customer.webhook_url!, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-MentionWatch-Signature': signature,
                'X-MentionWatch-Event-Id': eventId,
              },
              body,
              signal: AbortSignal.timeout(10000),
            });

            if (resp.ok) {
              delivered = true;
              break;
            }
            console.error(`Webhook delivery attempt ${attempt + 1} failed: ${resp.status} for ${customerId}`);
          } catch (err) {
            console.error(`Webhook delivery attempt ${attempt + 1} error for ${customerId}:`, err);
          }
        }

        // Mark as seen (even if delivery failed — store the mention)
        await env.KV.put(dedupKey, '1', { expirationTtl: 86400 * 7 }); // 7 days

        // Store mention for /api/mentions endpoint
        const mentionsRaw = await env.KV.get(`mentions:${customerId}`, 'json') as any[] | null;
        const mentions = mentionsRaw || [];
        mentions.push({ ...payload, delivered });
        // Keep last 500 mentions
        const trimmed = mentions.slice(-500);
        await env.KV.put(`mentions:${customerId}`, JSON.stringify(trimmed));

        // Increment monthly counter
        customer.mentions_this_month++;
        await env.KV.put(`customer:${customerId}`, JSON.stringify(customer));
      }
    }
  }

  console.log(`Poll complete. Checked ${customerKeywords.size} keywords for ${customerKeys.keys.length} customers.`);
}

// ─── Creem Webhook Verification ───

async function verifyCreemSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const computed = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return computed === signature;
}

// ─── Export ───

export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(pollSources(env));
  },
};
