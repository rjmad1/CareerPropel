#!/usr/bin/env node
/**
 * Spec governance check — validates that high-impact PRs link appropriate specs.
 *
 * Rules:
 *   1. prisma/schema.prisma changed → ADR must exist or PR body links one
 *   2. src/app/api/** new route file → API contract spec expected
 *   3. src/lib/security/** or src/lib/middleware/** → security spec expected
 *   4. src/lib/llm/** or src/lib/agents/** → AI governance spec expected
 *
 * Exit 0 = pass, Exit 1 = fail (blocks CI).
 * Warnings only for soft requirements; hard failures for architectural gates.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PR_BODY = process.env.PR_BODY || '';
const BASE_REF = process.env.GITHUB_BASE_REF || 'main';

// Get changed files in this PR
function getChangedFiles() {
  try {
    const output = execSync(
      `git diff --name-only origin/${BASE_REF}...HEAD`,
      { cwd: ROOT, encoding: 'utf8' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch {
    console.warn('[spec-check] Could not determine changed files, skipping check.');
    return [];
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function adrExists() {
  const adrDir = path.join(ROOT, 'docs', 'adr');
  if (!fs.existsSync(adrDir)) return false;
  return fs.readdirSync(adrDir).some(f => f.endsWith('.md'));
}

function prLinksSpec(pattern) {
  return PR_BODY.toLowerCase().includes(pattern.toLowerCase());
}

const changed = getChangedFiles();
const errors = [];
const warnings = [];

// Rule 1: Prisma schema changed → ADR required
const schemaChanged = changed.some(f => f === 'prisma/schema.prisma');
if (schemaChanged) {
  const hasAdrLink = prLinksSpec('docs/adr') || prLinksSpec('adr/');
  if (!hasAdrLink) {
    errors.push(
      'prisma/schema.prisma was modified but the PR description does not reference an ADR.\n' +
      '  → Create or link an ADR in docs/adr/ using templates/adr.md'
    );
  } else {
    console.log('[spec-check] ✓ Schema change: ADR reference found in PR body');
  }
}

// Rule 2: New API route files → API contract expected
const newApiRoutes = changed.filter(
  f => f.startsWith('src/app/api/') && f.endsWith('route.ts')
);
if (newApiRoutes.length > 0) {
  const hasApiSpec = prLinksSpec('docs/specifications') || prLinksSpec('api-contract') || prLinksSpec('specs/');
  if (!hasApiSpec) {
    warnings.push(
      `${newApiRoutes.length} new API route(s) added without a linked API contract spec.\n` +
      `  Routes: ${newApiRoutes.join(', ')}\n` +
      '  → Consider creating an API contract in docs/specifications/api/ using templates/api-contract.md'
    );
  } else {
    console.log('[spec-check] ✓ New API routes: spec reference found');
  }
}

// Rule 3: Security-critical path changes → security review expected
const securityPaths = [
  'src/lib/security/',
  'src/lib/middleware/',
  'src/lib/auth.ts',
  'src/middleware.ts',
];
const securityChanged = changed.some(f => securityPaths.some(p => f.startsWith(p) || f === p));
if (securityChanged) {
  const hasSecuritySpec = prLinksSpec('security') || prLinksSpec('threat-model') || prLinksSpec('docs/security');
  if (!hasSecuritySpec) {
    warnings.push(
      'Security-critical files changed without a referenced security review.\n' +
      '  → Consider creating a security review using templates/security-review.md'
    );
  } else {
    console.log('[spec-check] ✓ Security change: review reference found');
  }
}

// Rule 4: AI/LLM pipeline changes → AI governance spec expected
const aiPaths = ['src/lib/llm/', 'src/lib/agents/', 'src/lib/safety/', 'src/lib/agent/'];
const aiChanged = changed.some(f => aiPaths.some(p => f.startsWith(p)));
if (aiChanged) {
  const hasAiSpec = prLinksSpec('ai-governance') || prLinksSpec('docs/governance') || prLinksSpec('llm');
  if (!hasAiSpec) {
    warnings.push(
      'AI/LLM pipeline files changed without a referenced AI governance spec.\n' +
      '  → Consider documenting the change in docs/governance/AI_GOVERNANCE.md'
    );
  } else {
    console.log('[spec-check] ✓ AI change: governance reference found');
  }
}

// Report
if (warnings.length > 0) {
  console.warn('\n[spec-check] WARNINGS (non-blocking):');
  warnings.forEach((w, i) => console.warn(`  ${i + 1}. ${w}`));
}

if (errors.length > 0) {
  console.error('\n[spec-check] FAILURES (blocking):');
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));
  console.error('\nResolve the above issues before merging. See CONTRIBUTING.md for the spec workflow.');
  process.exit(1);
}

if (warnings.length === 0 && errors.length === 0) {
  console.log('[spec-check] ✓ All governance checks passed.');
}
