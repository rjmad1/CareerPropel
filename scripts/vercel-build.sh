#!/bin/bash
set -e

# Execute self-healing migration repair to clean up any failed or rolled-back stabilization records
echo "Executing self-healing database migration repairs..."
npx prisma db execute --file prisma/migration_repair.sql --schema prisma/schema.prisma || echo "WARN: migration repair query failed (non-fatal)"

# Resolve any previously failed migrations before deploying.
# These are no-ops if migrations are already applied; errors are logged but do NOT abort the build
# because the migration may simply not exist in this environment.
echo "Resolving previously failed migrations (non-fatal)..."
npx prisma migrate resolve --rolled-back 20260523000000_add_jobid_mock_session_unique_fk && echo "OK: 20260523000000 resolved" || echo "WARN: 20260523000000 resolve had non-zero exit (may already be applied or not exist)"
npx prisma migrate resolve --rolled-back 20260524000000_runtime_modernization && echo "OK: 20260524000000 resolved" || echo "WARN: 20260524000000 resolve had non-zero exit (may already be applied or not exist)"
npx prisma migrate resolve --applied 20260528000000_rbac_governance && echo "OK: 20260528000000 resolved" || echo "WARN: 20260528000000 resolve had non-zero exit (may already be applied or not exist)"
npx prisma migrate resolve --rolled-back 20260529000000_stabilization_and_orchestration && echo "OK: 20260529000000 resolved" || echo "WARN: 20260529000000 resolve had non-zero exit (may already be applied or not exist)"


if npx prisma migrate deploy; then
  echo "✅ Prisma migrations deployed successfully."
else
  echo "⚠️ Prisma migrate deploy failed. Checking for physical schema drift..."
  # Run diff check. In git bash/cmd, we can search for the "No difference detected" line.
  # Output might contain this exact phrase. Let's capture the diff output.
  DIFF_OUT=$(npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma 2>&1 || true)
  if echo "$DIFF_OUT" | grep -q "No difference detected"; then
    echo "✅ No database schema drift detected. Proceeding safely (database was likely synced via db push)."
  else
    echo "❌ Database schema drift detected! Aborting build."
    echo "$DIFF_OUT"
    exit 1
  fi
fi

npx prisma generate
next build
