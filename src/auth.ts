import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { roleDefaultRoute } from "@/lib/constants";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.schoolId = (user as { schoolId?: string }).schoolId;
      }
      // Re-fetch user data on session update or if schoolId is missing
      if (trigger === "update" || (token.sub && !token.schoolId)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { schoolId: true, role: { select: { name: true } } }
        });
        if (dbUser) {
          token.schoolId = dbUser.schoolId;
          token.role = dbUser.role?.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "";
        session.user.schoolId = (token.schoolId as string | null) ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // For relative URLs, return as-is to stay on same domain
      if (url.startsWith("/")) return url;
      
      // If URL is already absolute and matches baseUrl, allow it
      if (url.startsWith(baseUrl)) return url;
      
      // For any other case, default to baseUrl
      return baseUrl;
    },
  },
  providers: [
    Credentials({
      name: "Email + Password",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { role: true },
        });

        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          schoolId: user.schoolId,
          defaultRoute: roleDefaultRoute[user.role.name],
        };
      },
    }),
  ],
});
