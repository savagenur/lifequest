import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

/**
 * tRPC API Route Handler
 * ----------------------
 * This is where all tRPC requests are handled.
 *
 * The [trpc] dynamic segment catches all tRPC procedure calls:
 * - /api/trpc/quest.getDaily
 * - /api/trpc/quest.create
 * - /api/trpc/quest.complete
 *
 * tRPC automatically routes to the correct procedure based on the URL.
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
