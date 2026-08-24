/**
 * L4 刊例 vs 官网能力档：Trinity 是否覆盖官方已公布的能力 × 分辨率。
 * 官网有、刊例无 → 缺档；刊例多出的 AIGC 4K 等不视为缺档。
 */

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
  const onlineByModel = new Map(
    (onlineDoc?.data ?? []).map((e) => [String(e.model ?? "").toLowerCase(), e]),
  );

  const reverse = new Map();
  for (const [tid, meta] of Object.entries(trinityMap ?? {})) {
    if (tid.startsWith("_")) continue;
    if ((meta.modality ?? "text") !== "image") continue;
    const vid = String(meta.vendorModelId ?? tid).toLowerCase();
    reverse.set(vid, tid);
  }

  const gaps = [];
  for (const off of officialModels ?? []) {
    const vendorId = String(off.vendorModelId ?? "").toLowerCase();
    const trinityId = reverse.get(vendorId);
    if (!trinityId) continue;
    const slots = expandOfficialSlots(off);
    if (!slots.length) continue;

    const online = onlineByModel.get(trinityId.toLowerCase()) ?? null;
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
