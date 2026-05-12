import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/agent/execution/[executionId]/logs
 * Fetch paginated logs for an execution
 * 
 * Query params:
 * - page: number (default: 0)
 * - pageSize: number (default: 50)
 * - level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' (optional)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const executionId = params.executionId;
    const page = parseInt(request.nextUrl.searchParams.get('page') || '0');
    const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '50');
    const level = request.nextUrl.searchParams.get('level');

    // TODO: Wire to Prisma
    // const logs = await prisma.eventLog.findMany({
    //   where: {
    //     executionId,
    //     ...(level && { level }),
    //   },
    //   orderBy: { timestamp: 'desc' },
    //   skip: page * pageSize,
    //   take: pageSize,
    // });
    //
    // const total = await prisma.eventLog.count({
    //   where: {
    //     executionId,
    //     ...(level && { level }),
    //   },
    // });

    // Mock response
    const mockLogs = [
      {
        id: 'log_1',
        executionId,
        level: 'INFO',
        message: 'Execution started',
        data: { startedBy: 'user_123' },
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: 'log_2',
        executionId,
        level: 'INFO',
        message: 'Tool call: extract_job_requirements',
        data: { tool: 'extract_job_requirements', duration: 60000 },
        timestamp: new Date(Date.now() - 240000),
      },
      {
        id: 'log_3',
        executionId,
        level: 'INFO',
        message: 'Tool call: tailor_resume completed successfully',
        data: { tool: 'tailor_resume', duration: 60000, status: 'success' },
        timestamp: new Date(Date.now() - 1000),
      },
    ];

    const filteredLogs = level
      ? mockLogs.filter((log) => log.level === level)
      : mockLogs;

    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(
      page * pageSize,
      (page + 1) * pageSize
    );
    const hasMore = (page + 1) * pageSize < total;

    return NextResponse.json(
      {
        logs: paginatedLogs,
        total,
        page,
        pageSize,
        hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
