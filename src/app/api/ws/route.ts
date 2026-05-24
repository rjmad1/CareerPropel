import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const executionId = request.nextUrl.searchParams.get('executionId');

  return Response.json(
    {
      error: 'WebSocket transport is deprecated',
      message: executionId
        ? `Use /api/agent/execution/${executionId}/subscribe for SSE execution updates`
        : 'Use the SSE execution subscription endpoint instead',
    },
    { status: 410 }
  );
}
