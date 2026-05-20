import { router } from "../trpc";
import { questRouter } from "./quest";

/**
 * App Router
 * ----------
 * This is the root router that combines all sub-routers.
 *
 * Structure:
 * - trpc.quest.getDaily()
 * - trpc.quest.create()
 * - trpc.quest.complete()
 *
 * Add more routers here as your app grows:
 * - userRouter for user-related endpoints
 * - avatarRouter for avatar customization
 * - achievementRouter for achievements/badges
 */
export const appRouter = router({
  quest: questRouter,
});

// Export the type for use in the frontend
export type AppRouter = typeof appRouter;
