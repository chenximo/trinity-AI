/**
 * 按模态跑 trinity-AI 根目录 npm scripts（与 Skill / tools.yaml 对齐）。
 * 不重写算法；命令可随环境覆盖。
 */
import { spawn } from "node:child_process";
import type { WorkerConfig } from "./config.js";
import type { ReviewModality } from "./types.js";
import { resolveSopSteps } from "./sopDsl/resolveSopSteps.js";

/**
 * 默认命令链（官方锚跟刊例 · 人确认写价前）：
 * 1) 拉线上刊例(V1)  2) listing V1/V2  3) 写 listing-v2 草案
 * 4) V2 vs V1 diff  5) 组装 Admin 确认单（draftPrices+diff）
 * 可用 PRICING_WORKER_STEPS_TEXT 覆盖。
 */
const DEFAULT_STEPS: Record<ReviewModality, string[]> = {
  text: [
    "pricing:fetch",
    "pricing:listing:v1v2",
    "pricing:gen-listing-v2",
    "pricing:diff:listing-v2",
    "pricing:emit-review-package",
  ],
  image: [],
  video: [],
};

export function stepsForModality(
  modality: ReviewModality,
  scenarioRaw?: string,
): string[] {
  const key = `PRICING_WORKER_STEPS_${modality.toUpperCase()}`;
  const raw = (process.env[key] ?? "").trim();
  if (raw) {
    return raw
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const dslSteps = resolveSopSteps(scenarioRaw, modality);
  if (dslSteps) return dslSteps;
  return DEFAULT_STEPS[modality];
}

export function runNpmScript(
  cfg: WorkerConfig,
  script: string,
): Promise<{ code: number; log: string }> {
  return new Promise((resolve) => {
    const child = spawn("npm", ["run", script], {
      cwd: cfg.trinityAiRoot,
      env: process.env,
      shell: process.platform === "win32",
    });
    let log = "";
    const onChunk = (buf: Buffer) => {
      const t = buf.toString("utf8");
      log += t;
      process.stdout.write(t);
    };
    child.stdout?.on("data", onChunk);
    child.stderr?.on("data", onChunk);

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      log += `\n[worker] timeout after ${cfg.cliTimeoutMs}ms\n`;
      resolve({ code: 124, log });
    }, cfg.cliTimeoutMs);

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, log });
    });
  });
}

export async function runPipeline(
  cfg: WorkerConfig,
  modality: ReviewModality,
  scenarioRaw?: string,
): Promise<{ steps: string[]; ok: boolean; log: string }> {
  const steps = stepsForModality(modality, scenarioRaw);
  let log = "";
  for (const step of steps) {
    log += `\n=== npm run ${step} ===\n`;
    const r = await runNpmScript(cfg, step);
    log += r.log;
    if (r.code !== 0) {
      return { steps, ok: false, log: log + `\n[worker] step failed: ${step} exit=${r.code}\n` };
    }
  }
  return { steps, ok: true, log };
}
