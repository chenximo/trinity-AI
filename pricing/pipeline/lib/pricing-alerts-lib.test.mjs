/**
 * node --test pricing/pipeline/lib/pricing-alerts-lib.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  alertsToDigestMarkdown,
  alertsDigestTitle,
} from "./pricing-alerts-lib.mjs";

const klingGap = {
  type: "listing_official_coverage_gap",
  blocking: true,
  modality: "image",
  trinityId: "Kling-2.1",
  detail: "官网有「图生图 · 1K」，Trinity 刊例未挂该能力档",
  capability: "image_to_image",
  resolution: "1k",
};

test("digest empty blocking", () => {
  const md = alertsToDigestMarkdown(
    [{ type: "supplier_price_gap", blocking: false, trinityId: "x" }],
    { generatedAt: "2026-08-24T00:00:00Z" },
  );
  assert.match(md, /0.*待人工决策/);
  assert.match(md, /模型价格/);
});

test("digest surfaces P0 coverage gap first", () => {
  const md = alertsToDigestMarkdown(
    [
      klingGap,
      {
        ...klingGap,
        resolution: "2k",
        detail: "官网有「图生图 · 2K」，Trinity 刊例未挂该能力档",
      },
      {
        type: "listing_tier_gap",
        blocking: true,
        modality: "image",
        trinityId: "gemini-2.5-flash-image",
        detail: "— · 线上/草案缺项",
      },
    ],
    {
      generatedAt: "2026-08-24T00:00:00Z",
      listingSummary: {
        image: { officialCoverageGaps: 2, tierMissing: 7 },
      },
    },
  );
  assert.match(md, /待决策 3 条/);
  assert.match(md, /官网能力缺口 2/);
  assert.match(md, /P0.*刊例未覆盖官网能力档/);
  assert.match(md, /Kling-2.1/);
  assert.match(md, /pricing-alerts\.md/);
});

test("digest title reflects blocking count", () => {
  assert.match(alertsDigestTitle([klingGap]), /1 条待决策/);
  assert.match(alertsDigestTitle([]), /巡检完成/);
});

test("digest title can be modality scoped", () => {
  assert.match(alertsDigestTitle([klingGap], { modality: "image" }), /生图巡检/);
});

test("collect digest can be modality scoped", () => {
  const md = alertsToDigestMarkdown([klingGap], {
    generatedAt: "2026-08-24T00:00:00Z",
    modality: "image",
  });
  assert.match(md, /生图巡检/);
  assert.doesNotMatch(md, /生文/);
});
