#!/usr/bin/env node
/**
 * 官方生图种子 ↔ L2 进货参照交叉校验（AIGC 国内/国际 · TokenHub）
 * 口径：PRICING-GOVERNANCE-WORKFLOW.md §3
 *
 *   node pricing/pipeline/validate-official-aigc-image.mjs
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PRICING_SHEET_IMAGE } from "../suppliers/aigc/data/pricing-sheet-image.mjs";
import {
  parseAigcImageExcel,
  excelImageModelsByKey,
} from "../suppliers/aigc/lib/parse-aigc-image-excel.mjs";
import {
  normalizeAigcImagePricing,
  indexAigcImageByTrinity,
} from "../suppliers/aigc/lib/pricing-api-image.mjs";
import {
  officialImageTiersForCompare,
  aigcImageTiersForCompare,
  tokenhubImageTiersForCompare,
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

function indexTokenhubImage(models) {
  const map = new Map();
  for (const m of models ?? []) {
    if (!/^hy-image/i.test(m.modelId ?? "")) continue;
    const id = m.modelId?.toLowerCase();
    if (id) map.set(id, m);
  }
  return map;
}

function isL2Annotated(trinityId) {
  return annotationsForModel(trinityId, "official-aigc-image").length > 0;
}

function pushCompareResult(bucket, annotatedBucket, entry) {
  if (isL2Annotated(entry.trinityId)) {
    annotatedBucket.push({ ...entry, annotated: true });
    return;
  }
  bucket.push(entry);
}

async function main() {
  const [officialMapRaw, aigcMapRaw, officialRaw, thRaw] = await Promise.all([
    readFile(OFFICIAL_MAP_FILE, "utf8"),
    readFile(AIGC_IMAGE_MAP, "utf8"),
    readFile(officialPricingFile("image"), "utf8"),
    readFile(TOKENHUB_FILE, "utf8").catch(() => "{}"),
  ]);

  const officialTrinityMap = JSON.parse(officialMapRaw);
  const aigcTrinityMap = JSON.parse(aigcMapRaw);
  delete aigcTrinityMap._comment;
  const official = JSON.parse(officialRaw);
  const tokenhubIndex = indexTokenhubImage(JSON.parse(thRaw).models);

  const officialByVendor = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );
  const sheetMap = new Map(
    PRICING_SHEET_IMAGE.map((m) => [`${m.vendorCode}::${m.modelName}`, m]),
  );
  const excelMap = excelImageModelsByKey(parseAigcImageExcel());
  const aigcModels = normalizeAigcImagePricing(PRICING_SHEET_IMAGE, aigcTrinityMap);
  const { domestic: aigcDomByTid, international: aigcIntlByTid } =
    indexAigcImageByTrinity(aigcModels, aigcTrinityMap);

  const aigcMissing = [];
  const aigcIntlSkipped = [];
  const aigcOnlySkipped = [];
  const annotatedSkipped = [];
  const officialVsAigcDomestic = [];
  const officialVsAigcIntl = [];
  const officialVsAigcExcel = [];
  const officialVsTokenhub = [];
  const tokenhubNoCoverage = [];

  for (const [tid, offMeta] of Object.entries(officialTrinityMap)) {
    if (tid.startsWith("_")) continue;
    if ((offMeta.modality ?? "text") !== "image") continue;

    const vendorId = offMeta.vendorModelId?.toLowerCase() ?? tid.toLowerCase();
    const off = officialByVendor.get(vendorId);
    if (!off) continue;

    const offCurrency = off.currency ?? "CNY";
    const region = off.region ?? "domestic";
    const isIntlOnly = region === "international_only";
    const offTiers = officialImageTiersForCompare(off);
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

    const aigcRef = aigcTrinityMap[tid];
    const tidKey = tid.toLowerCase();
    const aigcDom = aigcDomByTid.get(tidKey) ?? null;
    const aigcIntl = aigcIntlByTid.get(tidKey) ?? null;

    if (aigcRef?.vendorCode && aigcRef?.modelName) {
      const aigcKey = `${aigcRef.vendorCode}::${aigcRef.modelName}`;
      const sheetEntry = sheetMap.get(aigcKey);
      const excelEntry = excelMap.get(aigcKey);

      if (!sheetEntry) {
        aigcMissing.push({ trinityId: tid, aigcKey, reason: "not_in_pricing_sheet" });
      } else {
        const domTiers = aigcImageTiersForCompare(aigcDom, aigcRef);
        const intlTiers = aigcImageTiersForCompare(aigcIntl, aigcRef);

        if (!isIntlOnly && offCurrency === "CNY" && domTiers.length) {
          const issues = compareImageTierLists(offTiers, domTiers);
          if (issues.length) {
            pushCompareResult(
              officialVsAigcDomestic,
              annotatedSkipped,
              {
                trinityId: tid,
                vendorModelId: off.vendorModelId,
                aigcKey,
                channel: "aigc-domestic",
                issues,
              },
            );
          }
        } else if (isIntlOnly && domTiers.length) {
          aigcIntlSkipped.push({
            trinityId: tid,
            aigcKey,
            reason: "intl_only_skip_domestic",
            note: "国际站官方价，跳过 AIGC 国内 vs 官方",
          });
        }

        if (intlTiers.length) {
          const issues = compareImageTierLists(
            offTiers.map((t) => ({
              ...t,
              price:
                offCurrency === "CNY" && t.price != null
                  ? Math.round((t.price / FX_ONLINE_DOMESTIC) * 10000) / 10000
                  : t.price,
            })),
            intlTiers,
          );
          if (issues.length) {
            pushCompareResult(
              officialVsAigcIntl,
              annotatedSkipped,
              {
                trinityId: tid,
                vendorModelId: off.vendorModelId,
                aigcKey,
                channel: "aigc-international",
                issues,
              },
            );
          }
        } else if (!domTiers.length) {
          aigcMissing.push({ trinityId: tid, aigcKey, reason: "sheet_no_price" });
        } else if (isIntlOnly) {
          aigcIntlSkipped.push({
            trinityId: tid,
            aigcKey,
            reason: "sheet_no_intl_price",
          });
        }
      }

      if (excelEntry && aigcRef) {
        const excelDom = [];
        const excelIntl = [];
        for (const row of excelEntry.tiers ?? []) {
          if (row.attribute !== (aigcRef.attribute ?? "标准价")) continue;
          for (const [label, price] of Object.entries(row.domestic ?? {})) {
            excelDom.push({ tierLabel: label, price: Number(price) });
          }
          for (const [label, price] of Object.entries(row.international ?? {})) {
            excelIntl.push({ tierLabel: label, price: Number(price) });
          }
        }
        if (excelIntl.length) {
          const issues = compareImageTierLists(
            offTiers.map((t) => ({
              ...t,
              price:
                offCurrency === "CNY" && t.price != null
                  ? Math.round((t.price / FX_ONLINE_DOMESTIC) * 10000) / 10000
                  : t.price,
            })),
            excelIntl.map((t, i, arr) => ({
              tierLabel: t.tierLabel,
              tierKey: undefined,
              price: t.price,
            })),
          );
          if (issues.length) {
            pushCompareResult(
              officialVsAigcExcel,
              annotatedSkipped,
              {
                trinityId: tid,
                vendorModelId: off.vendorModelId,
                aigcKey,
                channel: "aigc-excel",
                issues,
              },
            );
          }
        }
      }
    }

    if (offCurrency === "CNY") {
      const thModel = tokenhubIndex.get(vendorId) ?? tokenhubIndex.get(tidKey);
      if (thModel) {
        const thTiers = tokenhubImageTiersForCompare(thModel);
        const issues = compareImageTierLists(offTiers, thTiers);
        if (issues.length) {
          pushCompareResult(
            officialVsTokenhub,
            annotatedSkipped,
            {
              trinityId: tid,
              vendorModelId: off.vendorModelId,
              channel: "tokenhub",
              issues,
            },
          );
        }
      } else if (/^hy-image/i.test(vendorId)) {
        tokenhubNoCoverage.push({ trinityId: tid, vendorModelId: off.vendorModelId });
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    modality: "image",
    aigcMissing,
    aigcIntlSkipped,
    aigcOnlySkipped,
    annotatedSkipped,
    officialVsAigcDomestic,
    officialVsAigcIntl,
    officialVsAigcExcel,
    officialVsTokenhub,
    tokenhubNoCoverage,
    ok:
      aigcMissing.length === 0 &&
      officialVsAigcDomestic.length === 0 &&
      officialVsAigcIntl.length === 0 &&
      officialVsTokenhub.length === 0,
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  const outJson = path.join(OUT_VALIDATE_DIR, "official-aigc-cross-image.json");
  const outMd = path.join(OUT_VALIDATE_DIR, "official-aigc-cross-image.md");
  await writeFile(outJson, JSON.stringify(report, null, 2), "utf8");

  const lines = [
    "# 官方生图种子 ↔ L2 进货参照交叉校验",
    "",
    `> ${report.generatedAt.slice(0, 19)}Z · modality=image`,
    "",
    report.ok ? "## ✅ 通过" : "## ⚠ 存在问题",
    "",
    `- AIGC 缺录入：${aigcMissing.length}`,
    `- AIGC 仅参照（aigc_only）：${aigcOnlySkipped.length}`,
    `- 已登记例外（不计 fail）：${annotatedSkipped.length}`,
    `- 官方 vs AIGC 国内：${officialVsAigcDomestic.length} 项不一致`,
    `- 官方 vs AIGC 国际：${officialVsAigcIntl.length} 项不一致`,
    `- 官方 vs TokenHub：${officialVsTokenhub.length} 项不一致`,
    "",
  ];

  for (const block of [
    ["官方 vs AIGC 国内", officialVsAigcDomestic],
    ["官方 vs AIGC 国际", officialVsAigcIntl],
    ["官方 vs TokenHub", officialVsTokenhub],
  ]) {
    const [title, items] = block;
    if (!items.length) continue;
    lines.push(`### ${title}`, "");
    for (const m of items.slice(0, 15)) {
      lines.push(`- \`${m.trinityId}\` · ${m.vendorModelId} · ${m.issues?.length ?? 0} 项`);
    }
    lines.push("");
  }

  await writeFile(outMd, lines.join("\n"), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: report.ok,
        modality: "image",
        aigcMissing: aigcMissing.length,
        aigcOnlySkipped: aigcOnlySkipped.length,
        annotatedSkipped: annotatedSkipped.length,
        officialVsAigcDomestic: officialVsAigcDomestic.length,
        officialVsAigcIntl: officialVsAigcIntl.length,
        officialVsTokenhub: officialVsTokenhub.length,
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
