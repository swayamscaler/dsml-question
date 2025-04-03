import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, user }) {
      return token
    },
    async signIn({ user }) {
      if (user.email) {
        try {
          await prisma.email.create({
            data: {
              email: user.email,
            },
          });
        } catch (error: any) {
          // Ignore unique constraint violation errors
          if (error.code !== 'P2002') {
            console.error('Error storing email:', error);
          }
        }
      }
      return true;
    }
  }
})

export { handler as GET, handler as POST }
