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

const webPaths = [
  path.join(process.cwd(), 'src', 'app'),
  path.join(process.cwd(), 'src', 'bin', 'web.ts')
];

const forbiddenImports = [
  'from "@/bin/worker"',
  'from "../bin/worker"',
  'from "@/lib/queue/workers"',
  'from "../queue/workers"'
];

console.log('--- STARTING RUNTIME BOUNDARIES VALIDATION ---');

webPaths.forEach((webPath) => {
  if (!fs.existsSync(webPath)) return;
  const files = fs.statSync(webPath).isDirectory() 
    ? walkDir(webPath, (f) => f.endsWith('.ts') || f.endsWith('.tsx'))
    : [webPath];

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);
    
    forbiddenImports.forEach((forbidden) => {
      if (content.includes(forbidden)) {
        console.error(`\x1b[31m[ERROR] Web runtime boundary violation in "${relativePath}": imports worker internals "${forbidden}"\x1b[0m`);
        exitCode = 1;
      }
    });
  });
});

if (exitCode === 0) {
  console.log('\x1b[32m[PASS] Runtime boundaries validated successfully.\x1b[0m');
}
process.exit(exitCode);
