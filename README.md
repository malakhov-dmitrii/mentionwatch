# MentionWatch

Social media keyword monitoring API for developers. Get webhooks when your product is mentioned on HN, Reddit, and more.

## Project Structure

```
landing/          Static HTML landing page (deploy to Vercel/Netlify/any CDN)
  index.html      Main landing page
  welcome.html    Post-checkout success page
  docs.html       API documentation
worker/           Cloudflare Worker API backend
  src/index.ts    Main router, API endpoints, cron polling
  src/hn.ts       HN Algolia search service
  src/utils.ts    Auth, crypto, SSRF protection
```

## Setup

### 1. Stripe

Create two products in Stripe Dashboard:

- **Starter** ($19/mo): Add metadata `plan: starter`
- **Pro** ($49/mo): Add metadata `plan: pro`

Create Checkout Sessions (not Payment Links) with:
- `success_url`: `https://mentionwatch.com/welcome.html?session_id={CHECKOUT_SESSION_ID}`
- `cancel_url`: `https://mentionwatch.com`
- `metadata.plan`: `starter` or `pro`

Update `STRIPE_CHECKOUT_STARTER_URL` and `STRIPE_CHECKOUT_PRO_URL` in `landing/index.html`.

### 2. Cloudflare Worker

```bash
cd worker

# Create KV namespace
bunx wrangler kv namespace create MENTIONWATCH
# Copy the ID into wrangler.toml

# Set secrets
bunx wrangler secret put STRIPE_SECRET_KEY
bunx wrangler secret put STRIPE_WEBHOOK_SECRET

# Deploy
bun run deploy
```

### 3. Landing Page

```bash
cd landing
# Deploy to any static host. Examples:

# Vercel
vercel deploy --prod

# Netlify
netlify deploy --prod --dir=.

# Or just upload the 3 HTML files to any CDN
```

### 4. Stripe Webhook

In Stripe Dashboard, add a webhook endpoint:
- URL: `https://your-worker.your-subdomain.workers.dev/api/stripe-webhook`
- Events: `checkout.session.completed`

### 5. DNS

Point `mentionwatch.com` to your Vercel/Netlify deployment.
Point `api.mentionwatch.com` to your Cloudflare Worker (custom domain in Cloudflare Dashboard).

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
POST /api/stripe-webhook  Stripe checkout handler
GET  /api/welcome         Post-checkout data
```

## Local Dev

```bash
cd worker
bun run dev    # Starts wrangler dev server on localhost:8787
```
