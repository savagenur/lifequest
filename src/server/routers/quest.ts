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
        scheduledDate: z.string().optional(), // ISO date string (YYYY-MM-DD) for creating quests on a specific date
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If scheduledDate is provided, parse it for the scheduledDate field
      let scheduledDate: Date | undefined;
      if (input.scheduledDate) {
        const [year, month, day] = input.scheduledDate.split("-").map(Number);
        scheduledDate = new Date(year, month - 1, day, 12, 0, 0, 0); // Set to noon to avoid timezone issues
      }

      const quest = await ctx.db.quest.create({
        data: {
          title: input.title,
          description: input.description,
          xpReward: input.xpReward,
          difficulty: input.difficulty as Difficulty,
          category: input.category as Category,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          userId: ctx.user.id,
          ...(scheduledDate && { scheduledDate }),
        },
      });

      return quest;
    }),

  /**
   * COMPLETE QUEST
   * --------------
   * Marks a quest as completed and awards XP to the user.
   *
   * This does 4 things in a transaction:
   * 1. Updates quest status to COMPLETED
   * 2. Creates a QuestCompletion record
   * 3. Adds XP to the user
   * 4. Updates streak tracking
   */
  complete: protectedProcedure
    .input(
      z.object({
        questId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch quest and user in a single query to reduce database round trips
      const quest = await ctx.db.quest.findFirst({
        where: { id: input.questId, userId: ctx.user.id },
        include: {
          user: true,
        },
      });

      if (!quest) {
        throw new Error("Quest not found");
      }

      if (quest.status === "COMPLETED") {
        throw new Error("Quest already completed");
      }

      const user = quest.user;

      // Calculate streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let newStreak = 1;
      let newLongestStreak = user.longestStreak;

      if (user.lastActiveDate) {
        const lastActive = new Date(user.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // Same day, keep current streak
          newStreak = user.currentStreak;
        } else if (diffDays === 1) {
          // Consecutive day, increment streak
          newStreak = user.currentStreak + 1;
        } else {
          // Streak broken, start fresh
          newStreak = 1;
        }
      }

      // Update longest streak if needed
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }

      // Calculate level before and after
      const XP_PER_LEVEL = 100;
      const oldLevel = Math.floor(user.xp / XP_PER_LEVEL) + 1;
      const newTotalXp = user.xp + quest.xpReward;
      const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1;
      const leveledUp = newLevel > oldLevel;

      // Check for newly earned achievements
      const newlyEarnedAchievements: string[] = [];
      
      // Count completed quests (after this completion will be +1)
      const completedQuestsCount = await ctx.db.quest.count({
        where: { userId: ctx.user.id, status: "COMPLETED" },
      });
      const newCompletedCount = completedQuestsCount + 1;

      // Quest count achievements
      if (newCompletedCount === 1) newlyEarnedAchievements.push("First Quest");
      if (newCompletedCount === 5) newlyEarnedAchievements.push("On Fire");
      if (newCompletedCount === 10) newlyEarnedAchievements.push("Unstoppable");
      if (newCompletedCount === 25) newlyEarnedAchievements.push("Champion");
      if (newCompletedCount === 50) newlyEarnedAchievements.push("Legend");
      if (newCompletedCount === 100) newlyEarnedAchievements.push("Master");

      // Streak achievements
      if (newStreak === 3) newlyEarnedAchievements.push("3-Day Streak");
      if (newStreak === 7) newlyEarnedAchievements.push("Week Warrior");
      if (newStreak === 30) newlyEarnedAchievements.push("Month Master");

      // Level achievements
      if (newLevel === 5) newlyEarnedAchievements.push("Level 5");
      if (newLevel === 10) newlyEarnedAchievements.push("Level 10");
      if (newLevel === 25) newlyEarnedAchievements.push("Level 25");

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

          // 3. Add XP to user and update streak
          ctx.db.user.update({
            where: { id: ctx.user.id },
            data: {
              xp: { increment: quest.xpReward },
              level: newLevel,
              currentStreak: newStreak,
              longestStreak: newLongestStreak,
              lastActiveDate: today,
            },
          }),
        ]
      );

      return {
        quest: updatedQuest,
        completion,
        user: updatedUser,
        xpEarned: quest.xpReward,
        streak: newStreak,
        leveledUp,
        oldLevel,
        newLevel,
        newlyEarnedAchievements,
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
   * Fetches quests scheduled for a specific date.
   * Uses scheduledDate for proper timezone handling (separate from createdAt).
   * Falls back to createdAt for quests without scheduledDate (backward compatibility).
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
          OR: [
            {
              scheduledDate: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            {
              scheduledDate: null,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
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
