import { initTRPC } from "@trpc/server";
import { db } from "@/lib/db";

/**
 * tRPC context. Used for internal page-to-server communication only.
 * No auth/session here — tRPC is for internal queries (welcome page, etc.).
 * Public API uses Better Auth directly in route handlers.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    headers: opts.headers,
    db,
  };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
