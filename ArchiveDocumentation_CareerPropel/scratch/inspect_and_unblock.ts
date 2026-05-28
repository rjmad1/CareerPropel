/**
 * WARNING: NOT FOR PRODUCTION USE
 * THIS IS A RETAINED SCRATCH/EXPERIMENTAL FILE RELOCATED OUTSIDE THE RUNTIME TREE.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

// Manually parse .env file to load DATABASE_URL
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      const dbUrl = trimmed.split('DATABASE_URL=')[1].trim().replace(/"/g, '');
      process.env.DATABASE_URL = dbUrl;
      console.log("Successfully loaded DATABASE_URL from .env");
      break;
    }
  }
}

const prisma = new PrismaClient();

// List of brand new stabilization tables introduced in 20260529000000_stabilization_and_orchestration
const STABILIZATION_TABLES = [
  'JobIntelligence',
  'RequirementBreakdown',
  'BusinessProblem',
  'OperationalSignal',
  'StrengthEvidence',
  'FitGap',
  'FitScoringSnapshot',
  'RoleFitAnalysis',
  'PatternLibraryEntry',
  'WorkflowDefinition',
  'WorkflowExecution',
  'WorkflowStepExecution',
  'ApprovalRequest',
  'OpportunityPlan',
  'WorkflowSchedule',
  'OutreachCampaign',
  'Outreach',
  'RelationshipGraph',
  'UserCapabilityOverride',
  'FeatureFlag',
  'AuthorizationAuditLog',
  'EngagementMetric',
  'PromptVersion',
  'EventLog',
  'AiProviderConfig',
  'UserCapabilityPreset',
  'TokenUsageLog',
  'ModelHealthLog'
];

async function main() {
  console.log("Starting database cleanup of transient stabilization tables...");

  // Drop transient tables if they exist in the database (CASCADE) to allow a clean migration run
  for (const tableName of STABILIZATION_TABLES) {
    const checkTable: any[] = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = '${tableName}'
    `);
    
    if (checkTable.length > 0) {
      console.log(`Transient table "${tableName}" exists. Dropping CASCADE...`);
      await prisma.$executeRawUnsafe(`DROP TABLE "${tableName}" CASCADE`);
      console.log(`Transient table "${tableName}" dropped successfully.`);
    }
  }

  // Pre-create RoleArchetype enum if missing (needed for clean table re-creation)
  console.log("Ensuring RoleArchetype enum exists...");
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "RoleArchetype" AS ENUM (
        'BUILDER', 'OPERATOR', 'STRATEGIST', 'MAINTAINER', 'OPTIMIZER', 'RESEARCHER', 'EXECUTOR', 
        'PROCESS_SCALER', 'SYSTEMS_INTEGRATOR', 'CUSTOMER_FACING_TRANSLATOR', 'TECHNICAL_LEAD', 'TRANSFORMATION_DRIVER'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);

  console.log("Database cleanup and unblocking completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
