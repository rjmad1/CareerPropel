import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
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
      error: error instanceof Error ? error.stack : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
