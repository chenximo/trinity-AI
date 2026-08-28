/**
 * node --test pricing/pipeline/lib/listing-official-coverage-lib.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  findImageOfficialListingGaps,
  findVideoOfficialListingGaps,
  trinityCoversOfficialSlot,
} from "./listing-official-coverage-lib.mjs";

test("variant '-' covers official capability at same resolution", () => {
  const online = {
    price_groups: [
      {
        type: "resolution_tier",
        label: "1k",
        conditions: { variant: "-", resolution_tier: "1k" },
      },
    ],
  };
  assert.equal(
    trinityCoversOfficialSlot(online, {
      capability: "image_to_image",
      resolution: "1k",
    }),
    true,
  );
});

test("Kling-2.1 missing 图生图 is a listing gap", () => {
  const report = findImageOfficialListingGaps({
    trinityMap: {
      "Kling-2.1": {
        modality: "image",
        vendorModelId: "kling-2.1",
      },
    },
    officialModels: [
      {
        vendorModelId: "kling-2.1",
        capabilities: [
          {
            id: "text_to_image",
            label: "文生图",
            resolutions: ["1K", "2K"],
          },
          {
            id: "image_to_image",
            label: "图生图",
            resolutions: ["1K", "2K"],
          },
          {
            id: "multi_reference_image",
            label: "多图参考生图",
            resolutions: ["1K", "2K"],
          },
        ],
      },
    ],
    onlineDoc: {
      data: [
        {
          model: "Kling-2.1",
          price_groups: [
            {
              type: "resolution_tier",
              conditions: {
                variant: "text_to_image",
                resolution_tier: "1k",
              },
            },
            {
              type: "resolution_tier",
              conditions: {
                variant: "text_to_image",
                resolution_tier: "2k",
              },
            },
            {
              type: "resolution_tier",
              conditions: {
                variant: "multi_reference_image",
                resolution_tier: "1k",
              },
            },
            {
              type: "resolution_tier",
              conditions: {
                variant: "multi_reference_image",
                resolution_tier: "2k",
              },
            },
          ],
        },
      ],
    },
  });

  assert.equal(report.ok, false);
  assert.equal(report.gapCount, 2);
  assert.deepEqual(
    report.gaps.map((g) => `${g.capability}:${g.resolution}`).sort(),
    ["image_to_image:1k", "image_to_image:2k"],
  );
});

test("image P6b joins online slug via vendorModelId (GG-2.5 ↔ gemini-2.5-flash-image)", () => {
  const report = findImageOfficialListingGaps({
    trinityMap: {
      "GG-2.5": {
        modality: "image",
        vendorModelId: "gemini-2.5-flash-image",
      },
    },
    officialModels: [
      {
        vendorModelId: "gemini-2.5-flash-image",
        capabilities: [
          {
            id: "text_to_image",
            label: "文生图",
            resolutions: ["1K"],
          },
        ],
      },
    ],
    onlineDoc: {
      data: [
        {
          model: "gemini-2.5-flash-image",
          price_groups: [
            {
              type: "resolution_tier",
              conditions: { variant: "-", resolution_tier: "1k" },
            },
          ],
        },
      ],
    },
  });
  assert.equal(report.ok, true);
  assert.equal(report.gapCount, 0);
});

test("video P6b flags mapped official model missing from listing", () => {
  const report = findVideoOfficialListingGaps({
    trinityMap: {
      "hy-video-1.5": {
        modality: "video",
        vendorModelId: "hy-video-1.5",
      },
    },
    officialModels: [
      {
        vendorModelId: "hy-video-1.5",
        tiers: [{ tierLabel: "720p", price: 1.5 }],
      },
    ],
    onlineDoc: { data: [] },
  });
  assert.equal(report.ok, false);
  assert.equal(report.gaps[0]?.kind, "missing_model");
  assert.equal(report.gaps[0]?.trinityId, "hy-video-1.5");
});

test("video P6b compact-matches vidu-q3-pro to live viduq3-pro", () => {
  const report = findVideoOfficialListingGaps({
    trinityMap: {
      "vd-video-q3-pro": {
        modality: "video",
        vendorModelId: "vd-video-q3-pro",
      },
    },
    officialModels: [
      {
        vendorModelId: "vd-video-q3-pro",
        tiers: [{ tierLabel: "标准价", price: 1 }],
      },
    ],
    onlineDoc: {
      data: [{ model: "viduq3-pro", price_groups: [] }],
    },
  });
  assert.equal(report.ok, true);
  assert.equal(report.gapCount, 0);
});
