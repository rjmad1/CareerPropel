import { createLogger } from '@/lib/logging/logger';

const versionLogger = createLogger({ component: 'contract-versioning' });

// Canonical supported contract versions
export const SUPPORTED_VERSIONS = {
  QUEUE_CONTRACT: '1.0.0',
  EVENT_CONTRACT: '1.0.0',
  SSE_CONTRACT: '1.0.0',
} as const;

export interface ContractCompatibilityReport {
  compatible: boolean;
  checks: {
    queuePayload: boolean;
    eventSchema: boolean;
    sseProtocol: boolean;
  };
  errors: string[];
}

/**
 * Checks if the runtime contract matches the expected version.
 * Supports exact matching for minor versions, and semver major checks.
 */
export function checkVersionCompatibility(version: string, expected: string): boolean {
  if (version === expected) return true;
  
  // Basic semver major check
  const [major] = version.split('.');
  const [expectedMajor] = expected.split('.');
  return major === expectedMajor;
}

/**
 * Enforces rolling upgrade compatibility checks.
 */
export function isVersionCompatibleWithDeployed(localVersion: string, deployedVersion: string): boolean {
  if (deployedVersion === 'unknown') return true;
  
  const [localMajor] = localVersion.split('.');
  const [deployedMajor] = deployedVersion.split('.');
  
  // Reject rolling upgrades if major versions do not align (breaking changes)
  return localMajor === deployedMajor;
}

/**
 * Validates queue payload, event schema, and SSE contract versions.
 * Throws an error on boot if incompatibility is detected.
 */
export async function enforceContractCompatibility(meta: {
  queueVersion?: string;
  eventVersion?: string;
  sseVersion?: string;
}): Promise<ContractCompatibilityReport> {
  const report: ContractCompatibilityReport = {
    compatible: false,
    checks: {
      queuePayload: false,
      eventSchema: false,
      sseProtocol: false,
    },
    errors: [],
  };

  const queueVer = meta.queueVersion || SUPPORTED_VERSIONS.QUEUE_CONTRACT;
  const eventVer = meta.eventVersion || SUPPORTED_VERSIONS.EVENT_CONTRACT;
  const sseVer = meta.sseVersion || SUPPORTED_VERSIONS.SSE_CONTRACT;

  // 1. Queue Contract Versioning
  if (checkVersionCompatibility(queueVer, SUPPORTED_VERSIONS.QUEUE_CONTRACT)) {
    report.checks.queuePayload = true;
  } else {
    report.errors.push(`[INCOMPATIBLE_QUEUE_CONTRACT] Expected v${SUPPORTED_VERSIONS.QUEUE_CONTRACT}, got v${queueVer}`);
  }

  // 2. Event Contract Versioning
  if (checkVersionCompatibility(eventVer, SUPPORTED_VERSIONS.EVENT_CONTRACT)) {
    report.checks.eventSchema = true;
  } else {
    report.errors.push(`[INCOMPATIBLE_EVENT_CONTRACT] Expected v${SUPPORTED_VERSIONS.EVENT_CONTRACT}, got v${eventVer}`);
  }

  // 3. SSE Protocol Versioning
  if (checkVersionCompatibility(sseVer, SUPPORTED_VERSIONS.SSE_CONTRACT)) {
    report.checks.sseProtocol = true;
  } else {
    report.errors.push(`[INCOMPATIBLE_SSE_CONTRACT] Expected v${SUPPORTED_VERSIONS.SSE_CONTRACT}, got v${sseVer}`);
  }

  report.compatible = Object.values(report.checks).every(Boolean);

  if (!report.compatible) {
    versionLogger.error({ report }, '❌ Incompatible contract version bounds detected!');
    throw new Error(`Incompatible contract versions: ${report.errors.join('; ')}`);
  }

  versionLogger.info('✅ All event, queue, and SSE contracts verified compatible.');
  return report;
}
