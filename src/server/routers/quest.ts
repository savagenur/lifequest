import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { Difficulty, Category } from "@/generated/prisma/client";

/**
 * Quest Router
 * ------------
 * All quest-related API endpoints live here.
 *
 * Procedures:
 * - getDaily: Fetch today's active quests for a user
 * - create: Create a new quest
 * - complete: Mark a quest as completed and award XP
 */
export const questRouter = router({
  /**
   * GET DAILY QUESTS
   * ----------------
   * Fetches all active quests for a user.
   * In a real app, you'd filter by date or "daily" flag.
   */
  getDaily: protectedProcedure
    .query(async ({ ctx }) => {
      const quests = await ctx.db.quest.findMany({
        where: {
          userId: ctx.user.id,
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return quests;
    }),

  /**
   * CREATE QUEST
   * ------------
   * Creates a new quest for a user.
   *
   * Zod validates the input — if invalid, tRPC returns an error automatically.
   * No manual validation needed!
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        xpReward: z.number().int().positive().default(10),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EPIC"]).default("EASY"),
        category: z
          .enum(["HEALTH", "LEARNING", "CAREER", "PERSONAL", "FINANCE"])
          .default("PERSONAL"),
        dueDate: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quest = await ctx.db.quest.create({
        data: {
          title: input.title,
          description: input.description,
          xpReward: input.xpReward,
          difficulty: input.difficulty as Difficulty,
          category: input.category as Category,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          userId: ctx.user.id,
        },
      });

      return quest;
    }),

  /**
   * COMPLETE QUEST
   * --------------
   * Marks a quest as completed and awards XP to the user.
   *
   * This does 3 things in a transaction:
   * 1. Updates quest status to COMPLETED
   * 2. Creates a QuestCompletion record
   * 3. Adds XP to the user
   */
  complete: protectedProcedure
    .input(
      z.object({
        questId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First, get the quest to know how much XP to award
      // Also verify the quest belongs to the current user
      const quest = await ctx.db.quest.findFirst({
        where: { id: input.questId, userId: ctx.user.id },
      });

      if (!quest) {
        throw new Error("Quest not found");
      }

      if (quest.status === "COMPLETED") {
        throw new Error("Quest already completed");
      }

      // Use a transaction to ensure all updates succeed or none do
      const [updatedQuest, completion, updatedUser] = await ctx.db.$transaction(
        [
          // 1. Mark quest as completed
          ctx.db.quest.update({
            where: { id: input.questId },
            data: { status: "COMPLETED" },
          }),

          // 2. Create completion record
          ctx.db.questCompletion.create({
            data: {
              questId: input.questId,
              userId: ctx.user.id,
              xpEarned: quest.xpReward,
            },
          }),

          // 3. Add XP to user
          ctx.db.user.update({
            where: { id: ctx.user.id },
            data: {
              xp: { increment: quest.xpReward },
            },
          }),
        ]
      );

      return {
        quest: updatedQuest,
        completion,
        user: updatedUser,
        xpEarned: quest.xpReward,
      };
    }),
});
