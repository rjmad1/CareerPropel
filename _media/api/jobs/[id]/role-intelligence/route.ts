import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { enqueueAgentExecution } from '@/lib/queue/enqueue';
import { AgentType } from '@/lib/agents/prompts';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userEmail } = await getAuthContext();
    const { id: jobId } = await context.params;

    if (!jobId || jobId.length < 5) {
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 });
    }

    // Verify job exists and user owns it
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        candidate: { select: { email: true, id: true } }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.candidate.email !== userEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const candidateId = job.candidate.id;

    // Fetch JobIntelligence
    const intelligence = await prisma.jobIntelligence.findUnique({
      where: { jobId },
      include: {
        archetypes: true,
        requirements: true,
        businessProblems: true,
        signals: true,
      }
    });

    // Fetch RoleFitAnalysis
    let fitAnalysis = null;
    if (intelligence) {
      fitAnalysis = await prisma.roleFitAnalysis.findUnique({
        where: {
          candidateId_jobIntelligenceId: {
            candidateId,
            jobIntelligenceId: intelligence.id
          }
        },
        include: {
          strengths: {
            include: {
              businessProblem: true
            }
          },
          gaps: true
        }
      });
    }

    // Fetch PatternLibraryEntry
    const patterns = await prisma.patternLibraryEntry.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch execution states for UI loaders
    const executions = await prisma.agentExecution.findMany({
      where: {
        userId: userEmail,
        jobId,
        agentType: {
          in: ['role-intelligence', 'fit-analysis', 'strength-mapper', 'conversion-scorer', 'gap-analyzer', 'pattern-miner']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 12
    });

    return NextResponse.json({
      intelligence,
      fitAnalysis,
      patterns,
      executions
    });
  } catch (error) {
    console.error('[role-intelligence GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userEmail } = await getAuthContext();
    const { id: jobId } = await context.params;

    if (!jobId || jobId.length < 5) {
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { agentType } = body;

    const validAgentTypes: AgentType[] = [
      'role-intelligence',
      'fit-analysis',
      'strength-mapper',
      'conversion-scorer',
      'gap-analyzer',
      'pattern-miner'
    ];

    if (!agentType || !validAgentTypes.includes(agentType as AgentType)) {
      return NextResponse.json({ error: 'Invalid or missing agentType' }, { status: 400 });
    }

    // Verify job exists and user owns it
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        candidate: { select: { email: true } }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.candidate.email !== userEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const executionId = await enqueueAgentExecution(agentType, userEmail, {
      jobId,
      companyName: job.company,
      jobDescription: job.description ?? '',
    });

    return NextResponse.json({
      success: true,
      executionId
    });
  } catch (error) {
    console.error('[role-intelligence POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
