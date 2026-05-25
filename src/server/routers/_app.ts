import { router } from "../trpc";
import { questRouter } from "./quest";
import { userRouter } from "./user";
import { coachRouter } from "./coach";
import { goalRouter } from "./goal";
import { feedbackRouter } from "./feedback";
import { notificationRouter } from "./notification";

/**
 * App Router
 * ----------
 * This is the root router that combines all sub-routers.
 *
 * Structure:
 * - trpc.quest.*        - Quest management
 * - trpc.user.*         - User profile and stats
 * - trpc.coach.*        - AI Coach features
 * - trpc.goal.*         - Progress goals
 * - trpc.feedback.*     - User feedback
 * - trpc.notification.* - Push notifications
 */
export const appRouter = router({
  quest: questRouter,
  user: userRouter,
  coach: coachRouter,
  goal: goalRouter,
  feedback: feedbackRouter,
  notification: notificationRouter,
});

// Export the type for use in the frontend
export type AppRouter = typeof appRouter;
