#!/usr/bin/env node
/**
 * 拉取 OpenRouter 公开模型价目
 * API: GET https://openrouter.ai/api/v1/models
 *
 *   npm run pricing:supplier:openrouter
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "output/models-api.json");
const API_URL = "https://openrouter.ai/api/v1/models";

/** @param {Record<string, string|undefined>} pricing */
export function parseOpenRouterPricing(pricing) {
  const perM = (v) => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n * 1_000_000 : null;
  };
  return {
    input: perM(pricing?.prompt),
    output: perM(pricing?.completion),
    cache: perM(pricing?.input_cache_read),
    cacheCreation: perM(pricing?.input_cache_write),
  };
}

/** @param {import("openrouter").Model} m */
export function normalizeModel(m) {
  const tiers = parseOpenRouterPricing(m.pricing ?? {});
  return {
    id: m.id,
    name: m.name,
    created: m.created,
    contextLength: m.context_length,
    pricingRaw: m.pricing ?? {},
    tiers: [
      {
        tierLabel: "标准价",
        ...tiers,
      },
    ],
  };
}

async function main() {
  const res = await fetch(API_URL, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`OpenRouter API ${res.status}: ${await res.text()}`);
  }

  const body = await res.json();
  const models = (body.data ?? []).map(normalizeModel);

  const out = {
    source: API_URL,
    fetchedAt: new Date().toISOString(),
    modelCount: models.length,
    models,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(out, null, 2), "utf8");

  console.log(
    JSON.stringify(
      { modelCount: out.modelCount, outFile: OUT_FILE, fetchedAt: out.fetchedAt },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
