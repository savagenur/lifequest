import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use edge-compatible auth config (no Prisma/Node.js modules)
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
