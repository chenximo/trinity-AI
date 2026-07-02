import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** pricing/ 根目录 */
export const PRICING_ROOT = path.join(__dirname, "../..");

export const OUT_DIR = path.join(PRICING_ROOT, "output");

/** @typedef {"text"|"image"|"video"} PricingModality */

export const OUT_ONLINE_DIR = path.join(OUT_DIR, "online");
export const OUT_UPSTREAM_DIR = path.join(OUT_DIR, "upstream");
export const OUT_OFFICIAL_DIR = path.join(OUT_DIR, "official");
export const OUT_OPENROUTER_DIR = path.join(OUT_DIR, "openrouter");
export const OUT_DRAFT_DIR = path.join(OUT_DIR, "draft");
export const OUT_VALIDATE_DIR = path.join(OUT_DIR, "validate");

export const README_FILE = path.join(OUT_DIR, "README.md");

/** 生文 Excel（刊例校验 + 供应商分表 + 汇总） */
export const TEXT_PRICING_XLSX = path.join(OUT_DIR, "trinity-pricing-text.xlsx");

/** 生图 Excel（官方价对比） */
export const IMAGE_PRICING_XLSX = path.join(OUT_DIR, "trinity-pricing-image.xlsx");

/** 生视频 Excel（官方价对比） */
export const VIDEO_PRICING_XLSX = path.join(OUT_DIR, "trinity-pricing-video.xlsx");

/** @deprecated 已拆分为 text/image/video；等同 TEXT_PRICING_XLSX */
export const MASTER_PRICING_XLSX = TEXT_PRICING_XLSX;

/** 生文册 Sheet 顺序 */
export const TEXT_SHEET_ORDER = [
  "刊例对比校验-生文",
  "TokenHub广州",
  "百炼北京",
  "AIGC国内站",
  "AIGC国际站",
  "火山方舟",
  "汇总-供应商vs官方",
];

export const IMAGE_SHEET_ORDER = ["官方-生图"];
export const VIDEO_SHEET_ORDER = ["官方-生视频"];

/** @deprecated 使用 TEXT_SHEET_ORDER */
export const MASTER_SHEET_ORDER = TEXT_SHEET_ORDER;

/** @param {PricingModality} modality */
export function pricingXlsxForModality(modality) {
  return (
    {
      text: TEXT_PRICING_XLSX,
      image: IMAGE_PRICING_XLSX,
      video: VIDEO_PRICING_XLSX,
    }[modality] ?? TEXT_PRICING_XLSX
  );
}

/** @param {PricingModality} modality */
export function sheetOrderForModality(modality) {
  return (
    {
      text: TEXT_SHEET_ORDER,
      image: IMAGE_SHEET_ORDER,
      video: VIDEO_SHEET_ORDER,
    }[modality] ?? TEXT_SHEET_ORDER
  );
}

/** 生文对比总表（合并原摘要 + 官方-生文） */
export const TEXT_COMPARE_MASTER_SHEET = "刊例对比校验-生文";

// —— 线上刊例（pricing:fetch）——
export const PRICES_API_FILE = path.join(OUT_ONLINE_DIR, "prices-api.json");
export const PRICES_API_OLD_FILE = path.join(OUT_ONLINE_DIR, "prices-api.old.json");
export const PRICES_API_FLAT_FILE = path.join(OUT_ONLINE_DIR, "prices-api-flat.json");
export const PRICES_API_INDEX_FILE = path.join(OUT_ONLINE_DIR, "prices-api-index.json");
export const PRICES_API_CSV_FILE = path.join(OUT_ONLINE_DIR, "prices-api.csv");

// —— 上游汇总（pricing:upstream）——
export const UPSTREAM_PRICING_FILE = path.join(
  OUT_UPSTREAM_DIR,
  "upstream-pricing.json",
);
export const TRINITY_MODELS_CACHE_FILE = path.join(
  OUT_UPSTREAM_DIR,
  "trinity-models-api.json",
);
export const UPSTREAM_SUMMARY_MD = path.join(OUT_UPSTREAM_DIR, "summary.md");
export const UPSTREAM_SUMMARY_CSV = path.join(OUT_UPSTREAM_DIR, "summary.csv");

/** @deprecated 使用 MASTER_PRICING_XLSX */
export const UPSTREAM_XLSX = MASTER_PRICING_XLSX;

/** @param {string} supplierKey tokenhub | bailian | aigc-domestic | aigc-international | volcengine */
export function upstreamSupplierDir(supplierKey) {
  return path.join(OUT_UPSTREAM_DIR, supplierKey);
}

/** @param {string} supplierKey @param {string} baseName 如 guangzhou / beijing / pricing */
export function upstreamSupplierPaths(supplierKey, baseName) {
  const dir = upstreamSupplierDir(supplierKey);
  return {
    dir,
    md: path.join(dir, `${baseName}.md`),
    csv: path.join(dir, `${baseName}.csv`),
  };
}

// —— 官方价对比（pricing:compare:official）——
/** @param {PricingModality} modality */
export function officialComparePaths(modality) {
  const base = path.join(OUT_OFFICIAL_DIR, modality);
  return {
    md: `${base}.md`,
    json: `${base}.json`,
    csv: `${base}.csv`,
  };
}

/** @param {PricingModality} modality */
export function officialMasterSheetName(modality) {
  return (
    { text: "官方-生文", image: "官方-生图", video: "官方-生视频" }[modality] ??
    `官方-${modality}`
  );
}

export const OPENROUTER_MASTER_SHEET = "OR-生文";

// —— OpenRouter 对比 ——
export const OPENROUTER_TEXT_MD = path.join(OUT_OPENROUTER_DIR, "text.md");
export const OPENROUTER_TEXT_JSON = path.join(OUT_OPENROUTER_DIR, "text.json");

// —— 刊例草案与 diff ——
export const DRAFT_065_FILE = path.join(OUT_DRAFT_DIR, "0.65_prices-api.json");
export const DRAFT_065_META_FILE = path.join(
  OUT_DRAFT_DIR,
  "0.65_prices-api.meta.json",
);
/** 2026-06-30 归档（上游换算稿） */
export const DRAFT_065_ARCHIVE_630 = path.join(
  OUT_DRAFT_DIR,
  "0.65_prices_api_6_30.json",
);
export const DRAFT_065_ARCHIVE_630_META = path.join(
  OUT_DRAFT_DIR,
  "0.65_prices_api_6_30.meta.json",
);
/** 2026-07-02 官方价稿（DeepSeek 保留 6/30） */
export const DRAFT_065_702 = path.join(
  OUT_DRAFT_DIR,
  "0.65_prices_api_7_02.json",
);
export const DRAFT_065_702_META = path.join(
  OUT_DRAFT_DIR,
  "0.65_prices_api_7_02.meta.json",
);
export const DRAFT_065_DIFF_MD = path.join(
  OUT_DRAFT_DIR,
  "0.65_prices-api-diff.md",
);
export const DRAFT_065_DIFF_JSON = path.join(
  OUT_DRAFT_DIR,
  "0.65_prices-api-diff.json",
);
export const DRAFT_065_DIFF_CSV = path.join(
  OUT_DRAFT_DIR,
  "0.65_prices-api-diff.csv",
);

// —— 抽样校验 ——
export const VALIDATE_SAMPLE_MD = path.join(OUT_VALIDATE_DIR, "sample.md");
export const VALIDATE_SAMPLE_JSON = path.join(OUT_VALIDATE_DIR, "sample.json");

// —— 配置与供应商真源（非 output/）——
export const CONFIG_DIR = path.join(PRICING_ROOT, "config");
export const SUPPLIERS_DIR = path.join(PRICING_ROOT, "suppliers");

export const DISCOUNTS_FILE = path.join(CONFIG_DIR, "supplier-discounts.json");
export const TOKENHUB_FILE = path.join(
  SUPPLIERS_DIR,
  "tokenhub/output/pricing-console-api.json",
);
export const BAILIAN_FILE = path.join(
  SUPPLIERS_DIR,
  "bailian/output/pricing-api.json",
);
export const AIGC_MAP_FILE = path.join(SUPPLIERS_DIR, "aigc/trinity-map.json");
export const AIGC_OUT_FILE = path.join(
  SUPPLIERS_DIR,
  "aigc/output/pricing-api.json",
);
export const AIGC_SHEET_PATH = "pricing/suppliers/aigc/data/pricing-sheet.mjs";
export const VOLCENGINE_FILE = path.join(
  SUPPLIERS_DIR,
  "volcengine/output/pricing-api.json",
);
export const VOLCENGINE_MAP_FILE = path.join(
  SUPPLIERS_DIR,
  "volcengine/trinity-map.json",
);

export const OFFICIAL_MAP_FILE = path.join(
  SUPPLIERS_DIR,
  "official/trinity-map.json",
);

/** @param {PricingModality} modality */
export function officialPricingFile(modality) {
  return path.join(
    SUPPLIERS_DIR,
    `official/output/${modality}/vendor-pricing.json`,
  );
}

/** 解析相对 output/ 的路径 */
export function resolveOutPath(relativePath) {
  return path.resolve(OUT_DIR, relativePath);
}
