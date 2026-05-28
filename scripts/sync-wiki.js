const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const WIKI_DIR = path.join(PROJECT_ROOT, 'wiki');
const TEMP_SYNC_DIR = path.join(PROJECT_ROOT, '.git', 'wiki-sync-temp');

// Helpers for running shell commands
function runCmd(cmd, options = {}) {
  try {
    return execSync(cmd, { stdio: 'pipe', ...options }).toString().trim();
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString().trim() : '';
    const stdout = error.stdout ? error.stdout.toString().trim() : '';
    throw new Error(`Command "${cmd}" failed.\nStdout: ${stdout}\nStderr: ${stderr}`);
  }
}

// Helper to recursively copy directories
function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper to empty a directory except for its .git folder
function cleanDirExceptGit(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  }
}

// Get the remote Wiki URL based on the main repository origin URL
function getWikiUrl(remoteUrl, token) {
  let repoPath = '';
  // Match SSH format: git@github.com:owner/repo.git or git@github.com:owner/repo
  if (remoteUrl.startsWith('git@')) {
    const match = remoteUrl.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
    if (match) {
      repoPath = `${match[1]}/${match[2]}`;
    }
  } else if (remoteUrl.startsWith('http')) {
    // Match HTTPS format: https://github.com/owner/repo.git or https://github.com/owner/repo
    const match = remoteUrl.match(/https?:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
    if (match) {
      repoPath = `${match[1]}/${match[2]}`;
    }
  }

  if (!repoPath) {
    throw new Error(`Could not parse remote URL: ${remoteUrl}`);
  }

  if (token) {
    return `https://x-access-token:${token}@github.com/${repoPath}.wiki.git`;
  } else {
    // Local: keep protocol
    if (remoteUrl.startsWith('git@')) {
      return `git@github.com:${repoPath}.wiki.git`;
    } else {
      return `https://github.com/${repoPath}.wiki.git`;
    }
  }
}

// Parse markdown and rewrite links
function rewriteLinksInFile(filePath, relativeFilePath, branch) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match markdown links: [text](url) and images: ![alt](url)
  const linkRegex = /(!?)\[([^\]]*)\]\(([^)]+)\)/g;

  const rewrittenContent = content.replace(linkRegex, (match, isImage, text, url) => {
    // Ignore absolute URLs and anchor-only links
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('#')) {
      return match;
    }

    const [pathPart, anchorPart] = url.split('#');
    const anchorSuffix = anchorPart ? `#${anchorPart}` : '';

    if (!pathPart) {
      return match;
    }

    // Clean leading slash
    let cleanPath = pathPart.startsWith('/') ? pathPart.slice(1) : pathPart;

    // 1. Strip "wiki/" prefix if referencing internal wiki files
    if (cleanPath.startsWith('wiki/')) {
      cleanPath = cleanPath.slice(5);
    }

    // Resolve path relative to current file's directory within the wiki
    const currentDir = path.dirname(relativeFilePath);
    const resolvedInWiki = path.normalize(path.join(currentDir, cleanPath)).replace(/\\/g, '/');

    // Check if the file exists in the local wiki folder
    const absoluteWikiPath = path.join(WIKI_DIR, resolvedInWiki);

    if (fs.existsSync(absoluteWikiPath)) {
      return `${isImage}[${text}](${resolvedInWiki}${anchorSuffix})`;
    }

    // 2. Points outside the wiki. Resolve relative to project root.
    const absoluteCurrentFileDir = path.dirname(path.join(WIKI_DIR, relativeFilePath));
    let absoluteProjectPath = path.resolve(absoluteCurrentFileDir, pathPart);

    if (!fs.existsSync(absoluteProjectPath)) {
      // Fallback: resolve from project root directly
      absoluteProjectPath = path.resolve(PROJECT_ROOT, pathPart);
    }

    // Case-insensitive fallback for files pointing outside (e.g. BrandingRenameReport.md -> BRANDING_RENAME_REPORT.md)
    if (!fs.existsSync(absoluteProjectPath)) {
      const parentDir = path.dirname(absoluteProjectPath);
      if (fs.existsSync(parentDir)) {
        const files = fs.readdirSync(parentDir);
        const baseLower = path.basename(absoluteProjectPath).toLowerCase();
        const matchedFile = files.find(f => f.toLowerCase() === baseLower);
        if (matchedFile) {
          absoluteProjectPath = path.join(parentDir, matchedFile);
        }
      }
    }

    if (fs.existsSync(absoluteProjectPath)) {
      const relativeToRoot = path.relative(PROJECT_ROOT, absoluteProjectPath).replace(/\\/g, '/');
      return `${isImage}[${text}](https://github.com/rjmad1/CareerPropel/blob/${branch}/${relativeToRoot}${anchorSuffix})`;
    }

    // Fallback: point to main repository root/file path if not found
    return `${isImage}[${text}](https://github.com/rjmad1/CareerPropel/blob/${branch}/${cleanPath}${anchorSuffix})`;
  });

  if (content !== rewrittenContent) {
    fs.writeFileSync(filePath, rewrittenContent, 'utf8');
  }
}

// Find all files in a directory recursively
function getAllFiles(dir, relativeTo = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, relativeTo));
    } else {
      results.push(path.relative(relativeTo, filePath).replace(/\\/g, '/'));
    }
  }
  return results;
}

// Main execution function
function main() {
  console.log('--- Career Propel Wiki Synchronization ---');

  if (!fs.existsSync(WIKI_DIR)) {
    console.error(`Error: Local wiki directory not found at ${WIKI_DIR}`);
    process.exit(1);
  }

  // 1. Get git remote origin
  let remoteUrl;
  try {
    remoteUrl = runCmd('git remote get-url origin', { cwd: PROJECT_ROOT });
    console.log(`Main repository remote URL: ${remoteUrl}`);
  } catch (error) {
    console.error('Error: Could not retrieve main repository remote origin URL.');
    console.error(error.message);
    process.exit(1);
  }

  // 2. Detect branch
  let branch = 'main';
  try {
    if (process.env.GITHUB_REF_NAME) {
      branch = process.env.GITHUB_REF_NAME;
    } else {
      branch = runCmd('git rev-parse --abbrev-ref HEAD', { cwd: PROJECT_ROOT });
    }
    console.log(`Active branch for link resolution: ${branch}`);
  } catch (error) {
    console.log('Could not detect active branch. Defaulting to "main".');
  }

  // 3. Resolve Wiki URL
  const token = process.env.GITHUB_TOKEN || process.env.WIKI_SYNC_TOKEN;
  const wikiUrl = getWikiUrl(remoteUrl, token);
  console.log(`Target Wiki repository URL: ${token ? 'https://github.com/...wiki.git (Authenticated)' : wikiUrl}`);

  // 4. Set up temporary directory
  if (fs.existsSync(TEMP_SYNC_DIR)) {
    console.log('Cleaning up existing temp sync directory...');
    fs.rmSync(TEMP_SYNC_DIR, { recursive: true, force: true });
  }

  // 5. Clone Wiki repository
  console.log('Cloning remote Wiki repository...');
  try {
    runCmd(`git clone "${wikiUrl}" "${TEMP_SYNC_DIR}"`, { cwd: PROJECT_ROOT });
    console.log('Successfully cloned remote Wiki.');
  } catch (error) {
    console.warn('\n========================================================================');
    console.warn('WARNING: Failed to clone remote Wiki repository.');
    console.warn('This usually means the Wiki repository has not been initialized yet.');
    console.warn('Please ensure:');
    console.warn('1. The "Wikis" feature is enabled in your GitHub repository settings.');
    console.warn('2. You have manually created the first Wiki page (e.g. Home) on GitHub.');
    console.warn(`Detailed Git error: ${error.message}`);
    console.warn('========================================================================\n');
    console.log('Exiting gracefully without pushing.');
    process.exit(0);
  }

  // 6. Clean cloned files (except .git)
  console.log('Preparing clean workspace in cloned wiki repository...');
  cleanDirExceptGit(TEMP_SYNC_DIR);

  // 7. Copy local wiki contents to cloned repo
  console.log('Copying local documentation to wiki repository...');
  copyDirRecursive(WIKI_DIR, TEMP_SYNC_DIR);

  // 8. Create Home.md if README.md exists (GitHub Wiki default landing page)
  const readmePath = path.join(TEMP_SYNC_DIR, 'README.md');
  const homePath = path.join(TEMP_SYNC_DIR, 'Home.md');
  if (fs.existsSync(readmePath)) {
    console.log('Creating Home.md from README.md...');
    fs.copyFileSync(readmePath, homePath);
  }

  // 9. Rewrite links inside markdown files
  console.log('Rewriting links to resolve internal wiki paths and external repo links...');
  const files = getAllFiles(TEMP_SYNC_DIR);
  for (const relativeFile of files) {
    if (relativeFile.endsWith('.md')) {
      const fullPath = path.join(TEMP_SYNC_DIR, relativeFile);
      rewriteLinksInFile(fullPath, relativeFile, branch);
    }
  }

  // 10. Check if there are changes to push
  console.log('Checking for changes...');
  try {
    const status = runCmd('git status --porcelain', { cwd: TEMP_SYNC_DIR });
    if (!status) {
      console.log('No changes detected. Wiki is up to date.');
      fs.rmSync(TEMP_SYNC_DIR, { recursive: true, force: true });
      return;
    }
    console.log('Detected wiki updates:\n' + status);
  } catch (error) {
    console.error('Failed to verify status of temporary wiki clone:', error.message);
    process.exit(1);
  }

  // 11. Configure git user (useful in CI environment)
  console.log('Configuring git user...');
  try {
    // Only configure if user name or email is not set locally
    let gitName = '';
    let gitEmail = '';
    try {
      gitName = runCmd('git config user.name', { cwd: TEMP_SYNC_DIR });
      gitEmail = runCmd('git config user.email', { cwd: TEMP_SYNC_DIR });
    } catch (e) {
      // Configuration missing
    }

    if (!gitName) {
      runCmd('git config user.name "GitHub Action"', { cwd: TEMP_SYNC_DIR });
    }
    if (!gitEmail) {
      runCmd('git config user.email "action@github.com"', { cwd: TEMP_SYNC_DIR });
    }
  } catch (error) {
    console.warn('Could not configure git user. Attempting push anyway.', error.message);
  }

  // 12. Commit and Push
  console.log('Staging and committing wiki changes...');
  try {
    runCmd('git add -A', { cwd: TEMP_SYNC_DIR });
    runCmd('git commit -m "Sync wiki from local docs [skip ci]"', { cwd: TEMP_SYNC_DIR });
    
    // Determine the branch of the wiki (GitHub wiki default branch is master)
    let wikiBranch = 'master';
    try {
      wikiBranch = runCmd('git rev-parse --abbrev-ref HEAD', { cwd: TEMP_SYNC_DIR });
    } catch (e) {
      // Fallback
    }

    console.log(`Pushing changes to remote Wiki branch "${wikiBranch}"...`);
    runCmd(`git push origin ${wikiBranch}`, { cwd: TEMP_SYNC_DIR });
    console.log('Successfully published wiki to remote!');
  } catch (error) {
    console.error('Failed to commit and push changes to remote wiki:', error.message);
    process.exit(1);
  }

  // 13. Cleanup
  console.log('Cleaning up temporary workspace...');
  try {
    fs.rmSync(TEMP_SYNC_DIR, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Could not remove temp sync directory: ${error.message}`);
  }

  console.log('Wiki sync completed successfully.');
}

if (require.main === module) {
  main();
}
