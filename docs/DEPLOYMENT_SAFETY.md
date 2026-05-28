# Deployment Safety & Release Engineering Manual

This manual details the procedures, checks, and scripts to ensure zero-downtime, safe deployments and rolling upgrades on the CareerPropel platform.

---

## 1. Zero-Downtime Worker Drains

To deploy a new worker version without interrupting in-flight job executions:

1. **Enable Worker Drain Mode:** Publish the drain signal via Redis to signal the active workers to stop picking up new jobs.
   ```bash
   npx tsx scripts/ops/set-deployment.ts --drain-mode true
   ```
2. **In-Flight Completion:** Active workers will finish their currently processing executions (lock duration is protected up to 15 minutes).
3. **Queue Pause:** Pause all queue brokers globally:
   ```bash
   npx tsx scripts/ops/set-deployment.ts --queue-pause true
   ```
4. **Boot New Workers:** Spin up the new Version (N+1) containers.
5. **Promote Active Version:** Update the target active version key in Redis:
   ```bash
   npx tsx scripts/ops/set-deployment.ts --active-version "2.0.0"
   ```
6. **Resume Queues:** Re-enable all queues and disable drain mode on the new version.

---

## 2. Version Coordination

Startup gates prevent incompatible code from running. On early-boot:
* Web and worker instances execute `enforceStartupGates()`.
* The system validates database schema matching, Node.js runtime boundaries, and serialize formats.
* If a new queue contract (e.g. `v2.0.0`) is pushed but the active worker is still running `v1.0.0`, startup is immediately aborted, preventing corrupt enqueues.

---

## 3. Rollback Playbook

If a new deployment experiences a high error rate or fails the readiness probe:
1. **Trigger Rollback:** Restore the active deployment version reference to the previous stable release:
   ```bash
   npx tsx scripts/ops/rollback-deployment.ts --previous-version "1.9.0"
   ```
2. **De-escalation:** The system automatically demotes the new workers and redirects all active enqueues to the older, stable Version (N) workers.
3. **Verify:** Confirm that queue throughput returns to healthy baselines via the `/api/ops/metrics` API.
