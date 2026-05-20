import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { log } from "@/lib/logging/logger"

/**
 * In-memory store for dev bypass mode (ALLOW_DEV_LOGIN=true only).
 *
 * RASUI-003 fix: bounded to 100 entries to prevent memory growth from
 * long-lived processes in environments where the bypass is accidentally enabled.
 */
const DEV_USERS_MAX = 100;
const devUsers = new Map<string, { id: string; email: string; name: string }>();

function validateAuthEnvironment() {
  const errors: string[] = []
  if (!process.env.NEXTAUTH_SECRET) errors.push('NEXTAUTH_SECRET is not set')
  if (!process.env.NEXTAUTH_URL) errors.push('NEXTAUTH_URL is not set')
  if (errors.length > 0) {
    log.error({ errors }, 'NextAuth configuration errors detected')
    log.error('Add NEXTAUTH_SECRET and NEXTAUTH_URL to .env.local or Vercel environment variables.')
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

          // RASUI-003 remediation:
          // Guard 1 — Hard production block. ALLOW_DEV_LOGIN must NEVER be enabled
          // in production regardless of what env vars are present.
          if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_LOGIN === 'true') {
            throw new Error(
              'ALLOW_DEV_LOGIN cannot be used in a production environment. ' +
              'Remove ALLOW_DEV_LOGIN from production environment variables immediately.'
            );
          }

          // Dev bypass: any email/password accepted when ALLOW_DEV_LOGIN=true
          if (process.env.ALLOW_DEV_LOGIN === 'true') {
            if (devUsers.has(email)) return devUsers.get(email)!
            // Bounded map: evict oldest entry if at capacity
            if (devUsers.size >= DEV_USERS_MAX) {
              const firstKey = devUsers.keys().next().value
              if (firstKey) devUsers.delete(firstKey)
            }
            const newUser = { id: email.split('@')[0], email, name: email.split('@')[0] }
            devUsers.set(email, newUser)
            // RASUI-003 fix: log activation without the email address (no PII in logs)
            log.info('[Auth] Dev bypass login activated')
            return newUser
          }

          // Production path: validate against Candidate table
          const candidate = await prisma.candidate.findUnique({ where: { email } })
          if (!candidate) {
            // RASUI-003 fix: no email in log message
            log.info('[Auth] Login attempt: no account found')
            return null
          }
          if (!candidate.passwordHash) {
            // OAuth-only account — no password set
            log.info('[Auth] Login attempt: OAuth-only account, no password set')
            return null
          }
          const valid = await bcrypt.compare(credentials.password, candidate.passwordHash)
          if (!valid) {
            log.info('[Auth] Login attempt: invalid credentials')
            return null
          }
          // Log userId (opaque) not email (PII)
          log.info({ userId: candidate.id }, '[Auth] User authenticated successfully')
          return { id: candidate.id, email: candidate.email, name: candidate.name }
        } catch (error) {
          log.error({ err: error }, '[Auth] Error in authorize callback')
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
        log.error({ err: error }, '[Auth JWT] Error in jwt callback')
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
        log.error({ err: error }, '[Auth Session] Error in session callback')
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
