import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/db"

// Check if database is available
const isDatabaseAvailable = () => {
  return !!process.env.DATABASE_URL
}

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
          console.error("[AUTH] No email provided in credentials")
          return null
        }

        try {
          const userEmail = credentials.email as string
          console.log("[AUTH] Attempting to authenticate user:", userEmail)
          
          // Check if database is configured
          if (!isDatabaseAvailable()) {
            console.warn("[AUTH] DATABASE_URL not configured, using fallback development mode")
            // Fallback: Accept any email/password for development
            return {
              id: `dev-${userEmail.split('@')[0]}`,
              email: userEmail,
              name: userEmail.split('@')[0]
            }
          }

          console.log("[AUTH] Looking up candidate with email:", userEmail)
          
          // Create or get user by email
          let candidate = await prisma.candidate.findUnique({
            where: { email: userEmail }
          })

          if (!candidate) {
            console.log("[AUTH] Candidate not found, creating new account for:", userEmail)
            // Auto-create candidate on first login
            candidate = await prisma.candidate.create({
              data: {
                email: userEmail,
                name: userEmail.split('@')[0]
              }
            })
            console.log("[AUTH] Successfully created candidate:", candidate.id)
          } else {
            console.log("[AUTH] Found existing candidate:", candidate.id)
          }

          // Return user object with email and ID
          const result = {
            id: candidate.id,
            email: candidate.email,
            name: candidate.name
          }
          console.log("[AUTH] Login successful for:", candidate.email)
          return result
        } catch (error) {
          console.error("[AUTH] Authorization error:", error)
          console.error("[AUTH] Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace",
            credentials_email: credentials?.email,
            database_configured: isDatabaseAvailable()
          })
          
          // Fallback for development when database fails
          if (!isDatabaseAvailable()) {
            console.warn("[AUTH] Database unavailable, allowing development login")
            return {
              id: `dev-${credentials.email.split('@')[0]}`,
              email: credentials.email,
              name: credentials.email.split('@')[0]
            }
          }
          
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
          // Ensure user exists in database (only if database is available)
          const email = user.email
          if (!email) return false

          if (!isDatabaseAvailable()) {
            console.warn("[AUTH] Database not available for OAuth sign-in, allowing fallback")
            return true
          }

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
          // Allow OAuth sign-in even if database fails in development
          return true
        }
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string
      }
      return session
    }
  }
}
