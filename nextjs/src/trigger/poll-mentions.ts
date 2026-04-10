import { schedules } from "@trigger.dev/sdk";
import { eq, and, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { keywords, mentions, seenMentions } from "@/lib/schema";
import { user } from "../../auth-schema";
import { searchHN, hnHitToMention } from "@/lib/hn";
import { generateId } from "@/lib/crypto";
import { deliverWebhook, type WebhookPayload } from "@/lib/webhook";

export const pollMentions = schedules.task({
  id: "poll-mentions",
  cron: { pattern: "*/5 * * * *" },
  // concurrencyLimit: 1 prevents overlapping runs
  run: async () => {
    // Phase 1: Find new mentions
    const allKeywords = await db
      .select({
        keyword: keywords.keyword,
        userId: keywords.userId,
      })
      .from(keywords);

    if (allKeywords.length === 0) return { found: 0, delivered: 0 };

    const uniqueKeywordStrings = [
      ...new Set(allKeywords.map((k) => k.keyword)),
    ];

    const hnResults = await searchHN(uniqueKeywordStrings);

    let found = 0;

    for (const [keyword, hits] of hnResults) {
      // Find all users who have this keyword
      const usersWithKeyword = allKeywords.filter(
        (k) => k.keyword.toLowerCase() === keyword.toLowerCase()
      );

      for (const { userId } of usersWithKeyword) {
        for (const hit of hits) {
          const mention = hnHitToMention(hit, keyword);

          // Dedup: check seen_mentions
          const [seen] = await db
            .select()
            .from(seenMentions)
            .where(
              and(
                eq(seenMentions.userId, userId),
                eq(seenMentions.externalId, mention.external_id)
              )
            )
            .limit(1);

          if (seen) continue;

          // Insert mention + mark as seen
          const mentionId = generateId("mw_evt");
          await db.insert(mentions).values({
            id: mentionId,
            userId,
            keyword: mention.keyword,
            source: mention.source,
            type: mention.type,
            title: mention.title,
            text: mention.text,
            author: mention.author,
            url: mention.url,
            sourceUrl: mention.source_url,
            externalId: mention.external_id,
            timestamp: mention.timestamp,
            delivered: false,
          });

          await db
            .insert(seenMentions)
            .values({
              id: generateId("mw_seen"),
              userId,
              externalId: mention.external_id,
            })
            .onConflictDoNothing();

          found++;
        }
      }
    }

    // Phase 2: Deliver undelivered mentions
    const undelivered = await db
      .select()
      .from(mentions)
      .where(eq(mentions.delivered, false));

    let delivered = 0;

    // Group by userId to batch lookups
    const userIds = [...new Set(undelivered.map((m) => m.userId))];
    const users =
      userIds.length > 0
        ? await db
            .select({
              id: user.id,
              webhookUrl: user.webhookUrl,
              webhookSecret: user.webhookSecret,
            })
            .from(user)
            .where(inArray(user.id, userIds))
        : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    for (const mention of undelivered) {
      const userData = userMap.get(mention.userId);
      if (!userData?.webhookUrl || !userData?.webhookSecret) continue;

      const payload: WebhookPayload = {
        id: mention.id,
        keyword: mention.keyword,
        source: mention.source,
        type: mention.type,
        title: mention.title,
        text: mention.text,
        author: mention.author,
        url: mention.url,
        source_url: mention.sourceUrl,
        timestamp: mention.timestamp,
        delivered_at: new Date().toISOString(),
      };

      const result = await deliverWebhook(
        userData.webhookUrl,
        userData.webhookSecret,
        payload
      );

      if (result.success) {
        await db
          .update(mentions)
          .set({ delivered: true, deliveredAt: new Date() })
          .where(eq(mentions.id, mention.id));

        // Increment mention quota for this user
        await db
          .update(user)
          .set({
            mentionsThisMonth: sql`COALESCE(${user.mentionsThisMonth}, 0) + 1`,
          })
          .where(eq(user.id, mention.userId));

        delivered++;
      }
    }

    return { found, delivered };
  },
});
