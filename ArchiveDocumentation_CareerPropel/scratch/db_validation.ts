/**
 * WARNING: NOT FOR PRODUCTION USE
 * THIS IS A RETAINED SCRATCH/EXPERIMENTAL FILE RELOCATED OUTSIDE THE RUNTIME TREE.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING JSON DATABASE STATE VALIDATION ---\n');

  // 1. Verify table existence
  const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('AgentExecution', 'ToolCall', 'EventLog', 'PromptVersion', 'Job')`
  );

  // 2. Check AgentExecution columns
  const agentExecutionCols = await prisma.$queryRawUnsafe<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }[]>(
    `SELECT column_name, data_type, is_nullable, column_default 
     FROM information_schema.columns 
     WHERE table_name = 'AgentExecution' 
     ORDER BY column_name`
  );

  // 3. Check ToolCall columns
  const toolCallCols = await prisma.$queryRawUnsafe<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }[]>(
    `SELECT column_name, data_type, is_nullable, column_default 
     FROM information_schema.columns 
     WHERE table_name = 'ToolCall' 
     ORDER BY column_name`
  );

  // 4. Check EventLog columns
  const eventLogCols = await prisma.$queryRawUnsafe<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }[]>(
    `SELECT column_name, data_type, is_nullable, column_default 
     FROM information_schema.columns 
     WHERE table_name = 'EventLog' 
     ORDER BY column_name`
  );

  // 5. Check PromptVersion columns
  const promptVersionCols = await prisma.$queryRawUnsafe<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }[]>(
    `SELECT column_name, data_type, is_nullable, column_default 
     FROM information_schema.columns 
     WHERE table_name = 'PromptVersion' 
     ORDER BY column_name`
  );

  // 6. Inspect Indexes
  const indexes = await prisma.$queryRawUnsafe<{
    tablename: string;
    indexname: string;
    indexdef: string;
  }[]>(
    `SELECT tablename, indexname, indexdef 
     FROM pg_indexes 
     WHERE schemaname = 'public' 
     AND tablename IN ('AgentExecution', 'ToolCall', 'EventLog', 'PromptVersion') 
     ORDER BY tablename, indexname`
  );

  // 7. Inspect Foreign Keys
  const foreignKeys = await prisma.$queryRawUnsafe<{
    constraint_name: string;
    table_name: string;
    column_name: string;
    foreign_table_name: string;
    foreign_column_name: string;
  }[]>(
    `SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
     FROM information_schema.table_constraints AS tc 
     JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY' 
     AND tc.table_schema = 'public'
     AND tc.table_name IN ('AgentExecution', 'ToolCall', 'EventLog', 'PromptVersion')`
  );

  const results = {
    tables,
    agentExecutionCols,
    toolCallCols,
    eventLogCols,
    promptVersionCols,
    indexes,
    foreignKeys,
  };

  const outputPath = path.join(__dirname, 'validation_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Successfully wrote validation results to ${outputPath}`);
}

main()
  .catch((e) => {
    console.error('Error during validation execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
