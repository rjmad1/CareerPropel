import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

// Simple in-memory user store for development
const devUsers = new Map<string, { id: string; email: string; name: string }>()

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
        if (!credentials?.email) {
          return null
        }

        try {
          const userEmail = credentials.email as string
          const userName = userEmail.split('@')[0]
          const userId = `user-${userEmail.replace(/[^a-z0-9]/g, '')}`

          // Check if user exists in dev store
          if (devUsers.has(userEmail)) {
            const user = devUsers.get(userEmail)!
            return user
          }

          // Create new user in dev store
          const newUser = { id: userId, email: userEmail, name: userName }
          devUsers.set(userEmail, newUser)
          return newUser
        } catch (error) {
          console.error("[AUTH] Error:", error)
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
      // Allow all sign-ins
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
