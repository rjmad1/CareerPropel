import * as fs from 'fs';
import * as path from 'path';

let exitCode = 0;

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

const srcDir = path.join(process.cwd(), 'src');
const files = walkDir(srcDir, (f) => f.endsWith('.ts') || f.endsWith('.tsx'));

const forbiddenSockets = [
  'socket.io',
  'socket.io-client',
  'io('
];

console.log('--- STARTING REALTIME MODEL (SSE) VALIDATION ---');

// Check that SSE manager exists
const sseManagerPath = path.join(process.cwd(), 'src', 'lib', 'realtime', 'sse-manager.ts');
if (!fs.existsSync(sseManagerPath)) {
  console.error('\x1b[31m[ERROR] Canonical SSE Manager (src/lib/realtime/sse-manager.ts) is missing!\x1b[0m');
  exitCode = 1;
} else {
  console.log('\x1b[32m[PASS] Canonical SSE Manager exists.\x1b[0m');
}

// Ensure no Socket.IO remains in production files
files.forEach((file) => {
  const relativePath = path.relative(process.cwd(), file);
  // Skip tests
  if (relativePath.includes('__tests__') || relativePath.includes('tests/')) return;
  
  const content = fs.readFileSync(file, 'utf8');
  forbiddenSockets.forEach((forbidden) => {
    if (content.includes(forbidden)) {
      console.error(`\x1b[31m[ERROR] Forbidden Socket.IO reference in "${relativePath}": contains "${forbidden}"\x1b[0m`);
      exitCode = 1;
    }
  });
});

if (exitCode === 0) {
  console.log('\x1b[32m[PASS] Realtime model (SSE-only) validated successfully.\x1b[0m');
}
process.exit(exitCode);
