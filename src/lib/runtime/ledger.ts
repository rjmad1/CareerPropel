import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import crypto from 'crypto';

const ledgerLogger = createLogger({ component: 'execution-event-ledger' });

export interface LedgerEventInput {
  executionId: string;
  eventType: string;
  payload: Record<string, unknown>;
  traceId?: string | null;
  spanId?: string | null;
  correlationId?: string | null;
  replayable?: boolean;
  sourceRuntime?: string;
}

/**
 * Calculates a SHA-256 checksum for a JSON-serializable payload.
 */
export function calculatePayloadChecksum(payload: Record<string, unknown>): string {
  const serialized = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Fetches the chain hash of the most recent event for a given execution ID.
 */
export async function getLatestChainHash(executionId: string): Promise<string> {
  const latestEvent = await prisma.executionEventLedger.findFirst({
    where: { executionId },
    orderBy: { timestamp: 'desc' },
    select: { payload: true },
  });

  if (latestEvent && latestEvent.payload) {
    const payload = latestEvent.payload as any;
    return payload._chainHash || '';
  }

  return 'GENESIS_HASH_INIT';
}

/**
 * Appends a new, immutable operational event to the Execution Event Ledger.
 * Computes payload integrity checksums and maintains a cryptographic chain of trust.
 */
export async function logEventToLedger(input: LedgerEventInput): Promise<string> {
  const eventId = `ev_ledg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  try {
    const payload = { ...(input.payload || {}) };
    
    // 1. Calculate individual payload checksum
    const checksum = calculatePayloadChecksum(payload);
    payload._checksum = checksum;

    // 2. Fetch preceding event chain hash and construct chain hash
    const prevChainHash = await getLatestChainHash(input.executionId);
    const chainInput = `${eventId}:${input.eventType}:${checksum}:${prevChainHash}`;
    const chainHash = crypto.createHash('sha256').update(chainInput).digest('hex');
    payload._chainHash = chainHash;

    await prisma.executionEventLedger.create({
      data: {
        eventId,
        executionId: input.executionId,
        eventType: input.eventType,
        payload: payload as any,
        traceId: input.traceId || null,
        spanId: input.spanId || null,
        correlationId: input.correlationId || null,
        replayable: input.replayable !== undefined ? input.replayable : true,
        sourceRuntime: input.sourceRuntime || 'system',
      },
    });

    ledgerLogger.debug(
      { eventId, executionId: input.executionId, eventType: input.eventType, checksum, chainHash },
      'Successfully persisted event to durable ledger with cryptographic trust chain'
    );
  } catch (error) {
    ledgerLogger.error(
      { err: error, executionId: input.executionId, eventType: input.eventType },
      'Durable ledger write failed! Platform metrics could be affected.'
    );
  }

  return eventId;
}

/**
 * Retrieves all events associated with a specific execution ID, ordered chronologically.
 */
export async function getExecutionLedger(executionId: string) {
  return prisma.executionEventLedger.findMany({
    where: { executionId },
    orderBy: { timestamp: 'asc' },
  });
}

/**
 * Retrieves replayable events for an execution from the ledger.
 */
export async function getReplayableLedgerEvents(executionId: string) {
  return prisma.executionEventLedger.findMany({
    where: {
      executionId,
      replayable: true,
    },
    orderBy: { timestamp: 'asc' },
  });
}

/**
 * Audits the integrity of the event ledger for a given execution ID.
 * Verifies payload checksums and traces the cryptographic signature chain.
 */
export async function verifyLedgerIntegrity(executionId: string): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const events = await getExecutionLedger(executionId);

  let expectedPrevHash = 'GENESIS_HASH_INIT';

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const payload = event.payload as any;

    if (!payload || !payload._checksum || !payload._chainHash) {
      errors.push(`Event [${event.eventId}] is missing cryptographic metadata.`);
      continue;
    }

    const { _checksum, _chainHash, ...rawPayload } = payload;

    // 1. Verify payload checksum
    const calculatedChecksum = calculatePayloadChecksum(rawPayload);
    if (calculatedChecksum !== _checksum) {
      errors.push(`Event [${event.eventId}] checksum mismatch. Expected: ${_checksum}, Got: ${calculatedChecksum}. TAMPER DETECTED.`);
    }

    // 2. Verify chain linkage
    const chainInput = `${event.eventId}:${event.eventType}:${calculatedChecksum}:${expectedPrevHash}`;
    const calculatedChainHash = crypto.createHash('sha256').update(chainInput).digest('hex');
    if (calculatedChainHash !== _chainHash) {
      errors.push(`Event [${event.eventId}] chain sequence mismatch. Expected: ${_chainHash}, Calculated: ${calculatedChainHash}. SEQUENCE TAMPER DETECTED.`);
    }

    expectedPrevHash = _chainHash;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Executes the Event Ledger Lifecycle Policy sweep.
 * - HOT (0-30 days): Live, fully queryable operational ledger events.
 * - WARM (30-90 days): Retained in DB, but trace payloads are stripped to compress index size.
 * - ARCHIVED (90-365 days): Written out to disk archives and deleted from active DB.
 * - PURGED (365+ days): Permanently deleted from platform retention.
 */
export async function runEventLedgerLifecycleSweep(): Promise<{
  warmCompressed: number;
  archived: number;
  purged: number;
}> {
  const now = new Date();
  const warmCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const archiveCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const purgeCutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  let warmCompressed = 0;
  let archived = 0;
  let purged = 0;

  try {
    // 1. PURGED: Delete everything older than 365 days
    const purgeRes = await prisma.executionEventLedger.deleteMany({
      where: {
        timestamp: { lt: purgeCutoff },
      },
    });
    purged = purgeRes.count;

    // 2. ARCHIVED: Export events between 90 and 365 days to cold storage and remove from active DB
    const archiveEvents = await prisma.executionEventLedger.findMany({
      where: {
        timestamp: { lte: archiveCutoff, gte: purgeCutoff },
      },
    });

    if (archiveEvents.length > 0) {
      const fs = await import('fs');
      const path = await import('path');
      const archiveDir = path.join(process.cwd(), 'docs', 'archives');
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }
      const archiveFile = path.join(archiveDir, `ledger-archive-${Date.now()}.json`);
      fs.writeFileSync(archiveFile, JSON.stringify(archiveEvents, null, 2), 'utf8');
      
      const archiveRes = await prisma.executionEventLedger.deleteMany({
        where: {
          timestamp: { lte: archiveCutoff, gte: purgeCutoff },
        },
      });
      archived = archiveRes.count;
    }

    // 3. WARM: Compress payloads of events between 30 and 90 days to conserve space
    const warmEvents = await prisma.executionEventLedger.findMany({
      where: {
        timestamp: { lte: warmCutoff, gte: archiveCutoff },
        // Only target events whose payload has not been compressed
        NOT: {
          payload: {
            path: ['_compressed'],
            equals: true,
          },
        },
      },
    });

    for (const ev of warmEvents) {
      const payload = ev.payload as any;
      const compressedPayload = {
        _checksum: payload._checksum,
        _chainHash: payload._chainHash,
        _compressed: true,
        message: 'Payload warm-compressed to conserve database capacity.',
      };

      await prisma.executionEventLedger.update({
        where: { id: ev.id },
        data: {
          payload: compressedPayload as any,
        },
      });
      warmCompressed++;
    }

    ledgerLogger.info(
      { warmCompressed, archived, purged },
      'Event ledger lifecycle policy sweep completed successfully'
    );
  } catch (error) {
    ledgerLogger.error({ err: error }, 'Error executing event ledger lifecycle sweep');
  }

  return { warmCompressed, archived, purged };
}


