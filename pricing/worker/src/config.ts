/**
 * 价审出包 Worker · 环境与路径
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** 加载 worker 目录下 .env（不覆盖已有 process.env） */
function loadDotEnv(): void {
  const envPath = path.resolve(here, "../.env");
  try {
    const text = fs.readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i <= 0) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    /* optional */
  }
}

loadDotEnv();

export type WorkerConfig = {
  port: number;
  host: string;
  workerToken: string;
  trinityAiRoot: string;
  dryRun: boolean;
  adminApiBase: string;
  adminApiToken: string;
  /** 现网挂原任务：X-Trinity-Ops-Token */
  adminOpsToken: string;
  packageOutDir: string;
  cliTimeoutMs: number;
  /**
   * C-01：价审成功后异步跑 pricing:upstream* + 复制/上传刊例 Excel。
   * 默认开启（非 dry-run）；设 PRICING_WORKER_CATALOG_SYNC=0 关闭。
   */
  catalogSyncEnabled: boolean;
};

function env(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

export function loadConfig(): WorkerConfig {
  // src → worker → pricing → trinity-AI 仓根
  const defaultRoot = path.resolve(here, "../../..");
  return {
    port: Number(env("PORT", "8787")) || 8787,
    host: env("HOST", "0.0.0.0") || "0.0.0.0",
    workerToken: env("WORKER_TOKEN"), // 空 = 不校验（对齐 Admin 出包 URL 无 Bearer）
    trinityAiRoot: path.resolve(env("TRINITY_AI_ROOT", defaultRoot)),
    dryRun: ["1", "true", "yes"].includes(env("PRICING_WORKER_DRY_RUN", "0").toLowerCase()),
    adminApiBase: env("ADMIN_API_BASE").replace(/\/$/, ""),
    adminApiToken: env("ADMIN_API_TOKEN"),
    adminOpsToken: env("ADMIN_OPS_TOKEN"),
    packageOutDir: env("PACKAGE_OUT_DIR"),
    cliTimeoutMs: Number(env("CLI_TIMEOUT_MS", "1800000")) || 1_800_000,
    catalogSyncEnabled: !["0", "false", "no", "off"].includes(
      env("PRICING_WORKER_CATALOG_SYNC", "1").toLowerCase(),
    ),
  };
}
