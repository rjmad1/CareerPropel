import { startTraceSpan, redactSensitiveData } from '@/platform/telemetry/trace';
import { getLangfuse } from '@/platform/ai-observability/langfuse';

describe('OpenTelemetry Tracing Wrapper', () => {
  it('should successfully create and wrap a trace span', () => {
    const trace = startTraceSpan('test-span', {
      attributes: {
        key: 'value',
      },
    });
    expect(trace).toBeDefined();
    expect(trace.name).toBe('test-span');
    expect(trace.traceId).toBeDefined();
    expect(trace.spanId).toBeDefined();
    
    // Add event and end span
    trace.addEvent('test-event', { detail: 'info' });
    trace.end({ success: true });
  });

  it('should redact sensitive information in attributes', () => {
    const sensitive = {
      email: 'user@example.com',
      password: 'mypassword123',
      normalKey: 'safe-value',
      nested: {
        api_key: 'sk_test_123',
        safe: 42,
      },
    };

    const redacted = redactSensitiveData(sensitive);
    expect(redacted.email).toBe('[REDACTED_EMAIL]');
    expect(redacted.password).toBe('[REDACTED_SENSITIVE_FIELD]');
    expect(redacted.normalKey).toBe('safe-value');
    expect(redacted.nested.api_key).toBe('[REDACTED_SENSITIVE_FIELD]');
    expect(redacted.nested.safe).toBe(42);
  });
});

describe('Langfuse AI Observability client', () => {
  it('should resolve the Langfuse client (or null if unconfigured)', () => {
    const langfuse = getLangfuse();
    // In test environment without keys configured, it should return null safely
    if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
      expect(langfuse).not.toBeNull();
    } else {
      expect(langfuse).toBeNull();
    }
  });
});
