#!/usr/bin/env node
/**
 * 刊例 V1 / V2 对比草案（不写生产 /v1/prices）
 *
 *   node pricing/pipeline/gen-listing-v1v2.mjs
 *
 * V1 = 国内 seed CNY ÷ 6.5（或已是 USD 则直用）
 * V2 = text-intl seed 优先；无则 = V1
 * 输出：pricing/output/listing-v1v2/
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TEXT_SEED } from "../suppliers/official/data/seeds/text.mjs";
import { TEXT_INTL_SEED } from "../suppliers/official/data/seeds/text-intl.mjs";
import { readOnlinePricesCache } from "./lib/fetch-online-prices-lib.mjs";
import {
  LISTING_POLICY,
  FX_V1_CNY_PER_USD,
  buildListingV1V2ModelRows,
  listingMoneyCell,
  listingUsdCell,
  listingPctDelta,
} from "./lib/listing-v1v2-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../output/listing-v1v2");

async function main() {
  const modality = "text";
  let onlineIds = [];
  try {
    const { raw } = await readOnlinePricesCache(modality);
    const models = raw.models || raw.data || [];
    onlineIds = models.map((m) => m.id || m.model).filter(Boolean);
  } catch (e) {
    console.warn("online cache missing, using seed keys only:", e.message);
    onlineIds = [
      ...new Set([...Object.keys(TEXT_SEED), ...Object.keys(TEXT_INTL_SEED)]),
    ];
  }

  const rows = [];
  for (const id of onlineIds.sort()) {
    rows.push(...buildListingV1V2ModelRows(id, TEXT_SEED, TEXT_INTL_SEED));
  }

  await mkdir(OUT_DIR, { recursive: true });
  const jsonPath = path.join(OUT_DIR, `listing-v1v2-${modality}.json`);
  const mdPath = path.join(OUT_DIR, `listing-v1v2-${modality}.md`);

  const payload = {
    generatedAt: new Date().toISOString(),
    modality,
    listing_policy: LISTING_POLICY,
    fx_v1: FX_V1_CNY_PER_USD,
    onlineModelCount: onlineIds.length,
    intlSeedCount: Object.keys(TEXT_INTL_SEED).length,
    rows,
  };
  await writeFile(jsonPath, JSON.stringify(payload, null, 2), "utf8");

  const lines = [
    `# 刊例 V1 / V2 对比 · ${modality}`,
    "",
    `> listing_policy = **${LISTING_POLICY}**（当前生效）· FX_V1 = ${FX_V1_CNY_PER_USD}`,
    `> 生成：${payload.generatedAt} · 线上模型 ${onlineIds.length} · 已录国际站 ${payload.intlSeedCount}`,
    `> **本文件为草案，不写生产 /v1/prices**`,
    "",
    "| Trinity ID | 档位 | 厂商官方·国内 | 厂商官方·国际 | 刊例·V1 | 刊例·V2 | V2 vs V1（入/出） | V2 来源 | note |",
    "|---|---|---|---|---|---|---|---|---|",
  ];

  for (const r of rows) {
    const vs =
      r.v1 && r.v2
        ? `入 ${listingPctDelta(r.v2.input, r.v1.input)} / 出 ${listingPctDelta(r.v2.output, r.v1.output)}`
        : "⚠";
    lines.push(
      `| ${r.modelId} | ${r.tierLabel} | ${listingMoneyCell(r.domestic)} | ${listingMoneyCell(r.international)} | ${listingUsdCell(r.v1)} | ${listingUsdCell(r.v2)} | ${vs} | ${r.v2Source} | ${r.note || ""} |`,
    );
  }

  const withIntl = new Set(
    rows
      .filter((r) => r.v2Source === "intl" || r.v2Source === "intl-uniform")
      .map((r) => r.modelId),
  );
  const usdDirect = new Set(
    rows.filter((r) => r.v2Source === "usd-direct").map((r) => r.modelId),
  );
  const fallback = new Set(
    rows.filter((r) => r.v2Source === "fallback-v1").map((r) => r.modelId),
  );
  const missing = new Set(
    rows.filter((r) => r.v2Source === "missing").map((r) => r.modelId),
  );

  lines.push(
    "",
    "## 覆盖摘要",
    "",
    `| 项 | 数 |`,
    `|----|----|`,
    `| 线上模型 | ${onlineIds.length} |`,
    `| 已用国际站（V2≠回退） | ${withIntl.size} |`,
    `| 国际-only USD（V2=V1） | ${usdDirect.size} |`,
    `| V2=回退 V1（待补国际） | ${fallback.size} |`,
    `| 双锚皆缺 | ${missing.size} |`,
    "",
    "### 待补国际站（当前回退 V1 的国内系）",
    "",
  );

  const domesticVendorsHint = rows
    .filter((r) => r.v2Source === "fallback-v1" && r.domestic?.currency === "CNY")
    .map((r) => r.modelId);
  const uniq = [...new Set(domesticVendorsHint)].sort();
  for (const id of uniq) lines.push(`- ${id}`);

  await writeFile(mdPath, lines.join("\n") + "\n", "utf8");
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
  console.log(
    `intl-applied=${withIntl.size} fallback-v1=${fallback.size} missing=${missing.size}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
