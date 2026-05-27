export interface TraceSpan {
  addEvent(name: string, attributes?: Record<string, unknown>): void;
  end(attributes?: Record<string, unknown>): void;
}

class NoopTraceSpan implements TraceSpan {
  addEvent(_name: string, _attributes?: Record<string, unknown>) {}
  end(_attributes?: Record<string, unknown>) {}
}

export function startTraceSpan(
  _name: string,
  _attributes?: Record<string, unknown>
): TraceSpan {
  return new NoopTraceSpan();
}
