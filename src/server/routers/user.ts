import { router, protectedProcedure } from "../trpc";

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
  getById: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
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
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const [user, totalQuests, completedQuests, totalXpEarned] = await Promise.all([
        ctx.db.user.findUnique({
          where: { id: userId },
        }),
        ctx.db.quest.count({
          where: { userId },
        }),
        ctx.db.quest.count({
          where: { userId, status: "COMPLETED" },
        }),
        ctx.db.questCompletion.aggregate({
          where: { userId },
          _sum: { xpEarned: true },
        }),
      ]);

      // Count quests by category
      const questsByCategory = await ctx.db.quest.groupBy({
        by: ["category"],
        where: { userId, status: "COMPLETED" },
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
