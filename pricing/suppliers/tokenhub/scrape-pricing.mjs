#!/usr/bin/env node
/**
 * TokenHub 控制台 API 价目抓取（本地运行）
 *
 * 用法：
 *   node pricing/suppliers/tokenhub/scrape-pricing.mjs
 *   npm run pricing:supplier:tokenhub:console
 *
 *   # 复用已登录 Chrome（远程调试）
 *   node pricing/suppliers/tokenhub/scrape-pricing.mjs --cdp=http://127.0.0.1:9222
 *
 * 依赖（首次）：
 *   cd trinity-AI && npm install -D playwright && npx playwright install chromium
 *
 * 输出：pricing/suppliers/tokenhub/output/pricing-console-api.json
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONSOLE_API_OUT,
  buildConsoleApiResult,
} from "./lib/pricing-api.mjs";
import { syncPricingExcel } from "../../pipeline/lib/sync-pricing-excel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "output");
const OUT_FILE = path.join(OUT_DIR, CONSOLE_API_OUT);

const CONSOLE_URL =
  "https://console.cloud.tencent.com/tokenhub/models?regionId=1&from=all";

const PROFILE_DIR = path.join(__dirname, ".profile");

function parseArgs(argv) {
  const cdp = argv.find((a) => a.startsWith("--cdp="))?.split("=")[1] ?? "";
  const loginTimeoutMs = Number(
    argv.find((a) => a.startsWith("--login-timeout="))?.split("=")[1] ?? "300000"
  );
  return { loginTimeoutMs, cdp };
}

function attachTokenHubModelListCapture(page, bucket) {
  page.on("response", async (response) => {
    try {
      const url = response.url();
      if (!url.includes("cmd=DescribeModelList") || !url.includes("serviceType=tokenhub")) {
        return;
      }
      const ct = response.headers()["content-type"] ?? "";
      if (!ct.includes("json")) return;
      const json = await response.json();
      bucket.push({ url, json });
    } catch {
      /* ignore */
    }
  });
}

async function waitForConsoleLogin(page, loginTimeoutMs) {
  await page.goto(CONSOLE_URL, { waitUntil: "domcontentloaded", timeout: 120_000 });

  const alreadyOnConsole = await page
    .evaluate(() => {
      const body = document.body?.innerText ?? "";
      return (
        /tokenhub/i.test(location.href) &&
        !/登录\s*-\s*腾讯云/.test(document.title) &&
        (/GLM|DeepSeek|Qwen|混元|Hy-/i.test(body) ||
          document.querySelectorAll("a, [class*='card']").length > 8)
      );
    })
    .catch(() => false);

  if (!alreadyOnConsole) {
    console.error(`[console] 请在脚本弹出的浏览器窗口登录腾讯云。`);
    console.error(`[console] 登录后停留在模型列表页，最长等待 ${loginTimeoutMs / 1000}s…`);
    await page.waitForFunction(
      () => {
        const body = document.body?.innerText ?? "";
        if (/登录\s*-\s*腾讯云/.test(document.title)) return false;
        if (!/tokenhub|console\.cloud\.tencent/i.test(location.href)) return false;
        return /元\/百万|百万\s*tokens|GLM|DeepSeek|Qwen|混元|模型/i.test(body);
      },
      { timeout: loginTimeoutMs },
    );
  }
}

async function scrollListPage(page) {
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);
}

async function scrapeConsole(page, loginTimeoutMs) {
  const apiPayloads = [];
  attachTokenHubModelListCapture(page, apiPayloads);

  await waitForConsoleLogin(page, loginTimeoutMs);
  await scrollListPage(page);

  // 再等一轮列表接口（滚动/筛选可能触发第二次 DescribeModelList）
  await page.waitForTimeout(2000);

  const scrapedAt = new Date().toISOString();
  const result = buildConsoleApiResult({ payloads: apiPayloads, scrapedAt });

  if (!result) {
    throw new Error(
      "未捕获 DescribeModelList。请确认已登录并在模型广场列表页，或重试 --cdp 连接已登录的 Chrome。",
    );
  }

  return result;
}

async function openBrowser(chromium, { cdp }) {
  const viewport = { width: 1440, height: 900 };
  const userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

  if (cdp) {
    console.error(`[console] 连接已有 Chrome：${cdp}`);
    const browser = await chromium.connectOverCDP(cdp);
    const context = browser.contexts()[0] ?? (await browser.newContext());
    const page = context.pages()[0] ?? (await context.newPage());
    return { page, close: () => browser.close() };
  }

  console.error(`[console] 使用持久配置目录：${PROFILE_DIR}`);
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport,
    userAgent,
    slowMo: 50,
  });
  const page = context.pages()[0] ?? (await context.newPage());
  return { page, close: () => context.close() };
}

async function main() {
  const { loginTimeoutMs, cdp } = parseArgs(process.argv.slice(2));

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error(
      "未安装 playwright。请执行：\n  cd trinity-AI && npm install -D playwright && npx playwright install chromium"
    );
    process.exit(1);
  }

  const { page, close } = await openBrowser(chromium, { cdp });

  try {
    const result = await scrapeConsole(page, loginTimeoutMs);

    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT_FILE, JSON.stringify(result, null, 2), "utf8");

    console.log(
      JSON.stringify(
        {
          source: result.source,
          modelCount: result.modelCount,
          pricingTierCount: result.pricingTierCount,
          scrapedAt: result.scrapedAt,
          outFile: OUT_FILE,
        },
        null,
        2,
      ),
    );
    console.error(`\n已写入 ${OUT_FILE}`);
    syncPricingExcel({ label: "tokenhub" });
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
