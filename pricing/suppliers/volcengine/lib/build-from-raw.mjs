import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DOC_URL, MODALITIES, PRICING_RAW_OUT } from "./constants.mjs";
import { normalizeTextFromRaw, buildTextApiModels } from "./normalize-text.mjs";
import { normalizeImageFromRaw, buildImageApiModels } from "./normalize-image.mjs";
import { normalizeVideoFromRaw, buildVideoApiModels } from "./normalize-video.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "output");
const MAP_FILE = path.join(__dirname, "..", "trinity-map.json");

/**
 * @param {Record<string, unknown>} trinityMap
 */
function stripMeta(trinityMap) {
  const map = { ...trinityMap };
  delete map._comment;
  delete map._doc;
  return map;
}

/**
 * @param {Awaited<ReturnType<typeof import('./scrape-doc.mjs').scrapeVolcengineDoc>>} raw
 * @param {Record<string, { trinityId?: string }>} trinityMap
 */
export function buildModalitiesFromRaw(raw, trinityMap = {}) {
  const textSheet = normalizeTextFromRaw(raw);
  const imageSheet = normalizeImageFromRaw(raw);
  const videoSheet = normalizeVideoFromRaw(raw);

  return {
    text: {
      models: buildTextApiModels(textSheet, trinityMap),
      sheetCount: textSheet.length,
    },
    image: {
      models: buildImageApiModels(imageSheet, trinityMap),
      sheetCount: imageSheet.length,
    },
    video: {
      models: buildVideoApiModels(videoSheet, trinityMap),
      sheetCount: videoSheet.length,
    },
  };
}

/**
 * @param {Awaited<ReturnType<typeof import('./scrape-doc.mjs').scrapeVolcengineDoc>>} raw
 */
export async function buildAllModalitiesFromRaw(raw) {
  let trinityMap = {};
  try {
    trinityMap = stripMeta(JSON.parse(await readFile(MAP_FILE, "utf8")));
  } catch {
    /* optional */
  }

  const built = buildModalitiesFromRaw(raw, trinityMap);
  const generatedAt = new Date().toISOString();
  const dataDate = raw.scrapedAt?.slice(0, 7) ?? generatedAt.slice(0, 7);

  /** @type {Record<string, { outFile: string, modelCount: number, trinityMappedCount: number }>} */
  const summary = {};

  for (const modality of MODALITIES) {
    const { models } = built[modality];
    const mapped = models.filter((m) => m.trinityId);
    const out = {
      source: "volcengine_ark_pricing_doc",
      docUrl: DOC_URL,
      modality,
      dataDate,
      generatedAt,
      scrapedAt: raw.scrapedAt ?? null,
      modelCount: models.length,
      trinityMappedCount: new Set(mapped.map((m) => m.trinityId)).size,
      models,
    };

    const outDir = path.join(OUT_DIR, modality);
    await mkdir(outDir, { recursive: true });
    const outFile = path.join(outDir, "pricing-api.json");
    await writeFile(outFile, JSON.stringify(out, null, 2), "utf8");

    summary[modality] = {
      outFile,
      modelCount: models.length,
      trinityMappedCount: out.trinityMappedCount,
    };
  }

  // 生文兼容旧路径 output/pricing-api.json
  const textOut = path.join(OUT_DIR, "pricing-api.json");
  await writeFile(
    textOut,
    JSON.stringify(
      {
        ...built.text,
        source: "volcengine_ark_pricing_doc",
        docUrl: DOC_URL,
        modality: "text",
        dataDate,
        generatedAt,
        scrapedAt: raw.scrapedAt ?? null,
        modelCount: built.text.models.length,
        trinityMappedCount: summary.text.trinityMappedCount,
        models: built.text.models,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    text: summary.text,
    image: summary.image,
    video: summary.video,
  };
}

/**
 * @param {string} rawPath
 * @param {import('./constants.mjs').MODALITIES[number] | 'all'} modality
 */
export async function buildFromRawFile(rawPath, modality = "all") {
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  if (modality === "all") {
    return buildAllModalitiesFromRaw(raw);
  }
  const all = await buildAllModalitiesFromRaw(raw);
  return { [modality]: all[modality] };
}
