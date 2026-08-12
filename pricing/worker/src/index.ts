/**
 * 价审出包 Worker · HTTP 入口
 *
 * POST /v1/pricing-review/trigger  — Admin 触发（Bearer WORKER_TOKEN）
 * GET  /healthz
 */
import http from "node:http";
import fs from "node:fs";
import { loadConfig } from "./config.js";
import { assemblePackage } from "./assemblePackage.js";
import { deliverPackage } from "./callback.js";
import { syncCatalogExcelAfterReview } from "./catalogSync.js";
import { runPipeline, runNpmScript } from "./runPipeline.js";
import type { JobResult, ReviewModality, ReviewTriggerBody } from "./types.js";
import { normalizeTrigger } from "./types.js";
import {
  detectOnboardNew,
  isAutoOnboardDetect,
  type OnboardDetectResult,
} from "./onboard/detectOnboardNew.js";

const cfg = loadConfig();

function fileExists(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

/**
 * ④ 上新跟价（B1/B2）最小前置校验：
 * - 官方 trinity-map.json 必须存在且可读（用于后续 mapping/对比）
 * - 对应模态 seeds + catalog 必须存在（避免出包但无真源）
 *
 * P0：只做“文件就绪”检查；后续可按 modelIds 子集做更精确校验。
 */
function assertOnboardModelPreconditions(
  root: string,
  modality: ReviewModality,
  modelIds?: string[] | null,
): void {
  const officialMap = `${root}/pricing/suppliers/official/trinity-map.json`;
  if (!fileExists(officialMap)) {
    throw new Error(`onboard precheck fail: missing ${officialMap}`);
  }

  const seedPath = `${root}/pricing/suppliers/official/data/seeds/${modality}.mjs`;
  const catalogPath = `${root}/pricing/suppliers/official/data/catalog/${modality}.mjs`;
  if (!fileExists(seedPath)) {
    throw new Error(`onboard precheck fail: missing ${seedPath}`);
  }
  if (!fileExists(catalogPath)) {
    throw new Error(`onboard precheck fail: missing ${catalogPath}`);
  }

  // P0：map 覆盖校验（按 Admin 传入子集 modelIds），避免“确实会跑但没有对应 SKU”的无效产出。
  const ids = modelIds?.filter((s) => typeof s === "string" && s.trim() !== "") ?? [];
  if (ids.length === 0) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(officialMap, "utf8"));
  } catch (e) {
    throw new Error(`onboard precheck fail: parse officialMap json error: ${String(e)}`);
  }

  if (parsed == null || typeof parsed !== "object") {
    throw new Error(`onboard precheck fail: officialMap json unexpected shape`);
  }

  const m = parsed as Record<string, { modality?: string; vendorModelId?: string }>;
  const missing: string[] = [];
  const wrongModality: string[] = [];

  for (const id of ids) {
    const entry = m[id];
    if (!entry) {
      missing.push(id);
      continue;
    }
    if (typeof entry.vendorModelId !== "string" || entry.vendorModelId.trim() === "") {
      missing.push(id);
      continue;
    }
    if (entry.modality && entry.modality !== modality) {
      wrongModality.push(id);
    }
  }

  if (missing.length > 0 || wrongModality.length > 0) {
    const miss = missing.slice(0, 30).join(", ");
    const wrong = wrongModality.slice(0, 30).join(", ");
    throw new Error(
      `onboard precheck fail: trinity-map not ready (modality=${modality})` +
        (missing.length ? ` missing=[${miss}]${missing.length > 30 ? ` (+${missing.length - 30})` : ""}` : "") +
        (wrongModality.length
          ? ` wrongModality=[${wrong}]${wrongModality.length > 30 ? ` (+${wrongModality.length - 30})` : ""}`
          : ""),
    );
  }
}

function json(res: http.ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
  });
  res.end(data);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function authOk(req: http.IncomingMessage): boolean {
  // Admin 现网出包 URL POST **不带** Authorization；内网部署可把 WORKER_TOKEN 留空关闭校验
  if (!cfg.workerToken) return true;
  const h = req.headers.authorization || "";
  return h === `Bearer ${cfg.workerToken}`;
}

function normalizeModalities(m: ReviewTriggerBody["modality"]): ReviewModality[] {
  if (m === "all") return ["text", "image", "video"];
  if (m === "text" || m === "image" || m === "video") return [m];
  throw new Error(`invalid modality: ${String(m)}`);
}

function parseOnboardModelSubtype(note?: string | null): "B1" | "B2" {
  const n = (note ?? "").trim();
  if (!n) return "B1";
  if (/(^|[^0-9A-Za-z])B2([^0-9A-Za-z]|$)/.test(n)) return "B2";
  if (n.includes("接渠道") || n.includes("新上游")) return "B2";
  return "B1";
}

function parseOnboardModelChannel(note?: string | null): string | null {
  const n = (note ?? "").trim();
  if (!n) return null;
  const m = n.match(/(?:^|[^\w-])channel=([\w-]+)(?:$|[^\w-])/);
  return m?.[1] ?? null;
}

function scenarioForOnboard(
  detect: OnboardDetectResult,
): string {
  if (detect.subtype === "B2" && detect.channelId) {
    return `上新跟价:B2:${detect.channelId}`;
  }
  return "上新跟价:B1";
}

function attachDetectToPackage(
  pkg: Record<string, unknown>,
  detect: OnboardDetectResult,
): Record<string, unknown> {
  const extras =
    pkg.extras && typeof pkg.extras === "object"
      ? (pkg.extras as Record<string, unknown>)
      : {};
  return {
    ...pkg,
    extras: {
      ...extras,
      onboardDetect: {
        subtype: detect.subtype,
        channelId: detect.channelId,
        channelTitle: detect.channelTitle,
        pendingCount: detect.pendingCount,
        modelIds: detect.modelIds,
        summary: detect.summary,
        channels: detect.channels.map((c) => ({
          key: c.key,
          supplyId: c.supplyId,
          subtype: c.subtype,
          pendingCount: c.pendingCount,
        })),
      },
      note: detect.summary,
    },
  };
}

async function handleTrigger(raw: ReviewTriggerBody): Promise<JobResult[]> {
  const body = normalizeTrigger(raw);
  const modalities = normalizeModalities(body.modality);
  const results: JobResult[] = [];

  const manualOnboard =
    body.scenario === "上新跟价" && !isAutoOnboardDetect(body.note);
  const manualSubtype =
    body.scenario === "上新跟价" && manualOnboard
      ? parseOnboardModelSubtype(body.note)
      : null;
  const manualChannel =
    body.scenario === "上新跟价" && manualOnboard && manualSubtype === "B2"
      ? parseOnboardModelChannel(body.note)
      : null;

  for (const modality of modalities) {
    const started = Date.now();
    const steps: string[] = [];
    let detectResult: OnboardDetectResult | null = null;
    try {
      if (cfg.dryRun) {
        steps.push("dry-run (skip npm)");
        if (body.scenario === "上新跟价") {
          detectResult = await detectOnboardNew(cfg.trinityAiRoot, modality);
          steps.push(`detect-new:${detectResult.subtype}:${detectResult.channelId}:pending=${detectResult.pendingCount}`);
          steps.push(`dsl-scenario:${scenarioForOnboard(detectResult)}`);
        } else if (manualSubtype) {
          steps.push(`dsl-subtype:${manualSubtype}`);
        }
      } else {
        let scenarioForPipeline = body.scenario;

        if (body.scenario === "上新跟价") {
          if (manualOnboard && manualSubtype) {
            scenarioForPipeline =
              manualSubtype === "B2" && manualChannel
                ? `上新跟价:B2:${manualChannel}`
                : `上新跟价:${manualSubtype}`;
            steps.push(`onboard-manual:${scenarioForPipeline}`);
          } else {
            steps.push("pricing:upstream:access");
            const accessRun = await runNpmScript(cfg, "pricing:upstream:access");
            if (accessRun.code !== 0) {
              results.push({
                ok: false,
                reviewId: body.reviewId,
                taskCode: body.taskCode,
                modality,
                errorMessage: "upstream access scan failed（见 Worker 日志）",
                steps,
                durationMs: Date.now() - started,
              });
              continue;
            }
            detectResult = await detectOnboardNew(cfg.trinityAiRoot, modality);
            steps.push(
              `detect-new:${detectResult.subtype}:${detectResult.channelId}:pending=${detectResult.pendingCount}`,
            );
            scenarioForPipeline = scenarioForOnboard(detectResult);
          }

          // map 覆盖校验仅对 Admin 显式传入的 Trinity modelIds；auto detect 的上游 id 不在 official map
          assertOnboardModelPreconditions(
            cfg.trinityAiRoot,
            modality,
            body.modelIds,
          );
        }

        const pipe = await runPipeline(cfg, modality, scenarioForPipeline);
        steps.push(...pipe.steps);
        if (!pipe.ok) {
          results.push({
            ok: false,
            reviewId: body.reviewId,
            taskCode: body.taskCode,
            modality,
            errorMessage: "CLI pipeline failed（见 Worker 日志）",
            steps,
            durationMs: Date.now() - started,
          });
          continue;
        }
      }

      let packageJson = await assemblePackage(
        cfg,
        modality,
        body.reviewId,
        body.runId,
      );
      if (body.scenario === "上新跟价" && detectResult) {
        packageJson = attachDetectToPackage(packageJson, detectResult);
      }
      const delivered = await deliverPackage(cfg, body, modality, packageJson);
      steps.push(`deliver:${delivered.mode}`);

      // C-01 方案 C：确认单已交付后再异步刷总册；失败不推翻本条 ok
      steps.push("catalog-sync:queued");
      void syncCatalogExcelAfterReview(cfg, modality).catch((err) => {
        console.error(`[catalog-sync] unhandled modality=${modality}`, err);
      });

      results.push({
        ok: true,
        reviewId: body.reviewId,
        taskCode: body.taskCode,
        modality,
        packageJson,
        steps,
        durationMs: Date.now() - started,
      });
    } catch (e) {
      results.push({
        ok: false,
        reviewId: body.reviewId,
        taskCode: body.taskCode,
        modality,
        errorMessage: e instanceof Error ? e.message : String(e),
        steps,
        durationMs: Date.now() - started,
      });
    }
  }

  return results;
}

/** 进行中的任务数（简单并发限制） */
let inflight = 0;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/healthz") {
    json(res, 200, {
      ok: true,
      dryRun: cfg.dryRun,
      trinityAiRoot: cfg.trinityAiRoot,
      inflight,
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/v1/pricing-review/trigger") {
    if (!authOk(req)) {
      json(res, 401, { ok: false, error: "unauthorized" });
      return;
    }
    let body: ReviewTriggerBody;
    try {
      body = JSON.parse(await readBody(req)) as ReviewTriggerBody;
    } catch {
      json(res, 400, { ok: false, error: "invalid json" });
      return;
    }
    let normalized;
    try {
      normalized = normalizeTrigger(body);
    } catch (e) {
      json(res, 400, {
        ok: false,
        error: e instanceof Error ? e.message : "taskId or reviewId required",
      });
      return;
    }
    if (normalized.modality == null) {
      json(res, 400, { ok: false, error: "modality required" });
      return;
    }

    // 默认同步回价审包（对齐 Admin 出包 URL：无 ?async=1 时直接 ready）
    // 已配 ADMIN_OPS_TOKEN / callbackUrl 时可加 ?async=1 先 ACK 再挂包
    const asyncMode = url.searchParams.get("async") === "1";
    if (asyncMode) {
      inflight += 1;
      json(res, 202, {
        ok: true,
        accepted: true,
        taskId: normalized.reviewId,
        taskCode: normalized.taskCode,
        reviewId: normalized.reviewId,
        modality: normalized.modality,
        dryRun: cfg.dryRun,
        message: "accepted; running pipeline",
      });
      void handleTrigger(normalized)
        .then((results) => {
          console.log("[worker] done", JSON.stringify(results.map((r) => ({
            ok: r.ok,
            modality: r.modality,
            errorMessage: r.errorMessage,
            durationMs: r.durationMs,
          }))));
        })
        .catch((e) => console.error("[worker] fatal", e))
        .finally(() => {
          inflight -= 1;
        });
      return;
    }

    inflight += 1;
    try {
      const results = await handleTrigger(normalized);
      const ok = results.every((r) => r.ok);
      // 单模态同步：直接回价审包，便于 Admin「同步返回包→ready」
      if (ok && results.length === 1 && results[0].packageJson) {
        json(res, 200, results[0].packageJson);
      } else {
        json(res, ok ? 200 : 500, { ok, results });
      }
    } finally {
      inflight -= 1;
    }
    return;
  }

  json(res, 404, { ok: false, error: "not found" });
});

server.listen(cfg.port, cfg.host, () => {
  console.log(
    `[pricing-review-worker] http://${cfg.host}:${cfg.port} dryRun=${cfg.dryRun} root=${cfg.trinityAiRoot}`,
  );
});
