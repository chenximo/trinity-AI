/**
 * 将 official-prices-api-{modality}.json 发布为本地 L4 刊例缓存（按模态隔离）
 */

import { readFile, writeFile, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { writeOnlinePricesCache } from "./fetch-online-prices-lib.mjs";
import { pricesApiPaths } from "./paths.mjs";

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {object} opts
 * @param {"image"|"video"} opts.modality
 * @param {string} opts.draftFile
 * @param {string} [opts.metaFile]
 * @param {string} opts.publishedFrom basename
 * @param {string} [opts.defaultPolicy]
 */
export async function publishOfficialPricesApi(opts) {
  const { modality, draftFile, metaFile, publishedFrom, defaultPolicy } = opts;
  const paths = pricesApiPaths(modality);

  if (!(await fileExists(draftFile))) {
    throw new Error(
      `Missing ${path.basename(draftFile)} — run npm run pricing:gen-official:${modality} first`,
    );
  }

  const [draftRaw, metaRaw] = await Promise.all([
    readFile(draftFile, "utf8"),
    metaFile
      ? readFile(metaFile, "utf8").catch(() => "{}")
      : Promise.resolve("{}"),
  ]);
  const draft = JSON.parse(draftRaw);
  const meta = JSON.parse(metaRaw);
  const publishedAt = new Date().toISOString();

  if (await fileExists(paths.json)) {
    await copyFile(paths.json, paths.old);
    console.log(`Backed up → ${paths.old}`);
  }

  const document = {
    ...draft,
    modality,
    source: "trinity_prices_api",
    fetchedAt: publishedAt,
    modelCount: draft.data?.length ?? draft.modelCount,
    publishedFrom,
    publishedAt,
    pricingPolicy:
      meta.pricingPolicy ?? defaultPolicy ?? `official_vendor_${modality}+l2_fallback`,
  };

  await writeOnlinePricesCache(document, {
    writeCsvFile: true,
    modality,
  });

  if (process.env.PRICING_WRITE_PUBLISH_LOG === "1") {
    await writeFile(
      paths.publishLog,
      JSON.stringify(
        {
          publishedAt,
          modality,
          from: publishedFrom,
          draftGeneratedAt: draft.fetchedAt ?? meta.generatedAt ?? null,
          modelCount: document.modelCount,
          pricingPolicy: document.pricingPolicy,
          backup: paths.old,
          target: paths.json,
        },
        null,
        2,
      ),
      "utf8",
    );
    console.log(`Wrote ${paths.publishLog}`);
  }

  console.log(`Published ${document.modelCount} ${modality} models → ${paths.json}`);

  return { document, paths };
}
