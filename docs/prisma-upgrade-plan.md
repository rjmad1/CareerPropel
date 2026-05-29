# Deferred Prisma Upgrade Plan

This document outlines the step-by-step procedure and rollback strategy for upgrading Prisma from version `5.22.0` to `7.8.0`. This upgrade should be executed in a dedicated, isolated pull request after resolving the current migration emergency.

Please refer to the [Production Deployment](#production-deployment) checklist before executing the rollout.

## Steps to Execute the Upgrade

1. **Create dedicated branch/PR**:
   Create a new branch from `main` named `chore/upgrade-prisma-7.8.0`.

2. **Update dependencies**:
   Run the following commands to bump Prisma to the latest stable major version. It is recommended to use `--save-exact` (or pin exact versions in `package.json`) to avoid accidental minor/patch upgrades in CI/automation environments:

   ```bash
   npm i --save-exact --save-dev prisma@7.8.0
   npm i --save-exact @prisma/client@7.8.0
   npm install
   ```

3. **Prisma Generate & Type Checking**:
   To avoid v5/v7 artifact conflicts, first clean the Prisma client cache by deleting the generated client directories:

   ```bash
   rm -rf node_modules/.prisma .prisma/client
   ```

   (Alternatively, delete whichever client cache folder exists on your system). Then, regenerate the client and check for any breaking changes in generated types or code symbols:

   ```bash
   npx prisma generate
   npm run build
   ```

4. **Verify Schema Compliance**:
   Ensure `schema.prisma` conforms to Prisma v7 guidelines by consulting the [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7).
   Run the schema validation command:

   ```bash
   npx prisma validate
   ```

   Checklist of common breaking changes / deprecations to scan for in `schema.prisma`:
   - **Removed preview flags**: Remove deprecated flags from `generator client` block (e.g., `referentialIntegrity`, `interactiveTransactions`).
   - **Renamed generators**: Ensure custom generator names comply with v7 format.
   - **Relation/Mapping syntax**: Verify `@relation` annotations match updated syntax rules (e.g., relation names, referential actions).
   - **Enum handling**: Ensure native database enums are correctly typed and mapped.

5. **Test Validation against Staging Database**:
   Verify the upgrade against a snapshot/copy of the production database in a staging environment. (Refer to the [Pre-Upgrade Database Backup & Staging Validation](#pre-upgrade-database-backup--staging-validation) checklist for full staging environment alignment).
   First, run the compatibility verification command to ensure Prisma v7 is fully compatible with the existing migration history:

   ```bash
   npx prisma migrate status
   ```

   Ensure Prisma v7 can read the files in `prisma/migrations/` and recognize the `_prisma_migrations` table schema. Only proceed to reset/deploy if status reports compatibility. (If not, update migration files or the table schema to v7 format first).

   Once compatibility is verified, proceed with:

   ```bash
   npx prisma migrate reset --force
   npx prisma migrate deploy
   ```

6. **Run Full Test Suite**:
   Execute all automated unit, integration, and E2E tests to verify functionality.
   Note that `npm run test` runs only Jest unit/integration tests (located in `src/__tests__/`) and does not cover E2E tests.
   Operators must also run the E2E command to execute the end-to-end tests in `cypress/e2e/`:

   ```bash
   npm run test
   npm run test:e2e
   ```

## Production Deployment

This section details the operational requirements and gating steps for a safe production rollout.

### 1. Timeline & Gating Steps
- **Gate 1**: 100% pass rate in staging validation (running migrations against staging copy).
- **Gate 2**: Successful completion of full Jest + E2E test suites on the upgrade branch.
- **Gate 3**: Stakeholder approval & scheduling inside the designated maintenance window (low traffic hours, e.g., Sunday 02:00 UTC).
- **Deployment Window**: Expected duration is 30 minutes.

### 2. Pre-Upgrade Database Backup & Staging Validation
Before executing the upgrade on the production database, perform a full backup and verify the backup integrity:
- **Backup Command**:
  ```bash
  # Execute backup using pg_dump (or AWS RDS Snapshot)
  pg_dump -H $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f pre_upgrade_backup.dump
  ```
- **Verification**: Restore the dump file to a temporary isolated local/staging instance to ensure the backup is valid and uncorrupted before proceeding.

### 3. Monitoring & Alerting Requirements
Once the production deployment is complete, monitor system health using the following metrics:
- **Error Rates**: Watch the Sentry dashboard for database connection or query errors.
- **Latency**: Check the observability panel (`src/lib/observability/metrics.ts`) for query latency spikes.
- **Alert Trigger**: Set up Slack/email alerts to trigger if query error rate exceeds 1% within any 5-minute window post-upgrade.

### 4. Stakeholder Communication Plan
- **Pre-Notification**: Notify users and team members at least 24 hours prior to the maintenance window.
- **Status Updates**: Publish a status page update when maintenance begins, when migrations are running, and when the system is fully operational.
- **Escalation Path**:
  - Technical Lead: [tech-lead@careerpropel.dev]
  - Database Administrator: [dba@careerpropel.dev]

## Rollback Plan

If any critical runtime issues or type mismatch regressions are identified during testing, production staging, or live rollout:

### Rollback Decision Criteria / Triggers
- Catastrophic database migration failures during deployment.
- High database connection error rate (>5%) or app crash loops on launch.
- Severe performance regressions or data access errors reported post-upgrade.

### Step-by-Step Rollback Procedure

1. **Revert changes**:
   Rollback package dependencies back to `5.22.0`:

   ```bash
   npm i --save-exact --save-dev prisma@5.22.0
   npm i --save-exact @prisma/client@5.22.0
   npm install
   ```

2. **Re-generate Client**:
   Clean the build cache and generate the v5 client:

   ```bash
   rm -rf node_modules/.prisma .prisma/client
   npx prisma generate
   ```

3. **Verify Build & Run Critical Tests**:
   Verify everything compiles cleanly on the previous version and run critical tests:

   ```bash
   npm run build
   npm run test -- --bail
   ```

   *Note: If the full test suite is too slow, operators may run only a targeted/designated smoke test suite to verify critical paths, but verification must pass before declaring the rollback complete.*
