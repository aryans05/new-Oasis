import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
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
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          // Find guest in Supabase
          let guest = await getGuest(user.email);

          // If not found, create it
          if (!guest) {
            guest = await createGuest({
              email: user.email,
              fullName: user.name,
            });
          }

          // Attach guestId to JWT token
          token.guestId = guest.id;
        } catch (err) {
          console.error("❌ Error attaching guestId to token:", err);
        }
      }
      return token;
    },

    // 2) Expose guestId + Google ID in session
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub; // Google ID
        session.user.guestId = token.guestId ?? null; // Supabase guestId
      }
      return session;
    },

    // 3) Simple auth guard
    authorized({ auth }: any) {
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
