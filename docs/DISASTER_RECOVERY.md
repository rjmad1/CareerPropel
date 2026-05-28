# Disaster Recovery & System Restoration Manual

This manual governs the backup, restore, and business-continuity policies for CareerPropel platform databases, cache clusters, and message queues.

---

## 1. PostgreSQL Backup & Point-in-Time Recovery (PITR)

PostgreSQL holds the source of truth for user profiles, transaction logs, and immutable event ledgers. 

### A. Continuous Backup Architecture
* **WAL Archiving:** Write-Ahead Logs (WAL) are streamed continuously to a secure, write-once cold storage bucket (e.g., AWS S3 with Object Lock or GCP Cloud Storage with retention policies) via pgBackRest.
* **Daily Base Backups:** Full database snapshots are taken every 24 hours at 01:00 UTC during low-traffic periods.

### B. Restore Validation (PITR Recovery)
In the event of database corruption or catastrophic failure:
1. Provision a blank PostgreSQL instance.
2. Restore the latest daily base backup:
   ```bash
   pgbackrest --stanza=career-propel restore
   ```
3. Replay WAL files up to the target timestamp (e.g., just before a corruption event):
   ```ini
   # recovery.signal file configuration
   restore_command = 'pgbackrest --stanza=career-propel archive-get %f "%p"'
   recovery_target_time = '2026-05-29 04:00:00 UTC'
   ```
4. Start the database server and confirm that all indices, transactions, and state sequences are recovered without data loss.

---

## 2. Redis Cache & Queue Rebuild Strategy

Redis acts as our ephemeral state cache, worker heartbeat registrar, and BullMQ queue broker. If the Redis instance is completely destroyed:

### A. Automatic Queue Rebuild
1. Provision a new, empty Redis instance.
2. Restart the Scheduler and Worker runtimes.
3. The Scheduler will detect that active/queued DB executions do not exist in Redis and will automatically trigger the reconciliation loop (`reconcileOrphanExecutions`).
4. Stranded jobs are safely failed or re-enqueued, and worker heartbeats are automatically re-registered as processes check in.

### B. Replay Recovery
1. If Redis goes down during a job execution, some real-time events may be lost.
2. Because the `ExecutionEventLedger` is persisted durably in PostgreSQL, an operator can reconstruct the execution state simply by executing an Event Replay action:
   ```bash
   # Reconstruct active state by reading Postgres ledger and pushing back to queue
   npx tsx scripts/ops/reconstruct-replay.ts --execution-id <id>
   ```

---

## 3. Event Ledger Corruption Recovery

The `ExecutionEventLedger` is secured with a SHA-256 cryptographic chain. If an event is maliciously modified or corrupted:

```
[Event N-1] (ChainHash: A) <--- [Event N] (CalculatedHash: B != _chainHash) ---> TAMPER DETECTED
```

### A. Corruption Detection
Run the self-diagnostic integrity sweep to locate the exact corrupted index:
```typescript
import { verifyLedgerIntegrity } from '@/lib/runtime/ledger';

const audit = await verifyLedgerIntegrity(executionId);
if (!audit.valid) {
  console.error('Tampering detected:', audit.errors);
}
```

### B. Ledger Reconstruction Strategy
1. **Quarantine:** Immediately suspend active replays for the corrupted execution.
2. **Re-verify Checksums:** Identify which specific fields in the payload mismatch their original checksum.
3. **Reconstruct:** Re-read preceding verified states up to the point of corruption, and rebuild the chain by writing a new correction event in the ledger, recalculating correct chain hashes from the correction node forward.
