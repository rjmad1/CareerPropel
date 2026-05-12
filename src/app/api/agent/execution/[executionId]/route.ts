import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/agent/execution/[executionId]
 * Fetch execution details with tool calls and logs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const executionId = params.executionId;
    const includeToolCalls = request.nextUrl.searchParams.get('excludeTools') !== 'true';
    const includeEvents = request.nextUrl.searchParams.get('excludeEvents') !== 'true';

    // TODO: Wire to Prisma
    // const execution = await prisma.agentExecution.findUnique({
    //   where: { id: executionId },
    //   include: {
    //     toolCalls: includeToolCalls,
    //     // events: includeEvents,
    //   },
    // });

    // Mock response for development
    const execution = {
      id: executionId,
      candidateId: 'cand_123',
      jobId: null,
      agentType: 'resume-tailor',
      status: 'completed',
      startedAt: new Date(Date.now() - 300000), // 5 minutes ago
      completedAt: new Date(),
      duration: 300000,
      currentTask: null,
      progress: 100,
      tokenUsage: 1500,
      errorMessage: null,
      metadata: { jobTitle: 'Senior Engineer' },
      createdAt: new Date(Date.now() - 300000),
      updatedAt: new Date(),
    };

    const toolCalls = includeToolCalls
      ? [
          {
            id: 'tool_1',
            executionId: executionId,
            toolName: 'extract_job_requirements',
            status: 'success',
            input: { jobDescription: 'Senior Engineer role...' },
            output: { requirements: ['React', 'Node.js', 'TypeScript'] },
            error: null,
            startedAt: new Date(Date.now() - 300000),
            completedAt: new Date(Date.now() - 240000),
            duration: 60000,
            tokens: 500,
            metadata: null,
          },
          {
            id: 'tool_2',
            executionId: executionId,
            toolName: 'tailor_resume',
            status: 'success',
            input: { resume: 'Original resume...', keywords: ['React', 'Node.js'] },
            output: { tailoredResume: 'Tailored resume...' },
            error: null,
            startedAt: new Date(Date.now() - 240000),
            completedAt: new Date(),
            duration: 60000,
            tokens: 1000,
            metadata: null,
          },
        ]
      : [];

    const logs = includeEvents ? [] : [];

    return NextResponse.json(
      {
        execution,
        toolCalls,
        logs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching execution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agent/execution/[executionId]
 * Update execution status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const executionId = params.executionId;
    const body = await request.json();

    // TODO: Wire to Prisma
    // const updated = await prisma.agentExecution.update({
    //   where: { id: executionId },
    //   data: body,
    // });

    // Mock response
    const updated = {
      id: executionId,
      status: body.status || 'running',
      ...body,
    };

    return NextResponse.json({ execution: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating execution:', error);
    return NextResponse.json(
      { error: 'Failed to update execution' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agent/execution/[executionId]
 * Delete execution and all related data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const executionId = params.executionId;

    // TODO: Wire to Prisma
    // await prisma.agentExecution.delete({
    //   where: { id: executionId },
    // });

    return NextResponse.json(
      { success: true, message: 'Execution deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting execution:', error);
    return NextResponse.json(
      { error: 'Failed to delete execution' },
      { status: 500 }
    );
  }
}
