# Production Operations Manual

This operations manual governs the management, administration, and troubleshooting of the CareerPropel platform in high-availability environments.

---

## 1. System Administration & Console Access

All administrative tasks are governed by strict Role-Based Access Control (RBAC). 

### Admin Endpoints:
* **Metrics Dashboard:** `/api/ops/metrics` (requires `PLATFORM_ADMIN` or `SUPER_ADMIN`).
* **Provider Configuration:** `/api/ops/providers` (requires `PLATFORM_ADMIN` or `SUPER_ADMIN` for changes).
* **Cost Analytics:** `/api/ops/cost` (requires `PLATFORM_ADMIN` or `SUPER_ADMIN`).

---

## 2. Replay Audit Trail Governance

All event replay actions must be performed by authorized operators (`PLATFORM_ADMIN` or `SUPER_ADMIN`) and are durably audited.

### Replaying failed jobs via CLI:
```bash
# Replay standard execution job
npx tsx scripts/ops/replay-job.ts --execution-id <id> --operator admin@careerpropel.co --reason "Recovering from temporary Anthropic timeout"
```

Each execution replay records:
* **Operator:** `admin@careerpropel.co`
* **Reason:** "Recovering from temporary Anthropic timeout"
* **Duplicate Suppression Status:** Checked and logged to prevent double-charging candidates.
* **Integrity Chain Check:** Executed to confirm event ledger has not been tampered with.

---

## 3. Incident Management & Troubleshooting

### A. Critical Alert: "Dead-Letter Queue depth elevated"
* **Diagnosis:** Check `prisma.auditLog` or DLQ metrics `/api/ops/metrics`. High failure rate typically indicates an LLM provider outage or schema drift.
* **Resolution:**
  1. Inspect the last failed job reason in the DB:
     ```sql
     SELECT "errorMessage" FROM "AgentExecution" WHERE status = 'failed' ORDER BY "updatedAt" DESC LIMIT 5;
     ```
  2. If the failure is due to an upstream outage, trigger dynamic load-shedding by setting the provider status to warning.
  3. Once the provider recovers, trigger manual replay:
     ```bash
     npx tsx scripts/ops/replay-dlq.ts --all
     ```

### B. Critical Alert: "Tampering detected in Event Ledger"
* **Diagnosis:** Diagnostic sweep logs checksum mismatch on a candidate's execution ledger.
* **Resolution:**
  1. Run the verification script:
     ```bash
     npx tsx scripts/ops/verify-ledger.ts --execution-id <id>
     ```
  2. Locate the tampered event and extract the payload. Compare with cold-storage transaction logs.
  3. Re-verify integrity and construct a correction node if needed.
