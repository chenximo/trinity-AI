/** 价目表列头单位（元/USD 每百万 tokens） */

export const CNY_PER_M = "元/百万tokens";
export const USD_PER_M = "USD/百万tokens";

/** 上游分表：未对接（无 Trinity 映射）时 Trinity ID 填 `-` */
export const ACCESS_MARK = "-";

/** Trinity API 刊例，非上游人民币换算，最终用户价待商务确认 */
export const TRINITY_LIST_LABEL = "Trinity刊例";

/**
 * @deprecated 上游分表已取消「接入」列；对接语义改由 Trinity ID（未接=`-`）
 * 保留供 upstream-access md 等旧调用
 */
export function accessCell(trinityId, officialCtx = {}, show = true) {
  if (!show) return "";
  const tid = String(trinityId ?? "").trim();
  if (!tid) return "";
  if (officialCtx.onlineByModel?.has(tid.toLowerCase())) return ACCESS_MARK;
  return "";
}

/**
 * 上游分表 Trinity ID 单元格：已对接填 slug；未对接填 `-`；续档行留空（供合并）
 * @param {string} [trinityId]
 * @param {boolean} [show]
 */
export function trinityIdCell(trinityId, show = true) {
  if (!show) return "";
  const tid = String(trinityId ?? "").trim();
  return tid || ACCESS_MARK;
}

export function isUsdUpstream(sup) {
  return (
    (sup?.catalog === "aigc" && sup?.site === "international") ||
    sup?.catalog === "wangju-cloudportal" ||
    sup?.key === "bailian-intl"
  );
}

export function upstreamUnit(supOrSite) {
  const intl =
    supOrSite === "international" ||
    (typeof supOrSite === "object" && isUsdUpstream(supOrSite));
  return intl ? USD_PER_M : CNY_PER_M;
}

/** @deprecated 使用 colSupplierListCompact */
export function colSupplierList(field, unit) {
  return `供应商挂牌_${field}(${unit})`;
}

/** @deprecated 使用 colSupplierListCompact */
export function colOfficial(field, unit) {
  return colSupplierList(field, unit);
}

export function colSupplierListCompact(unit) {
  return `供应商挂牌(${unit})`;
}

export function colTrinityList(field) {
  return `${TRINITY_LIST_LABEL}_${field}(${USD_PER_M})`;
}

/**
 * 上游分表表头（生文 / 生图 / 生视频统一）
 * 行轴 = 该上游全量模型+挂牌价；Trinity ID 未对接 = `-`；单位见 Sheet/MD 顶注
 */
export function buildSupplierTableHeader(_sup, opts = {}) {
  const cols = [
    "厂商",
    "上游模型",
    "Trinity ID",
    "档位",
    "官方价",
    "上游价",
    "刊例价",
    "上游vs官方",
    "刊例vs上游",
  ];
  if (opts.withListing === false) {
    return cols.filter((c) => c !== "刊例价" && c !== "刊例vs上游");
  }
  return cols;
}

/** 生图/生视频：价格属性 + 分辨率压成单列「档位」 */
export function mediaTierLabel(tierName, resolutionLabel) {
  const t = String(tierName ?? "").trim();
  const r = String(resolutionLabel ?? "").trim();
  if (t && r && t !== r && t !== "标准价") return `${t} · ${r}`;
  return r || t || "—";
}
