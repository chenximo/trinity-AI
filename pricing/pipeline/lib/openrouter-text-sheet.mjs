/**
 * 生文册 · OR-生文 Sheet（官网 vs OpenRouter）
 */

import { MERGE_OPENROUTER_TEXT } from "./export-excel.mjs";
import { OPENROUTER_MASTER_SHEET } from "./paths.mjs";
import {
  buildOpenRouterCompareRows,
  buildOpenRouterExcelRows,
} from "./compare-openrouter-lib.mjs";

/** @param {string[]} [filterIds] */
export async function buildOpenRouterTextSheet(filterIds = []) {
  const report = await buildOpenRouterCompareRows(filterIds);
  return {
    report,
    name: OPENROUTER_MASTER_SHEET,
    rows: buildOpenRouterExcelRows(report),
    merge: MERGE_OPENROUTER_TEXT,
  };
}
