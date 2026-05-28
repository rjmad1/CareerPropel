import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import { executionJobDataSchema } from '@/contracts/queue/jobs';

const compLogger = createLogger({ component: 'compatibility-verifier' });

export interface CompatibilityReport {
  compatible: boolean;
  checks: {
    databaseSchema: boolean;
    nodeRuntime: boolean;
    queuePayloadContract: boolean;
  };
  errors: string[];
}

/**
 * Validates schema, runtime version, and serialization contract compatibility on boot.
 */
export async function verifyRuntimeCompatibility(): Promise<CompatibilityReport> {
  const report: CompatibilityReport = {
    compatible: false,
    checks: {
      databaseSchema: false,
      nodeRuntime: false,
      queuePayloadContract: false,
    },
    errors: [],
  };

  compLogger.info('Verifying distributed runtime compatibility boundaries...');

  // 1. Validate Database Schema (Assert ExecutionEventLedger is present and queryable)
  try {
    await prisma.executionEventLedger.findFirst({
      take: 1,
    });
    report.checks.databaseSchema = true;
  } catch (err: any) {
    report.errors.push(`[SCHEMA_INCOMPATIBILITY] ExecutionEventLedger table is missing or corrupted: ${err.message}`);
  }

  // 2. Validate Node Runtime Version (Require >= v18.0.0 for stable thread isolation and ESM)
  try {
    const majorVersion = parseInt(process.versions.node.split('.')[0], 10);
    if (majorVersion < 18) {
      throw new Error(`Node.js version is ${process.version}. Platform requires v18+ for operational stability.`);
    }
    report.checks.nodeRuntime = true;
  } catch (err: any) {
    report.errors.push(`[RUNTIME_INCOMPATIBILITY] ${err.message}`);
  }

  // 3. Validate Queue Payload Contract serialisation validation
  try {
    const testData = {
      executionId: 'test-compat-id',
      userId: 'test-user',
      agentType: 'job-match',
      promptContext: { test: 'value' },
      requestId: 'test-req-id',
      correlationId: 'test-corr-id',
      submittedAt: new Date().toISOString(),
    };
    
    // Parse test payload through contracts schema
    executionJobDataSchema.parse(testData);
    report.checks.queuePayloadContract = true;
  } catch (err: any) {
    report.errors.push(`[CONTRACT_INCOMPATIBILITY] Queue payload schema validation failed: ${err.message}`);
  }

  report.compatible = Object.values(report.checks).every((c) => c === true);

  if (report.compatible) {
    compLogger.info('✅ Runtime compatibility verified. System is aligned.');
  } else {
    compLogger.error({ errors: report.errors }, '❌ Distributed runtime incompatibility detected! Startup aborted.');
  }

  return report;
}
