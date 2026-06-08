const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const GIT_DIR = path.join(PROJECT_ROOT, '.git');
const HOOKS_DIR = path.join(GIT_DIR, 'hooks');
const PRE_PUSH_PATH = path.join(HOOKS_DIR, 'pre-push');

function main() {
  console.log('--- Career Propel Git Hook Installer ---');

  if (!fs.existsSync(GIT_DIR)) {
    console.warn('Warning: .git directory not found. Skipping Git hook installation (expected in non-git environments like Vercel).');
    process.exit(0);
  }

  if (!fs.existsSync(HOOKS_DIR)) {
    console.log('Creating hooks directory...');
    fs.mkdirSync(HOOKS_DIR, { recursive: true });
  }

  // Pre-push hook content
  // Runs the sync-wiki.js script before pushing code to remote
  const hookContent = `#!/bin/sh
# Career Propel Git Pre-Push Hook
# Automatically synchronizes local wiki changes to the remote Wiki.

echo ""
echo "=== PRE-PUSH: Syncing local wiki to remote ==="
node scripts/sync-wiki.js
echo "=============================================="
echo ""
`;

  // Check if hook already exists
  let shouldWrite = true;
  if (fs.existsSync(PRE_PUSH_PATH)) {
    const existingContent = fs.readFileSync(PRE_PUSH_PATH, 'utf8');
    if (existingContent.includes('sync-wiki.js')) {
      console.log('Pre-push hook is already installed and up to date.');
      shouldWrite = false;
    } else {
      console.log('An existing pre-push hook was found. Appending wiki sync...');
      fs.appendFileSync(PRE_PUSH_PATH, `\n# Added by Career Propel wiki sync\nnode scripts/sync-wiki.js\n`, 'utf8');
      shouldWrite = false;
      console.log('Successfully appended wiki sync to existing pre-push hook.');
    }
  }

  if (shouldWrite) {
    console.log('Writing pre-push hook...');
    fs.writeFileSync(PRE_PUSH_PATH, hookContent, { encoding: 'utf8', mode: 0o755 });
    
    // Ensure executable permissions on Unix-based systems
    try {
      fs.chmodSync(PRE_PUSH_PATH, '755');
    } catch (err) {
      // Ignore if chmod fails (e.g. on Windows filesystems that don't support it, but node handles mode on write)
    }
    
    console.log('Pre-push hook installed successfully at:');
    console.log(`  ${PRE_PUSH_PATH}`);
  }
}

if (require.main === module) {
  main();
}
