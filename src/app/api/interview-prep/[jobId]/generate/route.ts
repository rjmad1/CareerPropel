'use server';

/**
 * Interview Prep Generation Route
 *
 * POST /api/interview-prep/{jobId}/generate - Force regenerate interview prep
 */

import { NextRequest, NextResponse } from 'next/server';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

interface GenerateRequest {
  force?: boolean;
  userId: string;
  jobDescription?: string;
  userResume?: string;
}

interface RouteParams {
  params: {
    jobId: string;
  };
}

/**
 * POST /api/interview-prep/{jobId}/generate
 * Force regenerate interview prep for a job
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId } = params;
    const body: GenerateRequest = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch job and user data from database
    // const job = await db.job.findUnique({
    //   where: { id: jobId },
    //   include: { candidate: true },
    // });

    // if (!job) {
    //   return NextResponse.json(
    //     { error: 'Job not found' },
    //     { status: 404 }
    //   );
    // }

    // // Check if user owns this job
    // if (job.candidate.id !== body.userId) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 403 }
    //   );
    // }

    // const userResume = body.userResume || job.candidate.resumeText;
    // const jobDescription = body.jobDescription || job.description;

    // if (!userResume || !jobDescription) {
    //   return NextResponse.json(
    //     { error: 'Resume and job description are required' },
    //     { status: 400 }
    //   );
    // }

    // // Generate new prep
    // const prep = await generateInterviewPrep({
    //   jobId,
    //   jobDescription,
    //   jobTitle: job.title,
    //   company: job.company,
    //   userResume,
    // });

    // // Save or update in database
    // const upserted = await db.interviewPrep.upsert({
    //   where: { jobId },
    //   update: {
    //     ...prep,
    //     lastUpdated: new Date(),
    //     prepStatus: 'ready',
    //   },
    //   create: {
    //     ...prep,
    //     candidateId: body.userId,
    //     prepStatus: 'ready',
    //   },
    //   include: {
    //     companyResearch: true,
    //     roleBreakdown: true,
    //     starStories: true,
    //   },
    // });

    // // Publish event for real-time updates
    // await publishEvent('interview-prep:generated', {
    //   jobId,
    //   userId: body.userId,
    //   prep: upserted,
    // });

    // return NextResponse.json(upserted);

    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error generating interview prep:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview prep' },
      { status: 500 }
    );
  }
}
