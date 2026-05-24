import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getExecutionEnvelope } from '@/lib/agents/store';

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

    const execution = await getExecutionEnvelope(executionId);

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        execution,
        toolCalls: includeToolCalls ? execution.toolCalls || [] : [],
        logs: includeEvents ? execution.eventLogs || [] : [],
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

    const updated = await prisma.agentExecution.update({
      where: { id: executionId },
      data: body,
    });

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
  _request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const executionId = params.executionId;

    await prisma.agentExecution.delete({
      where: { id: executionId },
    });

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
