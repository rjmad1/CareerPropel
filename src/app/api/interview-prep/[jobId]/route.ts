/**
 * Interview Prep — per-job routes
 *
 * GET    /api/interview-prep/{jobId}  — fetch prep for a job
 * PUT    /api/interview-prep/{jobId}  — update prep (user modifications)
 * DELETE /api/interview-prep/{jobId}  — delete prep
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { jobId: string }
}

async function getOwnedPrep(jobId: string, candidateId: string) {
  const prep = await prisma.interviewPrep.findUnique({
    where: { jobId },
    include: { starStories: true },
  })
  if (!prep || prep.candidateId !== candidateId) {
    throw ApiErrors.NOT_FOUND('interview prep')
  }
  return prep
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { userEmail } = await getAuthContext()
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } })
    if (!candidate) return errorResponse(ApiErrors.NOT_FOUND('interview prep'))

    const prep = await getOwnedPrep(params.jobId, candidate.id)
    return successResponse(prep)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userEmail } = await getAuthContext()
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } })
    if (!candidate) return errorResponse(ApiErrors.NOT_FOUND('interview prep'))

    await getOwnedPrep(params.jobId, candidate.id)

    const updates = await request.json()

    // Whitelist editable fields to prevent mass-assignment
    const allowed = [
      'companyResearch',
      'roleBreakdown',
      'technicalPrep',
      'systemDesignPrep',
      'resumeAlignment',
      'compensationGuide',
      'prepStatus',
    ] as const

    const data: Record<string, unknown> = { userModifications: true }
    for (const field of allowed) {
      if (field in updates) data[field] = updates[field]
    }

    const updated = await prisma.interviewPrep.update({
      where: { jobId: params.jobId },
      data,
      include: { starStories: true },
    })

    return successResponse(updated)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { userEmail } = await getAuthContext()
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } })
    if (!candidate) return errorResponse(ApiErrors.NOT_FOUND('interview prep'))

    await getOwnedPrep(params.jobId, candidate.id)

    await prisma.interviewPrep.delete({ where: { jobId: params.jobId } })

    return successResponse({ deleted: true })
  } catch (error) {
    return errorResponse(error)
  }
}
