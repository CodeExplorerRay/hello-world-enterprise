const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const imagePrefix = process.env.CONTAINER_BUILD_PREFIX || 'hello-world-enterprise';
const dockerConfigDir = process.env.DOCKER_CONFIG || path.join(os.tmpdir(), 'hello-world-enterprise-docker-config');
fs.mkdirSync(dockerConfigDir, { recursive: true });

const services = [
  'ab-testing-service',
  'ai-decision-engine',
  'api-gateway',
  'capitalization-service',
  'concatenation-service',
  'feature-flag-service',
  'frontend',
  'punctuation-service',
  'teapot-service',
];

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      DOCKER_CONFIG: dockerConfigDir,
    },
    stdio: 'inherit',
    ...options,
  });
}

try {
  run('docker', ['version']);
} catch (error) {
  console.error('Docker is not available. Start Docker Desktop or the Docker daemon, then rerun this command.');
  process.exit(error.status || 1);
}

for (const service of services) {
  const contextPath = path.join('services', service);
  const tag = `${imagePrefix}-${service}:local-compliance`;

  console.log(`\nBuilding ${service} as ${tag}`);
  run('docker', ['build', '--pull=false', '-t', tag, contextPath]);
}

console.log(`\nContainer build verification passed for ${services.length} services.`);
