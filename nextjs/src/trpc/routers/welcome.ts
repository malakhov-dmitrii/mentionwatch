import { z } from "zod/v4";
import { eq, and, gt } from "drizzle-orm";
import { createTRPCRouter, baseProcedure } from "../init";
import { checkoutSessions } from "@/lib/schema";

export const welcomeRouter = createTRPCRouter({
  fetchCredentials: baseProcedure
    .input(z.object({ checkoutId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .select({
          apiKey: checkoutSessions.apiKey,
          webhookSecret: checkoutSessions.webhookSecret,
          plan: checkoutSessions.plan,
        })
        .from(checkoutSessions)
        .where(
          and(
            eq(checkoutSessions.checkoutId, input.checkoutId),
            gt(checkoutSessions.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!session) {
        return { found: false as const };
      }

      // plan is raw slug ("starter" | "pro"), page component formats for display
      return {
        found: true as const,
        apiKey: session.apiKey,
        webhookSecret: session.webhookSecret,
        plan: session.plan,
      };
    }),
});
