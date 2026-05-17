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

        const userEmail = credentials.email as string
        const userName = userEmail.split('@')[0]
        const userId = `dev-${userEmail.replace(/[^a-z0-9]/g, '')}`

        // Check if user exists in dev store
        if (devUsers.has(userEmail)) {
          return devUsers.get(userEmail)!
        }

        // Create new user in dev store
        const newUser = { id: userId, email: userEmail, name: userName }
        devUsers.set(userEmail, newUser)
        return newUser
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  }
}
