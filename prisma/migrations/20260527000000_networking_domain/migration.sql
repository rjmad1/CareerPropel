-- Networking Domain: enums, 4 new models, Contact intelligence columns
-- All statements are idempotent (IF NOT EXISTS / DO $$ ... END)

-- ─── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "ContactType" AS ENUM (
    'RECRUITER', 'HIRING_MANAGER', 'REFERRAL', 'PEER', 'ALUMNI', 'COMMUNITY'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RecruiterType" AS ENUM (
    'STAFFING_RECRUITER', 'INTERNAL_RECRUITER', 'ENGINEERING_MANAGER', 'DIRECTOR', 'VP'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OutreachChannel" AS ENUM ('LINKEDIN', 'EMAIL', 'PHONE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OutreachStatus" AS ENUM (
    'DRAFT', 'QUEUED', 'SENT', 'FAILED', 'DELIVERED', 'VIEWED', 'REPLIED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OutreachCampaignStatus" AS ENUM (
    'PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RelationshipStrength" AS ENUM ('COLD', 'WARM', 'HOT', 'STRONG');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Contact: intelligence columns ───────────────────────────────────────────

ALTER TABLE "Contact"
  ADD COLUMN IF NOT EXISTS "contactType"              "ContactType",
  ADD COLUMN IF NOT EXISTS "recruiterType"            "RecruiterType",
  ADD COLUMN IF NOT EXISTS "influenceScore"           DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "hiringAuthorityScore"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "outreachPriority"         INTEGER          NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "responseProbability"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "linkedinConnectionDegree" INTEGER,
  ADD COLUMN IF NOT EXISTS "mutualConnections"        INTEGER          NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "discoveryMetadata"        JSONB,
  ADD COLUMN IF NOT EXISTS "lastInteractionAt"        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastReplyAt"              TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Contact_contactType_idx"    ON "Contact"("contactType");
CREATE INDEX IF NOT EXISTS "Contact_influenceScore_idx" ON "Contact"("influenceScore");

-- ─── OutreachCampaign ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "OutreachCampaign" (
  "id"          TEXT                     NOT NULL,
  "candidateId" TEXT                     NOT NULL,
  "jobId"       TEXT,
  "company"     TEXT                     NOT NULL,
  "objective"   TEXT                     NOT NULL,
  "status"      "OutreachCampaignStatus" NOT NULL DEFAULT 'PLANNING',
  "startedAt"   TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "metadata"    JSONB,
  "createdAt"   TIMESTAMP(3)             NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3)             NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OutreachCampaign_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OutreachCampaign_candidateId_idx" ON "OutreachCampaign"("candidateId");
CREATE INDEX IF NOT EXISTS "OutreachCampaign_status_idx"      ON "OutreachCampaign"("status");

DO $$ BEGIN
  ALTER TABLE "OutreachCampaign"
    ADD CONSTRAINT "OutreachCampaign_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Outreach ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Outreach" (
  "id"                  TEXT              NOT NULL,
  "campaignId"          TEXT              NOT NULL,
  "contactId"           TEXT              NOT NULL,
  "channel"             "OutreachChannel" NOT NULL,
  "message"             TEXT              NOT NULL,
  "personalizedMessage" TEXT,
  "status"              "OutreachStatus"  NOT NULL DEFAULT 'DRAFT',
  "sequenceStep"        INTEGER           NOT NULL DEFAULT 0,
  "scheduledAt"         TIMESTAMP(3),
  "sentAt"              TIMESTAMP(3),
  "deliveredAt"         TIMESTAMP(3),
  "viewedAt"            TIMESTAMP(3),
  "repliedAt"           TIMESTAMP(3),
  "responseSentiment"   TEXT,
  "approvedBy"          TEXT,
  "approvedAt"          TIMESTAMP(3),
  "metadata"            JSONB,
  "createdAt"           TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Outreach_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Outreach_campaignId_idx" ON "Outreach"("campaignId");
CREATE INDEX IF NOT EXISTS "Outreach_contactId_idx"  ON "Outreach"("contactId");
CREATE INDEX IF NOT EXISTS "Outreach_status_idx"     ON "Outreach"("status");

DO $$ BEGIN
  ALTER TABLE "Outreach"
    ADD CONSTRAINT "Outreach_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "OutreachCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Outreach"
    ADD CONSTRAINT "Outreach_contactId_fkey"
    FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── RelationshipGraph ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "RelationshipGraph" (
  "id"               TEXT                  NOT NULL,
  "candidateId"      TEXT                  NOT NULL,
  "sourceContactId"  TEXT                  NOT NULL,
  "targetContactId"  TEXT                  NOT NULL,
  "relationshipType" TEXT                  NOT NULL,
  "strength"         "RelationshipStrength" NOT NULL DEFAULT 'COLD',
  "confidence"       DOUBLE PRECISION       NOT NULL DEFAULT 0,
  "metadata"         JSONB,
  "createdAt"        TIMESTAMP(3)           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3)           NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RelationshipGraph_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RelationshipGraph_candidateId_idx"               ON "RelationshipGraph"("candidateId");
CREATE INDEX IF NOT EXISTS "RelationshipGraph_sourceContactId_targetContactId_idx"
  ON "RelationshipGraph"("sourceContactId", "targetContactId");

DO $$ BEGIN
  ALTER TABLE "RelationshipGraph"
    ADD CONSTRAINT "RelationshipGraph_sourceContactId_fkey"
    FOREIGN KEY ("sourceContactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "RelationshipGraph"
    ADD CONSTRAINT "RelationshipGraph_targetContactId_fkey"
    FOREIGN KEY ("targetContactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── EngagementMetric ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "EngagementMetric" (
  "id"          TEXT         NOT NULL,
  "candidateId" TEXT         NOT NULL,
  "campaignId"  TEXT,
  "metricType"  TEXT         NOT NULL,
  "value"       DOUBLE PRECISION NOT NULL,
  "dimension"   TEXT,
  "measuredAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata"    JSONB,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EngagementMetric_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EngagementMetric_candidateId_metricType_idx" ON "EngagementMetric"("candidateId", "metricType");
CREATE INDEX IF NOT EXISTS "EngagementMetric_measuredAt_idx"              ON "EngagementMetric"("measuredAt");
