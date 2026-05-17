/**
 * Interview Prep API Routes
 *
 * GET /api/interview-prep?jobId={jobId} - Fetch existing prep
 * POST /api/interview-prep - Create new prep
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewPrep } from '@/lib/interview/prepService';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

interface PrepRequest {
  jobId: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
  userResume: string;
  userProjects?: string[];
}

/**
 * GET /api/interview-prep?jobId={id}
 * Fetch existing interview prep for a job
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch from database
    // const prep = await db.interviewPrep.findUnique({
    //   where: { jobId },
    //   include: {
    //     companyResearch: true,
    //     roleBreakdown: true,
    //     starStories: true,
    //   },
    // });

    // Placeholder: return 404 if not found
    return NextResponse.json(
      { error: 'Interview prep not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching interview prep:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview prep' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interview-prep
 * Generate new interview prep for a job
 */
export async function POST(request: NextRequest) {
  try {
    const body: PrepRequest = await request.json();

    // Validate required fields
    const required = ['jobId', 'jobDescription', 'jobTitle', 'company', 'userResume'];
    const missing = required.filter(field => !body[field as keyof PrepRequest]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate interview prep
    const prep = await generateInterviewPrep({
      jobId: body.jobId,
      jobDescription: body.jobDescription,
      jobTitle: body.jobTitle,
      company: body.company,
      userResume: body.userResume,
      userProjects: body.userProjects,
    });

    // TODO: Save to database
    // await db.interviewPrep.create({
    //   data: {
    //     id: prep.id,
    //     jobId: prep.jobId,
    //     candidateId: userId, // from auth
    //     role: prep.role,
    //     company: prep.company,
    //     prepStatus: prep.prepStatus,
    //     confidenceScore: prep.confidenceScore,
    //     generatedAt: prep.generatedAt,
    //     lastUpdated: prep.lastUpdated,
    //     // ... serialize complex objects to JSON
    //   },
    // });

    return NextResponse.json(prep, { status: 201 });
  } catch (error) {
    console.error('Error generating interview prep:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview prep' },
      { status: 500 }
    );
  }
}
