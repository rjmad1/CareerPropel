import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../src/lib/db';
import { createRedisClient } from '../src/lib/redis/redisClient';
import { verifyRuntimeCompatibility } from '../src/lib/runtime/compatibility';

interface LinkCheckResult {
  file: string;
  brokenLinks: { link: string; absolutePath: string }[];
}

async function runCommand(cmd: string): Promise<{ success: boolean; output: string }> {
  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output };
  } catch (err: any) {
    return { success: false, output: err.stdout || err.stderr || err.message };
  }
}

function findMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== 'ArchiveDocumentation_CareerPropel') {
        findMarkdownFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function verifyMarkdownLinks(workspaceDir: string): LinkCheckResult[] {
  const mdFiles = findMarkdownFiles(workspaceDir);
  const results: LinkCheckResult[] = [];

  // Match standard markdown links: [text](link)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const file of mdFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    const brokenLinks: { link: string; absolutePath: string }[] = [];

    while ((match = linkRegex.exec(content)) !== null) {
      const link = match[2].trim();

      // Skip external links, mailto links, hashes, or special uri protocols
      if (
        link.startsWith('http://') ||
        link.startsWith('https://') ||
        link.startsWith('mailto:') ||
        link.startsWith('#') ||
        link.startsWith('gitnexus://') ||
        link.startsWith('file://')
      ) {
        continue;
      }

      // Clean up query params or hash targets in the relative path (e.g. file.md#L10)
      const relativePathOnly = link.split('#')[0].split('?')[0];
      if (!relativePathOnly) continue;

      const fileDir = path.dirname(file);
      const targetAbsPath = path.resolve(fileDir, relativePathOnly);

      if (!fs.existsSync(targetAbsPath)) {
        brokenLinks.push({ link, absolutePath: targetAbsPath });
      }
    }

    if (brokenLinks.length > 0) {
      results.push({ file: path.relative(workspaceDir, file), brokenLinks });
    }
  }

  return results;
}

function loadEnvFiles() {
  const envPaths = ['.env.local', '.env'];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(__dirname, '..', envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const firstEquals = trimmed.indexOf('=');
          const key = trimmed.slice(0, firstEquals).trim();
          let val = trimmed.slice(firstEquals + 1).trim();
          // Strip surrounding quotes
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

async function main() {
  console.log('=====================================================');
  console.log('🚀 RUNNING PRE-DEPLOYMENT CERTIFICATION GATES...');
  console.log('=====================================================');

  loadEnvFiles();

  const timestamp = new Date().toISOString();
  const certificationReportPath = path.resolve(__dirname, '../PRE_DEPLOYMENT_CERTIFICATION.md');
  const workspaceRoot = path.resolve(__dirname, '..');

  const report = {
    timestamp,
    nodeVersion: process.version,
    envVarsValid: false,
    prismaValid: false,
    prismaMigrationStatus: 'unknown',
    databaseConnection: false,
    redisConnection: false,
    runtimeCompatibility: false,
    brokenLinks: [] as LinkCheckResult[],
    issues: [] as string[],
  };

  // 1. Validate Environment Variables
  const requiredEnv = ['DATABASE_URL', 'REDIS_URL', 'NEXTAUTH_SECRET', 'ANTHROPIC_API_KEY'];
  const missingEnv = requiredEnv.filter((env) => !process.env[env]);
  if (missingEnv.length === 0) {
    report.envVarsValid = true;
    console.log('✅ Environment variables validated.');
  } else {
    report.issues.push(`[ENV] Missing critical environment variables: ${missingEnv.join(', ')}`);
    console.error(`❌ Env validation failed. Missing: ${missingEnv.join(', ')}`);
  }

  // 2. Validate Prisma Schema Alignment
  console.log('⏳ Validating Prisma Schema...');
  const prismaValidate = await runCommand('npx prisma validate');
  if (prismaValidate.success) {
    report.prismaValid = true;
    console.log('✅ Prisma Schema is valid.');
  } else {
    report.issues.push(`[PRISMA_VALIDATE] Schema validation failed:\n${prismaValidate.output}`);
    console.error('❌ Prisma Schema validation failed.');
  }

  // 3. Validate Prisma Migration Status & Drift Check
  console.log('⏳ Checking Database Migration Status and Drift...');
  const prismaMigrateStatus = await runCommand('npx prisma migrate status');
  const prismaDiff = await runCommand('npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma');
  
  const isMigrated = prismaMigrateStatus.success && prismaMigrateStatus.output.includes('Database is up to date');
  const noDrift = prismaDiff.success && prismaDiff.output.includes('No difference detected');
  
  report.prismaMigrationStatus = `Prisma Migrate Status Success: ${prismaMigrateStatus.success}\nPrisma Diff: ${prismaDiff.output.trim()}`;
  
  if (isMigrated) {
    console.log('✅ Database is up to date with migrations.');
  } else if (noDrift) {
    console.log('✅ Database schema has no physical drift with schema.prisma (verified via migration diff).');
  } else {
    report.issues.push(`[PRISMA_MIGRATION] Migration drift detected:\n${prismaDiff.output}\nMigration status:\n${prismaMigrateStatus.output}`);
    console.error('❌ Database schema drift detected.');
  }

  // 4. Verify Database Connection & Runtime Compatibility
  try {
    console.log('⏳ Verifying Database Connection and Schema Compatibility...');
    const compReport = await verifyRuntimeCompatibility();
    report.databaseConnection = compReport.checks.databaseSchema;
    report.runtimeCompatibility = compReport.compatible;
    if (compReport.compatible) {
      console.log('✅ Database connection & runtime compatibility verified.');
    } else {
      compReport.errors.forEach((err) => report.issues.push(`[COMPATIBILITY] ${err}`));
      console.error('❌ Runtime compatibility checks failed.');
    }
  } catch (err: any) {
    report.issues.push(`[DB_CONNECTION] Failed to run compatibility verifier: ${err.message}`);
    console.error('❌ Database connection check crashed.');
  }

  // 5. Verify Redis Connection
  let redisClient;
  try {
    console.log('⏳ Verifying Redis Connectivity...');
    redisClient = createRedisClient('career-propel:pre-deploy-test');
    const pingRes = await redisClient.ping();
    if (pingRes === 'PONG') {
      report.redisConnection = true;
      console.log('✅ Redis connected successfully.');
    } else {
      report.issues.push(`[REDIS] Unexpected ping response: ${pingRes}`);
      console.error('❌ Redis verification failed.');
    }
  } catch (err: any) {
    report.issues.push(`[REDIS] Connectivity check failed: ${err.message}`);
    console.error('❌ Redis connectivity check failed.');
  } finally {
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch {}
    }
  }

  // 6. Automated Link Checking
  console.log('⏳ Scanning Markdown Documentation Links...');
  report.brokenLinks = verifyMarkdownLinks(workspaceRoot);
  if (report.brokenLinks.length === 0) {
    console.log('✅ Documentation link check passed. 0 broken links.');
  } else {
    report.brokenLinks.forEach((res) => {
      res.brokenLinks.forEach((link) => {
        report.issues.push(`[LINK_CHECK] Broken link in ${res.file}: "${link.link}" (Expected path: ${link.absolutePath})`);
      });
    });
    console.warn(`⚠️ Link check failed. Found ${report.brokenLinks.length} files with broken links.`);
  }

  // 7. Write Certification Report
  const passed = report.issues.length === 0;
  const statusColor = passed ? '🟢 PASSED' : '🔴 FAILED';

  let brokenLinksSummary = '✅ No broken references found.';
  if (report.brokenLinks.length > 0) {
    brokenLinksSummary = report.brokenLinks
      .map(
        (res) =>
          `* **${res.file}**:\n` +
          res.brokenLinks.map((bl) => `  * Broken reference: \`${bl.link}\` (Target absolute path: \`${bl.absolutePath}\`)`).join('\n')
      )
      .join('\n');
  }

  let issuesList = '* ✅ No blocking issues detected.';
  if (report.issues.length > 0) {
    issuesList = report.issues.map((issue) => `* ${issue}`).join('\n');
  }

  const certificateMarkdown = `# Pre-Deployment Certification Report

* **Timestamp**: \`${report.timestamp}\`
* **Node version**: \`${report.nodeVersion}\`
* **Overall Status**: **${statusColor}**

---

## Gates Overview

| Gate | Status | Description |
|---|---|---|
| Environment Configuration | ${report.envVarsValid ? '🟢 VALID' : '🔴 INVALID'} | Checks for presence of all required environment keys |
| Prisma Schema Structure | ${report.prismaValid ? '🟢 VALID' : '🔴 INVALID'} | Runs \`npx prisma validate\` to check schema integrity |
| Database Connection | ${report.databaseConnection ? '🟢 STABLE' : '🔴 OFFLINE'} | Querying postgres to confirm database connection and ledger |
| Redis Connection | ${report.redisConnection ? '🟢 STABLE' : '🔴 OFFLINE'} | Ping Redis server to check status |
| Runtime Compatibility | ${report.runtimeCompatibility ? '🟢 COMPATIBLE' : '🔴 DRIFT DETECTED'} | Checks Node version bounds and serialization schemas |
| Documentation Reference Integrity | ${report.brokenLinks.length === 0 ? '🟢 0 BROKEN LINKS' : '⚠️ BROKEN LINKS DETECTED'} | Verifies local Markdown files have valid relative links |

---

## Detected Issues & Warnings
${issuesList}

---

## Markdown Reference Scan Results
${brokenLinksSummary}

---

*Report generated by: \`scripts/pre-deployment-certification.ts\`*
`;

  fs.writeFileSync(certificationReportPath, certificateMarkdown, 'utf8');
  console.log(`\n📄 Pre-deployment certification report written to ${certificationReportPath}`);
  console.log(`Certification Result: ${statusColor}\n`);

  if (!passed) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal pre-deployment check crash:', err);
  process.exit(1);
});
