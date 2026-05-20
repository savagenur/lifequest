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

  /**
   * UPDATE QUEST
   * ------------
   * Updates an existing quest's details.
   */
  update: protectedProcedure
    .input(
      z.object({
        questId: z.string(),
        title: z.string().min(1, "Title is required").optional(),
        description: z.string().optional(),
        xpReward: z.number().int().positive().optional(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EPIC"]).optional(),
        category: z
          .enum(["HEALTH", "LEARNING", "CAREER", "PERSONAL", "FINANCE"])
          .optional(),
        dueDate: z.string().datetime().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quest = await ctx.db.quest.findFirst({
        where: { id: input.questId, userId: ctx.user.id },
      });

      if (!quest) {
        throw new Error("Quest not found");
      }

      const updatedQuest = await ctx.db.quest.update({
        where: { id: input.questId },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.xpReward && { xpReward: input.xpReward }),
          ...(input.difficulty && { difficulty: input.difficulty as Difficulty }),
          ...(input.category && { category: input.category as Category }),
          ...(input.dueDate !== undefined && {
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
          }),
        },
      });

      return updatedQuest;
    }),

  /**
   * DELETE QUEST
   * ------------
   * Deletes a quest and its completion records.
   */
  delete: protectedProcedure
    .input(
      z.object({
        questId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quest = await ctx.db.quest.findFirst({
        where: { id: input.questId, userId: ctx.user.id },
      });

      if (!quest) {
        throw new Error("Quest not found");
      }

      // Delete completion records first, then the quest
      await ctx.db.$transaction([
        ctx.db.questCompletion.deleteMany({
          where: { questId: input.questId },
        }),
        ctx.db.quest.delete({
          where: { id: input.questId },
        }),
      ]);

      return { success: true };
    }),

  /**
   * UNCOMPLETE QUEST
   * ----------------
   * Reverses a completed quest back to active status and removes XP.
   */
  uncomplete: protectedProcedure
    .input(
      z.object({
        questId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quest = await ctx.db.quest.findFirst({
        where: { id: input.questId, userId: ctx.user.id },
      });

      if (!quest) {
        throw new Error("Quest not found");
      }

      if (quest.status !== "COMPLETED") {
        throw new Error("Quest is not completed");
      }

      // Find the completion record to know how much XP to remove
      const completion = await ctx.db.questCompletion.findFirst({
        where: { questId: input.questId, userId: ctx.user.id },
        orderBy: { completedAt: "desc" },
      });

      const xpToRemove = completion?.xpEarned ?? quest.xpReward;

      // Revert quest status, delete completion, and remove XP
      const [updatedQuest, , updatedUser] = await ctx.db.$transaction([
        ctx.db.quest.update({
          where: { id: input.questId },
          data: { status: "ACTIVE" },
        }),
        ctx.db.questCompletion.deleteMany({
          where: { questId: input.questId, userId: ctx.user.id },
        }),
        ctx.db.user.update({
          where: { id: ctx.user.id },
          data: {
            xp: { decrement: xpToRemove },
          },
        }),
      ]);

      return {
        quest: updatedQuest,
        user: updatedUser,
        xpRemoved: xpToRemove,
      };
    }),

  /**
   * GET ALL QUESTS (including completed today)
   * ------------------------------------------
   * Fetches active quests and today's completed quests, sorted properly.
   * Includes AI quest reason if the quest was created from an AI suggestion.
   */
  getAllWithTodayCompleted: protectedProcedure
    .query(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const quests = await ctx.db.quest.findMany({
        where: {
          userId: ctx.user.id,
          OR: [
            { status: "ACTIVE" },
            {
              status: "COMPLETED",
              updatedAt: { gte: today },
            },
          ],
        },
        include: {
          aiQuest: {
            select: {
              reason: true,
            },
          },
        },
        orderBy: [
          { status: "asc" }, // ACTIVE comes before COMPLETED alphabetically
          { createdAt: "desc" },
        ],
      });

      // Transform to include reason at top level for easier access
      return quests.map((quest) => ({
        ...quest,
        reason: quest.aiQuest?.reason ?? null,
      }));
    }),

  /**
   * GET QUESTS BY DATE
   * ------------------
   * Fetches quests created on a specific date.
   * Used for date-based navigation in the quests page.
   */
  getByDate: protectedProcedure
    .input(
      z.object({
        date: z.string(), // ISO date string (YYYY-MM-DD)
      })
    )
    .query(async ({ ctx, input }) => {
      // Parse date parts to avoid timezone issues
      // input.date is "YYYY-MM-DD" format
      const [year, month, day] = input.date.split("-").map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

      const quests = await ctx.db.quest.findMany({
        where: {
          userId: ctx.user.id,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          aiQuest: {
            select: {
              reason: true,
            },
          },
        },
        orderBy: [
          { status: "asc" },
          { createdAt: "desc" },
        ],
      });

      return quests.map((quest) => ({
        ...quest,
        reason: quest.aiQuest?.reason ?? null,
      }));
    }),
});
