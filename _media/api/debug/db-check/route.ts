import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(_request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
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
}
