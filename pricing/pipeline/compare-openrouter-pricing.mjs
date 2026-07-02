#!/usr/bin/env node
/**
 * Trinity 线上 vs OpenRouter 对照（生文）
 */

import { writeFile, mkdir } from "node:fs/promises";
import { mergeModalityWorkbook } from "./lib/export-excel.mjs";
import { buildOpenRouterTextSheet } from "./lib/openrouter-text-sheet.mjs";
import {
  OUT_OPENROUTER_DIR,
  OPENROUTER_TEXT_MD,
  OPENROUTER_TEXT_JSON,
  TEXT_PRICING_XLSX,
} from "./lib/paths.mjs";
import { renderOpenRouterMarkdown } from "./lib/compare-openrouter-lib.mjs";

/** @param {string[]} argv */
function parseArgs(argv) {
  const filterIds = [];
  for (const arg of argv) {
    if (!arg.startsWith("-")) filterIds.push(arg);
  }
  return { filterIds };
}

async function main() {
  const { filterIds } = parseArgs(process.argv.slice(2));
  const orSheet = await buildOpenRouterTextSheet(filterIds);

  await mkdir(OUT_OPENROUTER_DIR, { recursive: true });
  await writeFile(
    OPENROUTER_TEXT_MD,
    renderOpenRouterMarkdown(orSheet.report),
    "utf8",
  );
  await writeFile(
    OPENROUTER_TEXT_JSON,
    JSON.stringify(orSheet.report, null, 2),
    "utf8",
  );

  mergeModalityWorkbook("text", [
    {
      name: orSheet.name,
      rows: orSheet.rows,
      merge: orSheet.merge,
    },
  ]);

  console.log(
    JSON.stringify(
      {
        modelCount: orSheet.report.modelCount,
        rowCount: orSheet.report.rowCount,
        mdFile: OPENROUTER_TEXT_MD,
        jsonFile: OPENROUTER_TEXT_JSON,
        masterSheet: orSheet.name,
        masterXlsx: TEXT_PRICING_XLSX,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
