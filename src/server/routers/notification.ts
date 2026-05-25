import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const notificationRouter = router({
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pushSubscription.upsert({
        where: { endpoint: input.endpoint },
        create: {
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
          userId: ctx.user.id,
        },
        update: {
          p256dh: input.p256dh,
          auth: input.auth,
        },
      });
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pushSubscription.deleteMany({
        where: {
          endpoint: input.endpoint,
          userId: ctx.user.id,
        },
      });
    }),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.pushSubscription.findFirst({
      where: { userId: ctx.user.id },
    });
  }),
});
