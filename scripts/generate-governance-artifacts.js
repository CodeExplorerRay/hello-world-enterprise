const { spawnSync } = require("child_process");
const path = require("path");

const scripts = [
  "generate-adrs.js",
  "generate-incidents.js",
  "generate-security-audit.js",
];

for (const script of scripts) {
  const scriptPath = path.join(__dirname, script);
  const result = spawnSync(process.execPath, [scriptPath, "--offline"], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
