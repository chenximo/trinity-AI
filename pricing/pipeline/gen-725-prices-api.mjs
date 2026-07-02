#!/usr/bin/env node
/**
 * 爬虫上游官网价 → prices-api 同构 JSON（CNY ÷ 汇率 → USD）
 *
 *   npm run compare:gen-725-prices    # 7.25 → 0.725_prices-api.json
 *   npm run compare:gen-65-prices     # 6.5  → 0.65_prices-api.json
 *
 *   node pricing/pipeline/gen-725-prices-api.mjs --fx 6.5 --tag 0.65_prices --out 0.65_prices-api.json
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { assembleUpstreamPricesDocument } from "./lib/build-upstream-prices-api.mjs";
import {
  OUT_DRAFT_DIR,
  PRICES_API_FILE,
  UPSTREAM_PRICING_FILE,
  resolveOutPath,
} from "./lib/paths.mjs";
const TEMPLATE_FILE = PRICES_API_FILE;
const UPSTREAM_FILE = UPSTREAM_PRICING_FILE;
const DEFAULT_FX = 7.25;
const DEFAULT_TAG = "0.725_prices";
const OUT_FILE = path.join(OUT_DRAFT_DIR, "0.725_prices-api.json");

function parseArgs() {
  const args = process.argv.slice(2);
  let fx = DEFAULT_FX;
  let tag = DEFAULT_TAG;
  let outFile = OUT_FILE;
  let pricingPolicy = "default";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--fx" && args[i + 1]) fx = Number(args[++i]);
    else if (args[i] === "--tag" && args[i + 1]) tag = args[++i];
    else if (args[i] === "--out" && args[i + 1])
      outFile = resolveOutPath(args[++i]);
    else if (args[i] === "--policy" && args[i + 1])
      pricingPolicy = args[++i];
    else if (args[i] === "--optimized-065") pricingPolicy = "optimized_0.65";
  }
  return { fx, tag, outFile, pricingPolicy };
}

async function main() {
  const { fx, tag, outFile, pricingPolicy } = parseArgs();

  const [templateData, upstreamData] = await Promise.all([
    readFile(TEMPLATE_FILE, "utf8").then(JSON.parse),
    readFile(UPSTREAM_FILE, "utf8").then(JSON.parse),
  ]);

  const { document, buildStats } = assembleUpstreamPricesDocument({
    templateData,
    upstreamData,
    fxCnyPerUsd: fx,
    tag,
    pricingPolicy,
  });

  await mkdir(OUT_DRAFT_DIR, { recursive: true });
  await writeFile(outFile, JSON.stringify(document, null, 2), "utf8");

  const metaFile = outFile.replace(/\.json$/i, ".meta.json");
  await writeFile(metaFile, JSON.stringify(buildStats, null, 2), "utf8");

  console.log(
    `Built ${path.basename(outFile)}: ${buildStats.pricedModelCount}/${document.modelCount} models with upstream官网`,
  );
  console.log(`FX: 1 USD = ${fx} CNY · tag: ${tag} · policy: ${pricingPolicy}`);
  console.log(`By source:`, buildStats.pricedBySource);
  if (buildStats.aigcIntlInOutCount != null) {
    console.log(`AIGC intl in/out override: ${buildStats.aigcIntlInOutCount} models`);
  }
  console.log(`Wrote ${outFile}`);
  console.log(`Wrote ${metaFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
