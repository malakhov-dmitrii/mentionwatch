# MentionWatch

Social media keyword monitoring API for developers. Get webhooks when your product is mentioned on HN, Reddit, and more.

Live at: https://mentionwatch.mlh.one

## Architecture

Next.js App Router monolith (`nextjs/`) running on Coolify (port 3000).

- **ORM**: Drizzle + Postgres
- **Auth**: Better Auth with API Key plugin
- **Internal RPC**: tRPC
- **Scheduled jobs**: Trigger.dev
- **Payments**: Creem.io

## Dev

```bash
cd nextjs
bun dev
```

## Tests

```bash
cd nextjs
bun test
```

## DB

```bash
cd nextjs
bunx drizzle-kit push
```

## Env Vars

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Auth secret (random string) |
| `BETTER_AUTH_URL` | Public base URL (e.g. `https://mentionwatch.mlh.one`) |
| `CREEM_API_KEY` | Creem.io API key |
| `CREEM_WEBHOOK_SECRET` | Creem.io webhook signing secret |
| `TRIGGER_API_URL` | Trigger.dev API URL |
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key |

## API Endpoints

```
GET  /api/me                  Account info
POST /api/keywords            Create keyword
GET  /api/keywords            List keywords
DEL  /api/keywords/:id        Delete keyword
POST /api/webhooks            Set webhook URL
GET  /api/webhooks            Get webhook config
POST /api/webhooks/test       Send test payload
GET  /api/mentions            List recent mentions
POST /api/creem-webhook       Creem checkout handler
```

All endpoints (except `/api/creem-webhook`) require `Authorization: Bearer <api-key>`.

## Deploy

Deployed via Dockerfile on Coolify. Port 3000.

DNS: `mentionwatch.mlh.one` → Coolify server (51.75.161.176)

### Creem Webhook

In [Creem Dashboard > Developers > Webhooks](https://creem.io/dashboard/developers):
- URL: `https://mentionwatch.mlh.one/api/creem-webhook`
- Events: `checkout.completed`
