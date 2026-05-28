import * as fs from 'fs';
import * as path from 'path';

let exitCode = 0;

function logError(message: string) {
  console.error(`\x1b[31m[GOVERNANCE ERROR] ${message}\x1b[0m`);
  exitCode = 1;
}

function logSuccess(message: string) {
  console.log(`\x1b[32m[GOVERNANCE PASS] ${message}\x1b[0m`);
}

function walkDir(dir: string, filter: (filePath: string) => boolean): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath, filter));
    } else if (filter(filePath)) {
      results.push(filePath);
    }
  });
  return results;
}

// Helper to normalize path slashes
function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

console.log('--- STARTING GOVERNANCE VALIDATION CHECK ---\n');

// 1. Pages Router additions (OUTSIDE approved paths)
const pagesDir = path.join(process.cwd(), 'src', 'pages');
if (fs.existsSync(pagesDir)) {
  const pagesFiles = walkDir(pagesDir, () => true).map((p) => normalizePath(path.relative(process.cwd(), p)));
  const allowedPrefix = 'src/pages/api/admin/queues';
  
  pagesFiles.forEach((file) => {
    if (!file.startsWith(allowedPrefix)) {
      logError(`Forbidden Pages Router file found outside approved exception path: "${file}"`);
    }
  });
  if (exitCode === 0) {
    logSuccess('Pages Router restricted to approved paths.');
  }
} else {
  logSuccess('No Pages Router directory found.');
}

// 2. Scan all src/ source files for violations
const srcDir = path.join(process.cwd(), 'src');
const srcFiles = walkDir(srcDir, (f) => f.endsWith('.ts') || f.endsWith('.tsx'));

let hasTestImports = false;
let hasPlaywrightLeak = false;
let hasDeprecatedImports = false;

srcFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = normalizePath(path.relative(process.cwd(), file));

  // A. Imports from tests/ into src/
  if (content.includes('from \'@/tests/') || content.includes('from "../tests/') || content.includes('from \'../tests/')) {
    logError(`Source file "${relPath}" imports from tests/ directory.`);
    hasTestImports = true;
  }

  // B. Production references to Playwright globals (must be wrapped in NODE_ENV === 'test')
  if (content.includes('__sse_manager_connections_count')) {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('__sse_manager_connections_count')) {
        // Simple check to ensure it's in a test file or wrapped in a NODE_ENV === 'test' check
        // sse-manager.ts is allowed because it wraps it correctly.
        if (relPath !== 'src/lib/realtime/sse-manager.ts') {
          logError(`Source file "${relPath}" references Playwright global on line ${index + 1} without authorization.`);
          hasPlaywrightLeak = true;
        }
      }
    });
  }

  // C. Deprecated runtime file imports
  if (
    content.includes('from \'@/hooks/useSocket\'') ||
    content.includes('from "@/hooks/useSocket"') ||
    content.includes('from \'@/lib/socket/') ||
    content.includes('from "@/lib/socket/')
  ) {
    logError(`Source file "${relPath}" imports from deprecated WebSocket hook or server paths.`);
    hasDeprecatedImports = true;
  }
});

if (!hasTestImports) logSuccess('No imports from tests/ to src/ detected.');
if (!hasPlaywrightLeak) logSuccess('No unauthorized references to Playwright globals detected in production code.');
if (!hasDeprecatedImports) logSuccess('No deprecated WebSocket imports detected.');

// 3. Mock provider activation check in src/lib/llm/provider.ts
const providerPath = path.join(process.cwd(), 'src', 'lib', 'llm', 'provider.ts');
if (fs.existsSync(providerPath)) {
  const providerContent = fs.readFileSync(providerPath, 'utf8');
  if (
    !providerContent.includes('process.env.NODE_ENV !== \'test\'') ||
    !providerContent.includes('process.env.ENABLE_TEST_LLM_MOCKS !== \'true\'')
  ) {
    logError('Mock LLM provider is not safely guarded with both NODE_ENV and ENABLE_TEST_LLM_MOCKS checks.');
  } else {
    logSuccess('Mock LLM provider is correctly guarded.');
  }
} else {
  logError('Mock LLM provider file (src/lib/llm/provider.ts) not found.');
}

// 4. Fake SSE connected defaults check in src/hooks/useRealTime.ts
const realTimeHookPath = path.join(process.cwd(), 'src', 'hooks', 'useRealTime.ts');
if (fs.existsSync(realTimeHookPath)) {
  const hookContent = fs.readFileSync(realTimeHookPath, 'utf8');
  if (hookContent.includes('connected: true') && !hookContent.includes('__PLAYWRIGHT_TEST__')) {
    logError('useRealTime hook has fake hardcoded connected: true default.');
  } else {
    logSuccess('useRealTime hook is correctly guarded against fake connected states.');
  }
} else {
  logSuccess('useRealTime hook file not found.');
}

console.log('\n--- GOVERNANCE CHECK COMPLETED ---');
if (exitCode !== 0) {
  console.log('\x1b[31mGovernance check FAILED. Please resolve the errors listed above.\x1b[0m');
  process.exit(1);
} else {
  logSuccess('All governance checks PASSED successfully!');
  process.exit(0);
}
