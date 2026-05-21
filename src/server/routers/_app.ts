import { router } from "../trpc";
import { questRouter } from "./quest";
import { userRouter } from "./user";
import { coachRouter } from "./coach";
import { goalRouter } from "./goal";

/**
 * App Router
 * ----------
 * This is the root router that combines all sub-routers.
 *
 * Structure:
 * - trpc.quest.*    - Quest management
 * - trpc.user.*     - User profile and stats
 * - trpc.coach.*    - AI Coach features
 * - trpc.goal.*     - Progress goals
 */
export const appRouter = router({
  quest: questRouter,
  user: userRouter,
  coach: coachRouter,
  goal: goalRouter,
});

// Export the type for use in the frontend
export type AppRouter = typeof appRouter;
