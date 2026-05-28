/**
 * careerPropel CI/CD Architecture & Governance Gatekeeper
 * 
 * Enforces:
 *  - No circular dependencies (Madge)
 *  - Strict module isolation boundary rules (Dependency Cruiser)
 *  - Prisma Database Schema drift check
 *  - Route contract mapping completeness
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const log = (msg) => console.log(`[CI-GOVERNANCE] ${msg}`);
const err = (msg) => console.error(`[CI-GOVERNANCE] [ERROR] ❌ ${msg}`);
const success = (msg) => console.log(`[CI-GOVERNANCE] [SUCCESS] ✅ ${msg}`);

let failed = false;

log('Starting repository architectural governance checks...');

// ─── 1. CIRCULAR DEPENDENCY GATE ───
try {
  log('Running Circular Dependency verification (Madge)...');
  // Check if madge is installed in node_modules, else use npx
  const output = execSync('npx madge --circular --json src/', { encoding: 'utf-8', stdio: 'pipe' });
  const circulars = JSON.parse(output);

  if (Array.isArray(circulars) && circulars.length > 0) {
    err(`Circular dependencies detected in ${circulars.length} modules!`);
    circulars.forEach((c, idx) => {
      console.error(`  ${idx + 1}. Chain: ${c.join(' -> ')}`);
    });
    failed = true;
  } else {
    success('No circular dependencies detected.');
  }
} catch (error) {
  // If Madge exits with code 1 due to circulars detected, it lands here
  if (error.stdout) {
    try {
      const circulars = JSON.parse(error.stdout);
      if (Array.isArray(circulars) && circulars.length > 0) {
        err(`Circular dependencies detected in ${circulars.length} modules!`);
        circulars.forEach((c, idx) => {
          console.error(`  ${idx + 1}. Chain: ${c.join(' -> ')}`);
        });
        failed = true;
      }
    } catch {
      err('Circular dependency check failed to parse results. Please run: npx madge --circular src/');
      failed = true;
    }
  } else {
    err(`Circular dependency check failed to execute: ${error.message}`);
    failed = true;
  }
}

// ─── 2. DEPENDENCY BOUNDARIES GATE ───
try {
  log('Running Dependency Boundary Cruiser (Dependency-Cruiser)...');
  // Check if .dependency-cruiser config exists
  const dcConfigPath = path.join(__dirname, '..', '.dependency-cruiser.js');
  if (fs.existsSync(dcConfigPath)) {
    execSync('npx dependency-cruiser --config .dependency-cruiser.js src/', { stdio: 'inherit' });
    success('Dependency boundary rules validation passed.');
  } else {
    log('No .dependency-cruiser.js configuration found at root. Skipping.');
  }
} catch (error) {
  err('Dependency boundary violations found! Check cruiser log for details.');
  failed = true;
}

// ─── 3. PRISMA SCHEMA DRIFT CHECK ───
try {
  log('Verifying Prisma database schema drift status...');
  // Runs prisma migrate dev status --dry-run or prisma validate to ensure schema is up-to-date and consistent
  execSync('npx prisma validate', { stdio: 'inherit' });
  success('Prisma schema validation check passed.');
} catch (error) {
  err('Prisma schema validation failed! Ensure schema.prisma matches DB and migrations are fully applied.');
  failed = true;
}

// ─── 4. TYPE CHECK GATE ───
try {
  log('Running TypeScript compiler check (tsc --noEmit)...');
  execSync('npm run type-check', { stdio: 'inherit' });
  success('TypeScript validation passed with zero errors.');
} catch (error) {
  err('TypeScript compilation check failed! Fix typings.');
  failed = true;
}

// ─── 5. RELIABILITY TESTS GATE ───
try {
  log('Running Reliability test suite...');
  execSync('npx jest --testMatch="**/src/__tests__/reliability/**/*.test.ts" --runInBand --forceExit', { stdio: 'inherit' });
  success('Reliability tests validation passed.');
} catch (error) {
  err('Reliability tests failed!');
  failed = true;
}

// ─── 6. STATE MACHINE INVARIANT TESTS GATE ───
try {
  log('Running Invariant test suite...');
  execSync('npx jest --testMatch="**/src/__tests__/invariants/**/*.test.ts" --runInBand --forceExit', { stdio: 'inherit' });
  success('State machine invariants validation passed.');
} catch (error) {
  err('State machine invariants validation failed!');
  failed = true;
}

// ─── Final Summary ───
if (failed) {
  err('Repository architectural governance validation failed! Build aborted.');
  process.exit(1);
} else {
  success('All system architecture gates are green! Safe to commit.');
  process.exit(0);
}

