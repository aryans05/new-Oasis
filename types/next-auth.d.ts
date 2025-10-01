// app/_lib/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Google ID (from token.sub)
      guestId?: string | null; // Supabase guest ID
    } & DefaultSession["user"]; // ✅ properly extend default
  }

  interface User extends DefaultUser {
    id: string;
    guestId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    guestId?: string | null;
  }
}
