const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '../src');

// Map legacy spacing scale keys to standard Tailwind keys (exact 2x scale)
const spacingMap = {
  '1': '2',
  '2': '4',
  '3': '6',
  '4': '8',
  '5': '10',
  '6': '12',
  '8': '16',
  '10': '20',
  '12': '24',
  '16': '32',
  '20': '40',
  '24': '48',
  '32': '64',
  
  // Also support decimal keys if they were used
  '1.5': '3',
  '2.5': '5',
  '3.5': '7'
};

// Patterns to search for spacing classes
// Matches p-1, px-2, -m-4, gap-3, space-x-6, h-12, w-8, etc.
const prefixes = ['p', 'px', 'py', 'pl', 'pr', 'pt', 'pb', 'm', 'mx', 'my', 'ml', 'mr', 'mt', 'mb', 'gap', 'gap-x', 'gap-y', 'space-x', 'space-y', 'w', 'h', 'min-w', 'max-w', 'min-h', 'max-h', 'top', 'bottom', 'left', 'right'];

function normalizeContent(content) {
  let updatedContent = content;

  prefixes.forEach((prefix) => {
    // Escape prefix for safe regex construction (handling dashes)
    const escapedPrefix = prefix.replace('-', '\\-');
    
    // Regex matches e.g. px-2, -mx-4, gap-x-1
    // Matches negative prefix too: -?
    // Capture group 1: sign (- or empty)
    // Capture group 2: the core numeric spacing key (e.g. 2, 4, 12, 1.5)
    // Positive lookahead or boundary ensures we don't match e.g. w-full or h-screen
    const regex = new RegExp(`(\\b|-)${escapedPrefix}-([0-9]+(?:\\.[0-9]+)?)\\b`, 'g');

    updatedContent = updatedContent.replace(regex, (match, sign, value) => {
      if (spacingMap[value]) {
        return `${sign}${prefix}-${spacingMap[value]}`;
      }
      return match;
    });
  });

  return updatedContent;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && /\.(tsx|ts|css)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const normalized = normalizeContent(content);

      if (content !== normalized) {
        fs.writeFileSync(fullPath, normalized, 'utf8');
        console.log(`Normalized spacing in: ${path.relative(TARGET_DIR, fullPath)}`);
      }
    }
  });
}

console.log('Starting Tailwind spacing scale normalization codemod...');
processDirectory(TARGET_DIR);
console.log('Spacing scale normalization complete.');
