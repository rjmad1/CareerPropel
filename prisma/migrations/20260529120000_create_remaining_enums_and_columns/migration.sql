-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ExecutionSource" AS ENUM ('cron', 'queue', 'retry', 'fallback', 'manual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "InterruptionReason" AS ENUM ('deploy_shutdown', 'stall_detected', 'heartbeat_timeout');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "FailureClassification" AS ENUM ('provider_error', 'timeout', 'cost_ceiling', 'validation_error');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "DeploymentEnvironment" AS ENUM ('staging', 'production');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- DropForeignKey
ALTER TABLE "AgentExecution" DROP CONSTRAINT "AgentExecution_jobId_fkey";

-- DropForeignKey
ALTER TABLE "MockInterviewSession" DROP CONSTRAINT "MockInterviewSession_jobId_fkey";

-- DropIndex
DROP INDEX "AgentExecution_agentType_createdAt_idx";

-- DropIndex
DROP INDEX "EventLog_executionId_timestamp_idx";

-- DropIndex
DROP INDEX "EventLog_level_timestamp_idx";

-- DropIndex
DROP INDEX "PromptVersion_agentType_isActive_idx";

-- DropIndex
DROP INDEX "ToolCall_toolName_idx";

-- AlterTable
ALTER TABLE "Accomplishment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AccomplishmentBankItem" ALTER COLUMN "associatedSkills" DROP DEFAULT,
ALTER COLUMN "associatedRoles" DROP DEFAULT,
ALTER COLUMN "associatedTools" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AgentExecution" ADD COLUMN     "actualCost" DOUBLE PRECISION,
ADD COLUMN     "deploymentEnvironment" "DeploymentEnvironment",
ADD COLUMN     "deploymentSha" TEXT,
ADD COLUMN     "deploymentTimestamp" TIMESTAMP(3),
ADD COLUMN     "deploymentVersion" TEXT,
ADD COLUMN     "estimatedCost" DOUBLE PRECISION,
ADD COLUMN     "executionSource" "ExecutionSource",
ADD COLUMN     "failureClassification" "FailureClassification",
ADD COLUMN     "interruptedAt" TIMESTAMP(3),
ADD COLUMN     "interruptionReason" "InterruptionReason",
ADD COLUMN     "latencyMs" INTEGER,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "previousDeploymentVersion" TEXT,
ADD COLUMN     "queuedAt" TIMESTAMP(3),
ADD COLUMN     "railwayServiceId" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "retryLineage" JSONB,
ADD COLUMN     "tokenUsage" JSONB,
ADD COLUMN     "workerId" TEXT;

-- AlterTable
ALTER TABLE "AiProviderConfig" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AppraisalSession" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ApprovalRequest" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "FeatureFlag" ALTER COLUMN "allowedUserIds" DROP DEFAULT,
ALTER COLUMN "allowedRoles" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "FitGap" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "FitScoringSnapshot" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "calendarEventId" TEXT,
ADD COLUMN     "meetingLink" TEXT;

-- AlterTable
ALTER TABLE "JobIntelligence" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KeywordAlignmentAudit" ALTER COLUMN "requiredKeywords" DROP DEFAULT,
ALTER COLUMN "preferredKeywords" DROP DEFAULT,
ALTER COLUMN "titleKeywords" DROP DEFAULT,
ALTER COLUMN "toolKeywords" DROP DEFAULT,
ALTER COLUMN "domainKeywords" DROP DEFAULT,
ALTER COLUMN "actionVerbKeywords" DROP DEFAULT,
ALTER COLUMN "matchedKeywords" DROP DEFAULT,
ALTER COLUMN "missingKeywords" DROP DEFAULT,
ALTER COLUMN "overusedKeywords" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MockInterviewSession" ALTER COLUMN "strengths" DROP DEFAULT,
ALTER COLUMN "areasForImprovement" DROP DEFAULT,
ALTER COLUMN "suggestions" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OpportunityPlan" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Outreach" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OutreachCampaign" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ParserValidationReport" ALTER COLUMN "warnings" DROP DEFAULT,
ALTER COLUMN "errors" DROP DEFAULT,
ALTER COLUMN "recommendations" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PatternLibraryEntry" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Permission" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PromptVersion" ALTER COLUMN "capability" DROP DEFAULT,
ALTER COLUMN "template" DROP DEFAULT,
ALTER COLUMN "preprocessingVersion" DROP DEFAULT,
ALTER COLUMN "sanitizerVersion" DROP DEFAULT,
ALTER COLUMN "outputSchemaVersion" DROP DEFAULT,
ALTER COLUMN "canaryPercent" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "RelationshipGraph" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StrengthEvidence" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserCapabilityOverride" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserCapabilityPreset" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WorkflowDefinition" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WorkflowExecution" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WorkflowSchedule" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WorkflowStepExecution" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ProductFunnelMetric" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "funnel" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFunnelMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarToken" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "encryptionVersion" INTEGER NOT NULL DEFAULT 1,
    "encryptionKeyId" TEXT NOT NULL DEFAULT 'primary',
    "migratedAt" TIMESTAMP(3),
    "isLegacy" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CalendarToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "meetingUrl" TEXT,
    "jobId" TEXT,
    "interviewId" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobImport" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "rawData" JSONB NOT NULL,
    "imported" BOOLEAN NOT NULL DEFAULT false,
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionEventLedger" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "traceId" TEXT,
    "spanId" TEXT,
    "correlationId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replayable" BOOLEAN NOT NULL DEFAULT true,
    "sourceRuntime" TEXT NOT NULL,

    CONSTRAINT "ExecutionEventLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductFunnelMetric_emailHash_idx" ON "ProductFunnelMetric"("emailHash");

-- CreateIndex
CREATE INDEX "ProductFunnelMetric_funnel_idx" ON "ProductFunnelMetric"("funnel");

-- CreateIndex
CREATE INDEX "ProductFunnelMetric_step_idx" ON "ProductFunnelMetric"("step");

-- CreateIndex
CREATE INDEX "ProductFunnelMetric_status_idx" ON "ProductFunnelMetric"("status");

-- CreateIndex
CREATE INDEX "CalendarToken_candidateId_idx" ON "CalendarToken"("candidateId");

-- CreateIndex
CREATE INDEX "CalendarToken_isLegacy_idx" ON "CalendarToken"("isLegacy");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarToken_candidateId_provider_key" ON "CalendarToken"("candidateId", "provider");

-- CreateIndex
CREATE INDEX "CalendarEvent_candidateId_idx" ON "CalendarEvent"("candidateId");

-- CreateIndex
CREATE INDEX "CalendarEvent_startAt_idx" ON "CalendarEvent"("startAt");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_candidateId_externalId_provider_key" ON "CalendarEvent"("candidateId", "externalId", "provider");

-- CreateIndex
CREATE INDEX "JobImport_candidateId_idx" ON "JobImport"("candidateId");

-- CreateIndex
CREATE INDEX "JobImport_source_idx" ON "JobImport"("source");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionEventLedger_eventId_key" ON "ExecutionEventLedger"("eventId");

-- CreateIndex
CREATE INDEX "ExecutionEventLedger_executionId_idx" ON "ExecutionEventLedger"("executionId");

-- CreateIndex
CREATE INDEX "ExecutionEventLedger_correlationId_idx" ON "ExecutionEventLedger"("correlationId");

-- CreateIndex
CREATE INDEX "ExecutionEventLedger_timestamp_idx" ON "ExecutionEventLedger"("timestamp");

-- CreateIndex
CREATE INDEX "ExecutionEventLedger_eventType_idx" ON "ExecutionEventLedger"("eventType");

-- CreateIndex
CREATE INDEX "AgentExecution_executionSource_idx" ON "AgentExecution"("executionSource");

-- CreateIndex
CREATE INDEX "AgentExecution_queuedAt_idx" ON "AgentExecution"("queuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_name_key" ON "WorkflowDefinition"("name");

-- AddForeignKey
ALTER TABLE "CalendarToken" ADD CONSTRAINT "CalendarToken_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobImport" ADD CONSTRAINT "JobImport_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
