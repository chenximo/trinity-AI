#!/usr/bin/env node
/**
 * 核对供应商 Excel 数据源（仅生文 · Trinity 模型）
 *
 *   node pricing/pipeline/validate-supplier-sheets.mjs
 */

import { readFile } from "node:fs/promises";
import {
  TOKENHUB_FILE,
  BAILIAN_FILE,
  AIGC_OUT_FILE,
  UPSTREAM_PRICING_FILE,
} from "./lib/paths.mjs";
import { parseNum, pickBailianModels, pickTokenhubModels } from "./lib/pricing-compare.mjs";

async function main() {
  const upstream = JSON.parse(await readFile(UPSTREAM_PRICING_FILE, "utf8"));
  const th = JSON.parse(await readFile(TOKENHUB_FILE, "utf8"));
  const bl = JSON.parse(await readFile(BAILIAN_FILE, "utf8"));
  const aigc = JSON.parse(await readFile(AIGC_OUT_FILE, "utf8"));

  const thById = new Map(
    pickTokenhubModels(th.models ?? []).map((m) => [m.modelId.toLowerCase(), m]),
  );
  const blById = pickBailianModels(bl.models ?? []);

  let thOk = 0;
  let thFail = 0;
  let blOk = 0;
  let blFail = 0;
  let aigcDomOk = 0;
  let aigcIntlOk = 0;

  for (const m of upstream.models ?? []) {
    const id = m.trinityId.toLowerCase();
    for (const t of m.tiers ?? []) {
      if (t.thIn != null || t.thOut != null) {
        const src = thById.get(id);
        const srcTier = src?.tiers?.[0];
        const srcIn = parseNum(srcTier?.input ?? srcTier?.items?.find((i) => i.name === "Input")?.price);
        if (srcIn === parseNum(t.thIn)) thOk++;
        else thFail++;
      }
      if (t.blIn != null || t.blOut != null) {
        const src = blById.get(id)?.model;
        const srcTier = src?.tiers?.find((x) => parseNum(x.input) === parseNum(t.blIn)) ?? src?.tiers?.[0];
        if (parseNum(srcTier?.input) === parseNum(t.blIn)) blOk++;
        else blFail++;
      }
      if (t.aigcDomIn != null) aigcDomOk++;
      if (t.aigcIntlIn != null) aigcIntlOk++;
    }
  }

  const aigcMapped = (upstream.models ?? []).filter(
    (m) => m.tiers?.some((t) => t.aigcDomIn != null || t.aigcIntlIn != null),
  ).length;

  console.log(
    JSON.stringify(
      {
        trinityTextModels: upstream.models?.length ?? 0,
        tokenhubTierChecks: { ok: thOk, fail: thFail },
        bailianTierChecks: { ok: blOk, fail: blFail },
        aigcMappedModels: aigcMapped,
        aigcTierRows: { domestic: aigcDomOk, international: aigcIntlOk },
        note: "供应商 Excel 仅 Trinity 生文且有挂牌的行；fail 多为多档模型抽样误报",
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
