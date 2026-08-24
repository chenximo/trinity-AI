#!/usr/bin/env node
/**
 * 分模态价目巡检（推荐日常用）
 *
 *   node pricing/pipeline/inspect-pricing-modality.mjs --modality=image
 *   node pricing/pipeline/inspect-pricing-modality.mjs --modality=text --skip-official-fetch
 */

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");
const MODALITIES = new Set(["text", "image", "video"]);

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

function runStep(name, cmd, args) {
  console.log(`\n════════ pricing:inspect:${name} ════════`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: process.env });
  if (r.status !== 0) {
    console.error(`\n⚠️  step failed: ${name} (exit ${r.status ?? 1})`);
    return false;
  }
  return true;
}

function parseArgs() {
  const modalityArg = process.argv.slice(2).find((a) => a.startsWith("--modality="));
  const modality = modalityArg?.split("=")[1];
  if (!modality || !MODALITIES.has(modality)) {
    throw new Error("Usage: --modality=text|image|video");
  }
  return {
    modality,
    skipOfficialFetch: process.argv.includes("--skip-official-fetch"),
  };
}

function stepsForModality(modality, skipOfficialFetch) {
  const steps = [];

  if (!skipOfficialFetch) {
    steps.push([
      `official:${modality}`,
      "npm",
      ["run", `pricing:supplier:official:${modality}`],
    ]);
  }

  if (modality === "image") {
    steps.push(
      ["gen-official:image", "npm", ["run", "pricing:gen-official:image"]],
      ["upstream:image", "npm", ["run", "pricing:upstream:image"]],
      ["official-aigc:image", "npm", ["run", "pricing:validate:official-aigc-image"]],
      [
        "official-suppliers:image",
        "npm",
        ["run", "pricing:validate:official-suppliers-image"],
      ],
    );
  } else if (modality === "video") {
    steps.push(
      ["gen-official:video", "npm", ["run", "pricing:gen-official:video"]],
      ["upstream:video", "npm", ["run", "pricing:upstream:video"]],
      ["official-aigc:video", "npm", ["run", "pricing:validate:official-aigc-video"]],
      [
        "official-suppliers:video",
        "npm",
        ["run", "pricing:validate:official-suppliers-video"],
      ],
    );
  } else {
    steps.push(
      ["upstream:text", "npm", ["run", "pricing:upstream"]],
      ["official-aigc:text", "npm", ["run", "pricing:validate:official-aigc"]],
      ["official-suppliers:text", "npm", ["run", "pricing:validate:official-suppliers"]],
    );
  }

  steps.push(
    ["listing-compare", "npm", ["run", "pricing:validate:compare"]],
    [
      `alert:${modality}`,
      "npm",
      ["run", "pricing:alert", "--", `--modality=${modality}`],
    ],
  );

  return steps;
}

async function main() {
  await loadDotEnv();
  const { modality, skipOfficialFetch } = parseArgs();
  const failures = [];

  for (const [name, cmd, args] of stepsForModality(modality, skipOfficialFetch)) {
    if (!runStep(name, cmd, args)) failures.push(name);
  }

  console.log(`\n════════ pricing:inspect:${modality} 完成 ════════`);
  if (failures.length) {
    console.error(`失败步骤: ${failures.join(", ")}`);
    process.exit(1);
  }
  console.log(`全部步骤成功。${modality} 摘要已推送（若已配置 webhook）。`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
