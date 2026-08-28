/**
 * L4 刊例 vs 官网能力档：Trinity 是否覆盖官方已公布的能力 × 分辨率。
 * 官网有、刊例无 → 缺档；刊例多出的 AIGC 4K 等不视为缺档。
 */

import {
  buildImageOnlineJoinIndex,
  resolveOnlineImageEntry,
} from "../../config/image-listing-aliases.mjs";
import {
  getVideoRegistryByTrinityId,
  getVideoRegistryByVendorId,
} from "../../config/video-model-registry.mjs";
import { parseOnlineVideoTiers } from "./parse-online-prices.mjs";

const VARIANT_TO_CAPABILITY = {
  text_to_image: "text_to_image",
  t2i: "text_to_image",
  文生图: "text_to_image",
  image_to_image: "image_to_image",
  i2i: "image_to_image",
  图生图: "image_to_image",
  单图生图: "image_to_image",
  multi_reference_image: "multi_reference_image",
  multi_image: "multi_reference_image",
  多图参考: "multi_reference_image",
  多图参考生图: "multi_reference_image",
};

function normRes(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");
}

function expandOfficialSlots(off) {
  const caps = off.capabilities ?? off.prices?.capabilities ?? [];
  const slots = [];
  for (const cap of caps) {
    const id = String(cap.id ?? "").trim();
    if (!id) continue;
    for (const res of cap.resolutions ?? []) {
      slots.push({
        capability: id,
        label: cap.label ?? id,
        resolution: normRes(res),
        price: cap.price ?? null,
        unit: cap.unit ?? null,
      });
    }
  }
  return slots;
}

function listingGroups(onlineEntry) {
  return (onlineEntry?.price_groups ?? []).filter(
    (g) => g.type === "resolution_tier",
  );
}

/**
 * 刊例 `variant: "-"` 视为该分辨率下覆盖官网全部能力（未拆能力）。
 */
export function trinityCoversOfficialSlot(onlineEntry, slot) {
  const groups = listingGroups(onlineEntry);
  const wantRes = slot.resolution;
  for (const g of groups) {
    const gRes = normRes(
      g.conditions?.resolution_tier ?? g.label ?? g.conditions_summary,
    );
    if (gRes !== wantRes) continue;
    const variant = String(g.conditions?.variant ?? "").trim();
    if (!variant || variant === "-" || variant === "all") return true;
    const mapped = VARIANT_TO_CAPABILITY[variant] ?? VARIANT_TO_CAPABILITY[variant.toLowerCase()];
    if (mapped === slot.capability) return true;
  }
  return false;
}

/**
 * @param {{
 *   officialModels: object[],
 *   trinityMap: Record<string, { modality?: string, vendorModelId?: string }>,
 *   onlineDoc: { data?: object[] },
 * }} input
 */
export function findImageOfficialListingGaps({
  officialModels,
  trinityMap,
  onlineDoc,
}) {
  const vendorMap = {};
  const reverse = new Map();
  for (const [tid, meta] of Object.entries(trinityMap ?? {})) {
    if (tid.startsWith("_")) continue;
    if ((meta.modality ?? "text") !== "image") continue;
    vendorMap[tid] = meta;
    const vid = String(meta.vendorModelId ?? tid).toLowerCase();
    reverse.set(vid, tid);
  }

  const { onlineByJoinKey } = buildImageOnlineJoinIndex(
    onlineDoc?.data ?? [],
    vendorMap,
  );

  const gaps = [];
  for (const off of officialModels ?? []) {
    const vendorId = String(off.vendorModelId ?? "").toLowerCase();
    const trinityId = reverse.get(vendorId);
    if (!trinityId) continue;
    const slots = expandOfficialSlots(off);
    if (!slots.length) continue;

    const online = resolveOnlineImageEntry(
      onlineByJoinKey,
      trinityId,
      vendorId,
    );
    if (!online) {
      gaps.push({
        trinityId,
        vendorModelId: off.vendorModelId,
        kind: "missing_model",
        capability: null,
        resolution: null,
        label: "未上架",
        detail: `官网已列 ${off.vendorModelId}，Trinity 刊例无此模型`,
      });
      continue;
    }

    for (const slot of slots) {
      if (trinityCoversOfficialSlot(online, slot)) continue;
      gaps.push({
        trinityId,
        vendorModelId: off.vendorModelId,
        kind: "missing_slot",
        capability: slot.capability,
        resolution: slot.resolution,
        label: slot.label,
        detail: `官网有「${slot.label} · ${slot.resolution.toUpperCase()}」，Trinity 刊例未挂该能力档`,
      });
    }
  }

  return {
    gapCount: gaps.length,
    gaps,
    ok: gaps.length === 0,
  };
}

function videoResKey(label) {
  const low = String(label ?? "").toLowerCase();
  if (/540p|480p/.test(low)) return "res:540p";
  if (/768p|720p/.test(low)) return "res:720p";
  if (/1080p/.test(low)) return "res:1080p";
  if (/2k/.test(low)) return "res:2k";
  if (/4k/.test(low)) return "res:4k";
  return null;
}

function compactSlug(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[-_]/g, "");
}

function lookupVideoOnlineEntry(onlineByModel, trinityId, vendorId) {
  const reg =
    getVideoRegistryByTrinityId(trinityId) ??
    getVideoRegistryByVendorId(vendorId);
  const candidates = [reg?.onlineSlug, trinityId, vendorId]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  for (const c of candidates) {
    if (onlineByModel.has(c)) return onlineByModel.get(c);
  }
  const compactWant = new Set(candidates.map(compactSlug).filter(Boolean));
  if (!compactWant.size) return null;
  for (const [slug, entry] of onlineByModel) {
    if (compactWant.has(compactSlug(slug))) return entry;
  }
  return null;
}

/**
 * 生视频 P6b：已 map 的官网模型/分辨率档，Trinity 刊例未挂。
 * 积分/次等无分辨率档只做「整模型未上架」检查。
 */
export function findVideoOfficialListingGaps({
  officialModels,
  trinityMap,
  onlineDoc,
}) {
  const onlineByModel = new Map(
    (onlineDoc?.data ?? []).map((e) => [String(e.model ?? "").toLowerCase(), e]),
  );

  const reverse = new Map();
  for (const [tid, meta] of Object.entries(trinityMap ?? {})) {
    if (tid.startsWith("_")) continue;
    if (meta.modality !== "video") continue;
    reverse.set(String(meta.vendorModelId ?? tid).toLowerCase(), tid);
  }

  const gaps = [];
  for (const off of officialModels ?? []) {
    const vendorId = String(off.vendorModelId ?? "").toLowerCase();
    if (!vendorId) continue;
    const trinityId = reverse.get(vendorId);
    if (!trinityId) continue;

    const online = lookupVideoOnlineEntry(
      onlineByModel,
      trinityId,
      vendorId,
    );
    if (!online) {
      gaps.push({
        trinityId,
        vendorModelId: off.vendorModelId,
        kind: "missing_model",
        capability: null,
        resolution: null,
        label: "未上架",
        detail: `官网已列 ${off.vendorModelId}，Trinity 刊例无此模型`,
      });
      continue;
    }

    const officialTiers = off.tiers ?? off.prices?.tiers ?? [];
    const officialKeys = new Set(
      officialTiers.map((t) => videoResKey(t.tierLabel)).filter(Boolean),
    );
    if (!officialKeys.size) continue;

    const onlineKeys = new Set(
      parseOnlineVideoTiers(online)
        .map((t) => t.tierKey)
        .filter((k) => k && String(k).startsWith("res:")),
    );
    if (!onlineKeys.size) continue;

    for (const key of officialKeys) {
      if (onlineKeys.has(key)) continue;
      gaps.push({
        trinityId,
        vendorModelId: off.vendorModelId,
        kind: "missing_slot",
        capability: null,
        resolution: key.replace(/^res:/, ""),
        label: key,
        detail: `官网有分辨率档 ${key}，Trinity 刊例未挂`,
      });
    }
  }

  return {
    gapCount: gaps.length,
    gaps,
    ok: gaps.length === 0,
  };
}
