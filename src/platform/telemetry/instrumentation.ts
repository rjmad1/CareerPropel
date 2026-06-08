import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import * as otelResources from '@opentelemetry/resources';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { PrismaInstrumentation } from '@prisma/instrumentation';

let sdk: NodeSDK | null = null;

export function initTelemetry() {
  if (typeof window !== 'undefined') return;
  if (sdk) return;

  const serviceName = process.env.OTEL_SERVICE_NAME || 'career-propel';
  const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
  
  // Choose exporter based on env configuration
  // Fall back to ConsoleSpanExporter in development mode to avoid background OTLP errors
  const traceExporter = 
    process.env.OTEL_EXPORTER === 'console' || (process.env.NODE_ENV === 'development' && !process.env.OTEL_EXPORTER_OTLP_ENDPOINT)
      ? new ConsoleSpanExporter()
      : new OTLPTraceExporter({ url: otelEndpoint });

  sdk = new NodeSDK({
    resource: otelResources.defaultResource().merge(
      otelResources.resourceFromAttributes({
        'service.name': serviceName,
        'service.version': '1.0.0',
      })
    ),
    traceExporter,
    instrumentations: [
      new HttpInstrumentation(),
      new IORedisInstrumentation(),
      new PrismaInstrumentation(),
    ],
  });

  try {
    sdk.start();
    console.log(`[Telemetry] OpenTelemetry initialized successfully for service "${serviceName}" using ${traceExporter.constructor.name}`);
  } catch (error) {
    console.error('[Telemetry] Error initializing OpenTelemetry:', error);
  }
}
