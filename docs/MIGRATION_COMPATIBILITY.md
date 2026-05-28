# Schema Migration Compatibility Framework

This document outlines the testing protocols and deployment gates to ensure zero-downtime database migrations on the CareerPropel platform.

---

## 1. Zero-Downtime Migration Philosophy

CareerPropel requires zero-downtime deployments. This means database schema migrations must never introduce breaking changes that block in-flight applications. 

We enforce a strict **Expand and Contract** pattern:

```
Step 1: Expand (Add new columns/tables) ---> Step 2: Deploy new code ---> Step 3: Contract (Remove old columns)
```

At any point during a rolling upgrade, two versions of the application run simultaneously:
* **Version N (Old Workers):** Must remain compatible with the newly expanded schema.
* **Version N+1 (New Workers):** Must remain compatible with the old schema in case of immediate rollbacks.

---

## 2. Compatibility Test Grid

Our CI pipeline qualifies migrations by executing tests against four distinct environments:

| Test Case | Schema Version | Application Code Version | Compatibility Goal |
| :--- | :--- | :--- | :--- |
| **A. Forward Compatibility** | Version N+1 (New Schema) | Version N (Old Workers) | **PASSED:** Old worker continues executing jobs safely; ignores new database columns. |
| **B. Upgrade Cutover** | Version N+1 (New Schema) | Version N+1 (New Workers) | **PASSED:** New workers leverage new schema and write updated contracts successfully. |
| **C. Rollback Integrity** | Version N (Old Schema) | Version N+1 (New Workers) | **PASSED:** New worker can boot and read older columns gracefully if schema change is rolled back. |
| **D. Replay Continuity** | Version N+1 (New Schema) | Version N (Old Replays) | **PASSED:** Historical event ledger payloads (Version N) can be replayed inside the new schema (N+1). |

---

## 3. Migration Qualification Gates

Every database migration file (located in `prisma/migrations/`) must pass the following manual and automated checks in CI before merging:

1. **No Destructive Operations:** Direct column drops, column renames, or NOT NULL constraints without default values are blocked.
2. **Payload Contract Validation:** All database migrations must preserve the serialization integrity of the `ExecutionJobData` schema:
   ```typescript
   import { executionJobDataSchema } from '@/contracts/queue/jobs';
   // Ensure payload parser succeeds under new schema properties
   executionJobDataSchema.parse(payload);
   ```
3. **Rollback Verification Loop:**
   * Step 1: Run target database migration:
     ```bash
     npx prisma migrate dev
     ```
   * Step 2: Boot old worker version, enqueue 10 standard execution jobs, and verify successful completion.
   * Step 3: Roll back the migration:
     ```bash
     npx prisma migrate resolve --rolled-back <migration_id>
     ```
   * Step 4: Confirm that database returns to the original state without orphaned indices or constraints.
