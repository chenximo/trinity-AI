#!/usr/bin/env node
/**
 * 价目手动巡检（建议每周一次）
 *
 *   npm run pricing:inspect
 *   npm run pricing:inspect -- --skip-official-fetch
 *
 * 加载仓库根 .env 中的 PRICING_ALERT_*（若已 export 则跳过）
 */

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

async function loadDotEnv() {
  try {
    const raw = await readFile(path.join(root, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] == null || process.env[key] === "") {
        process.env[key] = val;
      }
    }
  } catch {
    // no .env
  }
}

/**
 * @param {string} name
 * @param {string} cmd
 * @param {string[]} args
 */
function runStep(name, cmd, args) {
  console.log(`\n════════ pricing:inspect · ${name} ════════`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: process.env });
  if (r.status !== 0) {
    console.error(`\n⚠️  step failed: ${name} (exit ${r.status ?? 1})`);
    return false;
  }
  return true;
}

async function main() {
  await loadDotEnv();

  const argv = process.argv.slice(2);
  const skipOfficial = argv.includes("--skip-official-fetch");

  const failures = [];

  const refreshArgs = ["run", "pricing:refresh"];
  if (skipOfficial) refreshArgs.push("--", "--skip-official-fetch");
  if (!runStep("refresh", "npm", refreshArgs)) failures.push("refresh");

  if (!runStep("gen-official:image", "npm", ["run", "pricing:gen-official:image"])) {
    failures.push("gen-official:image");
  }
  if (!runStep("gen-official:video", "npm", ["run", "pricing:gen-official:video"])) {
    failures.push("gen-official:video");
  }

  if (!runStep("validate:compare", "npm", ["run", "pricing:validate:compare"])) {
    failures.push("validate:compare");
  }

  if (
    !runStep("gate", "npm", [
      "run",
      "pricing:gate",
      "--",
      "--skip-fetch",
      "--no-fail-fast",
    ])
  ) {
    failures.push("gate");
  }

  if (!runStep("alert", "npm", ["run", "pricing:alert", "--", "--heartbeat"])) {
    failures.push("alert");
  }

  console.log("\n════════ pricing:inspect 完成 ════════");
  if (failures.length) {
    console.error(`失败步骤: ${failures.join(", ")}`);
    console.error("见上方日志；刊例告警见 pricing/output/validate/pricing-alerts.*");
    process.exit(1);
  }
  console.log("全部步骤成功。钉钉已推送（若已配置 webhook）。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
