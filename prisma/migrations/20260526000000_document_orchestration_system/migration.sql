-- Reconstructed DDL for 20260526000000_document_orchestration_system
-- All statements are safe and idempotent

-- Create Enums
DO $$ BEGIN
  CREATE TYPE "ParserStatus" AS ENUM ('pending', 'passed', 'failed', 'warning');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ExportFormat" AS ENUM ('markdown', 'docx', 'pdf', 'html');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PackageStatus" AS ENUM ('draft', 'audit_pending', 'audit_passed', 'audit_failed', 'finalized', 'submitted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create Tables
CREATE TABLE IF NOT EXISTS "AccomplishmentBankItem" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "metric" TEXT,
  "evidence" TEXT,
  "category" TEXT NOT NULL,
  "function" TEXT,
  "industry" TEXT,
  "domain" TEXT,
  "competency" TEXT,
  "operationalScale" TEXT,
  "associatedSkills" TEXT[] NOT NULL DEFAULT '{}',
  "associatedRoles" TEXT[] NOT NULL DEFAULT '{}',
  "associatedTools" TEXT[] NOT NULL DEFAULT '{}',
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "sourceAccomplishmentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AccomplishmentBankItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ResumeVariant" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "jobId" TEXT,
  "targetRole" TEXT NOT NULL,
  "targetIndustry" TEXT,
  "targetCompany" TEXT,
  "variantName" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "atsScore" DOUBLE PRECISION,
  "keywordCoverage" DOUBLE PRECISION,
  "recruiterOptimizationScore" DOUBLE PRECISION,
  "topThirdScore" DOUBLE PRECISION,
  "bulletQualityScore" DOUBLE PRECISION,
  "generatedFromProfileVersion" TEXT,
  "promptVersion" TEXT,
  "aiModel" TEXT,
  "generationCostUsd" DOUBLE PRECISION,
  "parserValidationStatus" "ParserStatus" NOT NULL DEFAULT 'pending',
  "parserReportId" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "isCurrent" BOOLEAN NOT NULL DEFAULT true,
  "parentVariantId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResumeVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "KeywordAlignmentAudit" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "resumeVariantId" TEXT,
  "jobId" TEXT,
  "jobTitle" TEXT,
  "jobDescriptionHash" TEXT,
  "jobDescriptionText" TEXT,
  "requiredKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "preferredKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "titleKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "toolKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "domainKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "actionVerbKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "matchedKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "missingKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "overusedKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "synonymizedKeywords" JSONB,
  "coverageScore" DOUBLE PRECISION,
  "exactMatchRate" DOUBLE PRECISION,
  "synonymPenalty" DOUBLE PRECISION,
  "auditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "KeywordAlignmentAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ParserValidationReport" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "headingRecognition" "ParserStatus" NOT NULL DEFAULT 'pending',
  "chronologyExtraction" "ParserStatus" NOT NULL DEFAULT 'pending',
  "keywordExtraction" "ParserStatus" NOT NULL DEFAULT 'pending',
  "sectionDetection" "ParserStatus" NOT NULL DEFAULT 'pending',
  "dateParsing" "ParserStatus" NOT NULL DEFAULT 'pending',
  "contactParsing" "ParserStatus" NOT NULL DEFAULT 'pending',
  "overallStatus" "ParserStatus" NOT NULL DEFAULT 'pending',
  "warnings" TEXT[] NOT NULL DEFAULT '{}',
  "errors" TEXT[] NOT NULL DEFAULT '{}',
  "recommendations" TEXT[] NOT NULL DEFAULT '{}',
  "testedContent" TEXT,
  "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ParserValidationReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApplicationPackage" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "jobId" TEXT,
  "packageName" TEXT NOT NULL,
  "targetRole" TEXT NOT NULL,
  "targetCompany" TEXT,
  "status" "PackageStatus" NOT NULL DEFAULT 'draft',
  "atsAuditResult" JSONB,
  "consistencyAuditResult" JSONB,
  "recruiterAuditResult" JSONB,
  "governanceAuditResult" JSONB,
  "finalizedAt" TIMESTAMP(3),
  "exportFormat" "ExportFormat" NOT NULL DEFAULT 'markdown',
  "exportUrl" TEXT,
  "profileVersionHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ApplicationPackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApplicationPackageItem" (
  "id" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "itemType" TEXT NOT NULL,
  "resumeVariantId" TEXT,
  "documentId" TEXT,
  "content" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ApplicationPackageItem_pkey" PRIMARY KEY ("id")
);

-- Indices
CREATE INDEX IF NOT EXISTS "AccomplishmentBankItem_candidateId_idx" ON "AccomplishmentBankItem"("candidateId");
CREATE INDEX IF NOT EXISTS "AccomplishmentBankItem_category_idx" ON "AccomplishmentBankItem"("category");
CREATE INDEX IF NOT EXISTS "AccomplishmentBankItem_function_idx" ON "AccomplishmentBankItem"("function");

CREATE INDEX IF NOT EXISTS "ResumeVariant_candidateId_idx" ON "ResumeVariant"("candidateId");
CREATE INDEX IF NOT EXISTS "ResumeVariant_jobId_idx" ON "ResumeVariant"("jobId");
CREATE INDEX IF NOT EXISTS "ResumeVariant_targetRole_idx" ON "ResumeVariant"("targetRole");
CREATE INDEX IF NOT EXISTS "ResumeVariant_isCurrent_idx" ON "ResumeVariant"("isCurrent");

CREATE INDEX IF NOT EXISTS "KeywordAlignmentAudit_candidateId_idx" ON "KeywordAlignmentAudit"("candidateId");
CREATE INDEX IF NOT EXISTS "KeywordAlignmentAudit_resumeVariantId_idx" ON "KeywordAlignmentAudit"("resumeVariantId");
CREATE INDEX IF NOT EXISTS "KeywordAlignmentAudit_jobId_idx" ON "KeywordAlignmentAudit"("jobId");

CREATE INDEX IF NOT EXISTS "ParserValidationReport_candidateId_idx" ON "ParserValidationReport"("candidateId");
CREATE INDEX IF NOT EXISTS "ParserValidationReport_overallStatus_idx" ON "ParserValidationReport"("overallStatus");

CREATE INDEX IF NOT EXISTS "ApplicationPackage_candidateId_idx" ON "ApplicationPackage"("candidateId");
CREATE INDEX IF NOT EXISTS "ApplicationPackage_jobId_idx" ON "ApplicationPackage"("jobId");
CREATE INDEX IF NOT EXISTS "ApplicationPackage_status_idx" ON "ApplicationPackage"("status");

CREATE INDEX IF NOT EXISTS "ApplicationPackageItem_packageId_idx" ON "ApplicationPackageItem"("packageId");
CREATE INDEX IF NOT EXISTS "ApplicationPackageItem_resumeVariantId_idx" ON "ApplicationPackageItem"("resumeVariantId");

-- Foreign Key Constraints
DO $$ BEGIN
  ALTER TABLE "AccomplishmentBankItem"
    ADD CONSTRAINT "AccomplishmentBankItem_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ResumeVariant"
    ADD CONSTRAINT "ResumeVariant_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ResumeVariant"
    ADD CONSTRAINT "ResumeVariant_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ResumeVariant"
    ADD CONSTRAINT "ResumeVariant_parserReportId_fkey"
    FOREIGN KEY ("parserReportId") REFERENCES "ParserValidationReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "KeywordAlignmentAudit"
    ADD CONSTRAINT "KeywordAlignmentAudit_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "KeywordAlignmentAudit"
    ADD CONSTRAINT "KeywordAlignmentAudit_resumeVariantId_fkey"
    FOREIGN KEY ("resumeVariantId") REFERENCES "ResumeVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ParserValidationReport"
    ADD CONSTRAINT "ParserValidationReport_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ApplicationPackage"
    ADD CONSTRAINT "ApplicationPackage_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ApplicationPackageItem"
    ADD CONSTRAINT "ApplicationPackageItem_packageId_fkey"
    FOREIGN KEY ("packageId") REFERENCES "ApplicationPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ApplicationPackageItem"
    ADD CONSTRAINT "ApplicationPackageItem_resumeVariantId_fkey"
    FOREIGN KEY ("resumeVariantId") REFERENCES "ResumeVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
