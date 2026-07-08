/** 价目表列头单位（元/USD 每百万 tokens） */

export const CNY_PER_M = "元/百万tokens";
export const USD_PER_M = "USD/百万tokens";

/** Trinity API 刊例，非上游人民币换算，最终用户价待商务确认 */
export const TRINITY_LIST_LABEL = "Trinity刊例";

export function isUsdUpstream(sup) {
  return (
    (sup?.catalog === "aigc" && sup?.site === "international") ||
    sup?.catalog === "wangju-cloudportal"
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

export function buildSupplierTableHeader(sup) {
  const unit = upstreamUnit(sup);
  return [
    "序号",
    "Trinity ID",
    "显示名",
    "厂商",
    "价格档位",
    "上游模型ID",
    "厂商官方价",
    colSupplierListCompact(unit),
    "供应商vs官方",
  ];
}
