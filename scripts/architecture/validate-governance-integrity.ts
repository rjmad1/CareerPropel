import * as fs from 'fs';
import * as path from 'path';

let exitCode = 0;

const criticalFiles = [
  'RUNTIME_OWNERSHIP_MAP.md',
  'FORBIDDEN_PATTERNS.md',
  'CANONICAL_PATTERNS.md',
  'CURRENT_ARCHITECTURE_SNAPSHOT.md',
  'sgconfig.yml',
  '.semgrep/rules.yml',
  '.dependency-cruiser/.dependency-cruiser.js',
  '.github/workflows/ci.yml'
];

console.log('--- STARTING GOVERNANCE INTEGRITY VALIDATION ---');

criticalFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.error(`\x1b[31m[ERROR] Critical governance file missing: "${file}"\x1b[0m`);
    exitCode = 1;
  } else {
    console.log(`\x1b[32m[PASS] Governance file exists: "${file}"\x1b[0m`);
  }
});

if (exitCode === 0) {
  console.log('\x1b[32m[PASS] Governance integrity validated successfully.\x1b[0m');
}
process.exit(exitCode);
