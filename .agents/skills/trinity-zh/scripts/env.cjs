/**
 * P0 configuration: TRINITY_BASE_URL + TRINITY_API_KEY
 *
 * Priority (higher overrides lower):
 *   1. Environment variables
 *   2. Skill directory .env
 *   3. Project root .env
 */

const fs = require("fs");
const path = require("path");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

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

loadEnv(path.join(projectRoot, ".env"));
loadEnv(path.join(skillDir, ".env"));

const DEFAULT_BASE_URL = "https://api.trinitydesk.ai/v1";

let BASE_URL = process.env.TRINITY_BASE_URL || DEFAULT_BASE_URL;
BASE_URL = BASE_URL.replace(/\/+$/, "");

const API_KEY = process.env.TRINITY_API_KEY;

if (!API_KEY) {
  console.error(
    "[CONFIG_MISSING] TRINITY_API_KEY\n" +
      "Run: node scripts/init-env.cjs  (creates .env with TRINITY_BASE_URL filled; user adds TRINITY_API_KEY=xh-...)\n" +
      "DO NOT retry. Ask the user to set TRINITY_API_KEY in .env after init-env."
  );
  process.exit(2);
}

module.exports = { BASE_URL, API_KEY };
