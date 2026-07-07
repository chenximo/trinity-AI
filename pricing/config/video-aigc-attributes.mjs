/**
 * 生视频 AIGC「属性」维（有声/无声/参考生…）— 刊例对比行展开与对齐
 */

/** @param {string} name */
export function normalizeAigcAttributeLabel(name) {
  const n = String(name ?? "").trim();
  if (!n || n === "-" || n === "—") return "标准价";
  return n;
}

/** @param {string} name */
export function isOffPeakAigcAttribute(name) {
  return /错峰/.test(String(name ?? ""));
}

/** @param {string} name */
export function isUnsupportedAigcAttribute(name) {
  return /当前已不支持/.test(String(name ?? ""));
}

/** @param {string} name */
export function shouldIncludeAigcAttributeInCompare(name) {
  const n = normalizeAigcAttributeLabel(name);
  if (!n) return false;
  if (isOffPeakAigcAttribute(n)) return false;
  if (isUnsupportedAigcAttribute(n)) return false;
  return true;
}

/** @param {string} text */
export function inferOfficialFeatureFromText(text) {
  const t = String(text ?? "");
  if (/含音频|有声|with native audio/i.test(t)) return "audio:on";
  if (/无声|no native audio|no audio/i.test(t)) return "audio:off";
  if (/with video input|有参考视频|含视频输入|有参考/.test(t)) return "ref:on";
  if (/no video input|无参考视频|无参考/.test(t)) return "ref:off";
  return null;
}

/** @param {string} attribute */
export function attributeAudioBucket(attribute) {
  const n = normalizeAigcAttributeLabel(attribute);
  if (n === "标准价") return "standard";
  if (/无声/.test(n)) return "audio:off";
  if (/有声/.test(n)) return "audio:on";
  return null;
}

/**
 * @param {string} aigcAttribute
 * @param {string|null} officialFeature from inferOfficialFeatureFromText
 */
export function aigcAttributeMatchesOfficialFeature(aigcAttribute, officialFeature) {
  if (!officialFeature) return true;
  const bucket = attributeAudioBucket(aigcAttribute);
  if (officialFeature === "audio:on") {
    return bucket === "audio:on" || bucket === "standard";
  }
  if (officialFeature === "audio:off") {
    return bucket === "audio:off" || bucket === "standard";
  }
  if (officialFeature === "ref:on") {
    return /有参考|含视频输入/.test(aigcAttribute);
  }
  if (officialFeature === "ref:off") {
    return /无参考/.test(aigcAttribute);
  }
  return true;
}

/**
 * @param {string} a
 * @param {string} b
 */
export function aigcAttributesEquivalent(a, b) {
  if (a === b) return true;
  return normalizeAigcAttributeLabel(a) === normalizeAigcAttributeLabel(b);
}

/**
 * @param {string} rowAttribute
 * @param {string|null|undefined} listingAttribute registry 声明的线上默认属性
 */
export function rowAttributeMatchesListing(rowAttribute, listingAttribute) {
  if (!listingAttribute) return true;
  return aigcAttributesEquivalent(rowAttribute, listingAttribute);
}

/** @param {string} tierLabel e.g. 无声视频 */
export function tokenTierLabelToAigcAttribute(tierLabel) {
  const t = String(tierLabel ?? "");
  if (/无声/.test(t)) return "无声";
  if (/有声/.test(t)) return "有声";
  return normalizeAigcAttributeLabel(tierLabel);
}

const ATTR_SORT = [
  "标准价",
  "无声",
  "有声",
  "有声+无音色",
  "文生",
  "图生、文生、首尾帧生",
  "图生、首尾帧生",
  "参考生",
  "无参考视频",
  "无参考视频+无声",
  "无参考视频+有声",
  "有参考视频",
  "有参考视频+无声",
];

/** @param {string} a @param {string} b */
export function compareAigcAttributeSort(a, b) {
  const ia = ATTR_SORT.indexOf(a);
  const ib = ATTR_SORT.indexOf(b);
  const sa = ia === -1 ? 99 : ia;
  const sb = ib === -1 ? 99 : ib;
  if (sa !== sb) return sa - sb;
  return String(a).localeCompare(String(b));
}
