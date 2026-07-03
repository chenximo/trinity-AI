#!/usr/bin/env node
/**
 * 阿里云百炼模型价格抓取（官方文档，无需登录）
 *
 * 用法：
 *   node scripts/bailian/scrape-pricing.mjs
 *   npm run bailian:pricing:doc
 *
 * 输出：
 *   scripts/bailian/output/bailian-pricing.json   原始表格
 *   scripts/bailian/output/pricing-api.json      归一化价目（主数据）
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRICING_API_OUT,
  PRICING_RAW_OUT,
  buildPricingApiResult,
} from "./lib/pricing-api.mjs";
import { syncPricingExcel } from "../../pipeline/lib/sync-pricing-excel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "output");
const OUT_FILE = path.join(OUT_DIR, PRICING_RAW_OUT);
const API_OUT_FILE = path.join(OUT_DIR, PRICING_API_OUT);

const DOC_URL = "https://help.aliyun.com/zh/model-studio/model-pricing";

async function scrapeDoc(page) {
  await page.goto(DOC_URL, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(3000);

  const payload = await page.evaluate(() => {
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
  });

  return {
    source: "alibaba_bailian_doc",
    docUrl: DOC_URL,
    ...payload,
  };
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
    const result = await scrapeDoc(page);
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT_FILE, JSON.stringify(result, null, 2), "utf8");

    const api = buildPricingApiResult(result);
    await writeFile(API_OUT_FILE, JSON.stringify(api, null, 2), "utf8");

    console.log(
      JSON.stringify(
        {
          source: result.source,
          tableCount: result.tableCount,
          rowCount: result.rowCount,
          modelCount: api.modelCount,
          pricingTierCount: api.pricingTierCount,
          modelsWithImplicitCache: api.models.filter((m) => m.supportsCache).length,
          scrapedAt: result.scrapedAt,
          rawFile: OUT_FILE,
          apiFile: API_OUT_FILE,
        },
        null,
        2,
      ),
    );
    console.error(`\n已写入 ${OUT_FILE}\n已写入 ${API_OUT_FILE}`);
    syncPricingExcel({ label: "bailian:doc" });
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
