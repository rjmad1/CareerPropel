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

const deprecatedPatterns = [
  { pattern: '@/lib/workflow/worker', message: 'Legacy workflow worker is deprecated' },
  { pattern: '@/lib/workflow/scheduler', message: 'Legacy workflow scheduler is deprecated' },
  { pattern: '@/hooks/useSocket', message: 'Legacy Socket.IO hook is deprecated' },
  { pattern: '@/lib/socket/', message: 'Legacy socket.io server is deprecated' }
];

console.log('--- STARTING DEPRECATED IMPORTS VALIDATION ---');

files.forEach((file) => {
  const relativePath = path.relative(process.cwd(), file);
  // Skip test files
  if (relativePath.includes('__tests__') || relativePath.includes('tests/')) return;
  
  const content = fs.readFileSync(file, 'utf8');
  
  deprecatedPatterns.forEach((dep) => {
    if (content.includes(dep.pattern)) {
      console.error(`\x1b[31m[ERROR] Deprecated reference in "${relativePath}": ${dep.message} ("${dep.pattern}")\x1b[0m`);
      exitCode = 1;
    }
  });
});

if (exitCode === 0) {
  console.log('\x1b[32m[PASS] Deprecated imports validated successfully.\x1b[0m');
}
process.exit(exitCode);
