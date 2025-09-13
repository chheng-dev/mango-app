import { authenticateUser, buildUserClaims } from "@/lib/services/authService";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      permissions: string[];
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    id: number;
    permissions: string[];
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

const authHandler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await authenticateUser(credentials.email, credentials.password);
        if (!user) return null;
        const claims = await buildUserClaims(Number(user.id));
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: null,
          permissions: claims.permissions,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const claims = await buildUserClaims(Number(user.id));
        token.userId = user.id;
        token.permissions = claims.permissions;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as number;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { authHandler as GET, authHandler as POST };
