import { getHealthSnapshot } from '@/lib/queue/health';

export async function GET() {
  const snapshot = await getHealthSnapshot();
  return Response.json(snapshot, {
    status: snapshot.status === 'ok' ? 200 : 503,
  });
}
