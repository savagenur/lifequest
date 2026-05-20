import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

/**
 * tRPC React Client
 * -----------------
 * This creates the React hooks for calling tRPC procedures.
 *
 * Usage:
 * - trpc.quest.getDaily.useQuery({ userId: "..." })
 * - trpc.quest.create.useMutation()
 * - trpc.quest.complete.useMutation()
 *
 * The type parameter <AppRouter> gives you full type safety:
 * - Autocomplete for procedure names
 * - Type checking for inputs
 * - Typed return values
 */
export const trpc = createTRPCReact<AppRouter>();
