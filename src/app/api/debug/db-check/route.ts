import { prisma } from "@/lib/db"
import { NextRequest } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"

export const dynamic = 'force-dynamic'

export const GET = withAuth(
  async (_request: NextRequest) => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return Response.json({ error: 'This endpoint is only available in development' }, { status: 403 })
    }

    try {
      console.log("[DEBUG] Starting database check...")
      
      // Try to connect and query
      const candidateCount = await prisma.candidate.count()
      
      console.log("[DEBUG] Database check successful. Candidate count:", candidateCount)
      
      return Response.json({
        status: "success",
        message: "Database connection successful",
        candidateCount: candidateCount,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error("[DEBUG] Database check failed:", error)
      return Response.json({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
  },
  {
    classification: 'privileged',
    roles: ['SUPER_ADMIN'],
    rateLimitClass: 'standard',
    auditSensitivity: 'high'
  }
)
