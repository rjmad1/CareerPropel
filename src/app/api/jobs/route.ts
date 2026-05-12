/**
 * GET /api/jobs - List all jobs
 * POST /api/jobs - Create a new job
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    // TODO: Replace with actual user authentication
    const userId = 'default-user';

    const jobs = await prisma.job.findMany({
      where: { userId },
      include: {
        interviews: true,
      },
      orderBy: { applicationDate: 'desc' },
    });

    return NextResponse.json({
      jobs,
      total: jobs.length,
      hasMore: false,
    });
  } catch (error) {
    console.error('[Jobs List API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Replace with actual user authentication
    const userId = 'default-user';

    // Create job with defaults
    const job = await prisma.job.create({
      data: {
        userId,
        role: body.role || 'Software Engineer',
        company: body.company || 'Unknown Company',
        stage: body.stage || 'interested',
        matchScore: body.matchScore || 0,
        applicationDate: body.applicationDate || new Date(),
        updatedAt: new Date(),
        interviewStatus: body.interviewStatus || 'none',
        resumeVersion: body.resumeVersion || 'v1',
        recruiterStatus: body.recruiterStatus || 'not_contacted',
        priority: body.priority || 'medium',
        aiConfidence: body.aiConfidence || 0.5,
        risks: body.risks || [],
        blockers: body.blockers || [],
        notes: body.notes || '',
        appliedVia: body.appliedVia || 'direct',
        jobUrl: body.jobUrl,
        companyResearchId: body.companyResearchId,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('[Jobs Create API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create job',
      },
      { status: 500 }
    );
  }
}
