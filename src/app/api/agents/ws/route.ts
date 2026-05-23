/**
 * GET /api/agents/ws
 *
 * Permanently redirects to the SSE agent status stream.
 * Raw WebSocket upgrade is handled by the Socket.io server in server.js;
 * server-to-client agent status updates are served via SSE at /api/agents/events.
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  // WebSocket upgrade requests cannot be handled by Next.js API routes;
  // the Socket.io server (server.js) handles WebSocket connections directly.
  if (_request.headers.get('upgrade')?.toLowerCase() === 'websocket') {
    return new Response(
      'WebSocket connections are not supported at this endpoint. Connect via the Socket.io server.',
      { status: 426, headers: { 'Content-Type': 'text/plain', Upgrade: 'websocket' } }
    );
  }
  return Response.redirect(new URL('/api/agents/events', _request.url), 308);
}
