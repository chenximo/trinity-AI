import { TEXT_CATALOG } from "../data/catalog/text.mjs";
import { IMAGE_CATALOG } from "../data/catalog/image.mjs";
import { VIDEO_CATALOG } from "../data/catalog/video.mjs";
import { TEXT_SEED, TEXT_SEED_VERIFIED_AT } from "../data/seeds/text.mjs";
import { IMAGE_SEED, IMAGE_SEED_VERIFIED_AT } from "../data/seeds/image.mjs";
import { VIDEO_SEED } from "../data/seeds/video.mjs";
import { MODALITIES, MODALITY_META } from "./modality.mjs";

/** @type {Record<import("./modality.mjs").Modality, import("../data/catalog/text.mjs").CatalogEntry[]>} */
const CATALOGS = {
  text: TEXT_CATALOG,
  image: IMAGE_CATALOG,
  video: VIDEO_CATALOG,
};

/** @type {Record<import("./modality.mjs").Modality, Record<string, import("../data/seeds/text.mjs").SeedEntry>>} */
const SEEDS = {
  text: TEXT_SEED,
  image: IMAGE_SEED,
  video: VIDEO_SEED,
};

/**
 * @param {import("./modality.mjs").Modality | "all"} modality
 * @param {string[]} filterIds
 */
export function loadCatalog(modality, filterIds = []) {
  const list =
    modality === "all"
      ? MODALITIES.flatMap((m) =>
          CATALOGS[m].map((e) => ({ ...e, modality: m })),
        )
      : CATALOGS[modality].map((e) => ({ ...e, modality }));

  if (!filterIds.length) return list;

  return list.filter((entry) => {
    const id = entry.vendorModelId.toLowerCase();
    const note = entry.trinityNote?.toLowerCase() ?? "";
    return filterIds.some(
      (f) => id.includes(f) || f.includes(id) || note.includes(f),
    );
  });
}

/** @param {import("./modality.mjs").Modality} modality */
export function getSeedMap(modality) {
  return SEEDS[modality];
}

/** @param {import("./modality.mjs").Modality} [modality] */
export function getSeedVerifiedAt(modality = "text") {
  if (modality === "image") return IMAGE_SEED_VERIFIED_AT;
  return TEXT_SEED_VERIFIED_AT;
}

/** @param {import("./modality.mjs").Modality} modality */
export function buildCatalogMeta(modality) {
  const m = MODALITY_META[modality];
  return {
    source: "vendor_official_catalog",
    modality,
    modalityLabel: m.label,
    description: `模型原厂官网权威价目（${m.label}）`,
    currency: m.currency,
    unit: m.unit,
    chargeUnit: m.chargeUnit,
  };
}

export { MODALITIES, MODALITY_META };
