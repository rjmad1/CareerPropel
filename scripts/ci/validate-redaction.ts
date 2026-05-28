import * as fs from 'fs';
import * as path from 'path';

// Precise regexes targeting actual secrets/PII leaks rather than placeholders
const PII_AND_SECRET_REGEXES = [
  /sk-ant-[a-zA-Z0-9_-]+/g, // Anthropic API Key
  /sk-[a-zA-Z0-9]{48}/g, // Standard OpenAI/Anthropic API Key
  /AIzaSy[a-zA-Z0-9_-]{33}/g, // Google API Key
  /bearer\s+(?!token|tokens)[a-zA-Z0-9_\-\.]{15,}/gi, // Actual Bearer Token (long string, excluding generic "Bearer token")
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSNs (PII)
];

const EXCLUDED_FILES = [
  'validate-redaction.ts',
];

const EXCLUDED_DIR_NAMES = [
  '__tests__',
  '__mocks__',
];

let leakCount = 0;

function scanDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(process.cwd(), fullPath);

    if (EXCLUDED_FILES.includes(file) || EXCLUDED_DIR_NAMES.some(name => relPath.includes(name))) {
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json'))) {
      const content = fs.readFileSync(fullPath, 'utf8');

      for (const regex of PII_AND_SECRET_REGEXES) {
        const matches = content.match(regex);
        if (matches) {
          // Double-check: ensure it's not a generic placeholder
          const realLeaks = matches.filter((m) => {
            const lower = m.toLowerCase();
            return (
              !lower.includes('placeholder') &&
              !lower.includes('your_') &&
              !lower.includes('example') &&
              !lower.includes('xxxx') &&
              !lower.includes('dummy') &&
              !lower.includes('test')
            );
          });

          if (realLeaks.length > 0) {
            console.error(`\x1b[31m[REDACTION VIOLATION] Leaked secret/PII found in file "${relPath}":\x1b[0m`);
            realLeaks.forEach((leak) => console.error(`  -> "${leak.slice(0, 20)}..."`));
            leakCount += realLeaks.length;
          }
        }
      }
    }
  }
}

console.log('--- STARTING CI SECRET & PII REDACTION SCANNER ---\n');
// We scan the production active codebase 'src/' specifically to find code leaks
scanDirectory(path.join(process.cwd(), 'src'));

if (leakCount > 0) {
  console.error(`\x1b[31m\nScan completed: FAILED. Found ${leakCount} unredacted secret/PII leak(s). Build aborted.\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32m\nScan completed: PASSED. No unredacted secrets or PII leaks detected in src/.\x1b[0m');
  process.exit(0);
}
