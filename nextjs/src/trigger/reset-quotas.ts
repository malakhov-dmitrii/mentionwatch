import { schedules } from "@trigger.dev/sdk";
import { db } from "@/lib/db";
import { user } from "@/lib/auth-schema";

export const resetQuotas = schedules.task({
  id: "reset-quotas",
  cron: { pattern: "0 0 1 * *" }, // 1st of month midnight UTC
  maxDuration: 60,
  run: async () => {
    const result = await db
      .update(user)
      .set({ mentionsThisMonth: 0 })
      .returning({ id: user.id });

    return { usersReset: result.length };
  },
});
