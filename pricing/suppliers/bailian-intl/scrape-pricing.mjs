#!/usr/bin/env node
/**
 * 百炼国际站双真源抓取（仅本渠道）
 *   1) 帮助中心 EN：DOC_URL（DOM 表格）
 *   2) 控制台 listModelPrices API（与 url=prices 同页数据源）
 * 入/出一致 → pricing-api.json；不一致 → dual-source-diff（待人工确认）
 * 缓：控制台表明文写入；帮助中心无列则用控制台缓（非推算）
 *
 *   npm run pricing:supplier:bailian-intl:doc
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONSOLE_DOC_URL,
  DOC_URL,
  DUAL_SOURCE_DIFF_OUT,
  PRICING_API_OUT,
  PRICING_RAW_CONSOLE_OUT,
  PRICING_RAW_HELP_OUT,
  PRICING_RAW_OUT,
  buildPricingApiResult,
  buildTierItems,
  diffDualSourceTierRows,
  groupTierRows,
  parsePricingTables,
  tierCompareKey,
} from "./lib/pricing-api.mjs";
import { fetchConsolePricingViaApi } from "./lib/console-api.mjs";
import { syncPricingExcel } from "../../pipeline/lib/sync-pricing-excel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "output");

const EXTRACT_TABLES_FN = () => {
  const sections = [];

  function nearestHeading(el) {
    let node = el;
    while (node) {
      const prev = node.previousElementSibling;
      if (prev) {
        const h = prev.matches("h2,h3,h4,h5")
          ? prev
          : prev.querySelector?.("h2,h3,h4,h5");
        if (h) return h.textContent?.trim() ?? "";
      }
      node = node.parentElement;
    }
    return "";
  }

  for (const table of document.querySelectorAll("table")) {
    const rows = Array.from(table.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.querySelectorAll("th,td")).map((c) =>
        (c.textContent ?? "").replace(/\s+/g, " ").trim(),
      ),
    );
    if (rows.length < 2) continue;
    const headers = rows[0];
    const data = rows.slice(1).map((cells) => {
      const row = {};
      headers.forEach((h, i) => {
        if (h) row[h] = cells[i] ?? "";
      });
      return row;
    });
    sections.push({
      section: nearestHeading(table),
      headers,
      rows: data,
    });
  }

  return {
    url: location.href,
    title: document.title,
    scrapedAt: new Date().toISOString(),
    tables: sections,
    tableCount: sections.length,
    rowCount: sections.reduce((n, s) => n + s.rows.length, 0),
  };
};

async function scrapeHelp(page) {
  await page.goto(DOC_URL, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(4000);
  const payload = await page.evaluate(EXTRACT_TABLES_FN);
  return {
    source: "alibaba_bailian_intl_help",
    docUrl: DOC_URL,
    ...payload,
  };
}

function summarizeDiff(diff) {
  return {
    consensusCount: diff.consensusKeys.size,
    conflictCount: diff.conflicts.length,
    helpOnlyCount: diff.helpOnly.length,
    consoleOnlyCount: diff.consoleOnly.length,
    conflicts: diff.conflicts,
    helpOnlySample: diff.helpOnly.slice(0, 30),
    consoleOnlySample: diff.consoleOnly.slice(0, 30),
    status:
      diff.conflicts.length || diff.helpOnly.length || diff.consoleOnly.length
        ? "有差异：待人工确认讨论"
        : "双源一致",
  };
}

/** 双源一致档：入/出来自 help，缓优先控制台表明文 */
function mergeConsensusRows(helpRows, consensusKeys, consoleByKey) {
  return helpRows
    .filter((r) => consensusKeys.has(tierCompareKey(r)))
    .map((h) => {
      const c = consoleByKey.get(tierCompareKey(h));
      const cache = h.cache ?? c?.cache ?? null;
      if (cache == null || cache === h.cache) return h;
      const inputUnit = "USD/百万tokens";
      return {
        ...h,
        cache,
        cachePolicyMode: "table",
        items: buildTierItems({
          input: h.input,
          output: h.output,
          cache,
          inputUnit,
          outputUnit: inputUnit,
          cacheUnit: inputUnit,
        }),
      };
    });
}

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error(
      "未安装 playwright。请执行：\n  cd trinity-AI && npm install -D playwright && npx playwright install chromium",
    );
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  try {
    await mkdir(OUT_DIR, { recursive: true });

    const helpRaw = await scrapeHelp(page);
    await writeFile(
      path.join(OUT_DIR, PRICING_RAW_HELP_OUT),
      JSON.stringify(helpRaw, null, 2),
      "utf8",
    );

    let consoleRaw = null;
    let consoleError = null;
    try {
      consoleRaw = await fetchConsolePricingViaApi(page);
      // 主 raw 不落 rawItems（体积大）
      const { rawItems, ...consoleForDisk } = consoleRaw;
      await writeFile(
        path.join(OUT_DIR, PRICING_RAW_CONSOLE_OUT),
        JSON.stringify({ ...consoleForDisk, rawItemCount: rawItems?.length }, null, 2),
        "utf8",
      );
      await writeFile(
        path.join(OUT_DIR, "bailian-intl-pricing-console-raw-items.json"),
        JSON.stringify(rawItems, null, 2),
        "utf8",
      );
    } catch (err) {
      consoleError = String(err?.message ?? err);
    }

    const helpRows = parsePricingTables(helpRaw.tables ?? []).tierRows.filter(
      (r) => r.region === "International" && r.chargeUnit === "TOKEN",
    );
    const consoleRows = consoleRaw
      ? parsePricingTables(consoleRaw.tables ?? []).tierRows
      : [];
    const consoleOk = consoleRows.length > 0;

    let dualMeta;
    let api;

    if (consoleOk) {
      const diff = diffDualSourceTierRows(helpRows, consoleRows);
      const summary = summarizeDiff(diff);
      dualMeta = {
        mode: "help_vs_console_api",
        helpUrl: DOC_URL,
        consoleUrl: CONSOLE_DOC_URL,
        consoleSource: "listModelPrices API",
        helpTierRows: helpRows.length,
        consoleTierRows: consoleRows.length,
        ...summary,
      };

      const mergedRows = mergeConsensusRows(
        helpRows,
        diff.consensusKeys,
        diff.consoleByKey,
      );
      // 用合并后的 rows 建 API：绕过 consensusOnly 再滤一遍
      const fakeRaw = {
        source: "alibaba_bailian_intl_dual_consensus",
        docUrl: DOC_URL,
        scrapedAt: new Date().toISOString(),
        tables: [],
        tableCount: 0,
      };
      api = buildPricingApiResult(fakeRaw, {
        dualSource: {
          ...dualMeta,
          consensusCount: diff.consensusKeys.size,
        },
      });
      const models = groupTierRows(mergedRows);
      api.models = models;
      api.modelCount = models.length;
      api.pricingTierCount = models.reduce((n, m) => n + m.tiers.length, 0);
      api.tierRowCount = mergedRows.length;

      await writeFile(
        path.join(OUT_DIR, DUAL_SOURCE_DIFF_OUT),
        JSON.stringify(
          {
            ...dualMeta,
            conflicts: diff.conflicts,
            helpOnly: diff.helpOnly,
            consoleOnly: diff.consoleOnly,
          },
          null,
          2,
        ),
        "utf8",
      );
    } else {
      dualMeta = {
        mode: "help_only_provisional",
        helpUrl: DOC_URL,
        consoleUrl: CONSOLE_DOC_URL,
        consoleError: consoleError || "控制台 API 未返回档位",
        note: "控制台不可用时暂用帮助中心；不得当作双源已核对。",
        status: "待人工：控制台未取到价目，双源未完成",
      };
      api = buildPricingApiResult(helpRaw, { dualSource: dualMeta });
      await writeFile(
        path.join(OUT_DIR, DUAL_SOURCE_DIFF_OUT),
        JSON.stringify(dualMeta, null, 2),
        "utf8",
      );
    }

    await writeFile(
      path.join(OUT_DIR, PRICING_RAW_OUT),
      JSON.stringify(
        {
          ...helpRaw,
          source: consoleOk
            ? "alibaba_bailian_intl_dual_consensus"
            : helpRaw.source,
          dualSourceNote: dualMeta.status,
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      path.join(OUT_DIR, PRICING_API_OUT),
      JSON.stringify(api, null, 2),
      "utf8",
    );

    const mdLines = [
      "# 百炼国际站 · 双真源核对",
      "",
      `- 帮助中心：${DOC_URL}`,
      `- 控制台：${CONSOLE_DOC_URL}（\`listModelPrices\` API）`,
      `- 状态：${dualMeta.status}`,
      "",
    ];
    if (dualMeta.mode === "help_vs_console_api") {
      mdLines.push(
        `| 项 | 数量 |`,
        `|----|------|`,
        `| 一致（入真源） | ${dualMeta.consensusCount} |`,
        `| 价格不一致（待人工确认） | ${dualMeta.conflictCount} |`,
        `| 仅帮助中心 | ${dualMeta.helpOnlyCount} |`,
        `| 仅控制台 | ${dualMeta.consoleOnlyCount} |`,
        "",
      );
      if (dualMeta.conflicts?.length) {
        mdLines.push("## 价格不一致 · 待人工确认讨论", "");
        for (const c of dualMeta.conflicts.slice(0, 100)) {
          mdLines.push(
            `- \`${c.modelId}\` / ${c.tierName}: help 入${c.help.input}/出${c.help.output}/缓${c.help.cache ?? "⚠"} vs console 入${c.console.input}/出${c.console.output}/缓${c.console.cache ?? "⚠"}`,
          );
        }
        mdLines.push("");
      }
    } else {
      mdLines.push(`> ${dualMeta.consoleError || dualMeta.note}`, "");
    }
    await writeFile(
      path.join(OUT_DIR, "dual-source-diff.md"),
      mdLines.join("\n"),
      "utf8",
    );

    const intlText = api.models.filter(
      (m) => m.region === "International" && m.modelType === "Text",
    ).length;

    console.log(
      JSON.stringify(
        {
          dualSource: {
            mode: dualMeta.mode,
            status: dualMeta.status,
            consensusCount: dualMeta.consensusCount,
            conflictCount: dualMeta.conflictCount,
            helpOnlyCount: dualMeta.helpOnlyCount,
            consoleOnlyCount: dualMeta.consoleOnlyCount,
            consoleError: dualMeta.consoleError,
          },
          modelCount: api.modelCount,
          pricingTierCount: api.pricingTierCount,
          internationalTextModels: intlText,
          glm52: api.models.find((m) => m.modelId === "glm-5.2")?.tiers?.[0],
          helpRaw: path.join(OUT_DIR, PRICING_RAW_HELP_OUT),
          consoleRaw: path.join(OUT_DIR, PRICING_RAW_CONSOLE_OUT),
          diff: path.join(OUT_DIR, DUAL_SOURCE_DIFF_OUT),
          apiFile: path.join(OUT_DIR, PRICING_API_OUT),
        },
        null,
        2,
      ),
    );
    syncPricingExcel({ label: "bailian-intl:doc" });
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
