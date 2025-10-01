import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // from token.sub
      guestId?: string; // Supabase guest ID
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    guestId?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
