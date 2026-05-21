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

      // Fetch shared data once to avoid N+1 queries
      const completedQuestsCount = await ctx.db.quest.count({
        where: { userId: ctx.user.id, status: "COMPLETED" },
      });

      // Auto-calculate progress for each goal based on unit type
      const goalsWithProgress = goals.map((goal) => {
        let currentValue = goal.currentValue;

        if (goal.unit === "XP") {
          currentValue = user.xp;
        } else if (goal.unit === "quests") {
          currentValue = completedQuestsCount;
        } else if (goal.unit === "days") {
          currentValue = user.currentStreak;
        }

        // Check if goal is completed based on current value
        const isCompleted = currentValue >= goal.targetValue;

        return {
          ...goal,
          currentValue,
          isCompleted,
        };
      });

      // Batch update goals that need changes
      const goalsToUpdate = goalsWithProgress.filter(
        (goal, index) => 
          goal.currentValue !== goals[index].currentValue || 
          goal.isCompleted !== goals[index].isCompleted
      );

      if (goalsToUpdate.length > 0) {
        await ctx.db.$transaction(
          goalsToUpdate.map((goal) =>
            ctx.db.goal.update({
              where: { id: goal.id },
              data: {
                currentValue: goal.currentValue,
                isCompleted: goal.isCompleted,
                completedAt: goal.isCompleted && !goals.find(g => g.id === goal.id)?.isCompleted ? new Date() : null,
              },
            })
          )
        );
      }

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
