#!/bin/bash
set -e

# Resolve any previously failed migrations before deploying.
# These are no-ops if migrations are already applied; errors are logged but do NOT abort the build
# because the migration may simply not exist in this environment.
echo "Resolving previously failed migrations (non-fatal)..."
npx prisma migrate resolve --rolled-back 20260523000000_add_jobid_mock_session_unique_fk && echo "OK: 20260523000000 resolved" || echo "WARN: 20260523000000 resolve had non-zero exit (may already be applied or not exist)"
npx prisma migrate resolve --rolled-back 20260524000000_runtime_modernization && echo "OK: 20260524000000 resolved" || echo "WARN: 20260524000000 resolve had non-zero exit (may already be applied or not exist)"
npx prisma migrate resolve --rolled-back 20260528000000_rbac_governance && echo "OK: 20260528000000 resolved" || echo "WARN: 20260528000000 resolve had non-zero exit (may already be applied or not exist)"

npx prisma migrate deploy
npx prisma generate
next build
