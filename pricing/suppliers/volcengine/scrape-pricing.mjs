#!/usr/bin/env node
/**
 * 火山方舟模型价格抓取（官方文档，无需登录）
 *
 *   npm run pricing:supplier:volcengine:doc
 *
 * 输出：suppliers/volcengine/output/volcengine-pricing-raw.json
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRICING_RAW_OUT } from "./lib/constants.mjs";
import { scrapeVolcengineDoc } from "./lib/scrape-doc.mjs";
import { buildAllModalitiesFromRaw } from "./lib/build-from-raw.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "output");
const RAW_FILE = path.join(OUT_DIR, PRICING_RAW_OUT);

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
    const result = await scrapeVolcengineDoc(page);
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(RAW_FILE, JSON.stringify(result, null, 2), "utf8");

    const built = await buildAllModalitiesFromRaw(result);

    console.log(
      JSON.stringify(
        {
          source: result.source,
          tableCount: result.tableCount,
          rowCount: result.rowCount,
          scrapedAt: result.scrapedAt,
          textModels: built.text.modelCount,
          imageModels: built.image.modelCount,
          videoModels: built.video.modelCount,
          rawFile: RAW_FILE,
        },
        null,
        2,
      ),
    );
    console.error(`\n已写入 ${RAW_FILE}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
