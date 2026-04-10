# MentionWatch

Social media keyword monitoring API for developers. Get webhooks when your product is mentioned on HN, Reddit, and more.

## Project Structure

```
landing/          Static HTML landing page (deploy to Coolify/any CDN)
  index.html      Main landing page
  welcome.html    Post-checkout success page
  docs.html       API documentation
  agent-setup.html  AI agent onboarding guide
  compare.html    Competitive comparison
  llms.txt        Machine-readable product description
worker/           Cloudflare Worker API backend
  src/index.ts    Main router, API endpoints, cron polling
  src/hn.ts       HN Algolia search service
  src/utils.ts    Auth, crypto, SSRF protection
mcp/              MCP server for AI agents (WIP)
```

## Setup

### 1. Creem.io (Payments)

Create two products in [Creem Dashboard](https://creem.io/dashboard):

- **Starter** ($19/mo): include `starter` in the product ID
- **Pro** ($49/mo): include `pro` in the product ID

Create checkout links with:
- `success_url`: `https://mentionwatch.mlh.one/welcome.html?checkout_id={CHECKOUT_ID}`

Update `CREEM_CHECKOUT_STARTER_URL` and `CREEM_CHECKOUT_PRO_URL` in `landing/index.html`.

### 2. Cloudflare Worker

```bash
cd worker

# Create KV namespace
bunx wrangler kv namespace create MENTIONWATCH
# Copy the ID into wrangler.toml

# Set secrets
bunx wrangler secret put CREEM_API_KEY
bunx wrangler secret put CREEM_WEBHOOK_SECRET

# Deploy
bun run deploy
```

### 3. Landing Page

Already deployed to Coolify (`mentionwatch-landing` on `ovh-cloud`).
Redeploy: `coolify deploy name mentionwatch-landing`

### 4. Creem Webhook

In [Creem Dashboard > Developers > Webhooks](https://creem.io/dashboard/developers):
- URL: `https://api.mentionwatch.mlh.one/api/creem-webhook`
- Events: `checkout.completed`

### 5. DNS

- `mentionwatch.mlh.one` → Coolify server (A record to 51.75.161.176)
- `api.mentionwatch.mlh.one` → Cloudflare Worker (custom domain)

## API Endpoints

```
GET  /api/me              Your account info
POST /api/keywords        Create keyword
GET  /api/keywords        List keywords
DEL  /api/keywords/:id    Delete keyword
POST /api/webhooks        Set webhook URL
GET  /api/webhooks        Get webhook config
POST /api/webhooks/test   Send test payload
GET  /api/mentions        List recent mentions
POST /api/creem-webhook   Creem checkout handler
GET  /api/welcome         Post-checkout data
```

## Local Dev

```bash
cd worker
bun run dev    # Starts wrangler dev server on localhost:8787
```
