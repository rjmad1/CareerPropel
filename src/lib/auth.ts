import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

// In-memory store for dev bypass mode (ALLOW_DEV_LOGIN=true only)
const devUsers = new Map<string, { id: string; email: string; name: string }>()

function validateAuthEnvironment() {
  const errors: string[] = []
  if (!process.env.NEXTAUTH_SECRET) errors.push('NEXTAUTH_SECRET is not set')
  if (!process.env.NEXTAUTH_URL) errors.push('NEXTAUTH_URL is not set')
  if (errors.length > 0) {
    console.error('❌ NextAuth Configuration Errors:')
    errors.forEach(err => console.error(`  - ${err}`))
    console.error('Add these to .env.local or Vercel environment variables.')
  }
  return errors.length === 0
}

if (typeof window === 'undefined') {
  validateAuthEnvironment()
}

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

    // Credentials — validates against DB (bcrypt). Falls back to dev bypass
    // when ALLOW_DEV_LOGIN=true (for local testing without DB seed).
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null
          const email = credentials.email.toLowerCase().trim()
          if (!email.includes('@')) return null

          // Dev bypass: any email/password accepted when ALLOW_DEV_LOGIN=true
          if (process.env.ALLOW_DEV_LOGIN === 'true') {
            if (devUsers.has(email)) return devUsers.get(email)!
            const newUser = { id: email.split('@')[0], email, name: email.split('@')[0] }
            devUsers.set(email, newUser)
            console.log('[Auth] ✅ Dev bypass login:', email)
            return newUser
          }

          // Production path: validate against Candidate table
          const candidate = await prisma.candidate.findUnique({ where: { email } })
          if (!candidate) {
            console.log('[Auth] ❌ No account for:', email)
            return null
          }
          if (!candidate.passwordHash) {
            // OAuth-only account — no password set
            console.log('[Auth] ❌ OAuth-only account, no password:', email)
            return null
          }
          const valid = await bcrypt.compare(credentials.password, candidate.passwordHash)
          if (!valid) {
            console.log('[Auth] ❌ Wrong password for:', email)
            return null
          }
          console.log('[Auth] ✅ Authenticated:', email)
          return { id: candidate.id, email: candidate.email, name: candidate.name }
        } catch (error) {
          console.error('[Auth] ❌ Error in authorize:', error)
          return null
        }
      }
    })
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.sub = user.id
          token.email = user.email ?? ''
          token.name = user.name ?? ''
        }
        return token
      } catch (error) {
        console.error('[Auth JWT] ❌ Error in jwt callback:', error)
        throw error
      }
    },

    async session({ session, token }) {
      try {
        session.user = {
          id: token.sub as string,
          email: token.email as string,
          name: token.name as string,
        }
        return session
      } catch (error) {
        console.error('[Auth Session] ❌ Error in session callback:', error)
        throw error
      }
    }
  },

  pages: {
    signIn: "/login",
    error: "/login?error=auth"
  },

  ...(process.env.NODE_ENV === 'development' && { debug: true })
}
