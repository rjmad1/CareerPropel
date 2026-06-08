import { Langfuse } from 'langfuse';

let langfuseInstance: Langfuse | null = null;

/**
 * Returns the initialized Langfuse client.
 * Returns null if Langfuse credentials are not configured (degraded/local development mode).
 */
export function getLangfuse(): Langfuse | null {
  if (typeof window !== 'undefined') return null;
  if (langfuseInstance) return langfuseInstance;

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com';

  if (!publicKey || !secretKey) {
    console.warn('[Langfuse] LANGFUSE_PUBLIC_KEY or LANGFUSE_SECRET_KEY environment variables are missing. AI governance logging will be bypassed.');
    return null;
  }

  try {
    langfuseInstance = new Langfuse({
      publicKey,
      secretKey,
      baseUrl,
    });
    console.log(`[Langfuse] SDK successfully initialized targeting host: ${baseUrl}`);
    return langfuseInstance;
  } catch (error) {
    console.error('[Langfuse] Error during SDK initialization:', error);
    return null;
  }
}
