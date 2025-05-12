import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.student.findUnique({
          where: { username: credentials.username },
        });
        if (user && user.password === credentials.password) {
          return { id: user.id, name: user.username };
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/statistics`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
