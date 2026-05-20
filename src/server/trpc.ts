import { initTRPC, TRPCError } from "@trpc/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * Context
 * -------
 * This is the "context" that every tRPC procedure has access to.
 * Think of it as shared data/utilities available in all your API endpoints.
 *
 * Currently includes:
 * - db: Prisma client for database queries
 *
 * Later you'll add:
 * - user: The authenticated user (from session)
 */
export const createTRPCContext = async () => {
  const session = await auth();
  
  return {
    db,
    session,
    user: session?.user,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * tRPC Initialization
 * -------------------
 * This creates the core tRPC instance with our context type.
 */
const t = initTRPC.context<Context>().create();

/**
 * Exports
 * -------
 * - router: Creates a new router (group of procedures)
 * - procedure: Creates a new procedure (API endpoint)
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected Procedure
 * -------------------
 * Use this for endpoints that require authentication.
 * Throws UNAUTHORIZED if user is not logged in.
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user as { id: string; email?: string | null; name?: string | null; image?: string | null },
    },
  });
});

// Keep backward compatibility
export const procedure = publicProcedure;
