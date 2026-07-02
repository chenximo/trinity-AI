#!/usr/bin/env node
/**
 * 官方种子 ↔ L2 进货参照交叉校验（AIGC 国内/国际 · TokenHub）+ 同族档位规则
 *
 *   npm run pricing:validate:official-aigc
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PRICING_SHEET } from "../suppliers/aigc/data/pricing-sheet.mjs";
import { parseAigcTextExcel, excelModelsByKey } from "../suppliers/aigc/lib/parse-aigc-excel.mjs";
import {
  familyRulesForModel,
  TIER_FAMILY_RULES,
} from "../config/model-family-tiers.mjs";
import {
  compareTierLists,
  officialTierToCompare,
  normalizeAttrLabel,
} from "./lib/pricing-validate-lib.mjs";
import {
  OFFICIAL_MAP_FILE,
  AIGC_MAP_FILE,
  officialPricingFile,
  OUT_VALIDATE_DIR,
  TOKENHUB_FILE,
} from "./lib/paths.mjs";

function aigcDomTiersFromSheet(entry) {
  return (entry?.tiers ?? [])
    .map((row) => {
      const dom = row.domestic;
      if (!dom || (dom.input == null && dom.output == null)) return null;
      return {
        tierLabel: normalizeAttrLabel(row.attribute),
        input: dom.input,
        output: dom.output,
        cache: dom.cache,
      };
    })
    .filter(Boolean);
}

function officialTierForAigcDomestic(tier) {
  return {
    tierLabel: tier.tierLabel ?? tier.tierName,
    input: tier.input,
    output: tier.output,
    cache: tier.cache,
  };
}

function aigcIntlCache(intl) {
  if (!intl) return null;
  return intl.cache ?? intl.cacheHit ?? null;
}

function aigcIntlTiersFromSheet(entry) {
  return (entry?.tiers ?? [])
    .map((row) => {
      const intl = row.international;
      if (!intl || (intl.input == null && intl.output == null)) return null;
      return {
        tierLabel: normalizeAttrLabel(row.attribute),
        input: intl.input,
        output: intl.output,
        cache: aigcIntlCache(intl),
      };
    })
    .filter(Boolean);
}

function aigcIntlTiersFromExcel(entry) {
  return (entry?.tiers ?? [])
    .map((row) => {
      const intl = row.international;
      if (!intl || (intl.input == null && intl.output == null)) return null;
      return {
        tierLabel: normalizeAttrLabel(row.attribute),
        input: intl.input,
        output: intl.output,
        cache: aigcIntlCache(intl),
      };
    })
    .filter(Boolean);
}

function tokenhubTiersFromModel(model) {
  return (model?.tiers ?? []).map((t) => ({
    tierLabel: normalizeAttrLabel(t.tierName ?? t.tierLabel ?? ""),
    input: t.input,
    output: t.output,
    cache: t.cache,
  }));
}

function indexTokenhubText(models) {
  const map = new Map();
  for (const m of models ?? []) {
    if (m.modelType !== "Text") continue;
    const id = m.modelId?.toLowerCase();
    if (id) map.set(id, m);
  }
  return map;
}

async function main() {
  const [officialMapRaw, aigcMapRaw, officialRaw, thRaw] = await Promise.all([
    readFile(OFFICIAL_MAP_FILE, "utf8"),
    readFile(AIGC_MAP_FILE, "utf8"),
    readFile(officialPricingFile("text"), "utf8"),
    readFile(TOKENHUB_FILE, "utf8").catch(() => "{}"),
  ]);

  const officialTrinityMap = JSON.parse(officialMapRaw);
  const aigcTrinityMap = JSON.parse(aigcMapRaw);
  const official = JSON.parse(officialRaw);
  const tokenhubIndex = indexTokenhubText(JSON.parse(thRaw).models);
  const officialByVendor = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );

  const sheetMap = new Map(
    PRICING_SHEET.map((m) => [`${m.vendorCode}::${m.modelName}`, m]),
  );
  const excelMap = excelModelsByKey(parseAigcTextExcel());

  const familyViolations = [];
  const officialTooFewTiers = [];
  const aigcMissing = [];
  const aigcIntlSkipped = [];
  const aigcExcelMissing = [];
  const officialVsAigcSheet = [];
  const officialVsAigcDomestic = [];
  const officialVsAigcExcel = [];
  const officialVsTokenhub = [];
  const tokenhubNoCoverage = [];

  for (const m of official.models ?? []) {
    const vid = m.vendorModelId?.toLowerCase();
    if (!vid) continue;
    const tierCount = m.tiers?.length ?? 0;
    const rules = familyRulesForModel(vid);
    for (const rule of rules) {
      if (tierCount < rule.minTiers) {
        familyViolations.push({
          vendorModelId: m.vendorModelId,
          ruleId: rule.id,
          label: rule.label,
          expectedMinTiers: rule.minTiers,
          actualTiers: tierCount,
        });
      }
    }
    if (tierCount === 1 && rules.some((r) => r.minTiers >= 2)) {
      officialTooFewTiers.push({
        vendorModelId: m.vendorModelId,
        tierCount,
        rules: rules.map((r) => r.id),
      });
    }
  }

  for (const [tid, offMeta] of Object.entries(officialTrinityMap)) {
    if (tid.startsWith("_")) continue;
    if ((offMeta.modality ?? "text") !== "text") continue;

    const vendorId = offMeta.vendorModelId?.toLowerCase() ?? tid.toLowerCase();
    const off = officialByVendor.get(vendorId);
    if (!off) continue;

    const offCurrency = off.currency ?? "USD";
    const offTiersIntl = (off.tiers ?? []).map((t) =>
      officialTierToCompare(t, offCurrency),
    );
    const offTiersCny = (off.tiers ?? []).map(officialTierForAigcDomestic);

    const aigcRef = aigcTrinityMap[tid];
    if (aigcRef?.vendorCode && aigcRef?.modelName) {
      const aigcKey = `${aigcRef.vendorCode}::${aigcRef.modelName}`;
      const sheetEntry = sheetMap.get(aigcKey);
      const excelEntry = excelMap.get(aigcKey);

      if (sheetEntry) {
        const aigcIntlTiers = aigcIntlTiersFromSheet(sheetEntry);
        const aigcDomTiers = aigcDomTiersFromSheet(sheetEntry);

        if (aigcIntlTiers.length) {
          const issues = compareTierLists(offTiersIntl, aigcIntlTiers, {
            fields: ["input", "output", "cache"],
          });
          if (issues.length) {
            officialVsAigcSheet.push({
              trinityId: tid,
              vendorModelId: off.vendorModelId,
              aigcKey,
              issues,
            });
          }
        } else if (!aigcDomTiers.length) {
          aigcMissing.push({ trinityId: tid, aigcKey, reason: "sheet_no_price" });
        } else if (offCurrency !== "CNY") {
          aigcIntlSkipped.push({
            trinityId: tid,
            aigcKey,
            reason: "sheet_no_intl_price",
            note: "仅有国内价，官方非 CNY，跳过国际交叉校验",
          });
        } else {
          aigcIntlSkipped.push({
            trinityId: tid,
            aigcKey,
            reason: "domestic_only",
            note: "AIGC 无国际价（刊例对比显示 —）",
          });
        }

        if (offCurrency === "CNY" && aigcDomTiers.length) {
          const domIssues = compareTierLists(offTiersCny, aigcDomTiers, {
            fields: ["input", "output", "cache"],
          });
          if (domIssues.length) {
            officialVsAigcDomestic.push({
              trinityId: tid,
              vendorModelId: off.vendorModelId,
              aigcKey,
              issues: domIssues,
            });
          }
        }
      } else {
        aigcMissing.push({ trinityId: tid, aigcKey, reason: "not_in_pricing_sheet" });
      }

      if (excelEntry) {
        const aigcTiers = aigcIntlTiersFromExcel(excelEntry);
        const issues = compareTierLists(offTiersIntl, aigcTiers);
        if (issues.length) {
          officialVsAigcExcel.push({
            trinityId: tid,
            vendorModelId: off.vendorModelId,
            aigcKey,
            issues,
          });
        }
      } else if (sheetEntry) {
        aigcExcelMissing.push({ trinityId: tid, aigcKey });
      }
    }

    if (offCurrency === "CNY") {
      const thModel =
        tokenhubIndex.get(tid.toLowerCase()) ??
        tokenhubIndex.get(vendorId);
      if (thModel) {
        const thTiers = tokenhubTiersFromModel(thModel);
        const thIssues = compareTierLists(offTiersCny, thTiers, {
          fields: ["input", "output", "cache"],
        });
        if (thIssues.length) {
          officialVsTokenhub.push({
            trinityId: tid,
            vendorModelId: off.vendorModelId,
            issues: thIssues,
          });
        }
      } else {
        tokenhubNoCoverage.push({ trinityId: tid, vendorModelId: off.vendorModelId });
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    familyRuleCount: TIER_FAMILY_RULES.length,
    familyViolations,
    officialTooFewTiers,
    aigcMissing,
    aigcIntlSkipped,
    aigcExcelMissing,
    officialVsAigcSheet,
    officialVsAigcDomestic,
    officialVsAigcExcel,
    officialVsTokenhub,
    tokenhubNoCoverage,
    ok:
      familyViolations.length === 0 &&
      officialTooFewTiers.length === 0 &&
      aigcMissing.length === 0 &&
      officialVsAigcSheet.length === 0 &&
      officialVsAigcDomestic.length === 0 &&
      officialVsTokenhub.length === 0,
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  const outJson = path.join(OUT_VALIDATE_DIR, "official-aigc-cross.json");
  const outMd = path.join(OUT_VALIDATE_DIR, "official-aigc-cross.md");
  await writeFile(outJson, JSON.stringify(report, null, 2), "utf8");

  const lines = [
    "# 官方种子 ↔ L2 进货参照交叉校验",
    "",
    `> ${report.generatedAt.slice(0, 19)}Z · 同族规则 ${report.familyRuleCount} 条 · 含 AIGC 国内/国际 · TokenHub`,
    "",
    report.ok ? "## ✅ 通过" : "## ⚠ 存在问题",
    "",
  ];

  if (familyViolations.length) {
    lines.push(
      `### 同族档位不足（${familyViolations.length}）`,
      "",
      "| vendorModelId | 规则 | 应有≥ | 实际 |",
      "|---|---|---|---|",
    );
    for (const v of familyViolations) {
      lines.push(
        `| ${v.vendorModelId} | ${v.label} | ${v.expectedMinTiers} | ${v.actualTiers} |`,
      );
    }
    lines.push("");
  }

  if (officialTooFewTiers.length) {
    lines.push("### 官方单档但同族要求多档", "");
    for (const v of officialTooFewTiers) {
      lines.push(`- \`${v.vendorModelId}\` · ${v.tierCount} 档 · 规则 ${v.rules.join(", ")}`);
    }
    lines.push("");
  }

  if (aigcIntlSkipped.length) {
    lines.push("### 仅 AIGC 国内价（国际价 —，不视为缺失）", "");
    for (const v of aigcIntlSkipped) {
      lines.push(
        `- \`${v.trinityId}\` → \`${v.aigcKey}\`${v.note ? ` · ${v.note}` : ""}`,
      );
    }
    lines.push("");
  }

  if (officialVsAigcDomestic.length) {
    lines.push("### 官方 vs AIGC 国内价不一致", "");
    for (const v of officialVsAigcDomestic) {
      lines.push(`- \`${v.trinityId}\` (\`${v.vendorModelId}\`): ${v.issues.length} 项`);
    }
    lines.push("");
  }

  if (aigcMissing.length) {
    lines.push("### Trinity 已映射 · AIGC sheet 真缺失", "");
    for (const v of aigcMissing) {
      lines.push(`- \`${v.trinityId}\` → \`${v.aigcKey}\` (${v.reason})`);
    }
    lines.push("");
  }

  if (officialVsTokenhub.length) {
    lines.push("### 官方 vs TokenHub 不一致", "");
    for (const v of officialVsTokenhub) {
      lines.push(`- \`${v.trinityId}\` (\`${v.vendorModelId}\`): ${v.issues.length} 项`);
    }
    lines.push("");
  }

  if (tokenhubNoCoverage.length) {
    lines.push(
      `### TokenHub 无覆盖（${tokenhubNoCoverage.length}，不 fail）`,
      "",
    );
    for (const v of tokenhubNoCoverage.slice(0, 15)) {
      lines.push(`- \`${v.trinityId}\``);
    }
    if (tokenhubNoCoverage.length > 15) {
      lines.push(`- … 另有 ${tokenhubNoCoverage.length - 15} 个`);
    }
    lines.push("");
  }

  if (officialVsAigcSheet.length) {
    lines.push("### 官方 vs AIGC sheet 价格/档位不一致", "");
    for (const v of officialVsAigcSheet) {
      lines.push(`- \`${v.trinityId}\` (\`${v.vendorModelId}\`): ${v.issues.length} 项`);
    }
    lines.push("");
  }

  await writeFile(outMd, lines.join("\n"), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: report.ok,
        familyViolations: familyViolations.length,
        officialTooFewTiers: officialTooFewTiers.length,
        aigcMissing: aigcMissing.length,
        aigcIntlSkipped: aigcIntlSkipped.length,
        officialVsAigcSheet: officialVsAigcSheet.length,
        officialVsAigcDomestic: officialVsAigcDomestic.length,
        officialVsTokenhub: officialVsTokenhub.length,
        tokenhubNoCoverage: tokenhubNoCoverage.length,
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
