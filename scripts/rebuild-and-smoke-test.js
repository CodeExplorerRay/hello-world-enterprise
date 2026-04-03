const { spawnSync } = require("child_process");

const composeArgs = ["compose", "-f", "infrastructure/docker-compose.yml"];
const services = ["ai-decision-engine", "teapot-service", "api-gateway", "frontend"];

function runCommand(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...extraEnv },
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

runCommand("docker", [...composeArgs, "build", ...services]);
runCommand("docker", [...composeArgs, "up", "-d", "--force-recreate", ...services]);
runCommand("node", ["scripts/smoke-test-endpoints.js"], {
  SMOKE_REQUIRE_LIVE_GEMINI: process.env.SMOKE_REQUIRE_LIVE_GEMINI || "false",
});
