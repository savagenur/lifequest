import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Edge-compatible auth config (no Prisma/Node.js modules)
// Used by middleware for session checking
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider config only - authorize logic is in full auth.ts
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // This will be overridden in auth.ts with actual DB logic
      authorize: () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = [
        "/auth/signin",
        "/auth/signup",
        "/auth/error",
        "/auth/verify-email",
        "/auth/verify-request",
        "/auth/forgot-password",
        "/auth/reset-password",
      ].some((route) => nextUrl.pathname.startsWith(route));
      const isAuthRoute = ["/auth/signin", "/auth/signup"].some((route) =>
        nextUrl.pathname.startsWith(route)
      );
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      // Redirect from "/" to "/quests"
      if (nextUrl.pathname === "/") {
        return Response.redirect(new URL("/quests", nextUrl));
      }

      // Allow API auth routes
      if (isApiAuthRoute) {
        return true;
      }

      // Redirect logged-in users away from auth pages
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/quests", nextUrl));
      }

      // Allow public routes
      if (isPublicRoute) {
        return true;
      }

      // Require auth for other routes
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
