-- RBAC Governance: new enums, extended models, and three new tables
-- All statements are idempotent (IF NOT EXISTS / DO $$ ... END)

-- ─── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "RoleType" AS ENUM (
    'SUPER_ADMIN', 'PLATFORM_ADMIN', 'SECURITY_ADMIN', 'SUPPORT_ADMIN', 'JOB_SEEKER', 'CUSTOM'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CapabilityEffect" AS ENUM ('allow', 'deny');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RolloutStrategy" AS ENUM ('all', 'percentage', 'allowlist', 'role_scoped', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Extend Role ──────────────────────────────────────────────────────────────

ALTER TABLE "Role"
  ADD COLUMN IF NOT EXISTS "roleType"            "RoleType" NOT NULL DEFAULT 'CUSTOM',
  ADD COLUMN IF NOT EXISTS "immutableSystemRole" BOOLEAN    NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "priority"            INTEGER    NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "environmentScope"    TEXT,
  ADD COLUMN IF NOT EXISTS "metadata"            JSONB;

-- ─── Extend Permission ────────────────────────────────────────────────────────

ALTER TABLE "Permission"
  ADD COLUMN IF NOT EXISTS "systemProtected" BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "Permission_resource_idx"        ON "Permission"("resource");
CREATE INDEX IF NOT EXISTS "Permission_systemProtected_idx" ON "Permission"("systemProtected");

CREATE UNIQUE INDEX IF NOT EXISTS "Permission_resource_action_key" ON "Permission"("resource", "action");

DO $$ BEGIN
  ALTER TABLE "Permission"
    ADD CONSTRAINT "Permission_resource_action_key"
    UNIQUE USING INDEX "Permission_resource_action_key";
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── Extend UserRole ─────────────────────────────────────────────────────────

ALTER TABLE "UserRole"
  ADD COLUMN IF NOT EXISTS "revokedBy"     TEXT,
  ADD COLUMN IF NOT EXISTS "justification" TEXT,
  ADD COLUMN IF NOT EXISTS "isActive"      BOOLEAN      NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "revokedAt"     TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "UserRole_isActive_idx"   ON "UserRole"("isActive");
CREATE INDEX IF NOT EXISTS "UserRole_expiresAt_idx"  ON "UserRole"("expiresAt");

-- ─── UserCapabilityOverride ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "UserCapabilityOverride" (
  "id"            TEXT             NOT NULL,
  "userId"        TEXT             NOT NULL,
  "permissionId"  TEXT             NOT NULL,
  "effect"        "CapabilityEffect" NOT NULL,
  "justification" TEXT,
  "createdBy"     TEXT             NOT NULL,
  "expiresAt"     TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserCapabilityOverride_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "UserCapabilityOverride"
    ADD CONSTRAINT "UserCapabilityOverride_userId_permissionId_key" UNIQUE ("userId", "permissionId");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "UserCapabilityOverride_userId_idx"       ON "UserCapabilityOverride"("userId");
CREATE INDEX IF NOT EXISTS "UserCapabilityOverride_permissionId_idx" ON "UserCapabilityOverride"("permissionId");
CREATE INDEX IF NOT EXISTS "UserCapabilityOverride_expiresAt_idx"    ON "UserCapabilityOverride"("expiresAt");

DO $$ BEGIN
  ALTER TABLE "UserCapabilityOverride"
    ADD CONSTRAINT "UserCapabilityOverride_permissionId_fkey"
    FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── FeatureFlag ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "FeatureFlag" (
  "id"              TEXT             NOT NULL,
  "key"             TEXT             NOT NULL,
  "description"     TEXT,
  "enabled"         BOOLEAN          NOT NULL DEFAULT false,
  "rolloutStrategy" "RolloutStrategy" NOT NULL DEFAULT 'disabled',
  "rolloutPercent"  DOUBLE PRECISION,
  "allowedUserIds"  TEXT[]           NOT NULL DEFAULT '{}',
  "allowedRoles"    TEXT[]           NOT NULL DEFAULT '{}',
  "environment"     TEXT,
  "metadata"        JSONB,
  "createdBy"       TEXT,
  "updatedBy"       TEXT,
  "createdAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "FeatureFlag"
    ADD CONSTRAINT "FeatureFlag_key_key" UNIQUE ("key");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "FeatureFlag_key_idx"         ON "FeatureFlag"("key");
CREATE INDEX IF NOT EXISTS "FeatureFlag_enabled_idx"     ON "FeatureFlag"("enabled");
CREATE INDEX IF NOT EXISTS "FeatureFlag_environment_idx" ON "FeatureFlag"("environment");

-- ─── AuthorizationAuditLog ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "AuthorizationAuditLog" (
  "id"            TEXT         NOT NULL,
  "actorId"       TEXT,
  "actorEmail"    TEXT         NOT NULL,
  "targetEmail"   TEXT,
  "permission"    TEXT         NOT NULL,
  "decision"      TEXT         NOT NULL,
  "reason"        TEXT,
  "resource"      TEXT,
  "resourceId"    TEXT,
  "ipAddress"     TEXT,
  "userAgent"     TEXT,
  "correlationId" TEXT,
  "requestId"     TEXT,
  "metadata"      JSONB,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuthorizationAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_actorEmail_idx"    ON "AuthorizationAuditLog"("actorEmail");
CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_permission_idx"    ON "AuthorizationAuditLog"("permission");
CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_decision_idx"      ON "AuthorizationAuditLog"("decision");
CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_createdAt_idx"     ON "AuthorizationAuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_correlationId_idx" ON "AuthorizationAuditLog"("correlationId");

-- ─── JobIntelligence: add missing candidate back-relation foreign key ──────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'JobIntelligence'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'JobIntelligence_candidateId_fkey'
  ) THEN
    ALTER TABLE "JobIntelligence"
      ADD CONSTRAINT "JobIntelligence_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
