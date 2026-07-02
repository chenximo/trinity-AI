#!/usr/bin/env node
/**
 * AIGC 商务 Excel ↔ pricing-sheet.mjs 校验
 *
 *   node pricing/pipeline/validate-aigc-excel.mjs
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PRICING_SHEET } from "../suppliers/aigc/data/pricing-sheet.mjs";
import {
  parseAigcTextExcel,
  excelModelsByKey,
} from "../suppliers/aigc/lib/parse-aigc-excel.mjs";
import { compareTierLists, comparePriceTriple, normalizeAttrLabel } from "./lib/pricing-validate-lib.mjs";
import { OUT_VALIDATE_DIR } from "./lib/paths.mjs";

function sheetByKey(sheet) {
  return new Map(sheet.map((m) => [`${m.vendorCode}::${m.modelName}`, m]));
}

function tiersForCompare(entry) {
  return (entry.tiers ?? []).map((t) => ({
    tierLabel: normalizeAttrLabel(t.attribute),
    input: t.domestic?.input ?? t.international?.input,
    output: t.domestic?.output ?? t.international?.output,
    cache: t.domestic?.cache ?? t.international?.cache,
    domestic: t.domestic,
    international: t.international,
  }));
}

function compareDomIntlPairs(excelTiers, sheetTiers) {
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
    if (normalizeAttrLabel(e.attribute) !== normalizeAttrLabel(s.attribute)) {
      issues.push({
        kind: "attribute_mismatch",
        index: i,
        excel: e.attribute,
        sheet: s.attribute,
      });
    }
    for (const site of ["domestic", "international"]) {
      const fields = [
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

async function main() {
  const excelModels = parseAigcTextExcel();
  const excelMap = excelModelsByKey(excelModels);
  const sheetMap = sheetByKey(PRICING_SHEET);

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
    const issues = compareDomIntlPairs(em.tiers, sm.tiers);
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

  const report = {
    generatedAt: new Date().toISOString(),
    excelModelCount: excelMap.size,
    sheetModelCount: sheetMap.size,
    missingInSheetCount: missingInSheet.length,
    missingInExcelCount: missingInExcel.length,
    mismatchCount: mismatches.length,
    ok:
      missingInSheet.length === 0 &&
      mismatches.length === 0,
    missingInSheet,
    missingInExcel,
    mismatches,
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  const outJson = path.join(OUT_VALIDATE_DIR, "aigc-excel-vs-sheet.json");
  const outMd = path.join(OUT_VALIDATE_DIR, "aigc-excel-vs-sheet.md");
  await writeFile(outJson, JSON.stringify(report, null, 2), "utf8");

  const lines = [
    "# AIGC 商务 Excel ↔ pricing-sheet 校验",
    "",
    `> 生成 ${report.generatedAt.slice(0, 19)}Z`,
    `> Excel 模型 **${report.excelModelCount}** · Sheet **${report.sheetModelCount}**`,
    "",
    report.ok
      ? "## ✅ 通过（已录入模型与 Excel 一致）"
      : "## ⚠ 存在问题",
    "",
  ];

  if (missingInSheet.length) {
    lines.push("### Excel 有 · Sheet 缺", "");
    for (const m of missingInSheet) {
      lines.push(`- \`${m.key}\`（${m.tierCount} 档）`);
    }
    lines.push("");
  }
  if (missingInExcel.length) {
    lines.push("### Sheet 有 · Excel 无（可能已下架）", "");
    for (const m of missingInExcel.slice(0, 30)) {
      lines.push(
        `- \`${m.key}\`${m.trinityId ? ` · Trinity \`${m.trinityId}\`` : ""}`,
      );
    }
    if (missingInExcel.length > 30) {
      lines.push(`- … 另有 ${missingInExcel.length - 30} 项`);
    }
    lines.push("");
  }
  if (mismatches.length) {
    lines.push("### 价格/档位不一致", "");
    for (const m of mismatches.slice(0, 20)) {
      lines.push(`- \`${m.key}\`: ${m.issues.length} 项`);
    }
    lines.push("");
  }

  await writeFile(outMd, lines.join("\n"), "utf8");

  console.log(JSON.stringify({
    ok: report.ok,
    excelModelCount: report.excelModelCount,
    sheetModelCount: report.sheetModelCount,
    missingInSheet: report.missingInSheetCount,
    missingInExcel: report.missingInExcelCount,
    mismatches: report.mismatchCount,
    outJson,
    outMd,
  }, null, 2));

  if (!report.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
