import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

// Simple in-memory user store for development
const devUsers = new Map<string, any>()

// Validate required environment variables at module load time
function validateAuthEnvironment() {
  const errors: string[] = []
  
  if (!process.env.NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is not set')
  }
  if (!process.env.NEXTAUTH_URL) {
    errors.push('NEXTAUTH_URL is not set')
  }
  
  if (errors.length > 0) {
    console.error('❌ NextAuth Configuration Errors:')
    errors.forEach(err => console.error(`  - ${err}`))
    console.error('')
    console.error('CRITICAL: NextAuth will not function properly without these environment variables.')
    console.error('For local development, add to .env.local:')
    console.error('  NEXTAUTH_SECRET=your-secret-key')
    console.error('  NEXTAUTH_URL=http://localhost:3000')
    console.error('')
    console.error('For Vercel production, add to Project Settings > Environment Variables:')
    console.error('  NEXTAUTH_SECRET=<generate-with-: openssl rand -base64 32>')
    console.error('  NEXTAUTH_URL=https://your-domain.vercel.app')
  }
  
  return errors.length === 0
}

// Check auth environment on startup
if (typeof window === 'undefined') { // Only on server side
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

    // Credentials provider - pure development mode
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          // Validate credentials exist
          if (!credentials?.email) {
            console.warn('[Auth] Login attempt with missing email')
            return null
          }
          
          const email = credentials.email.toLowerCase().trim()
          
          // Validate email format (basic)
          if (!email.includes('@')) {
            console.warn('[Auth] Login attempt with invalid email format:', email)
            return null
          }
          
          // Check if user already exists in store
          if (devUsers.has(email)) {
            const user = devUsers.get(email)
            console.log('[Auth] ✅ User authenticated from store:', email)
            return user
          }
          
          // Create new user on first login (development mode)
          const newUser = {
            id: email.split('@')[0],
            email: email,
            name: email.split('@')[0]
          }
          
          devUsers.set(email, newUser)
          console.log('[Auth] ✅ New user created and authenticated:', email)
          return newUser
          
        } catch (error) {
          console.error('[Auth] ❌ Unexpected error in authorize:', error)
          return null
        }
      }
    })
  ],
  
  // JWT Strategy
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  // JWT Callback: Add user ID to token
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          // On successful authorize(), add user data to token
          token.sub = user.id
          token.email = user.email
          token.name = user.name
          console.log('[Auth JWT] ✅ Token created for user:', user.email)
        }
        return token
      } catch (error) {
        console.error('[Auth JWT] ❌ Error in jwt callback:', error)
        throw error
      }
    },
    
    async session({ session, token }) {
      try {
        // Add user data from token to session
        if (session.user) {
          session.user.id = token.sub
          session.user.email = token.email
          session.user.name = token.name
        }
        console.log('[Auth Session] ✅ Session updated for user:', token.email)
        return session
      } catch (error) {
        console.error('[Auth Session] ❌ Error in session callback:', error)
        throw error
      }
    }
  },
  
  // Custom pages
  pages: { 
    signIn: "/login",
    error: "/login?error=auth" 
  },
  
  // Debug mode for development
  ...(process.env.NODE_ENV === 'development' && { debug: true })
}
