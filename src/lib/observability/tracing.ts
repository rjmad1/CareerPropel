import crypto from 'crypto';
import { createLogger } from '@/lib/logging/logger';

const traceLogger = createLogger({ component: 'distributed-tracer' });

const SENSITIVE_KEYS = new Set([
  'prompt', 'prompts', 'secret', 'secrets', 'token', 'tokens', 'key', 'keys',
  'api_key', 'apikey', 'password', 'passwords', 'auth', 'authorization',
  'email', 'phone', 'location', 'payload', 'payloads', 'input', 'output'
]);

/**
 * Recursively filters and redacts any trace attributes or events carrying sensitive tokens, PII, or prompt contents.
 */
export function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    const lowerVal = obj.toLowerCase();
    if (obj.startsWith('Bearer ') || obj.startsWith('sk_') || lowerVal.includes('key=') || lowerVal.includes('token=')) {
      return '[REDACTED_API_CREDENTIAL]';
    }
    // Strict pattern matching for emails
    if (obj.includes('@') && obj.indexOf('.') > obj.indexOf('@')) {
      return '[REDACTED_EMAIL]';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }
  if (typeof obj === 'object') {
    const redacted: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const lowerKey = k.toLowerCase();
      const hasSensitiveKeyword = Array.from(SENSITIVE_KEYS).some(
        sKey => lowerKey === sKey || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('password')
      );
      if (hasSensitiveKeyword) {
        redacted[k] = '[REDACTED_SENSITIVE_FIELD]';
      } else {
        redacted[k] = redactSensitiveData(v);
      }
    }
    return redacted;
  }
  return obj;
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentId?: string;
  name: string;
  startTime: number;
  attributes: Record<string, unknown>;
  events: Array<{ name: string; timestamp: string; attributes?: Record<string, unknown> }>;
  addEvent(name: string, attributes?: Record<string, unknown>): void;
  end(attributes?: Record<string, unknown>): void;
}

class ActiveTraceSpan implements TraceSpan {
  public readonly traceId: string;
  public readonly spanId: string;
  public readonly parentId?: string;
  public readonly name: string;
  public readonly startTime: number;
  public readonly attributes: Record<string, unknown> = {};
  public readonly events: Array<{ name: string; timestamp: string; attributes?: Record<string, unknown> }> = [];
  private isEnded = false;

  constructor(name: string, parentContext?: { correlationId?: string; parentSpanId?: string }, initialAttributes?: Record<string, unknown>) {
    this.name = name;
    this.startTime = Date.now();
    this.spanId = `span-${crypto.randomUUID()}`;
    this.traceId = parentContext?.correlationId || `trace-${crypto.randomUUID()}`;
    this.parentId = parentContext?.parentSpanId;
    
    if (initialAttributes) {
      this.attributes = redactSensitiveData({ ...initialAttributes });
    }

    traceLogger.info(
      {
        event: 'span_started',
        name: this.name,
        traceId: this.traceId,
        spanId: this.spanId,
        parentId: this.parentId,
        attributes: this.attributes,
        timestamp: new Date(this.startTime).toISOString(),
      },
      `Trace Span started: ${this.name}`
    );
  }

  public addEvent(name: string, attributes?: Record<string, unknown>): void {
    if (this.isEnded) return;
    this.events.push({
      name,
      timestamp: new Date().toISOString(),
      attributes: redactSensitiveData(attributes || {}),
    });
    
    traceLogger.debug(
      {
        event: 'span_event',
        spanName: this.name,
        eventName: name,
        traceId: this.traceId,
        spanId: this.spanId,
        attributes: redactSensitiveData(attributes || {}),
      },
      `Span Event logged: ${this.name} -> ${name}`
    );
  }

  public end(attributes?: Record<string, unknown>): void {
    if (this.isEnded) return;
    this.isEnded = true;
    const endTime = Date.now();
    const durationMs = endTime - this.startTime;

    if (attributes) {
      Object.assign(this.attributes, redactSensitiveData(attributes));
    }

    traceLogger.info(
      {
        event: 'span_ended',
        name: this.name,
        traceId: this.traceId,
        spanId: this.spanId,
        parentId: this.parentId,
        durationMs,
        attributes: this.attributes,
        events: this.events,
        timestamp: new Date(endTime).toISOString(),
      },
      `Trace Span ended: ${this.name} (${durationMs}ms)`
    );
  }
}

/**
 * Starts a new distributed trace span.
 * Standardizes openTelemetry span propagation using parent correlationId/spanId mapping.
 */
export function startTraceSpan(
  name: string,
  options: {
    correlationId?: string;
    parentSpanId?: string;
    attributes?: Record<string, unknown>;
  } = {}
): TraceSpan {
  return new ActiveTraceSpan(
    name,
    { correlationId: options.correlationId, parentSpanId: options.parentSpanId },
    options.attributes
  );
}

/**
 * Helper to propagate and format openTelemetry traceparent headers (W3C standard)
 */
export function formatTraceParent(traceId: string, spanId: string): string {
  // W3C traceparent standard format: 00-traceId-spanId-flags
  const cleanTraceId = traceId.replace(/[^a-f0-9]/gi, '').padEnd(32, '0').slice(0, 32);
  const cleanSpanId = spanId.replace(/[^a-f0-9]/gi, '').padEnd(16, '0').slice(0, 16);
  return `00-${cleanTraceId}-${cleanSpanId}-01`;
}
