const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const checkedFiles = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  cwd: repoRoot,
  encoding: 'utf8',
}).split(/\r?\n/).filter(Boolean);

const disallowedTrackedPatterns = [
  { pattern: /(^|\/)node_modules\//, reason: 'Vendored dependency directories must not be tracked.' },
  { pattern: /(^|\/)\.next\//, reason: 'Next.js build output must not be tracked.' },
  { pattern: /(^|\/)\.env(\.|$)/, reason: 'Environment files must remain local-only.' },
];

const allowedSecretPlaceholders = [
  'your_gemini_api_key_here',
  'your_real_key_here',
  'replace_me',
  'your_key_here',
];

const secretPatterns = [
  { label: 'OpenAI-style secret', regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: 'Google API key', regex: /\bAIza[0-9A-Za-z_-]{20,}\b/ },
  { label: 'Private key block', regex: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/ },
];

function isBinary(buffer) {
  const maxLength = Math.min(buffer.length, 1024);
  for (let index = 0; index < maxLength; index += 1) {
    if (buffer[index] === 0) {
      return true;
    }
  }
  return false;
}

const violations = [];

for (const checkedFile of checkedFiles) {
  if (checkedFile === '.env.example') {
    continue;
  }

  for (const rule of disallowedTrackedPatterns) {
    if (rule.pattern.test(checkedFile)) {
      violations.push(`${checkedFile}: ${rule.reason}`);
    }
  }
}

for (const checkedFile of checkedFiles) {
  const fullPath = path.join(repoRoot, checkedFile);
  if (!fs.existsSync(fullPath)) {
    continue;
  }

  const stat = fs.statSync(fullPath);
  if (!stat.isFile() || stat.size > 1024 * 1024) {
    continue;
  }

  const buffer = fs.readFileSync(fullPath);
  if (isBinary(buffer)) {
    continue;
  }

  const content = buffer.toString('utf8');

  for (const pattern of secretPatterns) {
    const matches = content.match(pattern.regex) || [];
    const unexpectedMatches = matches.filter((match) => !allowedSecretPlaceholders.includes(match));
    if (unexpectedMatches.length > 0) {
      violations.push(`${checkedFile}: Possible ${pattern.label} detected.`);
    }
  }
}

if (violations.length > 0) {
  console.error('Compliance policy check failed:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Compliance policy check passed for ${checkedFiles.length} files.`);
