#!/usr/bin/env node
/**
 * 将 official-prices-api-video.json 全量发布为本地 L4 刊例缓存
 *
 *   npm run pricing:publish-official:video
 *
 * - 备份：output/online/prices-api.json → prices-api.old.json
 * - 写入：official-prices-api-video.json → prices-api.json（及 flat/index/csv）
 *
 * 注：本命令更新仓库内 `output/online/` 参考刊例；生产 API 需另行部署。
 */

import { readFile, writeFile, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { writeOnlinePricesCache } from "./lib/fetch-online-prices-lib.mjs";
import {
  OFFICIAL_PRICES_API_VIDEO,
  OFFICIAL_PRICES_API_VIDEO_META,
  PRICES_API_FILE,
  PRICES_API_OLD_FILE,
} from "./lib/paths.mjs";

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await fileExists(OFFICIAL_PRICES_API_VIDEO))) {
    throw new Error(
      `Missing ${path.basename(OFFICIAL_PRICES_API_VIDEO)} — run npm run pricing:gen-official:video first`,
    );
  }

  const [draftRaw, metaRaw] = await Promise.all([
    readFile(OFFICIAL_PRICES_API_VIDEO, "utf8"),
    readFile(OFFICIAL_PRICES_API_VIDEO_META, "utf8").catch(() => "{}"),
  ]);
  const draft = JSON.parse(draftRaw);
  const meta = JSON.parse(metaRaw);
  const publishedAt = new Date().toISOString();

  if (await fileExists(PRICES_API_FILE)) {
    await copyFile(PRICES_API_FILE, PRICES_API_OLD_FILE);
    console.log(`Backed up → ${PRICES_API_OLD_FILE}`);
  }

  const document = {
    ...draft,
    source: "trinity_prices_api",
    fetchedAt: publishedAt,
    modelCount: draft.data?.length ?? draft.modelCount,
    publishedFrom: "official-prices-api-video.json",
    publishedAt,
    pricingPolicy: meta.pricingPolicy ?? "official_vendor_video+l2_fallback",
  };

  await writeOnlinePricesCache(document, { writeCsvFile: true });

  const changelog = path.join(
    path.dirname(PRICES_API_FILE),
    "prices-api-video-publish.log.json",
  );
  await writeFile(
    changelog,
    JSON.stringify(
      {
        publishedAt,
        from: "official-prices-api-video.json",
        draftGeneratedAt: draft.fetchedAt ?? meta.generatedAt ?? null,
        modelCount: document.modelCount,
        pricingPolicy: document.pricingPolicy,
        backup: PRICES_API_OLD_FILE,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `Published ${document.modelCount} video models → ${PRICES_API_FILE}`,
  );
  console.log(`Policy: ${document.pricingPolicy}`);
  console.log(`Wrote ${changelog}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
