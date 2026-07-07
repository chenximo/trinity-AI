/**
 * 生视频 · 供应商挂牌 vs 厂商官方价 · 汇总
 */

import { VIDEO_L3_SHEET_SUPPLIERS } from "../../config/channels-video.mjs";
import { collectVideoSupplierTierStats } from "./build-video-rows.mjs";
import {
  aggregateSupplierStats,
  buildSupplierOfficialSummaryExcelRows,
} from "./supplier-official-summary.mjs";

export const VIDEO_SUPPLIER_SUMMARY_SHEET = "汇总-供应商vs官方-生视频";

/**
 * @param {{
 *   aigcModels?: object[],
 *   officialCtx?: object,
 *   aigcTrinityMap?: object,
 *   generatedAt?: string,
 * }} ctx
 */
export function buildVideoSupplierOfficialSummaryReport(ctx = {}) {
  const generatedAt = ctx.generatedAt ?? new Date().toISOString();
  const payload = {
    aigcModels: ctx.aigcModels ?? [],
    volcModels: ctx.volcModels ?? [],
    aigcTrinityMap: ctx.aigcTrinityMap ?? {},
  };

  const bySupplier = VIDEO_L3_SHEET_SUPPLIERS.map((sup) => {
    const tierStats = collectVideoSupplierTierStats(
      sup,
      payload,
      ctx.officialCtx ?? {},
    );
    return aggregateSupplierStats(
      { key: sup.key, excelSheet: sup.excelSheet, title: sup.title },
      tierStats,
    );
  });

  return { generatedAt, bySupplier };
}

export { buildSupplierOfficialSummaryExcelRows as buildVideoSupplierOfficialSummaryExcelRows };
