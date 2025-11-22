import { eq } from "drizzle-orm";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { compare } from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
    accessToken?: string;
    refreshToken?: string;
    expires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .then((res) => res[0]);

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (!ACCESS_TOKEN_SECRET) {
          throw new Error("ACCESS_TOKEN_SECRET is not defined");
        }
        const accessToken = jwt.sign(
          { userId: user.id, email: user.email },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" },
        );

        if (!REFRESH_TOKEN_SECRET) {
          throw new Error("REFRESH_TOKEN_SECRET is not defined");
        }

        const refreshToken = jwt.sign(
          { userId: user.id, email: user.email },
          REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" },
        );

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name ?? null,
          accessToken,
          refreshToken,
          expires: 3600,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first login
      if (user) {
        token.id = user.id;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpires = Date.now() + (user as any).expires * 1000;
      }

      if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
        token.accessToken = jwt.sign(
          { userId: token.id, email: token.email },
          ACCESS_TOKEN_SECRET as string,
          { expiresIn: "15m" },
        );

        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;

      return session;
    },
  },
};
