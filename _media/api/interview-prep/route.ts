/**
 * Interview Prep API
 *
 * GET  /api/interview-prep?jobId={id}  — fetch existing prep
 * POST /api/interview-prep             — generate + persist new prep
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateInterviewPrep } from '@/lib/interview/prepService'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()

    const jobId = new URL(request.url).searchParams.get('jobId')
    if (!jobId) throw ApiErrors.VALIDATION_ERROR('jobId query parameter is required')

    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } })
    if (!candidate) return errorResponse(ApiErrors.NOT_FOUND('interview prep'))

    const prep = await prisma.interviewPrep.findUnique({
      where: { jobId },
      include: { starStories: true },
    })

    if (!prep || prep.candidateId !== candidate.id) {
      return errorResponse(ApiErrors.NOT_FOUND('interview prep'))
    }

    return successResponse(prep)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()

    const body = await request.json()
    const { jobId, jobDescription, jobTitle, company, userResume, userProjects } = body

    const missing = ['jobId', 'jobDescription', 'jobTitle', 'company', 'userResume'].filter(
      (f) => !body[f]
    )
    if (missing.length) throw ApiErrors.VALIDATION_ERROR(`Missing: ${missing.join(', ')}`)

    let candidate = await prisma.candidate.findUnique({ where: { email: userEmail } })
    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: { email: userEmail, name: userEmail.split('@')[0] },
      })
    }

    // Verify the job belongs to this candidate
    const job = await prisma.job.findFirst({
      where: { id: jobId, candidateId: candidate.id },
    })
    if (!job) throw ApiErrors.NOT_FOUND('job')

    // Mark as generating while we work
    await prisma.interviewPrep.upsert({
      where: { jobId },
      create: {
        jobId,
        candidateId: candidate.id,
        role: jobTitle,
        company,
        prepStatus: 'generating',
      },
      update: { prepStatus: 'generating', contentVersion: { increment: 1 } },
    })

    const generated = await generateInterviewPrep({
      jobId,
      jobDescription,
      jobTitle,
      company,
      userResume,
      userProjects,
    })

    // Persist star stories separately so they're queryable
    const prep = await prisma.interviewPrep.update({
      where: { jobId },
      data: {
        prepStatus: 'ready',
        confidenceScore: generated.confidenceScore,
        companyResearch: generated.companyResearch as any,
        roleBreakdown: generated.roleBreakdown as any,
        technicalPrep: generated.technicalPrep as any,
        systemDesignPrep: generated.systemDesignPrep as any,
        resumeAlignment: generated.resumeAlignment as any,
        compensationGuide: generated.compensationGuide as any,
        generatedAt: generated.generatedAt,
        starStories: {
          deleteMany: {},
          create: generated.behavioralStories.map((s) => ({
            candidateId: candidate.id,
            competency: s.competency,
            competencies: s.competencies ?? [],
            title: s.title ?? s.competency,
            summary: s.summary,
            situation: s.situation,
            task: s.task,
            action: s.action,
            result: s.result,
            metrics: Array.isArray(s.metrics) ? s.metrics : s.metrics ? [s.metrics] : [],
            sourceProject: s.sourceProject,
            relevanceScore: s.relevanceScore,
            timeToTell: s.timeToTell,
            confidence: s.confidence,
            interviewQuestions: s.interviewQuestions ?? [],
          })),
        },
      },
      include: { starStories: true },
    })

    return successResponse(prep, 201)
  } catch (error) {
    return errorResponse(error)
  }
}
