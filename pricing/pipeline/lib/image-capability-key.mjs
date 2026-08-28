/**
 * 生图能力 × 分辨率 tierKey 归一（官网 / AIGC / 线上共用）
 * 独立小模块，避免 parse-online ↔ image-pricing-validate 循环依赖。
 */

/** 生图能力维归一（官网 capabilities / AIGC tierName / 线上 variant） */
export function normalizeImageCapability(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");
  if (!s) return null;
  if (
    s === "text_to_image" ||
    s === "t2i" ||
    s === "文生图" ||
    s.includes("文生图")
  ) {
    return "text_to_image";
  }
  if (
    s === "image_to_image" ||
    s === "i2i" ||
    s === "图生图" ||
    s === "单图生图" ||
    s.includes("单图生图") ||
    s.includes("图生图")
  ) {
    return "image_to_image";
  }
  if (
    s === "multi_reference_image" ||
    s === "multi_image" ||
    s.includes("多图参考") ||
    s.includes("multi_reference")
  ) {
    return "multi_reference_image";
  }
  return s.replace(/[^a-z0-9_\u4e00-\u9fff]+/g, "_");
}

export function normalizeImageResKey(label) {
  const t = String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");
  if (!t) return null;
  if (t === "lt_1k" || t === "sub-1k" || /1k以下/.test(t)) return "sub-1k";
  if (t === "1k") return "1k";
  if (t === "2k") return "2k";
  if (t === "4k") return "4k";
  return t;
}

export function imageCapabilityResTierKey(capability, resolutionLabel) {
  const cap = normalizeImageCapability(capability);
  const res = normalizeImageResKey(resolutionLabel);
  if (cap && res) return `cap:${cap}|res:${res}`;
  if (res) return `res:${res}`;
  if (cap) return `cap:${cap}`;
  return null;
}
