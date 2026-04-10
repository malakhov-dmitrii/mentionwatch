import {
  pgTable,
  text,
  timestamp,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

// App-specific tables. Better Auth manages its own tables (user, session, account, apiKey)
// via `npx auth generate`. These coexist in the same database.

export const keywords = pgTable("keywords", {
  id: text("id").primaryKey(), // mw_kw_xxxx
  userId: text("user_id").notNull(), // FK to Better Auth user.id
  keyword: text("keyword").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mentions = pgTable("mentions", {
  id: text("id").primaryKey(), // mw_evt_xxxx
  userId: text("user_id").notNull(),
  keyword: text("keyword").notNull(),
  source: text("source").notNull(), // "hackernews" | "reddit"
  type: text("type").notNull(), // "story" | "comment"
  title: text("title").notNull(),
  text: text("text").notNull(),
  author: text("author").notNull(),
  url: text("url").notNull(),
  sourceUrl: text("source_url"),
  externalId: text("external_id").notNull(),
  timestamp: text("timestamp").notNull(), // ISO string from source
  delivered: boolean("delivered").default(false).notNull(),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const checkoutSessions = pgTable("checkout_sessions", {
  id: text("id").primaryKey(), // mw_cs_xxxx
  checkoutId: text("checkout_id").unique().notNull(),
  apiKey: text("api_key").notNull(),
  webhookSecret: text("webhook_secret").notNull(),
  plan: text("plan").notNull(), // "starter" | "pro"
  userId: text("user_id"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seenMentions = pgTable(
  "seen_mentions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    externalId: text("external_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("seen_user_external").on(table.userId, table.externalId)]
);

// Plan limits (referenced by /api/me, /api/keywords, poll task)
export const PLAN_LIMITS = {
  starter: { keywords: 5, mentions: 5000 },
  pro: { keywords: 25, mentions: 50000 },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
