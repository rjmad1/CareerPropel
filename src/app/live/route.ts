import { getLivenessSnapshot } from '@/lib/queue/health';

export async function GET() {
  return Response.json(await getLivenessSnapshot());
}
