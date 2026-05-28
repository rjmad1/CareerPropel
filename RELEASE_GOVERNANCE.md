# CareerPropel — Release Governance

This document establishes operational release governance for CareerPropel. It keeps release cycles lightweight and deterministic, avoiding enterprise SDLC bureaucracy.

---

## 1. Stabilization Branch Expectations

- **Branching Model**: Stabilization passes are conducted in dedicated release/stabilization branches (e.g., `release/vX.Y.Z-stabilization` or `merge-antigravity-recovery`).
- **Commits**: Direct commits are allowed during stabilization passes, provided they align strictly with active, approved cleanup or bug fixes. Feature development is frozen.

---

## 2. Validation Suite Requirements

Before promoting a release candidate (RC) to staging or production, the following suite must pass locally:

1. **Type Safety**: Run `npm run type-check` to verify no compilation errors.
2. **Linting Rules**: Run `npm run lint` to assert compliance with coding standards.
3. **Governance Checks**: Run `npm run governance-check` to enforce canonical architecture rules.
4. **Circular Dependency Scan**: Run `npx madge --circular --extensions ts,tsx src` to guarantee no dependency cycles are introduced.

---

## 3. Smoke Testing & Verification

- Execute the automated smoke test suite:
  ```bash
  npm run test:smoke
  ```
- **Manual Checklist**:
  - Verify worker heartbeat keys are successfully updated in Redis (e.g., run `GET heartbeat:execution-worker` via redis-cli).
  - Verify reconnect throttling by forcing a temporary disconnect and checking that warning logs are limited to 1 per minute per client connection.
  - Verify Next.js routes compile successfully (via `npm run build`).

---

## 4. Rollback Strategies

- If a release candidate exhibits degraded performance or unexpected exceptions in staging or production:
  - **Immediate Rollback**: Revert deployment to the previous stable git commit tag.
  - **Hotfix Process**: Hotfix directly on the stabilization branch, run validation, and redeploy.
