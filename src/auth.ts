import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { roleDefaultRoute } from "@/lib/constants";

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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.schoolId = (user as { schoolId?: string }).schoolId;
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
      const preferredBaseUrl =
        process.env.NEXT_PUBLIC_APP_URL?.trim() ||
        process.env.APP_URL?.trim() ||
        process.env.NEXTAUTH_URL?.trim() ||
        baseUrl;

      const activeBaseUrl = baseUrl.includes("localhost") ? preferredBaseUrl : baseUrl;

      if (url.startsWith("/")) return `${activeBaseUrl}${url}`;
      if (url.startsWith(activeBaseUrl)) return url;
      return activeBaseUrl;
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
