'use client'

let clientCorrelationId = '';

/**
 * Retrieves or generates a stable client-side correlation ID for the session.
 */
export function getClientCorrelationId(): string {
  if (typeof window === 'undefined') return '';
  if (!clientCorrelationId) {
    clientCorrelationId = window.crypto?.randomUUID?.() || 'c-' + Math.random().toString(36).substring(2, 11);
  }
  return clientCorrelationId;
}

export interface ClientErrorPayload {
  message: string;
  name?: string;
  stack?: string;
  componentStack?: string;
  correlationId?: string;
  digest?: string;
  url?: string;
  timestamp: string;
}

/**
 * Formats and logs client-side exceptions in a structured format to the browser console.
 */
export function logClientError(error: Error | unknown, componentStack?: string): void {
  if (typeof window === 'undefined') {
    // SSR Fallback
    console.error('[Server-Side Error in Client Code]', error);
    return;
  }

  const payload: ClientErrorPayload = {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : 'UnknownError',
    stack: error instanceof Error ? error.stack : undefined,
    componentStack,
    correlationId: getClientCorrelationId(),
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };

  // Extract Next.js digest if available (meaning it originated on server/SSR but bubbled to boundary)
  if (error && typeof error === 'object' && 'digest' in error) {
    payload.digest = String((error as { digest: unknown }).digest);
  }

  // Structured client-side logging to console
  console.error('[Client-Side Error]', JSON.stringify(payload, null, 2));
}
