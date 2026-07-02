#!/usr/bin/env node
/**
 * 官方真源 ↔ 百炼 / TokenHub / AIGC国内（L3 档位覆盖 + 价格）
 *
 *   npm run pricing:validate:official-suppliers
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { normalizeAigcPricing } from "../suppliers/aigc/lib/pricing-api.mjs";
import { PRICING_SHEET } from "../suppliers/aigc/data/pricing-sheet.mjs";
import { buildOfficialVsSuppliersReport } from "./lib/validate-official-suppliers-lib.mjs";
import {
  OFFICIAL_MAP_FILE,
  AIGC_MAP_FILE,
  officialPricingFile,
  OUT_VALIDATE_DIR,
  TOKENHUB_FILE,
  BAILIAN_FILE,
} from "./lib/paths.mjs";

const OUT_JSON = path.join(OUT_VALIDATE_DIR, "official-vs-suppliers.json");
const OUT_MD = path.join(OUT_VALIDATE_DIR, "official-vs-suppliers.md");
const OUT_ALERTS = path.join(OUT_VALIDATE_DIR, "official-vs-suppliers-alerts.json");

function renderMd(report) {
  const s = report.summary;
  const lines = [
    "# 官方真源 ↔ 转售渠道（L3）",
    "",
    `> ${report.generatedAt.slice(0, 19)}Z`,
    "",
    report.ok ? "## ✅ 通过" : "## ⚠ 存在问题",
    "",
    `| 指标 | 数量 |`,
    `|------|------|`,
    `| 对比项（模型×渠道） | ${s.modelChannels} |`,
    `| 一致 | ${s.ok} |`,
    `| 有问题（未登记例外） | ${s.issues} |`,
    `| 渠道无覆盖 | ${s.noCoverage} |`,
    `| 阻塞告警 | ${s.blockingAlertCount} |`,
    "",
  ];

  const bad = report.comparisons.filter(
    (c) => c.status === "issues" && !c.annotated,
  );
  if (bad.length) {
    lines.push("### 档位/价格不一致", "");
    for (const c of bad) {
      lines.push(
        `- \`${c.trinityId}\` · **${c.supplier}** · 官方 ${c.officialTierCount} 档 / 渠道 ${c.supplierTierCount} 档 · ${c.issueCount} 项`,
      );
    }
    lines.push("");
  }

  if (report.alerts.length) {
    lines.push("### 告警摘要", "");
    for (const a of report.alerts) {
      const tag = a.blocking === false ? "（已登记例外）" : "";
      lines.push(`- **[${a.severity}]** ${a.type} · \`${a.trinityId}\` · ${a.supplier} · ${a.title}${tag}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const [mapRaw, aigcMapRaw, officialRaw, blRaw, thRaw] = await Promise.all([
    readFile(OFFICIAL_MAP_FILE, "utf8"),
    readFile(AIGC_MAP_FILE, "utf8").catch(() => "{}"),
    readFile(officialPricingFile("text"), "utf8"),
    readFile(BAILIAN_FILE, "utf8").catch(() => "{}"),
    readFile(TOKENHUB_FILE, "utf8").catch(() => "{}"),
  ]);

  const aigcMap = JSON.parse(aigcMapRaw);
  const aigcModels = normalizeAigcPricing(PRICING_SHEET, aigcMap);

  const result = buildOfficialVsSuppliersReport({
    officialTrinityMap: JSON.parse(mapRaw),
    official: JSON.parse(officialRaw),
    bailianData: JSON.parse(blRaw),
    tokenhubData: JSON.parse(thRaw),
    aigcModels,
  });

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "L1_vs_L3",
    ...result,
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(report, null, 2), "utf8");
  await writeFile(OUT_MD, renderMd(report), "utf8");
  await writeFile(
    OUT_ALERTS,
    JSON.stringify(
      { generatedAt: report.generatedAt, alerts: report.alerts },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        ok: report.ok,
        ...report.summary,
        outJson: OUT_JSON,
        outMd: OUT_MD,
        outAlerts: OUT_ALERTS,
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
