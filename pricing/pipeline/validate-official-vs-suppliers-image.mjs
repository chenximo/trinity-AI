#!/usr/bin/env node
/**
 * 官方生图真源 ↔ 转售渠道（L3）：AIGC 国内/国际 · TokenHub · 火山方舟
 *
 *   node pricing/pipeline/validate-official-vs-suppliers-image.mjs
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PRICING_SHEET_IMAGE } from "../suppliers/aigc/data/pricing-sheet-image.mjs";
import {
  normalizeAigcImagePricing,
  indexAigcImageByTrinity,
} from "../suppliers/aigc/lib/pricing-api-image.mjs";
import { indexVolcengineByTrinity } from "../suppliers/volcengine/lib/pricing-api.mjs";
import {
  officialImageTiersForCompare,
  aigcImageTiersForCompare,
  tokenhubImageTiersForCompare,
  volcengineImageTiersForCompare,
  compareImageTierLists,
} from "./lib/image-pricing-validate-lib.mjs";
import { FX_ONLINE_DOMESTIC } from "./lib/compare-official-lib.mjs";
import { annotationsForModel } from "../config/pricing-annotations.mjs";
import {
  OFFICIAL_MAP_FILE,
  officialPricingFile,
  OUT_VALIDATE_DIR,
  TOKENHUB_FILE,
  SUPPLIERS_DIR,
} from "./lib/paths.mjs";

const AIGC_IMAGE_MAP = path.join(SUPPLIERS_DIR, "aigc/trinity-map-image.json");
const VOLC_IMAGE_FILE = path.join(
  SUPPLIERS_DIR,
  "volcengine/output/image/pricing-api.json",
);

const IMAGE_CHANNELS = [
  { key: "aigc-domestic", label: "AIGC国内", site: "domestic", cny: true },
  { key: "aigc-international", label: "AIGC国际", site: "international", cny: false },
  { key: "tokenhub", label: "TokenHub", site: "tokenhub", cny: true },
  { key: "volcengine", label: "火山方舟", site: "volcengine", cny: true },
];

function indexTokenhubImage(models) {
  const map = new Map();
  for (const m of models ?? []) {
    if (!/^hy-image/i.test(m.modelId ?? "")) continue;
    map.set(m.modelId.toLowerCase(), m);
  }
  return map;
}

function supplierTiers(channel, ctx, aigcRef) {
  const tid = ctx.tid;
  if (channel.key === "aigc-domestic") {
    const m = ctx.aigcDomByTid.get(tid);
    return aigcImageTiersForCompare(m, aigcRef);
  }
  if (channel.key === "aigc-international") {
    const m = ctx.aigcIntlByTid.get(tid);
    return aigcImageTiersForCompare(m, aigcRef);
  }
  if (channel.key === "tokenhub") {
    const m =
      ctx.tokenhubIndex.get(ctx.vendorId) ??
      ctx.tokenhubIndex.get(tid);
    return tokenhubImageTiersForCompare(m);
  }
  if (channel.key === "volcengine") {
    const m = ctx.volByTrinity.get(tid);
    return volcengineImageTiersForCompare(m);
  }
  return [];
}

function officialTiersForChannel(off, channel) {
  const tiers = officialImageTiersForCompare(off);
  const currency = off.currency ?? "CNY";
  if (channel.key === "aigc-international" && currency === "CNY") {
    return tiers.map((t) => ({
      ...t,
      price: t.price != null ? Math.round((t.price / FX_ONLINE_DOMESTIC) * 10000) / 10000 : null,
    }));
  }
  return tiers;
}

async function main() {
  const [mapRaw, aigcMapRaw, officialRaw, thRaw, volcRaw] = await Promise.all([
    readFile(OFFICIAL_MAP_FILE, "utf8"),
    readFile(AIGC_IMAGE_MAP, "utf8"),
    readFile(officialPricingFile("image"), "utf8"),
    readFile(TOKENHUB_FILE, "utf8").catch(() => "{}"),
    readFile(VOLC_IMAGE_FILE, "utf8").catch(() => "{}"),
  ]);

  const officialTrinityMap = JSON.parse(mapRaw);
  const aigcTrinityMap = JSON.parse(aigcMapRaw);
  delete aigcTrinityMap._comment;
  const official = JSON.parse(officialRaw);
  const aigcModels = normalizeAigcImagePricing(PRICING_SHEET_IMAGE, aigcTrinityMap);
  const { domestic: aigcDomByTid, international: aigcIntlByTid } =
    indexAigcImageByTrinity(aigcModels, aigcTrinityMap);
  const volByTrinity = indexVolcengineByTrinity(JSON.parse(volcRaw).models ?? []);
  const tokenhubIndex = indexTokenhubImage(JSON.parse(thRaw).models);

  const officialByVendor = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );

  const comparisons = [];
  const alerts = [];
  const aigcOnlySkipped = [];

  for (const [tid, offMeta] of Object.entries(officialTrinityMap)) {
    if (tid.startsWith("_")) continue;
    if ((offMeta.modality ?? "image") !== "image") continue;

    const vendorId = offMeta.vendorModelId?.toLowerCase() ?? tid.toLowerCase();
    const off = officialByVendor.get(vendorId);
    if (!off) continue;

    const seedAigcOnly = off.prices?.seedAigcOnly === true;
    if (seedAigcOnly) {
      aigcOnlySkipped.push({
        trinityId: tid,
        vendorModelId: off.vendorModelId,
        reason: "aigc_only_seed",
        note: off.prices?.seedNote ?? null,
      });
      continue;
    }

    const tidKey = tid.toLowerCase();
    const aigcRef = aigcTrinityMap[tid];
    const isIntlOnly = (off.region ?? "domestic") === "international_only";
    const ctx = {
      tid: tidKey,
      vendorId,
      aigcDomByTid,
      aigcIntlByTid,
      tokenhubIndex,
      volByTrinity,
    };

    for (const channel of IMAGE_CHANNELS) {
      if (isIntlOnly && channel.key === "aigc-domestic") continue;
      if (off.currency !== "CNY" && channel.cny && channel.key !== "aigc-international") {
        if (channel.key === "tokenhub" || channel.key === "volcengine") continue;
      }

      const supTiers = supplierTiers(channel, ctx, aigcRef);
      if (!supTiers.length) {
        comparisons.push({
          trinityId: tid,
          vendorModelId: off.vendorModelId,
          supplier: channel.label,
          channel: channel.key,
          status: "no_coverage",
          issueCount: 0,
        });
        continue;
      }

      const offTiers = officialTiersForChannel(off, channel);
      const issues = compareImageTierLists(offTiers, supTiers);
      const annotated =
        annotationsForModel(tid, "official-suppliers").length > 0 ||
        off.prices?.seedAigcOnly === true;

      const status = issues.length ? "issues" : "ok";
      comparisons.push({
        trinityId: tid,
        vendorModelId: off.vendorModelId,
        supplier: channel.label,
        channel: channel.key,
        status,
        officialTierCount: offTiers.length,
        supplierTierCount: supTiers.length,
        issueCount: issues.length,
        issues,
        annotated,
      });

      if (issues.length && !annotated) {
        alerts.push({
          schema: "trinity.pricing.alert/v1",
          severity: "error",
          type: "supplier_image_price_mismatch",
          trinityId: tid,
          vendorModelId: off.vendorModelId,
          phase: "L1_vs_L3_image",
          supplier: channel.key,
          title: `${channel.label}生图价与官方不一致`,
          detail: `${tid} · ${issues.length} 项`,
          blocking: true,
        });
      }
    }
  }

  const issuesCount = comparisons.filter(
    (c) => c.status === "issues" && !c.annotated,
  ).length;
  const report = {
    generatedAt: new Date().toISOString(),
    modality: "image",
    phase: "L1_vs_L3_image",
    ok: issuesCount === 0,
    summary: {
      modelChannels: comparisons.length,
      ok: comparisons.filter((c) => c.status === "ok").length,
      issues: issuesCount,
      noCoverage: comparisons.filter((c) => c.status === "no_coverage").length,
      aigcOnlySkipped: aigcOnlySkipped.length,
      blockingAlertCount: alerts.filter((a) => a.blocking).length,
    },
    aigcOnlySkipped,
    comparisons,
    alerts,
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  const outJson = path.join(OUT_VALIDATE_DIR, "official-vs-suppliers-image.json");
  const outMd = path.join(OUT_VALIDATE_DIR, "official-vs-suppliers-image.md");
  await writeFile(outJson, JSON.stringify(report, null, 2), "utf8");

  const lines = [
    "# 官方生图真源 ↔ 转售渠道（L3）",
    "",
    `> ${report.generatedAt.slice(0, 19)}Z`,
    "",
    report.ok ? "## ✅ 通过" : "## ⚠ 存在问题",
    "",
    `| 对比项 | ${report.summary.modelChannels} |`,
    `| 一致 | ${report.summary.ok} |`,
    `| 有问题 | ${report.summary.issues} |`,
    `| 无覆盖 | ${report.summary.noCoverage} |`,
    "",
  ];

  const bad = comparisons.filter((c) => c.status === "issues" && !c.annotated);
  if (bad.length) {
    lines.push("### 档位/价格不一致", "");
    for (const c of bad.slice(0, 20)) {
      lines.push(
        `- \`${c.trinityId}\` · **${c.supplier}** · 官方 ${c.officialTierCount} 档 / 渠道 ${c.supplierTierCount} 档`,
      );
    }
    lines.push("");
  }

  await writeFile(outMd, lines.join("\n"), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: report.ok,
        ...report.summary,
        outJson,
        outMd,
      },
      null,
      2,
    ),
  );

  if (!report.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
