import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const feedbackRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["BUG", "FEATURE", "GENERAL"]),
        message: z.string().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.feedback.create({
        data: {
          type: input.type,
          message: input.message,
          userId: ctx.user.id,
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }),
});
