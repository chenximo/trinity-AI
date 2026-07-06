/**
 * 生图 · 供应商挂牌 vs 厂商官方价 · 汇总（与生文 supplier-official-summary 同列结构）
 */

import { IMAGE_CONNECTED_SUPPLIERS } from "../../config/channels-image.mjs";
import { collectImageSupplierTierStats } from "./build-image-rows.mjs";
import {
  aggregateSupplierStats,
  buildSupplierOfficialSummaryExcelRows,
} from "./supplier-official-summary.mjs";

export const IMAGE_SUPPLIER_SUMMARY_SHEET = "汇总-供应商vs官方-生图";

/**
 * @param {{
 *   aigcModels?: object[],
 *   thData?: object,
 *   volcModels?: object[],
 *   officialCtx?: object,
 *   generatedAt?: string,
 * }} ctx
 */
export function buildImageSupplierOfficialSummaryReport(ctx = {}) {
  const generatedAt = ctx.generatedAt ?? new Date().toISOString();
  const payload = {
    aigcModels: ctx.aigcModels ?? [],
    thData: ctx.thData ?? {},
    volcModels: ctx.volcModels ?? [],
    aigcTrinityMap: ctx.aigcTrinityMap ?? {},
  };

  const bySupplier = IMAGE_CONNECTED_SUPPLIERS.map((sup) => {
    const tierStats = collectImageSupplierTierStats(
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

/** 与生文汇总 Excel 列完全一致 */
export { buildSupplierOfficialSummaryExcelRows as buildImageSupplierOfficialSummaryExcelRows };
