import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import { getGuest, createGuest } from "./data-service";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    // 1) Attach guestId to token during login
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.email) {
        try {
          let guest = await getGuest(user.email);

          if (!guest) {
            guest = await createGuest({
              email: user.email,
              fullName: user.name ?? "Anonymous",
            });
          }

          // Attach guestId to JWT
          token.guestId = guest.id;
        } catch (err) {
          console.error("❌ Error attaching guestId to token:", err);
        }
      }
      return token;
    },

    // 2) Expose guestId + Google ID in session
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub as string; // Google ID
        session.user.guestId = token.guestId ?? null; // Supabase guestId
      }
      return session;
    },

    // 3) Simple auth guard
    authorized({ auth }: { auth: Session | null }) {
      return !!auth?.user;
    },
  },

  // Custom sign-in page
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
