import { z } from "zod/v4";
import { router, procedure } from "../trpc";

/**
 * User Router
 * -----------
 * User-related API endpoints.
 */
export const userRouter = router({
  /**
   * GET USER BY ID
   * --------------
   * Fetches a user with their stats, avatar, and recent completions.
   */
  getById: procedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          avatar: true,
          questCompletions: {
            orderBy: { completedAt: "desc" },
            take: 10,
            include: {
              quest: true,
            },
          },
        },
      });

      return user;
    }),

  /**
   * GET USER STATS
   * --------------
   * Fetches aggregated stats for the user.
   */
  getStats: procedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [user, totalQuests, completedQuests, totalXpEarned] = await Promise.all([
        ctx.db.user.findUnique({
          where: { id: input.userId },
        }),
        ctx.db.quest.count({
          where: { userId: input.userId },
        }),
        ctx.db.quest.count({
          where: { userId: input.userId, status: "COMPLETED" },
        }),
        ctx.db.questCompletion.aggregate({
          where: { userId: input.userId },
          _sum: { xpEarned: true },
        }),
      ]);

      // Count quests by category
      const questsByCategory = await ctx.db.quest.groupBy({
        by: ["category"],
        where: { userId: input.userId, status: "COMPLETED" },
        _count: true,
      });

      return {
        user,
        totalQuests,
        completedQuests,
        totalXpEarned: totalXpEarned._sum.xpEarned || 0,
        completionRate: totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0,
        questsByCategory,
      };
    }),
});
