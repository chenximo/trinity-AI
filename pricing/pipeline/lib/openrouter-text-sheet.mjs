/**
 * 生文册 · OR-生文 Sheet（官网 vs OpenRouter）
 */

import { MERGE_OPENROUTER_TEXT } from "./export-excel.mjs";
import { OPENROUTER_MASTER_SHEET } from "./paths.mjs";
import {
  buildOpenRouterCompareRows,
  buildOpenRouterExcelRows,
} from "./compare-openrouter-lib.mjs";

/** @param {string[]} [filterIds] @param {{ preloaded?: object }} [opts] */
export async function buildOpenRouterTextSheet(filterIds = [], opts = {}) {
  const report = await buildOpenRouterCompareRows(filterIds, opts);
  return {
    report,
    name: OPENROUTER_MASTER_SHEET,
    rows: buildOpenRouterExcelRows(report),
    merge: MERGE_OPENROUTER_TEXT,
  };
}
