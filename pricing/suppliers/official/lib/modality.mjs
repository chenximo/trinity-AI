/** @typedef {"text"|"image"|"video"} Modality */

export const MODALITIES = /** @type {const} */ (["text", "image", "video"]);

/** @type {Record<Modality, { label: string, currency: string, unit: string, chargeUnit: string }>} */
export const MODALITY_META = {
  text: {
    label: "生文",
    currency: "USD",
    unit: "USD per 1M tokens",
    chargeUnit: "token",
  },
  image: {
    label: "生图",
    currency: "CNY",
    unit: "CNY per image (or per request)",
    chargeUnit: "image",
  },
  video: {
    label: "生视频",
    currency: "CNY",
    unit: "CNY per video generation (tiered)",
    chargeUnit: "video",
  },
};

export const VENDOR_PRICING_OUT = "vendor-pricing.json";

/**
 * @param {string} modality
 * @returns {modality is Modality}
 */
export function isModality(modality) {
  return MODALITIES.includes(/** @type {Modality} */ (modality));
}
