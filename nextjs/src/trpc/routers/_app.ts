import { createTRPCRouter } from "../init";
import { welcomeRouter } from "./welcome";

export const appRouter = createTRPCRouter({
  welcome: welcomeRouter,
});

export type AppRouter = typeof appRouter;
