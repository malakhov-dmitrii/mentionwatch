# MentionWatch — Social Media Keyword Monitoring API

## Problem
Developers, indie hackers, and small SaaS teams need to monitor keyword mentions across social media (Twitter/X, Reddit, HN, LinkedIn, ProductHunt, etc.). Current solutions (Mention.com at $41/mo, Brand24 at $79/mo, Brandwatch at $800+/mo) are overpriced, dashboard-heavy, and built for marketing teams — not developers who just want an API/webhook.

## Solution
MentionWatch: dead-simple API for social media keyword monitoring. Set keywords via API, get webhooks when they're mentioned. No dashboard bloat. No enterprise sales process. Developer-first.

**Core offering:**
- REST API to manage monitored keywords
- Webhook delivery when mentions are detected
- Sources: Twitter/X, Reddit, Hacker News, LinkedIn, ProductHunt, Dev.to, GitHub Discussions
- JSON payloads with source, author, text, sentiment, URL, timestamp
- Filtering by source, sentiment, language

**Pricing (undercut competitors 5-10x):**
- Free: 1 keyword, 100 mentions/mo, webhook only
- Starter ($9/mo): 5 keywords, 5K mentions/mo, all sources
- Pro ($29/mo): 25 keywords, 50K mentions/mo, sentiment analysis, priority delivery
- Business ($79/mo): 100 keywords, unlimited mentions, SLA, dedicated support

## Launch Strategy (Day 1 — April 11, 2026)

### Phase 0: Tonight (build in ~4 hours)
1. Landing page — single page, hero + features + pricing + FAQ + CTA
2. Stripe checkout integration (payment links for each tier)
3. Simple email collection for free tier (waitlist)
4. Basic API docs page (shows what the API will look like)
5. Deploy to Vercel/Cloudflare Pages

### Phase 1: Launch Morning (April 11)
1. Post on Twitter/X with demo
2. Post on Indie Hackers
3. Post on relevant Reddit subs (r/SaaS, r/indiehackers, r/webdev, r/Entrepreneur)
4. Submit to HN (Show HN)
5. Post on LinkedIn
6. Submit to ProductHunt (schedule for next week for better traction)

### Phase 2: Concierge MVP (Days 1-7)
- First paying customers get manual onboarding
- Set up Apify actors for each source behind the scenes
- Deliver results via webhook manually if needed
- Learn what customers actually need vs. what we assumed

### Phase 3: Build Real Product (Days 7-30)
- Apify actors for Twitter/X, Reddit, HN, LinkedIn
- API layer (Hono on Cloudflare Workers)
- Webhook delivery system (queue + retry)
- Simple dashboard for API key management
- Monitoring and alerting

## Technical Architecture

### Landing Page (Tonight)
- Next.js or Astro static site
- Tailwind CSS
- Stripe Payment Links
- Deploy: Vercel

### Backend (Week 2+)
- Cloudflare Workers (Hono framework)
- Apify actors for scraping sources
- D1 or Turso for keywords/subscriptions
- Cloudflare Queues for webhook delivery
- Stripe for billing

### Scraping Layer
- Apify actors (Twitter, Reddit, HN)
- ScapeCreators actors as backup
- Custom lightweight scrapers for simpler sources (HN, DevTo)
- Polling interval: 5-15 min depending on tier

## Landing Page Structure
1. Hero: "Monitor social media mentions via API. $9/mo."
2. Problem: "Current tools charge $100+/mo for dashboards you don't need"
3. How it works: 3 steps (Set keywords → We monitor → Get webhooks)
4. Features grid: Sources, Webhook delivery, Sentiment, Filtering
5. Pricing table: 4 tiers
6. API preview: code snippet showing the API
7. FAQ: 5-6 questions
8. CTA: "Start monitoring in 60 seconds"

## Copy Angles
- **Primary:** "Social media monitoring for developers. Not marketing teams."
- **Price anchor:** "Why pay $100+/mo for a dashboard? Get webhooks for $9."
- **Speed:** "Set up in 60 seconds. First mention delivered in minutes."
- **Developer-first:** "curl, not clicks. API, not analytics dashboards."

## Funnel
1. **Awareness:** Social media posts, HN, IH, Reddit
2. **Interest:** Landing page with clear value prop
3. **Desire:** API preview + pricing comparison vs competitors
4. **Action:** Stripe checkout → immediate access
5. **Retention:** Webhook delivery that just works + usage dashboard

## SMM Strategy
- Twitter/X: Build in public thread, daily updates, engage with #indiehackers #buildinpublic
- Reddit: Value-first posts in r/SaaS, r/indiehackers, answer questions about monitoring
- HN: Show HN post, engage genuinely in comments
- LinkedIn: Professional angle — "I built this because..." story
- IH: Detailed launch post with revenue/metrics transparency

## Competitive Analysis
| Feature | MentionWatch | Mention.com | Brand24 | Brandwatch |
|---------|-------------|-------------|---------|------------|
| Price | $9/mo | $41/mo | $79/mo | $800+/mo |
| API | Yes (core) | Limited | Yes | Yes |
| Webhooks | Yes (core) | No | No | Yes |
| Setup time | 60 sec | 30 min | 30 min | Days |
| Target | Developers | Marketing | Marketing | Enterprise |
| Dashboard | Minimal | Full | Full | Full |

## Success Metrics (30 days)
- 10+ paying customers
- $200+ MRR
- <5 min avg setup time
- >95% webhook delivery rate
- 3+ organic mentions from customers

## Risks
1. Scraping reliability — mitigate with multiple actor providers + manual backup
2. Twitter/X API changes — use multiple scraping approaches
3. No product on launch day — mitigate with concierge MVP approach
4. Low conversion from free tier — aggressive follow-up emails
5. Competition notices and drops prices — we're already at the floor
