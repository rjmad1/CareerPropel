import { runtimeSettings } from '@/lib/runtime/settings';

const SENSITIVE_KEY_PATTERN = /(secret|token|password|key|authorization|cookie)/i;

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.length > 4000 ? `${value.slice(0, 4000)}...[truncated]` : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : sanitizeValue(nestedValue),
      ])
    );
  }

  return value;
}

export function sanitizeQueuePayload(payload: Record<string, unknown>) {
  const sanitized = sanitizeValue(payload) as Record<string, unknown>;
  const serialized = JSON.stringify(sanitized);

  if (serialized.length <= runtimeSettings.maxQueuePayloadBytes) {
    return sanitized;
  }

  return {
    ...sanitized,
    _truncated: true,
    _originalBytes: serialized.length,
  };
}
