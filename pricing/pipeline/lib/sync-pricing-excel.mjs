/**
 * 渠道 JSON 更新后同步 Excel / upstream 汇总。
 * pricing:refresh 子步骤设 PRICING_SKIP_EXCEL_SYNC=1，最后统一 upstream 一次。
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/**
 * @param {{ label?: string }} [opts]
 */
export function syncPricingExcel({ label } = {}) {
  if (process.env.PRICING_SKIP_EXCEL_SYNC === "1") {
    return { skipped: true };
  }

  const tag = label ? ` · ${label}` : "";
  console.log(`\n── pricing:upstream${tag}（同步 Excel）──`);
  const r = spawnSync(
    process.execPath,
    ["pricing/pipeline/gen-upstream-pricing.mjs"],
    { cwd: root, stdio: "inherit", env: process.env },
  );
  if (r.status !== 0) {
    console.error(`pricing:upstream failed${tag}`);
    process.exit(r.status ?? 1);
  }
  console.log("   Excel: pricing/output/trinity-pricing-text.xlsx");
  return { ok: true };
}
