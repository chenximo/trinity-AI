/**
 * 渠道 JSON 更新后同步 Excel / upstream 汇总。
 * pricing:refresh 子步骤设 PRICING_SKIP_EXCEL_SYNC=1，最后统一 upstream。
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  IMAGE_PRICING_XLSX,
  TEXT_PRICING_XLSX,
  VIDEO_PRICING_XLSX,
} from "./paths.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** @typedef {"text"|"image"|"video"} PricingModality */

const UPSTREAM_SCRIPT = {
  text: "pricing/pipeline/gen-upstream-pricing.mjs",
  image: "pricing/pipeline/gen-upstream-image-pricing.mjs",
  video: "pricing/pipeline/gen-upstream-video-pricing.mjs",
};

const UPSTREAM_XLSX = {
  text: TEXT_PRICING_XLSX,
  image: IMAGE_PRICING_XLSX,
  video: VIDEO_PRICING_XLSX,
};

/**
 * @param {{ label?: string, modality?: PricingModality }} [opts]
 */
export function syncPricingExcel({ label, modality = "text" } = {}) {
  if (process.env.PRICING_SKIP_EXCEL_SYNC === "1") {
    return { skipped: true };
  }

  const mod = modality === "image" || modality === "video" ? modality : "text";
  const script = UPSTREAM_SCRIPT[mod] ?? UPSTREAM_SCRIPT.text;
  const xlsx = UPSTREAM_XLSX[mod] ?? TEXT_PRICING_XLSX;
  const tag = label ? ` · ${label}` : "";

  console.log(`\n── pricing:upstream${tag}（同步 Excel · ${mod}）──`);
  const r = spawnSync(process.execPath, [script], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) {
    console.error(`pricing:upstream failed${tag}`);
    process.exit(r.status ?? 1);
  }
  console.log(`   Excel: ${path.relative(root, xlsx)}`);
  return { ok: true, modality: mod };
}
