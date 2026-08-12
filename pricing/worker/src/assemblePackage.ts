/**
 * 组装 Admin 可解析的价审包（必须含 draftPrices + diff.rows）。
 * 优先读 emit 产物 / listing-v2 草案+diff（0.65 仅作回退归档）；dry-run 也可组装已有文件。
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { WorkerConfig } from "./config.js";
import type { ReviewModality } from "./types.js";

function nowIso(): string {
  return new Date().toISOString();
}

async function readJsonIfExists(file: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as unknown;
  } catch {
    return null;
  }
}

function draftPaths(root: string, modality: ReviewModality): string[] {
  const draft = path.join(root, "pricing", "output", "draft");
  if (modality === "text") {
    return [
      path.join(draft, "listing-v2_prices-api.json"),
      path.join(draft, "0.65_prices-api.json"),
      path.join(draft, "0.65_prices_api_7_02.json"),
    ];
  }
  if (modality === "image") {
    return [path.join(draft, "official-prices-api-image.json")];
  }
  return [path.join(draft, "official-prices-api-video.json")];
}

function diffPaths(root: string, modality: ReviewModality): string[] {
  const draft = path.join(root, "pricing", "output", "draft");
  if (modality === "text") {
    return [
      path.join(draft, "listing-v2_prices-api-diff.json"),
      path.join(draft, "0.65_prices-api-diff.json"),
    ];
  }
  if (modality === "image") {
    return [path.join(draft, "official-prices-api-image-diff.json")];
  }
  return [path.join(draft, "official-prices-api-video-diff.json")];
}

function emitPath(root: string, modality: ReviewModality): string {
  return path.join(
    root,
    "pricing",
    "output",
    "review-packages",
    `review-package-${modality}.json`,
  );
}

async function loadDraftAndDiff(
  root: string,
  modality: ReviewModality,
): Promise<{
  draft: Record<string, unknown>;
  diff: Record<string, unknown>;
  draftPath: string;
  diffPath: string;
  packagePricingPolicy?: string;
} | null> {
  const emitted = await readJsonIfExists(emitPath(root, modality));
  if (emitted && typeof emitted === "object") {
    const o = emitted as Record<string, unknown>;
    if (o.draftPrices && o.diff) {
      return {
        draft: o.draftPrices as Record<string, unknown>,
        diff: o.diff as Record<string, unknown>,
        draftPath: emitPath(root, modality),
        diffPath: emitPath(root, modality),
        packagePricingPolicy:
          typeof o.pricingPolicy === "string" ? o.pricingPolicy : undefined,
      };
    }
  }

  let draft: Record<string, unknown> | null = null;
  let draftPath = "";
  for (const p of draftPaths(root, modality)) {
    const j = await readJsonIfExists(p);
    if (j && typeof j === "object" && Array.isArray((j as { data?: unknown }).data)) {
      draft = j as Record<string, unknown>;
      draftPath = p;
      break;
    }
  }
  let diff: Record<string, unknown> | null = null;
  let diffPath = "";
  for (const p of diffPaths(root, modality)) {
    const j = await readJsonIfExists(p);
    if (j && typeof j === "object" && Array.isArray((j as { rows?: unknown }).rows)) {
      diff = j as Record<string, unknown>;
      diffPath = p;
      break;
    }
  }
  if (!draft || !diff) return null;
  return { draft, diff, draftPath, diffPath };
}

/** 最小可过 Admin parse 的联调包（无仓内草案时） */
function buildMinimalDemoPackage(
  modality: ReviewModality,
  reviewId: number | string,
  runId?: string,
): Record<string, unknown> {
  const generatedAt = nowIso();
  const id = String(runId || `PR-DEMO-${reviewId}-${modality}`);
  const model = "demo-model-placeholder";
  return {
    schemaVersion: 1,
    runId: id,
    modality,
    generatedAt,
    pricingPolicy: "worker_demo_minimal",
    tag: "pricing-review-worker-demo",
    fxCnyPerUsd: 6.5,
    fxNote: "联调最小包 · 非正式建议价",
    meta: {
      tag: "pricing-review-worker-demo",
      pricingPolicy: "worker_demo_minimal",
      generatedAt,
      reviewId,
      worker: "pricing/worker",
      note: "未找到 listing-v2 草案/diff；返回最小可解析包。请同步 pricing/output/draft 或跑 pricing:review-text。",
    },
    draftPrices: {
      source: "trinity_prices_api",
      modality,
      fxCnyPerUsd: 6.5,
      fetchedAt: generatedAt,
      modelCount: 1,
      object: "list",
      data: [
        {
          object: "model_prices",
          model,
          display_name: model,
          modality_type: modality,
          charge_unit: "token",
          pricing_mode: "legacy",
          currency: "USD",
          price_unit: "per_million_tokens",
          price_groups: [
            {
              type: "default",
              label: "标准计价",
              prices: {
                input: { amount: "1", currency: "USD", unit: "per_million_tokens", display: "$1" },
                output: { amount: "2", currency: "USD", unit: "per_million_tokens", display: "$2" },
              },
            },
          ],
        },
      ],
    },
    diff: {
      generatedAt,
      fxCnyPerUsd: 6.5,
      summary: { total: 1, match: 0, diff: 1, withScrape: 1, withoutScrape: 0 },
      rows: [
        {
          model,
          displayName: model,
          hasScrapedUpstream: true,
          scrapeSource: "demo",
          pricingMode: "legacy",
          tierCount: 1,
          primaryVerdict: "偏差",
          tiers: [
            {
              tierIndex: 0,
              tierLabel: "标准计价",
              pricingMode: "legacy",
              fields: [
                { key: "input", online: 0.8, scraped: 1, delta: 0.2, deltaPct: 25, status: "偏差" },
                { key: "output", online: 1.5, scraped: 2, delta: 0.5, deltaPct: 33.3, status: "偏差" },
              ],
              verdict: "偏差",
            },
          ],
        },
      ],
    },
  };
}

export async function assemblePackage(
  cfg: WorkerConfig,
  modality: ReviewModality,
  reviewId: number | string,
  runId?: string,
): Promise<Record<string, unknown>> {
  const loaded = await loadDraftAndDiff(cfg.trinityAiRoot, modality);
  if (!loaded) {
    console.warn(
      `[worker] no draft/diff under ${cfg.trinityAiRoot}/pricing/output/draft；fallback minimal demo package`,
    );
    return buildMinimalDemoPackage(modality, reviewId, runId);
  }

  const { draft, diff, draftPath, diffPath, packagePricingPolicy } = loaded;
  const generatedAt = nowIso();
  const data = Array.isArray(draft.data) ? draft.data : [];
  const rows = Array.isArray(diff.rows) ? diff.rows : [];
  const id = String(runId || `PR-${reviewId}-${modality}`);

  return {
    schemaVersion: 1,
    runId: id,
    modality,
    generatedAt,
    pricingPolicy:
      packagePricingPolicy ||
      (draft.pricingPolicy as string) ||
      (String(draftPath).includes("listing-v2")
        ? "listing_v2_intl_first"
        : "official_vendor_065"),
    tag: `worker-${modality}`,
    fxCnyPerUsd: Number(diff.fxCnyPerUsd ?? draft.fxCnyPerUsd ?? 6.5),
    fxNote: (draft.fxNote as string) || undefined,
    meta: {
      generatedAt,
      reviewId,
      worker: "pricing/worker",
      draftSourcePath: draftPath,
      diffSourcePath: diffPath,
      pricedModelCount: data.length,
      diffRowCount: rows.length,
      dryRun: cfg.dryRun,
      note: cfg.dryRun
        ? "dry-run：未跑 npm CLI，使用仓内已有草案/diff 组装完整包"
        : "CLI 步骤完成后由 Worker 组装",
    },
    draftPrices: {
      source: draft.source ?? "trinity_prices_api",
      apiUrl: draft.apiUrl,
      modality: draft.modality ?? modality,
      fxCnyPerUsd: draft.fxCnyPerUsd ?? 6.5,
      fxNote: draft.fxNote,
      fetchedAt: draft.fetchedAt ?? generatedAt,
      modelCount: draft.modelCount ?? data.length,
      object: draft.object ?? "list",
      data,
    },
    diff: {
      generatedAt: diff.generatedAt ?? generatedAt,
      scrapedFile: diff.scrapedFile,
      onlineFetchedAt: diff.onlineFetchedAt,
      scrapedGeneratedAt: diff.scrapedGeneratedAt,
      scrapedPolicy: diff.scrapedPolicy,
      upstreamScrapedAt: diff.upstreamScrapedAt,
      fxCnyPerUsd: diff.fxCnyPerUsd ?? 6.5,
      summary: diff.summary ?? {},
      rows,
    },
  };
}
