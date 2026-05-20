import { initTRPC } from "@trpc/server";
import { db } from "@/lib/db";

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
  return {
    db,
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
export const procedure = t.procedure;
