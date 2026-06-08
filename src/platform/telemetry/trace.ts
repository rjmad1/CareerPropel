import { trace, Span, SpanStatusCode } from '@opentelemetry/api';

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
        if (v === null || v === undefined) {
          redacted[k] = v;
        } else if (lowerKey === 'email') {
          redacted[k] = '[REDACTED_EMAIL]';
        } else {
          redacted[k] = '[REDACTED_SENSITIVE_FIELD]';
        }
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
  addEvent(name: string, attributes?: Record<string, unknown>): void;
  end(attributes?: Record<string, unknown>): void;
}

export class OtelTraceSpanWrapper implements TraceSpan {
  public readonly traceId: string;
  public readonly spanId: string;
  public readonly parentId?: string;
  public readonly name: string;
  public readonly startTime: number;
  public readonly attributes: Record<string, unknown> = {};
  private isEnded = false;

  constructor(private span: Span, name: string, initialAttributes?: Record<string, unknown>) {
    this.name = name;
    this.startTime = Date.now();
    
    const spanContext = span.spanContext();
    this.traceId = spanContext.traceId;
    this.spanId = spanContext.spanId;

    if (initialAttributes) {
      this.attributes = redactSensitiveData({ ...initialAttributes });
      span.setAttributes(this.attributes as any);
    }
  }

  public addEvent(name: string, attributes?: Record<string, unknown>): void {
    if (this.isEnded) return;
    const cleanAttrs = attributes ? redactSensitiveData(attributes) : undefined;
    this.span.addEvent(name, cleanAttrs);
  }

  public end(attributes?: Record<string, unknown>): void {
    if (this.isEnded) return;
    this.isEnded = true;
    if (attributes) {
      const cleanAttrs = redactSensitiveData(attributes);
      Object.assign(this.attributes, cleanAttrs);
      this.span.setAttributes(cleanAttrs);
      if (attributes.success === false || attributes.error) {
        this.span.setStatus({
          code: SpanStatusCode.ERROR,
          message: String(attributes.error || 'Operation failed'),
        });
      } else {
        this.span.setStatus({ code: SpanStatusCode.OK });
      }
    } else {
      this.span.setStatus({ code: SpanStatusCode.OK });
    }
    this.span.end();
  }
}

/**
 * Starts a new distributed trace span using OpenTelemetry under the hood.
 */
export function startTraceSpan(
  name: string,
  options: {
    correlationId?: string;
    parentSpanId?: string;
    attributes?: Record<string, unknown>;
  } = {}
): TraceSpan {
  const tracer = trace.getTracer('career-propel');
  
  // Set context attributes if trace ID is specified
  const span = tracer.startSpan(name, {
    attributes: options.attributes ? (redactSensitiveData(options.attributes) as any) : undefined,
  });

  return new OtelTraceSpanWrapper(span, name, options.attributes);
}
