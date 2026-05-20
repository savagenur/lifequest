import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { generateDailyQuests } from "@/lib/ai-coach";
import type { Category } from "@/generated/prisma/client";

/**
 * AI Coach Router
 * ---------------
 * Endpoints for AI-powered quest generation and coach profile management.
 */
export const coachRouter = router({
  /**
   * GET COACH PROFILE
   * -----------------
   * Fetches the user's coach preferences. Returns null if not set up.
   */
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.coachProfile.findUnique({
        where: { userId: ctx.user.id },
      });
    }),

  /**
   * CREATE/UPDATE COACH PROFILE
   * ---------------------------
   * Sets up or updates the user's AI coach preferences.
   */
  saveProfile: protectedProcedure
    .input(
      z.object({
        focusAreas: z.array(z.enum(["HEALTH", "LEARNING", "CAREER", "PERSONAL", "FINANCE"])),
        challenges: z.string().optional(),
        dailyTimeMinutes: z.number().int().min(15).max(480).default(60),
        intensity: z.enum(["GENTLE", "BALANCED", "INTENSE"]).default("BALANCED"),
        coachStyle: z.enum(["MOTIVATIONAL", "ANALYTICAL", "FRIENDLY", "DRILL_SERGEANT"]).default("MOTIVATIONAL"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.coachProfile.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          focusAreas: input.focusAreas,
          challenges: input.challenges,
          dailyTimeMinutes: input.dailyTimeMinutes,
          intensity: input.intensity,
          coachStyle: input.coachStyle,
          onboardingComplete: true,
        },
        update: {
          focusAreas: input.focusAreas,
          challenges: input.challenges,
          dailyTimeMinutes: input.dailyTimeMinutes,
          intensity: input.intensity,
          coachStyle: input.coachStyle,
          onboardingComplete: true,
        },
      });
    }),

  /**
   * GET TODAY'S AI QUESTS
   * ---------------------
   * Fetches today's AI-generated quest batch, or generates if not exists.
   */
  getTodayQuests: protectedProcedure
    .query(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const batch = await ctx.db.dailyQuestBatch.findUnique({
        where: {
          userId_date: {
            userId: ctx.user.id,
            date: today,
          },
        },
        include: {
          quests: {
            include: {
              quest: true,
            },
          },
        },
      });

      return batch;
    }),

  /**
   * GENERATE DAILY QUESTS
   * ---------------------
   * Generates new AI quests for today. Only works if no batch exists for today.
   */
  generateQuests: protectedProcedure
    .mutation(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if already generated today
      const existingBatch = await ctx.db.dailyQuestBatch.findUnique({
        where: {
          userId_date: {
            userId: ctx.user.id,
            date: today,
          },
        },
      });

      if (existingBatch) {
        throw new Error("Quests already generated for today");
      }

      // Get user context for AI
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          coachProfile: true,
          questCompletions: {
            orderBy: { completedAt: "desc" },
            take: 10,
            include: { quest: true },
          },
          quests: {
            where: { status: "ACTIVE" },
            take: 10,
          },
        },
      });

      if (!user) throw new Error("User not found");
      if (!user.coachProfile) throw new Error("Coach profile not set up");

      // Get quest counts by category
      const questsByCategory = await ctx.db.quest.groupBy({
        by: ["category"],
        where: { userId: ctx.user.id, status: "COMPLETED" },
        _count: true,
      });

      const categoryMap: Record<Category, number> = {
        HEALTH: 0,
        LEARNING: 0,
        CAREER: 0,
        PERSONAL: 0,
        FINANCE: 0,
      };
      questsByCategory.forEach((q) => {
        categoryMap[q.category] = q._count;
      });

      // Generate quests with AI
      const aiResponse = await generateDailyQuests({
        name: user.name,
        level: user.level,
        xp: user.xp,
        focusAreas: user.coachProfile.focusAreas,
        challenges: user.coachProfile.challenges,
        dailyTimeMinutes: user.coachProfile.dailyTimeMinutes,
        intensity: user.coachProfile.intensity,
        coachStyle: user.coachProfile.coachStyle,
        recentCompletions: user.questCompletions.map((c) => ({
          title: c.quest.title,
          category: c.quest.category,
          completedAt: c.completedAt,
        })),
        activeQuests: user.quests.map((q) => ({
          title: q.title,
          category: q.category,
        })),
        questsByCategory: categoryMap,
      });

      // Create batch with quests
      const batch = await ctx.db.dailyQuestBatch.create({
        data: {
          userId: ctx.user.id,
          date: today,
          motivation: aiResponse.motivation,
          quests: {
            create: aiResponse.quests.map((q) => ({
              title: q.title,
              description: q.description,
              reason: q.reason,
              xpReward: q.xpReward,
              difficulty: q.difficulty,
              category: q.category,
              status: "PENDING",
            })),
          },
        },
        include: {
          quests: true,
        },
      });

      return batch;
    }),

  /**
   * ACCEPT AI QUEST
   * ---------------
   * Accepts an AI-suggested quest and creates a real Quest from it.
   */
  acceptQuest: protectedProcedure
    .input(
      z.object({
        aiQuestId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const aiQuest = await ctx.db.aIQuest.findUnique({
        where: { id: input.aiQuestId },
      });

      if (!aiQuest) throw new Error("AI Quest not found");
      if (aiQuest.status !== "PENDING") throw new Error("Quest already processed");

      // Create the actual quest and link it
      const [quest] = await ctx.db.$transaction([
        ctx.db.quest.create({
          data: {
            title: aiQuest.title,
            description: aiQuest.description,
            xpReward: aiQuest.xpReward,
            difficulty: aiQuest.difficulty,
            category: aiQuest.category,
            userId: ctx.user.id,
          },
        }),
        ctx.db.aIQuest.update({
          where: { id: input.aiQuestId },
          data: { status: "ACCEPTED" },
        }),
      ]);

      // Link the quest to the AI quest
      await ctx.db.aIQuest.update({
        where: { id: input.aiQuestId },
        data: { questId: quest.id },
      });

      return quest;
    }),

  /**
   * SKIP AI QUEST
   * -------------
   * Marks an AI-suggested quest as skipped.
   */
  skipQuest: protectedProcedure
    .input(z.object({ aiQuestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.aIQuest.update({
        where: { id: input.aiQuestId },
        data: { status: "SKIPPED" },
      });
    }),

  /**
   * ACCEPT ALL QUESTS
   * -----------------
   * Accepts all pending AI quests from today's batch.
   */
  acceptAllQuests: protectedProcedure
    .mutation(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const batch = await ctx.db.dailyQuestBatch.findUnique({
        where: {
          userId_date: {
            userId: ctx.user.id,
            date: today,
          },
        },
        include: {
          quests: {
            where: { status: "PENDING" },
          },
        },
      });

      if (!batch) throw new Error("No batch found for today");

      const createdQuests = [];

      for (const aiQuest of batch.quests) {
        const quest = await ctx.db.quest.create({
          data: {
            title: aiQuest.title,
            description: aiQuest.description,
            xpReward: aiQuest.xpReward,
            difficulty: aiQuest.difficulty,
            category: aiQuest.category,
            userId: ctx.user.id,
          },
        });

        await ctx.db.aIQuest.update({
          where: { id: aiQuest.id },
          data: { status: "ACCEPTED", questId: quest.id },
        });

        createdQuests.push(quest);
      }

      return createdQuests;
    }),

  /**
   * REGENERATE QUESTS
   * -----------------
   * Generates additional AI quests and appends them to today's batch.
   * Limited to 2 regenerations per day.
   */
  regenerateQuests: protectedProcedure
    .mutation(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get existing batch
      const existingBatch = await ctx.db.dailyQuestBatch.findUnique({
        where: {
          userId_date: {
            userId: ctx.user.id,
            date: today,
          },
        },
      });

      if (!existingBatch) {
        throw new Error("No quests generated yet. Generate quests first.");
      }

      if (existingBatch.regenerationCount >= 2) {
        throw new Error("Maximum regenerations reached (2 per day)");
      }

      // Get user context for AI
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          coachProfile: true,
          questCompletions: {
            orderBy: { completedAt: "desc" },
            take: 10,
            include: { quest: true },
          },
          quests: {
            where: { status: "ACTIVE" },
            take: 10,
          },
        },
      });

      if (!user) throw new Error("User not found");
      if (!user.coachProfile) throw new Error("Coach profile not set up");

      // Get quest counts by category
      const questsByCategory = await ctx.db.quest.groupBy({
        by: ["category"],
        where: { userId: ctx.user.id, status: "COMPLETED" },
        _count: true,
      });

      const categoryMap: Record<Category, number> = {
        HEALTH: 0,
        LEARNING: 0,
        CAREER: 0,
        PERSONAL: 0,
        FINANCE: 0,
      };
      questsByCategory.forEach((q) => {
        categoryMap[q.category] = q._count;
      });

      // Generate new quests with AI
      const aiResponse = await generateDailyQuests({
        name: user.name,
        level: user.level,
        xp: user.xp,
        focusAreas: user.coachProfile.focusAreas,
        challenges: user.coachProfile.challenges,
        dailyTimeMinutes: user.coachProfile.dailyTimeMinutes,
        intensity: user.coachProfile.intensity,
        coachStyle: user.coachProfile.coachStyle,
        recentCompletions: user.questCompletions.map((c) => ({
          title: c.quest.title,
          category: c.quest.category,
          completedAt: c.completedAt,
        })),
        activeQuests: user.quests.map((q) => ({
          title: q.title,
          category: q.category,
        })),
        questsByCategory: categoryMap,
      });

      // Add new quests to existing batch and increment regeneration count
      const updatedBatch = await ctx.db.dailyQuestBatch.update({
        where: { id: existingBatch.id },
        data: {
          motivation: aiResponse.motivation, // Update motivation with new one
          regenerationCount: { increment: 1 },
          quests: {
            create: aiResponse.quests.map((q) => ({
              title: q.title,
              description: q.description,
              reason: q.reason,
              xpReward: q.xpReward,
              difficulty: q.difficulty,
              category: q.category,
              status: "PENDING",
            })),
          },
        },
        include: {
          quests: true,
        },
      });

      return updatedBatch;
    }),

  /**
   * UNDO SKIP QUEST
   * ---------------
   * Reverts a skipped AI quest back to pending status.
   */
  undoSkipQuest: protectedProcedure
    .input(z.object({ aiQuestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const aiQuest = await ctx.db.aIQuest.findUnique({
        where: { id: input.aiQuestId },
        include: { batch: true },
      });

      if (!aiQuest) throw new Error("AI Quest not found");
      if (aiQuest.batch.userId !== ctx.user.id) throw new Error("Unauthorized");
      if (aiQuest.status !== "SKIPPED") throw new Error("Quest is not skipped");

      return ctx.db.aIQuest.update({
        where: { id: input.aiQuestId },
        data: { status: "PENDING" },
      });
    }),
});
