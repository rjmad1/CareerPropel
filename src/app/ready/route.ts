import { getReadinessSnapshot } from '@/lib/queue/health';

export async function GET() {
  const snapshot = await getReadinessSnapshot();
  return Response.json(snapshot, {
    status: snapshot.status === 'ready' ? 200 : 503,
  });
}
