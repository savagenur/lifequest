import { router } from "../trpc";
import { questRouter } from "./quest";
import { userRouter } from "./user";

/**
 * App Router
 * ----------
 * This is the root router that combines all sub-routers.
 *
 * Structure:
 * - trpc.quest.getDaily()
 * - trpc.quest.create()
 * - trpc.quest.complete()
 * - trpc.user.getById()
 * - trpc.user.getStats()
 */
export const appRouter = router({
  quest: questRouter,
  user: userRouter,
});

// Export the type for use in the frontend
export type AppRouter = typeof appRouter;
