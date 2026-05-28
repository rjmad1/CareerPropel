-- Migration Name: 20260529000000_stabilization_and_orchestration
-- Description: Core stabilization migration aligning PostgreSQL database schema with canonical schema.prisma
-- All statements are designed to be idempotent (using IF NOT EXISTS / DO blocks / Exception Handlers)
--
-- ─── OPERATIONAL SAFETY COMMENTS ─────────────────────────────────────────────
-- 1. BACKUP: Always perform a full database backup (`pg_dump`) before applying DDL statements.
-- 2. LOCK MINIMIZATION: Adding columns without defaults is fast, but adding indexes or unique constraints 
--    on highly active tables (e.g. "AgentExecution", "Contact") acquires write locks.
--    In heavy write-traffic environments, consider deploying these indexes CONCURRENTLY before applying the DDL.
-- 3. MAINTENANCE WINDOW: This migration adds 18 tables and registers several new enums. Run this during 
--    off-peak hours to minimize potential lock wait timeouts.
-- ─── NON-TRANSACTIONAL ENUM EXTENSION NOTE ──────────────────────────────────
-- PostgreSQL does not allow ALTER TYPE ... ADD VALUE to run inside a multi-statement transaction block.
-- If applying this migration manually through a transaction runner, the operator must execute the 
-- Stage 1 statements in a separate autocommit database session (outside of a transaction block).

-- ─── STAGE 1: ENUM EXTENSIONS ───────────────────────────────────────────────
ALTER TYPE "AgentExecutionStatus" ADD VALUE IF NOT EXISTS 'paused';
ALTER TYPE "AgentExecutionStatus" ADD VALUE IF NOT EXISTS 'interrupted';
ALTER TYPE "InterviewStatus" ADD VALUE IF NOT EXISTS 'no_show';


-- ─── STAGE 2: ENUM CREATION ──────────────────────────────────────────────────

-- 2.1 Workflow Orchestration Enums
DO $$ BEGIN
  CREATE TYPE "WorkflowStatus" AS ENUM ('queued', 'running', 'waiting_for_approval', 'blocked', 'failed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StepStatus" AS ENUM ('pending', 'running', 'waiting_for_approval', 'completed', 'failed', 'skipped');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StepType" AS ENUM ('agent_call', 'approval', 'condition', 'notification', 'delay');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ApprovalDecision" AS ENUM ('approved', 'rejected', 'modified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ApprovalActionType" AS ENUM ('send_outreach', 'send_followup', 'submit_document', 'compensation_comm', 'networking_comm');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ScheduleTriggerType" AS ENUM ('recurring', 'one_time', 'inactivity', 'stage_change');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2.2 Role Intelligence / Fit Evaluation Enums
DO $$ BEGIN
  CREATE TYPE "RoleArchetype" AS ENUM (
    'BUILDER', 'OPERATOR', 'STRATEGIST', 'MAINTAINER', 'OPTIMIZER', 'RESEARCHER', 'EXECUTOR', 
    'PROCESS_SCALER', 'SYSTEMS_INTEGRATOR', 'CUSTOMER_FACING_TRANSLATOR', 'TECHNICAL_LEAD', 'TRANSFORMATION_DRIVER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GapClassification" AS ENUM ('TRAINABLE', 'CREDIBILITY_KILLING', 'DOMAIN_DEPTH', 'ADAPTATION_SPEED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "FitDimension" AS ENUM (
    'DEMONSTRATED_EXECUTION_PROOF', 'BUSINESS_PROBLEM_ALIGNMENT', 'RESPONSIBILITY_OVERLAP', 'TOOL_OVERLAP', 
    'KEYWORD_OVERLAP', 'ADJACENT_SKILL_TRANSFER', 'DOMAIN_FAMILIARITY', 'ARCHETYPE_ALIGNMENT', 
    'IMMEDIATE_CONTRIBUTION_CAPABILITY', 'STRATEGIC_IMPACT_ALIGNMENT', 'CREDIBILITY_RISK', 'ADAPTATION_BURDEN'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PatternCategory" AS ENUM (
    'HIGH_FIT_RESPONSIBILITY', 'BUSINESS_PROBLEM', 'HIRING_URGENCY_SIGNAL', 
    'INTERVIEW_CONVERTING_NARRATIVE', 'ARCHETYPE_CORRELATION', 'SUCCESS_METRIC'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2.3 CRM & RBAC Enums (Consolidated)
DO $$ BEGIN
  CREATE TYPE "ContactType" AS ENUM ('RECRUITER', 'HIRING_MANAGER', 'REFERRAL', 'PEER', 'ALUMNI', 'COMMUNITY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RecruiterType" AS ENUM ('STAFFING_RECRUITER', 'INTERNAL_RECRUITER', 'ENGINEERING_MANAGER', 'DIRECTOR', 'VP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OutreachChannel" AS ENUM ('LINKEDIN', 'EMAIL', 'PHONE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OutreachStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENT', 'FAILED', 'DELIVERED', 'VIEWED', 'REPLIED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OutreachCampaignStatus" AS ENUM ('PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RelationshipStrength" AS ENUM ('COLD', 'WARM', 'HOT', 'STRONG');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RoleType" AS ENUM ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SECURITY_ADMIN', 'SUPPORT_ADMIN', 'JOB_SEEKER', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CapabilityEffect" AS ENUM ('allow', 'deny');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RolloutStrategy" AS ENUM ('all', 'percentage', 'allowlist', 'role_scoped', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ─── STAGE 3: INDEPENDENT TABLES ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "WorkflowDefinition" (
  "id"          TEXT         NOT NULL,
  "name"        TEXT         NOT NULL,
  "displayName" TEXT         NOT NULL,
  "description" TEXT,
  "version"     INTEGER      NOT NULL DEFAULT 1,
  "isActive"    BOOLEAN      NOT NULL DEFAULT true,
  "steps"       JSONB        NOT NULL,
  "metadata"    JSONB,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AiProviderConfig" (
  "id"           TEXT         NOT NULL,
  "candidateId"  TEXT         NOT NULL,
  "providerName" TEXT         NOT NULL,
  "endpointUrl"  TEXT,
  "encryptedKey" TEXT,
  "isActive"     BOOLEAN      NOT NULL DEFAULT true,
  "priority"     INTEGER      NOT NULL DEFAULT 1,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AiProviderConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserCapabilityPreset" (
  "id"           TEXT             NOT NULL,
  "candidateId"  TEXT             NOT NULL,
  "presetName"   TEXT             NOT NULL,
  "providerName" TEXT             NOT NULL,
  "modelName"    TEXT             NOT NULL,
  "maxCostLimit" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
  "privacyMode"  TEXT             NOT NULL DEFAULT 'enterprise',
  "createdAt"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserCapabilityPreset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TokenUsageLog" (
  "id"           TEXT             NOT NULL,
  "candidateId"  TEXT             NOT NULL,
  "executionId"  TEXT,
  "presetName"   TEXT             NOT NULL,
  "providerName" TEXT             NOT NULL,
  "modelName"    TEXT             NOT NULL,
  "inputTokens"  INTEGER          NOT NULL,
  "outputTokens" INTEGER          NOT NULL,
  "costUsd"      DOUBLE PRECISION NOT NULL,
  "createdAt"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TokenUsageLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ModelHealthLog" (
  "id"           TEXT         NOT NULL,
  "providerName" TEXT         NOT NULL,
  "modelName"    TEXT         NOT NULL,
  "latencyMs"    INTEGER      NOT NULL,
  "isSuccess"    BOOLEAN      NOT NULL,
  "statusCode"   INTEGER,
  "errorMessage" TEXT,
  "timestamp"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ModelHealthLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FeatureFlag" (
  "id"              TEXT              NOT NULL,
  "key"             TEXT              NOT NULL,
  "description"     TEXT,
  "enabled"         BOOLEAN           NOT NULL DEFAULT false,
  "rolloutStrategy" "RolloutStrategy" NOT NULL DEFAULT 'disabled',
  "rolloutPercent"  DOUBLE PRECISION,
  "allowedUserIds"  TEXT[]            NOT NULL DEFAULT '{}',
  "allowedRoles"    TEXT[]            NOT NULL DEFAULT '{}',
  "environment"     TEXT,
  "metadata"        JSONB,
  "createdBy"       TEXT,
  "updatedBy"       TEXT,
  "createdAt"       TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE IF NOT EXISTS "EngagementMetric" (
  "id"          TEXT             NOT NULL,
  "candidateId" TEXT             NOT NULL,
  "campaignId"  TEXT,
  "metricType"  TEXT             NOT NULL,
  "value"       DOUBLE PRECISION NOT NULL,
  "dimension"   TEXT,
  "measuredAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata"    JSONB,
  "createdAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EngagementMetric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PromptVersion" (
  "id"                   TEXT         NOT NULL,
  "capability"           TEXT         NOT NULL DEFAULT '',
  "agentType"            TEXT,
  "version"              TEXT         NOT NULL DEFAULT '1.0.0',
  "template"             TEXT         NOT NULL DEFAULT '',
  "systemPrompt"         TEXT,
  "systemHash"           TEXT,
  "userPromptTemplate"   TEXT,
  "userPromptHash"       TEXT,
  "preprocessingVersion" TEXT         DEFAULT '1.0.0',
  "sanitizerVersion"     TEXT         DEFAULT '1.0.0',
  "outputSchemaVersion"  TEXT         DEFAULT '1.0.0',
  "changelog"            TEXT,
  "createdBy"            TEXT,
  "isActive"             BOOLEAN      NOT NULL DEFAULT true,
  "canaryPercent"        DOUBLE PRECISION,
  "deprecatedAt"         TIMESTAMP(3),
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);


-- ─── STAGE 4: DEPENDENT TABLES ───────────────────────────────────────────────

-- 4.1 Role Intelligence Models
CREATE TABLE IF NOT EXISTS "JobIntelligence" (
  "id"                          TEXT             NOT NULL,
  "jobId"                       TEXT             NOT NULL,
  "candidateId"                 TEXT             NOT NULL,
  "inferredRole"                TEXT             NOT NULL,
  "roleArchetype"               "RoleArchetype"  NOT NULL,
  "archetypeWeights"            JSONB            NOT NULL,
  "roleClarityScore"            DOUBLE PRECISION NOT NULL,
  "hardRequirements"            JSONB            NOT NULL,
  "softRequirements"            JSONB            NOT NULL,
  "operationalDomain"           TEXT             NOT NULL,
  "recurringResponsibilities"   JSONB            NOT NULL,
  "decisionOwnership"           TEXT[]           NOT NULL,
  "operationalScope"            TEXT             NOT NULL,
  "executionComplexity"         INTEGER          NOT NULL,
  "systemsResponsibility"       TEXT,
  "crossFunctionalCoordination" TEXT,
  "reportingStructure"          JSONB,
  "organizationalLeverage"      INTEGER          NOT NULL,
  "analysisVersion"             INTEGER          NOT NULL DEFAULT 1,
  "analyzedAt"                  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"                   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"                   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "JobIntelligence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RequirementBreakdown" (
  "id"                    TEXT         NOT NULL,
  "jobIntelligenceId"     TEXT         NOT NULL,
  "requirement"           TEXT         NOT NULL,
  "classification"        TEXT         NOT NULL,
  "confidenceScore"       DOUBLE PRECISION NOT NULL,
  "tools"                 TEXT[]       NOT NULL,
  "decisions"             TEXT[]       NOT NULL,
  "outputs"               TEXT[]       NOT NULL,
  "metrics"               TEXT[]       NOT NULL,
  "ownership"             TEXT         NOT NULL,
  "operationalComplexity" INTEGER      NOT NULL,
  "collaborationSurface"  TEXT[]       NOT NULL,
  "businessImpact"        TEXT,
  "executionCadence"      TEXT,
  "riskLevel"             INTEGER      NOT NULL,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RequirementBreakdown_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessProblem" (
  "id"                  TEXT         NOT NULL,
  "jobIntelligenceId"   TEXT         NOT NULL,
  "problem"             TEXT         NOT NULL,
  "category"            TEXT         NOT NULL,
  "severity"            INTEGER      NOT NULL,
  "urgencySignal"       TEXT,
  "operationalFriction" TEXT,
  "scalingChallenge"    TEXT,
  "executionBottleneck" TEXT,
  "evidence"            TEXT,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BusinessProblem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OperationalSignal" (
  "id"                TEXT             NOT NULL,
  "jobIntelligenceId" TEXT             NOT NULL,
  "signal"            TEXT             NOT NULL,
  "signalType"        TEXT             NOT NULL,
  "frequency"         DOUBLE PRECISION NOT NULL,
  "weight"            DOUBLE PRECISION NOT NULL,
  "sourceCompanies"   TEXT[]           NOT NULL,
  "createdAt"         TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OperationalSignal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StrengthEvidence" (
  "id"                    TEXT             NOT NULL,
  "candidateId"           TEXT             NOT NULL,
  "jobId"                 TEXT,
  "source"                TEXT             NOT NULL,
  "capability"            TEXT             NOT NULL,
  "measurableOutcome"     TEXT,
  "businessImpact"        TEXT,
  "executionContext"      TEXT,
  "scale"                 TEXT,
  "decisionOwnership"     TEXT,
  "operationalComplexity" INTEGER,
  "systemsInfluenced"     TEXT[]           NOT NULL,
  "stakeholderLevel"      TEXT,
  "repeatability"         TEXT,
  "employerInterpretation" TEXT,
  "economicImpact"        TEXT,
  "operationalLeverage"   TEXT,
  "rarityScore"           DOUBLE PRECISION NOT NULL DEFAULT 0,
  "leverageScore"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "replacementCost"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "businessBottleneckScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "matchedProblems"       TEXT[]           NOT NULL,
  "matchConfidence"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt"             TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StrengthEvidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FitGap" (
  "id"                   TEXT               NOT NULL,
  "candidateId"          TEXT               NOT NULL,
  "jobId"                TEXT               NOT NULL,
  "gap"                  TEXT               NOT NULL,
  "classification"       "GapClassification" NOT NULL,
  "severity"             INTEGER            NOT NULL,
  "penaltyMultiplier"    DOUBLE PRECISION   NOT NULL DEFAULT 1.0,
  "adjacentProof"        TEXT,
  "learningTime"         TEXT,
  "learningResources"    TEXT[]             NOT NULL,
  "blockingReason"       TEXT,
  "alternativeRoute"     TEXT,
  "domainRequired"       TEXT,
  "adjacentDomain"       TEXT,
  "onboardingComplexity" INTEGER,
  "learningCurve"        TEXT,
  "operationalRampTime"  TEXT,
  "createdAt"            TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FitGap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FitScoringSnapshot" (
  "id"                             TEXT             NOT NULL,
  "candidateId"                    TEXT             NOT NULL,
  "jobId"                          TEXT             NOT NULL,
  "fitScore"                       DOUBLE PRECISION NOT NULL,
  "interviewConversionProbability" DOUBLE PRECISION NOT NULL,
  "immediateContributionScore"     DOUBLE PRECISION NOT NULL,
  "credibilityRiskScore"           DOUBLE PRECISION NOT NULL,
  "skillTransferScore"             DOUBLE PRECISION NOT NULL,
  "businessProblemAlignmentScore"  DOUBLE PRECISION NOT NULL,
  "adaptationRiskScore"            DOUBLE PRECISION NOT NULL,
  "roleClarityScore"               DOUBLE PRECISION NOT NULL,
  "employerPainMatchScore"         DOUBLE PRECISION NOT NULL,
  "dimensionScores"                JSONB            NOT NULL,
  "weightsVersion"                 INTEGER          NOT NULL DEFAULT 1,
  "weights"                        JSONB            NOT NULL,
  "strongestLeveragePoints"        TEXT[]           NOT NULL,
  "biggestBlockers"                TEXT[]           NOT NULL,
  "expectedRecruiterPerception"    TEXT,
  "recommendation"                 TEXT             NOT NULL,
  "recommendationRationale"        TEXT,
  "suppressed"                     BOOLEAN          NOT NULL DEFAULT false,
  "suppressionReason"              TEXT,
  "analysisVersion"                INTEGER          NOT NULL DEFAULT 1,
  "analyzedAt"                     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"                      TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"                      TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FitScoringSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RoleFitAnalysis" (
  "id"           TEXT         NOT NULL,
  "candidateId"  TEXT         NOT NULL,
  "jobId"        TEXT         NOT NULL,
  "analysisType" TEXT         NOT NULL,
  "results"      JSONB        NOT NULL,
  "executionId"  TEXT,
  "agentType"    TEXT,
  "modelVersion" TEXT,
  "tokenUsage"   INTEGER,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RoleFitAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PatternLibraryEntry" (
  "id"                   TEXT             NOT NULL,
  "candidateId"          TEXT             NOT NULL,
  "category"             "PatternCategory" NOT NULL,
  "pattern"              TEXT             NOT NULL,
  "description"          TEXT,
  "confidenceScore"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "frequencyObserved"    INTEGER          NOT NULL DEFAULT 1,
  "conversionRate"       DOUBLE PRECISION,
  "archetypeCorrelation" "RoleArchetype",
  "sourceJobIds"         TEXT[]           NOT NULL,
  "evidenceText"         TEXT,
  "metrics"              JSONB,
  "weightModifier"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "active"               BOOLEAN          NOT NULL DEFAULT true,
  "createdAt"            TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PatternLibraryEntry_pkey" PRIMARY KEY ("id")
);

-- 4.2 Workflow Orchestration Grouping
CREATE TABLE IF NOT EXISTS "WorkflowExecution" (
  "id"               TEXT           NOT NULL,
  "candidateId"      TEXT           NOT NULL,
  "jobId"            TEXT,
  "definitionId"     TEXT           NOT NULL,
  "status"           "WorkflowStatus" NOT NULL DEFAULT 'queued',
  "currentStepIndex" INTEGER        NOT NULL DEFAULT 0,
  "context"          JSONB,
  "metadata"         JSONB,
  "triggeredBy"      TEXT,
  "startedAt"        TIMESTAMP(3),
  "completedAt"      TIMESTAMP(3),
  "cancelledAt"      TIMESTAMP(3),
  "failedAt"         TIMESTAMP(3),
  "errorMessage"     TEXT,
  "createdAt"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WorkflowStepExecution" (
  "id"               TEXT         NOT NULL,
  "workflowId"       TEXT         NOT NULL,
  "stepKey"          TEXT         NOT NULL,
  "stepIndex"        INTEGER      NOT NULL,
  "stepType"         "StepType"   NOT NULL,
  "status"           "StepStatus" NOT NULL DEFAULT 'pending',
  "agentExecutionId" TEXT,
  "input"            JSONB,
  "output"           JSONB,
  "errorMessage"     TEXT,
  "startedAt"        TIMESTAMP(3),
  "completedAt"      TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkflowStepExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApprovalRequest" (
  "id"              TEXT               NOT NULL,
  "workflowId"      TEXT               NOT NULL,
  "stepKey"         TEXT               NOT NULL,
  "candidateId"     TEXT               NOT NULL,
  "actionType"      "ApprovalActionType" NOT NULL,
  "payload"         JSONB              NOT NULL,
  "modifiedPayload" JSONB,
  "decision"        "ApprovalDecision",
  "decisionNote"    TEXT,
  "decidedAt"       TIMESTAMP(3),
  "expiresAt"       TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OpportunityPlan" (
  "id"                TEXT         NOT NULL,
  "candidateId"       TEXT         NOT NULL,
  "jobId"             TEXT         NOT NULL,
  "urgencyScore"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "readinessScore"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "momentumScore"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "actions"           JSONB        NOT NULL,
  "healthBreakdown"   JSONB,
  "suggestedWorkflow" TEXT,
  "generatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt"         TIMESTAMP(3),
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OpportunityPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WorkflowSchedule" (
  "id"              TEXT                NOT NULL,
  "candidateId"     TEXT                NOT NULL,
  "jobId"           TEXT,
  "definitionId"    TEXT,
  "triggerType"     "ScheduleTriggerType" NOT NULL,
  "cronExpression"  TEXT,
  "scheduledAt"     TIMESTAMP(3),
  "inactivityDays"  INTEGER,
  "isActive"        BOOLEAN             NOT NULL DEFAULT true,
  "lastTriggeredAt" TIMESTAMP(3),
  "nextTriggerAt"   TIMESTAMP(3),
  "metadata"        JSONB,
  "createdAt"       TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkflowSchedule_pkey" PRIMARY KEY ("id")
);

-- 4.3 CRM outreach and Security Overrides
CREATE TABLE IF NOT EXISTS "OutreachCampaign" (
  "id"          TEXT                   NOT NULL,
  "candidateId" TEXT                   NOT NULL,
  "jobId"       TEXT,
  "company"     TEXT                   NOT NULL,
  "objective"   TEXT                   NOT NULL,
  "status"      "OutreachCampaignStatus" NOT NULL DEFAULT 'PLANNING',
  "startedAt"   TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "metadata"    JSONB,
  "createdAt"   TIMESTAMP(3)           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3)           NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OutreachCampaign_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE IF NOT EXISTS "RelationshipGraph" (
  "id"               TEXT                 NOT NULL,
  "candidateId"      TEXT                 NOT NULL,
  "sourceContactId"  TEXT                 NOT NULL,
  "targetContactId"  TEXT                 NOT NULL,
  "relationshipType" TEXT                 NOT NULL,
  "strength"         "RelationshipStrength" NOT NULL DEFAULT 'COLD',
  "confidence"       DOUBLE PRECISION     NOT NULL DEFAULT 0,
  "metadata"         JSONB,
  "createdAt"        TIMESTAMP(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RelationshipGraph_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE IF NOT EXISTS "EventLog" (
  "id"          TEXT         NOT NULL,
  "executionId" TEXT         NOT NULL,
  "level"       TEXT         NOT NULL,
  "message"     TEXT         NOT NULL,
  "metadata"    JSONB,
  "timestamp"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);


-- ─── STAGE 5: COLUMN ALTERATIONS & EXTENSIONS ───────────────────────────────

-- 5.1 Expand AgentExecution with orchestration tracking and cost parameters
ALTER TABLE "AgentExecution"
  ADD COLUMN IF NOT EXISTS "jobId"                     TEXT,
  ADD COLUMN IF NOT EXISTS "queueJobId"                 TEXT,
  ADD COLUMN IF NOT EXISTS "currentTask"                TEXT,
  ADD COLUMN IF NOT EXISTS "progress"                   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "attempts"                   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "providerId"                 TEXT,
  ADD COLUMN IF NOT EXISTS "requestId"                  TEXT,
  ADD COLUMN IF NOT EXISTS "correlationId"              TEXT,
  ADD COLUMN IF NOT EXISTS "promptVersionId"            TEXT,
  ADD COLUMN IF NOT EXISTS "promptHash"                 TEXT,
  ADD COLUMN IF NOT EXISTS "modelId"                    TEXT,
  ADD COLUMN IF NOT EXISTS "provider"                   TEXT,
  ADD COLUMN IF NOT EXISTS "fallbackUsed"               BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "fallbackReason"             TEXT,
  ADD COLUMN IF NOT EXISTS "sanitizerVersion"           TEXT,
  ADD COLUMN IF NOT EXISTS "inputTokens"                INTEGER,
  ADD COLUMN IF NOT EXISTS "outputTokens"               INTEGER,
  ADD COLUMN IF NOT EXISTS "costUsd"                    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "validationPassed"           BOOLEAN,
  ADD COLUMN IF NOT EXISTS "validationErrors"           JSONB,
  ADD COLUMN IF NOT EXISTS "validationVersion"          TEXT,
  ADD COLUMN IF NOT EXISTS "schemaValidated"            BOOLEAN,
  ADD COLUMN IF NOT EXISTS "semanticValidated"          BOOLEAN,
  ADD COLUMN IF NOT EXISTS "policyValidated"            BOOLEAN,
  ADD COLUMN IF NOT EXISTS "metadata"                   JSONB;

-- 5.2 Expand ToolCall with metrics
ALTER TABLE "ToolCall"
  ADD COLUMN IF NOT EXISTS "toolName"   TEXT,
  ADD COLUMN IF NOT EXISTS "durationMs" INTEGER,
  ADD COLUMN IF NOT EXISTS "tokens"     INTEGER;

-- 5.3 Expand Contact with CRM intelligence metadata
ALTER TABLE "Contact"
  ADD COLUMN IF NOT EXISTS "contactType"              "ContactType",
  ADD COLUMN IF NOT EXISTS "recruiterType"            "RecruiterType",
  ADD COLUMN IF NOT EXISTS "influenceScore"           DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "hiringAuthorityScore"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "outreachPriority"         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "responseProbability"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "linkedinConnectionDegree" INTEGER,
  ADD COLUMN IF NOT EXISTS "mutualConnections"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "discoveryMetadata"        JSONB,
  ADD COLUMN IF NOT EXISTS "lastInteractionAt"        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastReplyAt"              TIMESTAMP(3);

-- 5.4 Expand Role governance properties
ALTER TABLE "Role"
  ADD COLUMN IF NOT EXISTS "roleType"            "RoleType" NOT NULL DEFAULT 'CUSTOM',
  ADD COLUMN IF NOT EXISTS "immutableSystemRole" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "priority"            INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "environmentScope"    TEXT,
  ADD COLUMN IF NOT EXISTS "metadata"            JSONB;

-- 5.5 Expand Permission tracking metadata
ALTER TABLE "Permission"
  ADD COLUMN IF NOT EXISTS "systemProtected" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 5.6 Expand UserRole with revocation auditable structures
ALTER TABLE "UserRole"
  ADD COLUMN IF NOT EXISTS "revokedBy"     TEXT,
  ADD COLUMN IF NOT EXISTS "justification" TEXT,
  ADD COLUMN IF NOT EXISTS "isActive"      BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "revokedAt"     TIMESTAMP(3);


-- ─── STAGE 6: INDEXES & UNIQUE CONSTRAINTS ───────────────────────────────────

-- 6.1 Workflow Orchestration Indices
CREATE INDEX IF NOT EXISTS "WorkflowDefinition_name_idx" ON "WorkflowDefinition"("name");
CREATE INDEX IF NOT EXISTS "WorkflowDefinition_isActive_idx" ON "WorkflowDefinition"("isActive");
CREATE INDEX IF NOT EXISTS "WorkflowExecution_candidateId_idx" ON "WorkflowExecution"("candidateId");
CREATE INDEX IF NOT EXISTS "WorkflowExecution_jobId_idx" ON "WorkflowExecution"("jobId");
CREATE INDEX IF NOT EXISTS "WorkflowExecution_status_idx" ON "WorkflowExecution"("status");
CREATE INDEX IF NOT EXISTS "WorkflowExecution_definitionId_idx" ON "WorkflowExecution"("definitionId");
CREATE INDEX IF NOT EXISTS "WorkflowStepExecution_workflowId_idx" ON "WorkflowStepExecution"("workflowId");
CREATE INDEX IF NOT EXISTS "WorkflowStepExecution_stepKey_idx" ON "WorkflowStepExecution"("stepKey");
CREATE INDEX IF NOT EXISTS "WorkflowStepExecution_status_idx" ON "WorkflowStepExecution"("status");
CREATE INDEX IF NOT EXISTS "ApprovalRequest_workflowId_idx" ON "ApprovalRequest"("workflowId");
CREATE INDEX IF NOT EXISTS "ApprovalRequest_candidateId_idx" ON "ApprovalRequest"("candidateId");
CREATE INDEX IF NOT EXISTS "ApprovalRequest_decision_idx" ON "ApprovalRequest"("decision");
CREATE INDEX IF NOT EXISTS "ApprovalRequest_createdAt_idx" ON "ApprovalRequest"("createdAt");
CREATE INDEX IF NOT EXISTS "OpportunityPlan_candidateId_idx" ON "OpportunityPlan"("candidateId");
CREATE INDEX IF NOT EXISTS "OpportunityPlan_jobId_idx" ON "OpportunityPlan"("jobId");
CREATE INDEX IF NOT EXISTS "WorkflowSchedule_candidateId_idx" ON "WorkflowSchedule"("candidateId");
CREATE INDEX IF NOT EXISTS "WorkflowSchedule_isActive_idx" ON "WorkflowSchedule"("isActive");
CREATE INDEX IF NOT EXISTS "WorkflowSchedule_nextTriggerAt_idx" ON "WorkflowSchedule"("nextTriggerAt");
CREATE INDEX IF NOT EXISTS "WorkflowSchedule_definitionId_idx" ON "WorkflowSchedule"("definitionId");

-- 6.2 AI configurations and Prompts indices
CREATE INDEX IF NOT EXISTS "AiProviderConfig_candidateId_idx" ON "AiProviderConfig"("candidateId");
CREATE INDEX IF NOT EXISTS "UserCapabilityPreset_candidateId_idx" ON "UserCapabilityPreset"("candidateId");
CREATE INDEX IF NOT EXISTS "TokenUsageLog_candidateId_idx" ON "TokenUsageLog"("candidateId");
CREATE INDEX IF NOT EXISTS "TokenUsageLog_createdAt_idx" ON "TokenUsageLog"("createdAt");
CREATE INDEX IF NOT EXISTS "ModelHealthLog_providerName_modelName_idx" ON "ModelHealthLog"("providerName", "modelName");
CREATE INDEX IF NOT EXISTS "ModelHealthLog_timestamp_idx" ON "ModelHealthLog"("timestamp");
CREATE INDEX IF NOT EXISTS "PromptVersion_capability_idx" ON "PromptVersion"("capability");
CREATE INDEX IF NOT EXISTS "PromptVersion_agentType_idx" ON "PromptVersion"("agentType");
CREATE INDEX IF NOT EXISTS "PromptVersion_isActive_idx" ON "PromptVersion"("isActive");

-- 6.3 Role Intelligence Indices
CREATE INDEX IF NOT EXISTS "JobIntelligence_candidateId_idx" ON "JobIntelligence"("candidateId");
CREATE INDEX IF NOT EXISTS "JobIntelligence_jobId_idx" ON "JobIntelligence"("jobId");
CREATE INDEX IF NOT EXISTS "JobIntelligence_roleArchetype_idx" ON "JobIntelligence"("roleArchetype");
CREATE INDEX IF NOT EXISTS "JobIntelligence_inferredRole_idx" ON "JobIntelligence"("inferredRole");
CREATE INDEX IF NOT EXISTS "RequirementBreakdown_jobIntelligenceId_idx" ON "RequirementBreakdown"("jobIntelligenceId");
CREATE INDEX IF NOT EXISTS "RequirementBreakdown_classification_idx" ON "RequirementBreakdown"("classification");
CREATE INDEX IF NOT EXISTS "BusinessProblem_jobIntelligenceId_idx" ON "BusinessProblem"("jobIntelligenceId");
CREATE INDEX IF NOT EXISTS "BusinessProblem_category_idx" ON "BusinessProblem"("category");
CREATE INDEX IF NOT EXISTS "OperationalSignal_jobIntelligenceId_idx" ON "OperationalSignal"("jobIntelligenceId");
CREATE INDEX IF NOT EXISTS "OperationalSignal_signalType_idx" ON "OperationalSignal"("signalType");
CREATE INDEX IF NOT EXISTS "StrengthEvidence_candidateId_idx" ON "StrengthEvidence"("candidateId");
CREATE INDEX IF NOT EXISTS "StrengthEvidence_jobId_idx" ON "StrengthEvidence"("jobId");
CREATE INDEX IF NOT EXISTS "StrengthEvidence_capability_idx" ON "StrengthEvidence"("capability");
CREATE INDEX IF NOT EXISTS "StrengthEvidence_rarityScore_idx" ON "StrengthEvidence"("rarityScore");
CREATE INDEX IF NOT EXISTS "FitGap_candidateId_idx" ON "FitGap"("candidateId");
CREATE INDEX IF NOT EXISTS "FitGap_jobId_idx" ON "FitGap"("jobId");
CREATE INDEX IF NOT EXISTS "FitGap_classification_idx" ON "FitGap"("classification");
CREATE INDEX IF NOT EXISTS "FitScoringSnapshot_candidateId_idx" ON "FitScoringSnapshot"("candidateId");
CREATE INDEX IF NOT EXISTS "FitScoringSnapshot_jobId_idx" ON "FitScoringSnapshot"("jobId");
CREATE INDEX IF NOT EXISTS "FitScoringSnapshot_fitScore_idx" ON "FitScoringSnapshot"("fitScore");
CREATE INDEX IF NOT EXISTS "FitScoringSnapshot_interviewConversionProbability_idx" ON "FitScoringSnapshot"("interviewConversionProbability");
CREATE INDEX IF NOT EXISTS "FitScoringSnapshot_suppressed_idx" ON "FitScoringSnapshot"("suppressed");
CREATE INDEX IF NOT EXISTS "RoleFitAnalysis_candidateId_idx" ON "RoleFitAnalysis"("candidateId");
CREATE INDEX IF NOT EXISTS "RoleFitAnalysis_jobId_idx" ON "RoleFitAnalysis"("jobId");
CREATE INDEX IF NOT EXISTS "RoleFitAnalysis_analysisType_idx" ON "RoleFitAnalysis"("analysisType");
CREATE INDEX IF NOT EXISTS "RoleFitAnalysis_createdAt_idx" ON "RoleFitAnalysis"("createdAt");
CREATE INDEX IF NOT EXISTS "PatternLibraryEntry_candidateId_idx" ON "PatternLibraryEntry"("candidateId");
CREATE INDEX IF NOT EXISTS "PatternLibraryEntry_category_idx" ON "PatternLibraryEntry"("category");
CREATE INDEX IF NOT EXISTS "PatternLibraryEntry_conversionRate_idx" ON "PatternLibraryEntry"("conversionRate");
CREATE INDEX IF NOT EXISTS "PatternLibraryEntry_active_idx" ON "PatternLibraryEntry"("active");

-- 6.4 CRM outreach and Security Override Indices
CREATE INDEX IF NOT EXISTS "OutreachCampaign_candidateId_idx" ON "OutreachCampaign"("candidateId");
CREATE INDEX IF NOT EXISTS "OutreachCampaign_status_idx" ON "OutreachCampaign"("status");
CREATE INDEX IF NOT EXISTS "Outreach_campaignId_idx" ON "Outreach"("campaignId");
CREATE INDEX IF NOT EXISTS "Outreach_contactId_idx" ON "Outreach"("contactId");
CREATE INDEX IF NOT EXISTS "Outreach_status_idx" ON "Outreach"("status");
CREATE INDEX IF NOT EXISTS "RelationshipGraph_candidateId_idx" ON "RelationshipGraph"("candidateId");
CREATE INDEX IF NOT EXISTS "RelationshipGraph_sourceContactId_targetContactId_idx" ON "RelationshipGraph"("sourceContactId", "targetContactId");
CREATE INDEX IF NOT EXISTS "UserCapabilityOverride_userId_idx" ON "UserCapabilityOverride"("userId");
CREATE INDEX IF NOT EXISTS "UserCapabilityOverride_permissionId_idx" ON "UserCapabilityOverride"("permissionId");
CREATE INDEX IF NOT EXISTS "UserCapabilityOverride_expiresAt_idx" ON "UserCapabilityOverride"("expiresAt");
CREATE INDEX IF NOT EXISTS "FeatureFlag_key_idx" ON "FeatureFlag"("key");
CREATE INDEX IF NOT EXISTS "FeatureFlag_enabled_idx" ON "FeatureFlag"("enabled");
CREATE INDEX IF NOT EXISTS "FeatureFlag_environment_idx" ON "FeatureFlag"("environment");
CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_actorEmail_idx" ON "AuthorizationAuditLog"("actorEmail");
CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_permission_idx" ON "AuthorizationAuditLog"("permission");
CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_decision_idx" ON "AuthorizationAuditLog"("decision");
CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_createdAt_idx" ON "AuthorizationAuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuthorizationAuditLog_correlationId_idx" ON "AuthorizationAuditLog"("correlationId");

-- 6.5 Altered Tables Indices & Extensions
CREATE INDEX IF NOT EXISTS "AgentExecution_queueJobId_idx" ON "AgentExecution"("queueJobId");
CREATE INDEX IF NOT EXISTS "AgentExecution_promptVersionId_idx" ON "AgentExecution"("promptVersionId");
CREATE INDEX IF NOT EXISTS "ToolCall_toolName_idx" ON "ToolCall"("toolName");
CREATE INDEX IF NOT EXISTS "Contact_contactType_idx" ON "Contact"("contactType");
CREATE INDEX IF NOT EXISTS "Contact_influenceScore_idx" ON "Contact"("influenceScore");
CREATE INDEX IF NOT EXISTS "EventLog_executionId_timestamp_idx" ON "EventLog"("executionId", "timestamp");
CREATE INDEX IF NOT EXISTS "EventLog_level_timestamp_idx" ON "EventLog"("level", "timestamp");
CREATE INDEX IF NOT EXISTS "UserRole_isActive_idx" ON "UserRole"("isActive");
CREATE INDEX IF NOT EXISTS "UserRole_expiresAt_idx" ON "UserRole"("expiresAt");
CREATE INDEX IF NOT EXISTS "Permission_resource_idx" ON "Permission"("resource");
CREATE INDEX IF NOT EXISTS "Permission_systemProtected_idx" ON "Permission"("systemProtected");

-- 6.6 Safe creation of Unique Constraints using standard Prisma Naming Block
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PromptVersion_capability_version_key') THEN
    ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_capability_version_key" UNIQUE ("capability", "version");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PromptVersion_agentType_version_key') THEN
    ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_agentType_version_key" UNIQUE ("agentType", "version");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'AiProviderConfig_candidateId_providerName_key') THEN
    ALTER TABLE "AiProviderConfig" ADD CONSTRAINT "AiProviderConfig_candidateId_providerName_key" UNIQUE ("candidateId", "providerName");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'UserCapabilityPreset_candidateId_presetName_key') THEN
    ALTER TABLE "UserCapabilityPreset" ADD CONSTRAINT "UserCapabilityPreset_candidateId_presetName_key" UNIQUE ("candidateId", "presetName");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobIntelligence_jobId_key') THEN
    ALTER TABLE "JobIntelligence" ADD CONSTRAINT "JobIntelligence_jobId_key" UNIQUE ("jobId");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FitScoringSnapshot_jobId_key') THEN
    ALTER TABLE "FitScoringSnapshot" ADD CONSTRAINT "FitScoringSnapshot_jobId_key" UNIQUE ("jobId");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'OpportunityPlan_jobId_key') THEN
    ALTER TABLE "OpportunityPlan" ADD CONSTRAINT "OpportunityPlan_jobId_key" UNIQUE ("jobId");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'UserCapabilityOverride_userId_permissionId_key') THEN
    ALTER TABLE "UserCapabilityOverride" ADD CONSTRAINT "UserCapabilityOverride_userId_permissionId_key" UNIQUE ("userId", "permissionId");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FeatureFlag_key_key') THEN
    ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_key_key" UNIQUE ("key");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Permission_resource_action_key') THEN
    ALTER TABLE "Permission" ADD CONSTRAINT "Permission_resource_action_key" UNIQUE ("resource", "action");
  END IF;
END $$;



-- ─── STAGE 7: FOREIGN KEYS ───────────────────────────────────────────────────

DO $$ BEGIN
  -- 7.1 JobIntelligence FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobIntelligence_jobId_fkey') THEN
    ALTER TABLE "JobIntelligence" ADD CONSTRAINT "JobIntelligence_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobIntelligence_candidateId_fkey') THEN
    ALTER TABLE "JobIntelligence" ADD CONSTRAINT "JobIntelligence_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.2 RequirementBreakdown FK
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'RequirementBreakdown_jobIntelligenceId_fkey') THEN
    ALTER TABLE "RequirementBreakdown" ADD CONSTRAINT "RequirementBreakdown_jobIntelligenceId_fkey" FOREIGN KEY ("jobIntelligenceId") REFERENCES "JobIntelligence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.3 BusinessProblem FK
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'BusinessProblem_jobIntelligenceId_fkey') THEN
    ALTER TABLE "BusinessProblem" ADD CONSTRAINT "BusinessProblem_jobIntelligenceId_fkey" FOREIGN KEY ("jobIntelligenceId") REFERENCES "JobIntelligence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.4 OperationalSignal FK
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'OperationalSignal_jobIntelligenceId_fkey') THEN
    ALTER TABLE "OperationalSignal" ADD CONSTRAINT "OperationalSignal_jobIntelligenceId_fkey" FOREIGN KEY ("jobIntelligenceId") REFERENCES "JobIntelligence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.5 StrengthEvidence FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'StrengthEvidence_candidateId_fkey') THEN
    ALTER TABLE "StrengthEvidence" ADD CONSTRAINT "StrengthEvidence_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'StrengthEvidence_jobId_fkey') THEN
    ALTER TABLE "StrengthEvidence" ADD CONSTRAINT "StrengthEvidence_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- 7.6 FitGap FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FitGap_candidateId_fkey') THEN
    ALTER TABLE "FitGap" ADD CONSTRAINT "FitGap_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FitGap_jobId_fkey') THEN
    ALTER TABLE "FitGap" ADD CONSTRAINT "FitGap_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.7 FitScoringSnapshot FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FitScoringSnapshot_candidateId_fkey') THEN
    ALTER TABLE "FitScoringSnapshot" ADD CONSTRAINT "FitScoringSnapshot_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FitScoringSnapshot_jobId_fkey') THEN
    ALTER TABLE "FitScoringSnapshot" ADD CONSTRAINT "FitScoringSnapshot_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.8 RoleFitAnalysis FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'RoleFitAnalysis_candidateId_fkey') THEN
    ALTER TABLE "RoleFitAnalysis" ADD CONSTRAINT "RoleFitAnalysis_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'RoleFitAnalysis_jobId_fkey') THEN
    ALTER TABLE "RoleFitAnalysis" ADD CONSTRAINT "RoleFitAnalysis_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.9 PatternLibraryEntry FK
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PatternLibraryEntry_candidateId_fkey') THEN
    ALTER TABLE "PatternLibraryEntry" ADD CONSTRAINT "PatternLibraryEntry_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.10 WorkflowExecution FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'WorkflowExecution_candidateId_fkey') THEN
    ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'WorkflowExecution_definitionId_fkey') THEN
    ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  -- 7.11 WorkflowStepExecution FK
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'WorkflowStepExecution_workflowId_fkey') THEN
    ALTER TABLE "WorkflowStepExecution" ADD CONSTRAINT "WorkflowStepExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "WorkflowExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.12 ApprovalRequest FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ApprovalRequest_workflowId_fkey') THEN
    ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "WorkflowExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ApprovalRequest_candidateId_fkey') THEN
    ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.13 OpportunityPlan FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'OpportunityPlan_candidateId_fkey') THEN
    ALTER TABLE "OpportunityPlan" ADD CONSTRAINT "OpportunityPlan_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'OpportunityPlan_jobId_fkey') THEN
    ALTER TABLE "OpportunityPlan" ADD CONSTRAINT "OpportunityPlan_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.14 WorkflowSchedule FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'WorkflowSchedule_candidateId_fkey') THEN
    ALTER TABLE "WorkflowSchedule" ADD CONSTRAINT "WorkflowSchedule_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'WorkflowSchedule_definitionId_fkey') THEN
    ALTER TABLE "WorkflowSchedule" ADD CONSTRAINT "WorkflowSchedule_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- 7.15 CRM Outreach FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'OutreachCampaign_jobId_fkey') THEN
    ALTER TABLE "OutreachCampaign" ADD CONSTRAINT "OutreachCampaign_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Outreach_campaignId_fkey') THEN
    ALTER TABLE "Outreach" ADD CONSTRAINT "Outreach_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "OutreachCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Outreach_contactId_fkey') THEN
    ALTER TABLE "Outreach" ADD CONSTRAINT "Outreach_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'RelationshipGraph_sourceContactId_fkey') THEN
    ALTER TABLE "RelationshipGraph" ADD CONSTRAINT "RelationshipGraph_sourceContactId_fkey" FOREIGN KEY ("sourceContactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'RelationshipGraph_targetContactId_fkey') THEN
    ALTER TABLE "RelationshipGraph" ADD CONSTRAINT "RelationshipGraph_targetContactId_fkey" FOREIGN KEY ("targetContactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  -- 7.16 Security & Overrides FKs
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'UserCapabilityOverride_permissionId_fkey') THEN
    ALTER TABLE "UserCapabilityOverride" ADD CONSTRAINT "UserCapabilityOverride_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.17 EventLog FK
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'EventLog_executionId_fkey') THEN
    ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  -- 7.18 Altered Tables FK extensions (AgentExecution)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'AgentExecution_jobId_fkey') THEN
    ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'AgentExecution_promptVersionId_fkey') THEN
    ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "PromptVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;


-- ─── STAGE 8: VERIFICATION BLOCK ─────────────────────────────────────────────

DO $$
DECLARE
  missing_table TEXT;
BEGIN
  -- 8.1 Verify Extended/New Enums exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkflowStatus') THEN
    RAISE EXCEPTION 'Verification Failed: WorkflowStatus enum type is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RoleArchetype') THEN
    RAISE EXCEPTION 'Verification Failed: RoleArchetype enum type is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContactType') THEN
    RAISE EXCEPTION 'Verification Failed: ContactType enum type is missing';
  END IF;

  -- 8.2 Verify all Tables exist
  FOR missing_table IN 
    SELECT unnest(ARRAY[
      'JobIntelligence', 'RequirementBreakdown', 'BusinessProblem', 'OperationalSignal',
      'StrengthEvidence', 'FitGap', 'FitScoringSnapshot', 'RoleFitAnalysis', 'PatternLibraryEntry',
      'WorkflowDefinition', 'WorkflowExecution', 'WorkflowStepExecution', 'ApprovalRequest',
      'OpportunityPlan', 'WorkflowSchedule', 'AiProviderConfig', 'UserCapabilityPreset',
      'TokenUsageLog', 'ModelHealthLog', 'OutreachCampaign', 'Outreach', 'RelationshipGraph',
      'UserCapabilityOverride', 'FeatureFlag', 'AuthorizationAuditLog', 'EngagementMetric',
      'PromptVersion', 'EventLog'
    ])
  LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = missing_table) THEN
      RAISE EXCEPTION 'Verification Failed: Table % is missing', missing_table;
    END IF;
  END LOOP;

  -- 8.3 Verify Column Extensions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'AgentExecution' AND column_name = 'promptVersionId') THEN
    RAISE EXCEPTION 'Verification Failed: AgentExecution promptVersionId column extension is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Contact' AND column_name = 'influenceScore') THEN
    RAISE EXCEPTION 'Verification Failed: Contact influenceScore column extension is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'UserRole' AND column_name = 'revokedBy') THEN
    RAISE EXCEPTION 'Verification Failed: UserRole revokedBy column extension is missing';
  END IF;
  
  RAISE NOTICE 'Migration alignment verification completed successfully. Schema is robust and stabilized.';
END $$;


-- ─── ROLLBACK GUIDANCE COMMENTS (FOR OPERATORS) ──────────────────────────────
-- In the event of a rollback, execute the following SQL statement blocks in order:
--
-- 1. Drop EventLog and ToolCall constraints
--    ALTER TABLE "EventLog" DROP CONSTRAINT IF EXISTS "EventLog_executionId_fkey";
--    ALTER TABLE "ToolCall" DROP CONSTRAINT IF EXISTS "ToolCall_executionId_fkey";
--
-- 2. Drop Role Intelligence constraints and tables
--    ALTER TABLE "RequirementBreakdown" DROP CONSTRAINT IF EXISTS "RequirementBreakdown_jobIntelligenceId_fkey";
--    ALTER TABLE "BusinessProblem" DROP CONSTRAINT IF EXISTS "BusinessProblem_jobIntelligenceId_fkey";
--    ALTER TABLE "OperationalSignal" DROP CONSTRAINT IF EXISTS "OperationalSignal_jobIntelligenceId_fkey";
--    ALTER TABLE "JobIntelligence" DROP CONSTRAINT IF EXISTS "JobIntelligence_jobId_fkey";
--    ALTER TABLE "JobIntelligence" DROP CONSTRAINT IF EXISTS "JobIntelligence_candidateId_fkey";
--    DROP TABLE IF EXISTS "RequirementBreakdown";
--    DROP TABLE IF EXISTS "BusinessProblem";
--    DROP TABLE IF EXISTS "OperationalSignal";
--    DROP TABLE IF EXISTS "JobIntelligence";
--    DROP TABLE IF EXISTS "StrengthEvidence";
--    DROP TABLE IF EXISTS "FitGap";
--    DROP TABLE IF EXISTS "FitScoringSnapshot";
--    DROP TABLE IF EXISTS "RoleFitAnalysis";
--    DROP TABLE IF EXISTS "PatternLibraryEntry";
--
-- 3. Drop Workflow Orchestration constraints and tables
--    ALTER TABLE "WorkflowStepExecution" DROP CONSTRAINT IF EXISTS "WorkflowStepExecution_workflowId_fkey";
--    ALTER TABLE "ApprovalRequest" DROP CONSTRAINT IF EXISTS "ApprovalRequest_workflowId_fkey";
--    ALTER TABLE "ApprovalRequest" DROP CONSTRAINT IF EXISTS "ApprovalRequest_candidateId_fkey";
--    ALTER TABLE "WorkflowExecution" DROP CONSTRAINT IF EXISTS "WorkflowExecution_definitionId_fkey";
--    ALTER TABLE "WorkflowExecution" DROP CONSTRAINT IF EXISTS "WorkflowExecution_candidateId_fkey";
--    ALTER TABLE "WorkflowSchedule" DROP CONSTRAINT IF EXISTS "WorkflowSchedule_definitionId_fkey";
--    ALTER TABLE "WorkflowSchedule" DROP CONSTRAINT IF EXISTS "WorkflowSchedule_candidateId_fkey";
--    ALTER TABLE "OpportunityPlan" DROP CONSTRAINT IF EXISTS "OpportunityPlan_jobId_fkey";
--    ALTER TABLE "OpportunityPlan" DROP CONSTRAINT IF EXISTS "OpportunityPlan_candidateId_fkey";
--    DROP TABLE IF EXISTS "WorkflowStepExecution";
--    DROP TABLE IF EXISTS "ApprovalRequest";
--    DROP TABLE IF EXISTS "WorkflowExecution";
--    DROP TABLE IF EXISTS "WorkflowDefinition";
--    DROP TABLE IF EXISTS "OpportunityPlan";
--    DROP TABLE IF EXISTS "WorkflowSchedule";
--
-- 4. Drop CRM outreach and Security Override constraints and tables
--    ALTER TABLE "Outreach" DROP CONSTRAINT IF EXISTS "Outreach_campaignId_fkey";
--    ALTER TABLE "Outreach" DROP CONSTRAINT IF EXISTS "Outreach_contactId_fkey";
--    ALTER TABLE "OutreachCampaign" DROP CONSTRAINT IF EXISTS "OutreachCampaign_jobId_fkey";
--    ALTER TABLE "RelationshipGraph" DROP CONSTRAINT IF EXISTS "RelationshipGraph_sourceContactId_fkey";
--    ALTER TABLE "RelationshipGraph" DROP CONSTRAINT IF EXISTS "RelationshipGraph_targetContactId_fkey";
--    ALTER TABLE "UserCapabilityOverride" DROP CONSTRAINT IF EXISTS "UserCapabilityOverride_permissionId_fkey";
--    DROP TABLE IF EXISTS "Outreach";
--    DROP TABLE IF EXISTS "OutreachCampaign";
--    DROP TABLE IF EXISTS "RelationshipGraph";
--    DROP TABLE IF EXISTS "UserCapabilityOverride";
--
-- 5. Drop AI Platform Evolution configurations
--    DROP TABLE IF EXISTS "AiProviderConfig";
--    DROP TABLE IF EXISTS "UserCapabilityPreset";
--    DROP TABLE IF EXISTS "TokenUsageLog";
--    DROP TABLE IF EXISTS "ModelHealthLog";
--    DROP TABLE IF EXISTS "PromptVersion";
--    DROP TABLE IF EXISTS "FeatureFlag";
--    DROP TABLE IF EXISTS "AuthorizationAuditLog";
--    DROP TABLE IF EXISTS "EngagementMetric";
--    DROP TABLE IF EXISTS "EventLog";
--
-- 6. Revert Added Columns on pre-existing Tables
--    ALTER TABLE "AgentExecution" 
--      DROP COLUMN IF EXISTS "jobId", DROP COLUMN IF EXISTS "queueJobId", DROP COLUMN IF EXISTS "currentTask",
--      DROP COLUMN IF EXISTS "progress", DROP COLUMN IF EXISTS "attempts", DROP COLUMN IF EXISTS "providerId",
--      DROP COLUMN IF EXISTS "requestId", DROP COLUMN IF EXISTS "correlationId", DROP COLUMN IF EXISTS "promptVersionId",
--      DROP COLUMN IF EXISTS "promptHash", DROP COLUMN IF EXISTS "modelId", DROP COLUMN IF EXISTS "provider",
--      DROP COLUMN IF EXISTS "fallbackUsed", DROP COLUMN IF EXISTS "fallbackReason", DROP COLUMN IF EXISTS "sanitizerVersion",
--      DROP COLUMN IF EXISTS "inputTokens", DROP COLUMN IF EXISTS "outputTokens", DROP COLUMN IF EXISTS "costUsd",
--      DROP COLUMN IF EXISTS "validationPassed", DROP COLUMN IF EXISTS "validationErrors", DROP COLUMN IF EXISTS "validationVersion",
--      DROP COLUMN IF EXISTS "schemaValidated", DROP COLUMN IF EXISTS "semanticValidated", DROP COLUMN IF EXISTS "policyValidated",
--      DROP COLUMN IF EXISTS "metadata";
--    ALTER TABLE "ToolCall" DROP COLUMN IF EXISTS "toolName", DROP COLUMN IF EXISTS "durationMs", DROP COLUMN IF EXISTS "tokens";
--    ALTER TABLE "Contact" 
--      DROP COLUMN IF EXISTS "contactType", DROP COLUMN IF EXISTS "recruiterType", DROP COLUMN IF EXISTS "influenceScore",
--      DROP COLUMN IF EXISTS "hiringAuthorityScore", DROP COLUMN IF EXISTS "outreachPriority", DROP COLUMN IF EXISTS "responseProbability",
--      DROP COLUMN IF EXISTS "linkedinConnectionDegree", DROP COLUMN IF EXISTS "mutualConnections", DROP COLUMN IF EXISTS "discoveryMetadata",
--      DROP COLUMN IF EXISTS "lastInteractionAt", DROP COLUMN IF EXISTS "lastReplyAt";
--    ALTER TABLE "Role" DROP COLUMN IF EXISTS "roleType", DROP COLUMN IF EXISTS "immutableSystemRole", DROP COLUMN IF EXISTS "priority", DROP COLUMN IF EXISTS "environmentScope", DROP COLUMN IF EXISTS "metadata";
--    ALTER TABLE "Permission" DROP COLUMN IF EXISTS "systemProtected", DROP COLUMN IF EXISTS "updatedAt";
--    ALTER TABLE "UserRole" DROP COLUMN IF EXISTS "revokedBy", DROP COLUMN IF EXISTS "justification", DROP COLUMN IF EXISTS "isActive", DROP COLUMN IF EXISTS "revokedAt";
--
-- 7. Drop enums (Note: PostgreSQL does not support type value dropping natively)
--    DROP TYPE IF EXISTS "WorkflowStatus";
--    DROP TYPE IF EXISTS "StepStatus";
--    DROP TYPE IF EXISTS "StepType";
--    DROP TYPE IF EXISTS "ApprovalDecision";
--    DROP TYPE IF EXISTS "ApprovalActionType";
--    DROP TYPE IF EXISTS "ScheduleTriggerType";
--    DROP TYPE IF EXISTS "RoleArchetype";
--    DROP TYPE IF EXISTS "GapClassification";
--    DROP TYPE IF EXISTS "FitDimension";
--    DROP TYPE IF EXISTS "PatternCategory";
--    DROP TYPE IF EXISTS "ContactType";
--    DROP TYPE IF EXISTS "RecruiterType";
--    DROP TYPE IF EXISTS "OutreachChannel";
--    DROP TYPE IF EXISTS "OutreachStatus";
--    DROP TYPE IF EXISTS "OutreachCampaignStatus";
--    DROP TYPE IF EXISTS "RelationshipStrength";
--    DROP TYPE IF EXISTS "RoleType";
--    DROP TYPE IF EXISTS "CapabilityEffect";
--    DROP TYPE IF EXISTS "RolloutStrategy";
