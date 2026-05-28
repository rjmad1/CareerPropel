/**
 * Centralized Sentry Sanitizer
 * Redacts secrets, prompts, API keys, tokens, OAuth keys, resume content, candidate PII, LLM outputs, etc.
 */

export function redactString(str: string): string {
  if (typeof str !== 'string') return str;
  let redacted = str;

  // Anthropic API keys (sk-ant-...)
  redacted = redacted.replace(/sk-ant-[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]');
  // General sk- API keys
  redacted = redacted.replace(/sk-[a-zA-Z0-9]{48}/g, '[REDACTED_API_KEY]');
  // OpenAI/Nvidia/other API keys
  redacted = redacted.replace(/AIzaSy[a-zA-Z0-9_-]{33}/g, '[REDACTED_API_KEY]');
  // Bearer tokens
  redacted = redacted.replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]');
  
  // Inline key=value secrets (e.g., in URLs or query strings)
  redacted = redacted.replace(/(?:session-token|sessionToken|jwt|token|passwd|password|secret|key|authorization|cookie)=[a-zA-Z0-9_\-\.%]+/gi, (match) => {
    const parts = match.split('=');
    return `${parts[0]}=[REDACTED]`;
  });

  return redacted;
}

export function redactSensitiveData(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    return redactString(data);
  }
  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }
  if (typeof data === 'object') {
    const redactedObj: any = {};
    const keysToRedact = [
      'password', 'token', 'secret', 'prompt', 'apikey', 'api_key', 'key',
      'authorization', 'cookie', 'jwt', 'resume', 'jobdescription', 'job_description',
      'payload', 'promptcontext', 'prompt_context', 'content', 'output', 'text',
      'email', 'phone', 'name', 'cv', 'experience'
    ];
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (keysToRedact.some(k => lowerKey.includes(k))) {
        redactedObj[key] = '[REDACTED]';
      } else {
        redactedObj[key] = redactSensitiveData(value);
      }
    }
    return redactedObj;
  }
  return data;
}

export function redactEvent(event: any): any {
  if (!event) return event;

  // 1. Redact request body & headers
  if (event.request) {
    if (event.request.headers) {
      const headersToRedact = ['authorization', 'cookie', 'x-api-key', 'proxy-authorization'];
      for (const key of Object.keys(event.request.headers)) {
        if (headersToRedact.includes(key.toLowerCase())) {
          event.request.headers[key] = '[REDACTED]';
        }
      }
    }
    if (event.request.data) {
      event.request.data = redactSensitiveData(event.request.data);
    }
  }

  // 2. Redact contexts, tags, and extra metadata
  if (event.extra) {
    event.extra = redactSensitiveData(event.extra);
  }
  if (event.tags) {
    event.tags = redactSensitiveData(event.tags);
  }
  if (event.contexts) {
    event.contexts = redactSensitiveData(event.contexts);
  }

  // 3. Redact breadcrumbs
  if (event.breadcrumbs) {
    for (const breadcrumb of event.breadcrumbs) {
      if (breadcrumb.data) {
        breadcrumb.data = redactSensitiveData(breadcrumb.data);
      }
      if (breadcrumb.message) {
        breadcrumb.message = redactString(breadcrumb.message);
      }
    }
  }

  // 4. Redact message & exceptions
  if (event.message) {
    event.message = redactString(event.message);
  }
  if (event.exception && event.exception.values) {
    for (const val of event.exception.values) {
      if (val.value) {
        val.value = redactString(val.value);
      }
    }
  }

  return event;
}
