/**
 * Create project .env from env.template if missing.
 * Usage: node scripts/init-env.cjs
 *
 * - TRINITY_BASE_URL is pre-filled
 * - TRINITY_API_KEY is left empty for the user to fill
 * - Never overwrites an existing .env
 */

const fs = require("fs");
const path = require("path");

function findProjectRoot(startDir) {
  let dir = startDir;
  let fallback = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, ".git"))) {
      return dir;
    }
    if (fs.existsSync(path.join(dir, "package.json"))) {
      fallback = dir;
    }
    dir = path.dirname(dir);
  }
  return fallback;
}

const skillDir = path.resolve(__dirname, "..");
const projectRoot = findProjectRoot(process.cwd());
const templatePath = path.join(skillDir, "env.template");
const targetPath = path.join(projectRoot, ".env");

if (!fs.existsSync(templatePath)) {
  console.error("[INIT_ENV] env.template not found next to SKILL.md");
  process.exit(1);
}

if (fs.existsSync(targetPath)) {
  console.log(`[INIT_ENV] .env already exists at ${targetPath} — not modified.`);
  console.log("[INIT_ENV] Edit TRINITY_API_KEY=xh-... in that file if needed.");
  process.exit(0);
}

const content = fs.readFileSync(templatePath, "utf-8");
fs.writeFileSync(targetPath, content, { mode: 0o600 });
console.log(`[INIT_ENV] Created ${targetPath}`);
console.log("[NEXT_STEP] Open .env and set TRINITY_API_KEY=xh-... (TRINITY_BASE_URL is already filled).");
