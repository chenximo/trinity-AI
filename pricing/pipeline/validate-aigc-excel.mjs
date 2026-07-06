#!/usr/bin/env node
/**
 * AIGC 商务 Excel ↔ pricing-sheet 校验（生文 + 生图）
 *
 *   node pricing/pipeline/validate-aigc-excel.mjs
 *   node pricing/pipeline/validate-aigc-excel.mjs --modality=image
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PRICING_SHEET } from "../suppliers/aigc/data/pricing-sheet.mjs";
import { PRICING_SHEET_IMAGE } from "../suppliers/aigc/data/pricing-sheet-image.mjs";
import {
  parseAigcTextExcel,
  excelModelsByKey,
} from "../suppliers/aigc/lib/parse-aigc-excel.mjs";
import {
  parseAigcImageExcel,
  excelImageModelsByKey,
} from "../suppliers/aigc/lib/parse-aigc-image-excel.mjs";
import { compareTierLists, comparePriceTriple, normalizeAttrLabel } from "./lib/pricing-validate-lib.mjs";
import { OUT_VALIDATE_DIR } from "./lib/paths.mjs";

function parseModality(argv) {
  for (const arg of argv) {
    if (arg.startsWith("--modality=")) return arg.slice("--modality=".length);
    if (arg === "--modality") return argv[argv.indexOf(arg) + 1] ?? "all";
  }
  return "all";
}

function sheetByKey(sheet) {
  return new Map(sheet.map((m) => [`${m.vendorCode}::${m.modelName}`, m]));
}

function tiersForCompareText(entry) {
  return (entry.tiers ?? []).map((t) => ({
    tierLabel: normalizeAttrLabel(t.attribute),
    input: t.domestic?.input ?? t.international?.input,
    output: t.domestic?.output ?? t.international?.output,
    cache: t.domestic?.cache ?? t.international?.cache,
    domestic: t.domestic,
    international: t.international,
  }));
}

function tiersForCompareImage(entry) {
  return (entry.tiers ?? []).map((t) => ({
    tierLabel: normalizeAttrLabel(t.attribute),
    domestic: t.domestic,
    international: t.international,
  }));
}

function compareDomIntlPairs(excelTiers, sheetTiers, { image = false } = {}) {
  const issues = [];
  if (excelTiers.length !== sheetTiers.length) {
    issues.push({
      kind: "tier_count",
      excel: excelTiers.length,
      sheet: sheetTiers.length,
    });
  }
  const n = Math.max(excelTiers.length, sheetTiers.length);
  for (let i = 0; i < n; i++) {
    const e = excelTiers[i];
    const s = sheetTiers[i];
    if (!e || !s) {
      issues.push({ kind: "missing_tier_index", index: i });
      continue;
    }
    if (normalizeAttrLabel(e.tierLabel ?? e.attribute) !== normalizeAttrLabel(s.tierLabel ?? s.attribute)) {
      issues.push({
        kind: "attribute_mismatch",
        index: i,
        excel: e.tierLabel ?? e.attribute,
        sheet: s.tierLabel ?? s.attribute,
      });
    }
    for (const site of ["domestic", "international"]) {
      const fields = image
        ? [...new Set([
            ...Object.keys(e[site] ?? {}),
            ...Object.keys(s[site] ?? {}),
          ])]
        : [
            ...new Set([
              ...Object.keys(e[site] ?? {}),
              ...Object.keys(s[site] ?? {}),
            ]),
          ].filter(
            (f) => e[site]?.[f] != null || s[site]?.[f] != null,
          );
      const cmp = comparePriceTriple(e[site], s[site], { fields });
      if (!cmp.ok) {
        for (const [field, delta] of Object.entries(cmp.deltas)) {
          if (delta.status !== "ok") {
            issues.push({ kind: "price_mismatch", site, index: i, field, ...delta });
          }
        }
      }
    }
  }
  return issues;
}

function validateModality({ modality, excelModels, excelMap, sheet, sheetMap, tiersForCompare, image }) {
  const missingInSheet = [];
  const missingInExcel = [];
  const mismatches = [];

  for (const [key, em] of excelMap) {
    const sm = sheetMap.get(key);
    if (!sm) {
      missingInSheet.push({
        key,
        vendorCode: em.vendorCode,
        modelName: em.modelName,
        tierCount: em.tiers.length,
      });
      continue;
    }
    const issues = compareDomIntlPairs(
      tiersForCompare(em),
      tiersForCompare(sm),
      { image },
    );
    if (issues.length) {
      mismatches.push({ key, modelName: em.modelName, issues });
    }
  }

  for (const [key, sm] of sheetMap) {
    if (!excelMap.has(key)) {
      missingInExcel.push({
        key,
        vendorCode: sm.vendorCode,
        modelName: sm.modelName,
        trinityId: sm.trinityId ?? null,
      });
    }
  }

  return {
    modality,
    excelModelCount: excelMap.size,
    sheetModelCount: sheetMap.size,
    missingInSheetCount: missingInSheet.length,
    missingInExcelCount: missingInExcel.length,
    mismatchCount: mismatches.length,
    ok: missingInSheet.length === 0 && mismatches.length === 0,
    missingInSheet,
    missingInExcel,
    mismatches,
  };
}

async function main() {
  const modalityArg = parseModality(process.argv.slice(2));
  const runText = modalityArg === "all" || modalityArg === "text";
  const runImage = modalityArg === "all" || modalityArg === "image";

  const reports = [];

  if (runText) {
    const excelModels = parseAigcTextExcel();
    reports.push(
      validateModality({
        modality: "text",
        excelModels,
        excelMap: excelModelsByKey(excelModels),
        sheet: PRICING_SHEET,
        sheetMap: sheetByKey(PRICING_SHEET),
        tiersForCompare: tiersForCompareText,
        image: false,
      }),
    );
  }

  if (runImage) {
    const excelModels = parseAigcImageExcel();
    reports.push(
      validateModality({
        modality: "image",
        excelModels,
        excelMap: excelImageModelsByKey(excelModels),
        sheet: PRICING_SHEET_IMAGE,
        sheetMap: sheetByKey(PRICING_SHEET_IMAGE),
        tiersForCompare: tiersForCompareImage,
        image: true,
      }),
    );
  }

  const report = {
    generatedAt: new Date().toISOString(),
    modality: modalityArg,
    ok: reports.every((r) => r.ok),
    reports,
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  const outJson = path.join(OUT_VALIDATE_DIR, "aigc-excel-vs-sheet.json");
  const outMd = path.join(OUT_VALIDATE_DIR, "aigc-excel-vs-sheet.md");
  await writeFile(outJson, JSON.stringify(report, null, 2), "utf8");

  const lines = [
    "# AIGC 商务 Excel ↔ pricing-sheet 校验",
    "",
    `> 生成 ${report.generatedAt.slice(0, 19)}Z · modality=${modalityArg}`,
    "",
    report.ok ? "## ✅ 通过" : "## ⚠ 存在问题",
    "",
  ];

  for (const r of reports) {
    lines.push(
      `### ${r.modality}`,
      "",
      `- Excel 模型 **${r.excelModelCount}** · Sheet **${r.sheetModelCount}**`,
      `- Sheet 缺: ${r.missingInSheetCount} · 不一致: ${r.mismatchCount}`,
      "",
    );
    if (r.missingInSheet.length) {
      lines.push("**Excel 有 · Sheet 缺**", "");
      for (const m of r.missingInSheet.slice(0, 15)) {
        lines.push(`- \`${m.key}\`（${m.tierCount} 档）`);
      }
      lines.push("");
    }
    if (r.mismatches.length) {
      lines.push("**价格/档位不一致**", "");
      for (const m of r.mismatches.slice(0, 10)) {
        lines.push(`- \`${m.key}\`: ${m.issues.length} 项`);
      }
      lines.push("");
    }
  }

  await writeFile(outMd, lines.join("\n"), "utf8");

  console.log(JSON.stringify({
    ok: report.ok,
    modality: modalityArg,
    reports: reports.map((r) => ({
      modality: r.modality,
      excelModelCount: r.excelModelCount,
      sheetModelCount: r.sheetModelCount,
      missingInSheet: r.missingInSheetCount,
      mismatches: r.mismatchCount,
    })),
    outJson,
    outMd,
  }, null, 2));

  if (!report.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
