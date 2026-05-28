/**
 * POST /api/interview-prep/{jobId}/generate
 * Force-regenerate (or create) interview prep for a job.
 * Fetches job + candidate profile from DB, calls prepService, then upserts.
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { generateInterviewPrep } from '@/lib/interview/prepService'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ jobId: string }>
}

import { trackFunnelEvent } from '@/lib/observability/funnel';

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId } = await params
    const { userEmail } = await getAuthContext()

    await trackFunnelEvent(userEmail, 'interview', 'generate', 'started');

    // Allow caller to supply extra context; fall back to DB values
    const body = await request.json().catch(() => ({}))
    const { jobDescription: bodyDesc, userResume: bodyResume } = body as {
      jobDescription?: string
      userResume?: string
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      include: {
        profileData: true,
        skills: true,
        achievements: true,
      },
    })
    if (!candidate) throw ApiErrors.NOT_FOUND('candidate profile')

    const job = await prisma.job.findFirst({
      where: { id: jobId, candidateId: candidate.id },
    })
    if (!job) throw ApiErrors.NOT_FOUND('job')

    // Resolve resume text: caller override → stored resume → fallback to summary
    const resumeRecord = candidate.profileData.find((p) => p.type === 'resume')
    const resolvedResume =
      bodyResume ||
      (resumeRecord?.content ? JSON.stringify(resumeRecord.content) : null) ||
      candidate.summary ||
      `Candidate: ${candidate.name}`

    const resolvedDesc = bodyDesc || job.description || `${job.title} at ${job.company}`

    // Mark as generating so the UI can show a spinner
    await prisma.interviewPrep.upsert({
      where: { jobId },
      create: {
        jobId,
        candidateId: candidate.id,
        role: job.title,
        company: job.company,
        prepStatus: 'generating',
      },
      update: { prepStatus: 'generating', contentVersion: { increment: 1 } },
    })

    const generated = await generateInterviewPrep({
      jobId,
      jobDescription: resolvedDesc,
      jobTitle: job.title,
      company: job.company,
      userResume: resolvedResume,
    })

    const prep = await prisma.interviewPrep.update({
      where: { jobId },
      data: {
        role: job.title,
        company: job.company,
        prepStatus: 'ready',
        confidenceScore: generated.confidenceScore,
        companyResearch: generated.companyResearch as unknown as Prisma.InputJsonValue,
        roleBreakdown: generated.roleBreakdown as unknown as Prisma.InputJsonValue,
        technicalPrep: generated.technicalPrep as unknown as Prisma.InputJsonValue,
        systemDesignPrep: generated.systemDesignPrep as unknown as Prisma.InputJsonValue,
        resumeAlignment: generated.resumeAlignment as unknown as Prisma.InputJsonValue,
        compensationGuide: generated.compensationGuide as unknown as Prisma.InputJsonValue,
        generatedAt: generated.generatedAt,
        userModifications: false,
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

    await trackFunnelEvent(userEmail, 'interview', 'generate', 'completed');

    return successResponse(prep)
  } catch (error) {
    try {
      const { userEmail } = await getAuthContext()
      if (userEmail) {
        await trackFunnelEvent(userEmail, 'interview', 'generate', 'failed', { error: error instanceof Error ? error.message : String(error) });
      }
    } catch {}
    return errorResponse(error)
  }
}
