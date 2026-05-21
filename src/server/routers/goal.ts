import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

/**
 * Goal Router
 * -----------
 * Goal-related API endpoints for user progress goals.
 */
export const goalRouter = router({
  /**
   * GET USER GOALS
   * --------------
   * Fetches all goals for the current user with auto-calculated progress.
   */
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!user) return [];

      const goals = await ctx.db.goal.findMany({
        where: { userId: ctx.user.id },
        orderBy: [
          { isCompleted: "asc" },
          { createdAt: "desc" },
        ],
      });

      // Auto-calculate progress for each goal based on unit type
      const goalsWithProgress = await Promise.all(
        goals.map(async (goal) => {
          let currentValue = goal.currentValue;

          if (goal.unit === "XP") {
            currentValue = user.xp;
          } else if (goal.unit === "quests") {
            const completedQuests = await ctx.db.quest.count({
              where: { userId: ctx.user.id, status: "COMPLETED" },
            });
            currentValue = completedQuests;
          } else if (goal.unit === "days") {
            currentValue = user.currentStreak;
          }

          // Check if goal is completed based on current value
          const isCompleted = currentValue >= goal.targetValue;

          // Update goal if completion status changed
          if (isCompleted !== goal.isCompleted) {
            await ctx.db.goal.update({
              where: { id: goal.id },
              data: {
                currentValue,
                isCompleted,
                completedAt: isCompleted ? new Date() : null,
              },
            });
          } else {
            // Just update current value if it changed
            await ctx.db.goal.update({
              where: { id: goal.id },
              data: { currentValue },
            });
          }

          return {
            ...goal,
            currentValue,
            isCompleted,
          };
        })
      );

      return goalsWithProgress;
    }),

  /**
   * CREATE GOAL
   * -----------
   * Creates a new goal for the user.
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required").max(100),
        description: z.string().optional(),
        targetValue: z.number().int().positive("Target value must be positive"),
        unit: z.string().default("XP"),
        deadline: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.goal.create({
        data: {
          title: input.title,
          description: input.description,
          targetValue: input.targetValue,
          unit: input.unit,
          deadline: input.deadline ? new Date(input.deadline) : null,
          userId: ctx.user.id,
        },
      });

      return goal;
    }),

  /**
   * UPDATE GOAL PROGRESS
   * --------------------
   * Updates the current value of a goal.
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        goalId: z.string(),
        currentValue: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.goal.findFirst({
        where: { id: input.goalId, userId: ctx.user.id },
      });

      if (!goal) {
        throw new Error("Goal not found");
      }

      const isCompleted = input.currentValue >= goal.targetValue;
      const updateData: {
        currentValue: number;
        isCompleted?: boolean;
        completedAt?: Date | null;
      } = {
        currentValue: input.currentValue,
      };

      // Mark as completed if target reached
      if (isCompleted && !goal.isCompleted) {
        updateData.isCompleted = true;
        updateData.completedAt = new Date();
      } else if (!isCompleted && goal.isCompleted) {
        updateData.isCompleted = false;
        updateData.completedAt = null;
      }

      const updatedGoal = await ctx.db.goal.update({
        where: { id: input.goalId },
        data: updateData,
      });

      return updatedGoal;
    }),

  /**
   * DELETE GOAL
   * -----------
   * Deletes a goal.
   */
  delete: protectedProcedure
    .input(
      z.object({
        goalId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.goal.findFirst({
        where: { id: input.goalId, userId: ctx.user.id },
      });

      if (!goal) {
        throw new Error("Goal not found");
      }

      await ctx.db.goal.delete({
        where: { id: input.goalId },
      });

      return { success: true };
    }),
});
