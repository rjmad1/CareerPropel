import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    // GitHub OAuth (optional - requires GITHUB_ID and GITHUB_SECRET in .env.local)
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),

    // Google OAuth (optional - requires GOOGLE_ID and GOOGLE_SECRET in .env.local)
    ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
      })
    ] : []),

    // Credentials provider (always available for dev)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For development: accept any email/password combination
        // In production: validate against database with hashed passwords
        if (!credentials?.email) {
          return null
        }

        try {
          // Create or get user by email
          let candidate = await prisma.candidate.findUnique({
            where: { email: credentials.email as string }
          })

          if (!candidate) {
            // Auto-create candidate on first login
            candidate = await prisma.candidate.create({
              data: {
                email: credentials.email as string,
                name: (credentials.email as string).split('@')[0]
              }
            })
          }

          // Return user object with email and ID
          return {
            id: candidate.id,
            email: candidate.email,
            name: candidate.name
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
    error: "/auth/error"
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign-ins (GitHub, Google, etc.)
      if (account && account.provider !== 'credentials') {
        try {
          // Ensure user exists in database
          const email = user.email
          if (!email) return false

          let candidate = await prisma.candidate.findUnique({
            where: { email }
          })

          if (!candidate) {
            candidate = await prisma.candidate.create({
              data: {
                email,
                name: user.name || email.split('@')[0]
              }
            })
          }

          return true
        } catch (error) {
          console.error('OAuth sign-in error:', error)
          return false
        }
      }

      // Credentials provider (already handled in authorize)
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        // Store provider info for session
        if (account) {
          token.provider = account.provider
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    }
  }
}