#!/usr/bin/env node
/**
 * 组装 Admin 价审确认单 JSON（draftPrices + diff）
 *
 * 输入（默认 · 生文）：
 *   pricing/output/draft/listing-v2_prices-api.json
 *   pricing/output/draft/listing-v2_prices-api-diff.json
 *
 * 可用 --draft/--diff 指回归档 0.65_*
 *
 * 输出：
 *   pricing/output/review-packages/review-package-{modality}.json
 *
 *   npm run pricing:emit-review-package
 *   npm run pricing:emit-review-package -- --modality text
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  DRAFT_065_FILE,
  DRAFT_065_DIFF_JSON,
  LISTING_V2_PRICES_API,
  LISTING_V2_DIFF_JSON,
  OUT_DIR,
  resolveOutPath,
} from "./lib/paths.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  let modality = "text";
  // 生文默认改走 listing V2（固定名）；可用 --draft/--diff 覆盖回 0.65 归档
  let draftFile = modality === "text" ? LISTING_V2_PRICES_API : DRAFT_065_FILE;
  let diffFile = modality === "text" ? LISTING_V2_DIFF_JSON : DRAFT_065_DIFF_JSON;
  let outFile = "";
  let reviewId = "";
  let runId = "";
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--modality" && args[i + 1]) {
      modality = args[++i];
      if (modality === "text") {
        draftFile = LISTING_V2_PRICES_API;
        diffFile = LISTING_V2_DIFF_JSON;
      }
    } else if (a === "--draft" && args[i + 1]) draftFile = resolveOutPath(args[++i]);
    else if (a === "--diff" && args[i + 1]) diffFile = resolveOutPath(args[++i]);
    else if (a === "--out" && args[i + 1]) outFile = resolveOutPath(args[++i]);
    else if (a === "--reviewId" && args[i + 1]) reviewId = args[++i];
    else if (a === "--runId" && args[i + 1]) runId = args[++i];
  }
  if (!outFile) {
    outFile = path.join(OUT_DIR, "review-packages", `review-package-${modality}.json`);
  }
  return { modality, draftFile, diffFile, outFile, reviewId, runId };
}

export async function buildReviewPackage(opts) {
  const {
    modality = "text",
    draftFile = modality === "text" ? LISTING_V2_PRICES_API : DRAFT_065_FILE,
    diffFile = modality === "text" ? LISTING_V2_DIFF_JSON : DRAFT_065_DIFF_JSON,
    reviewId = "",
    runId = "",
  } = opts;

  const draft = JSON.parse(await readFile(draftFile, "utf8"));
  const diff = JSON.parse(await readFile(diffFile, "utf8"));
  if (!draft?.data || !Array.isArray(draft.data)) {
    throw new Error(`draft missing data[]: ${draftFile}`);
  }
  if (!diff?.rows || !Array.isArray(diff.rows)) {
    throw new Error(`diff missing rows[]: ${diffFile}`);
  }

  const generatedAt = new Date().toISOString();
  const id = runId || `PR-EMIT-${modality}-${generatedAt.slice(0, 19).replace(/[:T]/g, "")}`;

  return {
    schemaVersion: 1,
    runId: id,
    modality,
    generatedAt,
    pricingPolicy: draft.pricingPolicy ?? (draft.fxNote ? "listing_v2_intl_first" : "cli_pipeline"),
    tag: `emit-${modality}`,
    fxCnyPerUsd: Number(diff.fxCnyPerUsd ?? draft.fxCnyPerUsd ?? 6.5),
    fxNote: draft.fxNote ?? diff.fxNote,
    meta: {
      tag: `emit-${modality}`,
      pricingPolicy: "emit-review-package",
      generatedAt,
      reviewId: reviewId || null,
      worker: "pricing/pipeline/emit-review-package.mjs",
      draftSourcePath: draftFile,
      diffSourcePath: diffFile,
      pricedModelCount: draft.data.length,
      diffRowCount: diff.rows.length,
    },
    draftPrices: {
      source: draft.source ?? "trinity_prices_api",
      apiUrl: draft.apiUrl,
      modality: draft.modality ?? modality,
      fxCnyPerUsd: draft.fxCnyPerUsd ?? 6.5,
      fxNote: draft.fxNote,
      fetchedAt: draft.fetchedAt ?? generatedAt,
      modelCount: draft.modelCount ?? draft.data.length,
      object: draft.object ?? "list",
      data: draft.data,
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
      rows: diff.rows,
    },
  };
}

async function main() {
  const opts = parseArgs();
  const pkg = await buildReviewPackage(opts);
  await mkdir(path.dirname(opts.outFile), { recursive: true });
  await writeFile(opts.outFile, JSON.stringify(pkg, null, 2), "utf8");
  console.log(`[emit-review-package] wrote ${opts.outFile}`);
  console.log(
    `[emit-review-package] models=${pkg.draftPrices.modelCount} diffRows=${pkg.diff.rows.length}`,
  );
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
