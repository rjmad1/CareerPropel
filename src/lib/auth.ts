import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

// Simple in-memory user store for development
const devUsers = new Map<string, any>()

export const authOptions: NextAuthOptions = {
  providers: [
    // GitHub OAuth (optional)
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),

    // Google OAuth (optional)
    ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
      })
    ] : []),

    // Credentials provider - pure development mode
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        const email = credentials.email
        if (devUsers.has(email)) {
          return devUsers.get(email)
        }
        
        const user = {
          id: email.split('@')[0],
          email: email,
          name: email.split('@')[0]
        }
        devUsers.set(email, user)
        return user
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }
}
