/**
 * Debug endpoint: Auth Configuration Validation
 * 
 * SECURITY: This endpoint should ONLY be enabled in development
 * In production, restrict or remove this endpoint
 * 
 * Usage: GET /api/debug/auth-config
 * Response: Status of NextAuth environment variables and configuration
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';

export const dynamic = 'force-dynamic'

export const GET = withAuth(
  async (_request: NextRequest) => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return new Response(
        JSON.stringify({
          error: 'This endpoint is only available in development',
          status: 'disabled'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

  try {
    const config = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ SET' : '❌ MISSING',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ MISSING',
      },
      validation: {
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        isProduction: (process.env.NODE_ENV as string) === 'production',
        isDevelopment: process.env.NODE_ENV === 'development',
      },
      checks: {
        nextAuthUrlSet: process.env.NEXTAUTH_URL ? 'PASS' : 'FAIL',
        nextAuthSecretSet: process.env.NEXTAUTH_SECRET ? 'PASS' : 'FAIL',
        authConfigValid: process.env.NEXTAUTH_URL && process.env.NEXTAUTH_SECRET ? 'PASS' : 'FAIL',
      },
      recommendations: [] as string[],
      timestamp: new Date().toISOString(),
    }

    // Build recommendations
    if (!process.env.NEXTAUTH_URL) {
      config.recommendations.push(
        'Add NEXTAUTH_URL to environment variables. For local dev: http://localhost:3000, For Vercel: https://your-domain.vercel.app'
      )
    }

    if (!process.env.NEXTAUTH_SECRET) {
      config.recommendations.push(
        'Add NEXTAUTH_SECRET to environment variables. Generate with: openssl rand -base64 32'
      )
    }

    return new Response(
      JSON.stringify(config, null, 2),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('[Auth Config] Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to retrieve auth configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  },
  {
    classification: 'privileged',
    roles: ['SUPER_ADMIN'],
    rateLimitClass: 'standard',
    auditSensitivity: 'high'
  }
)
