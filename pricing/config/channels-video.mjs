/**
 * 生视频渠道注册表 — L2/L3 校验 · L4 Excel 共用
 *
 * **接入（connected）**：Trinity 生视频当前实际进货/转售渠道。
 * **参照（connected: false）**：仅有价目 scrape 或未作为进货接入。
 */

export const VIDEO_PRICE_UNIT_CNY = "元/秒";
export const VIDEO_PRICE_UNIT_USD = "美元/秒";

/** @typedef {{
 *   key: string,
 *   excelSheet: string,
 *   title: string,
 *   catalog: "aigc"|"tokenhub"|"volcengine",
 *   site?: "domestic"|"international",
 *   currency: "CNY"|"USD",
 *   connected?: boolean,
 *   l2?: boolean,
 *   l3?: boolean,
 *   l4?: boolean,
 *   note?: string,
 * }} VideoSupplierChannel */

/** @type {VideoSupplierChannel[]} */
export const VIDEO_SUPPLIERS = [
  {
    key: "aigc-domestic",
    excelSheet: "AIGC国内站-生视频",
    title: "腾讯云 AIGC · 国内站 · 生视频",
    catalog: "aigc",
    site: "domestic",
    currency: "CNY",
    connected: true,
    l2: true,
    l3: true,
    l4: true,
  },
  {
    key: "aigc-international",
    excelSheet: "AIGC国际站-生视频",
    title: "腾讯云 AIGC · 国际站 · 生视频",
    catalog: "aigc",
    site: "international",
    currency: "USD",
    connected: true,
    l2: true,
    l3: true,
    l4: true,
  },
  {
    key: "tokenhub",
    excelSheet: "TokenHub-生视频",
    title: "腾讯云 TokenHub · 生视频",
    catalog: "tokenhub",
    currency: "CNY",
    connected: false,
    l2: true,
    l3: true,
    l4: false,
    note: "价目参照（hy-video* / kl-video* 等）；未作为生视频进货渠道接入",
  },
  {
    key: "volcengine",
    excelSheet: "火山方舟-生视频",
    title: "火山方舟 · 生视频",
    catalog: "volcengine",
    currency: "CNY",
    connected: false,
    l3: true,
    l4: false,
    note: "价目参照（Seedance 等）；未作为生视频进货渠道接入",
  },
];

export const VIDEO_CONNECTED_SUPPLIERS = VIDEO_SUPPLIERS.filter((c) => c.connected);
export const VIDEO_PENDING_SUPPLIERS = VIDEO_SUPPLIERS.filter((c) => !c.connected);
export const VIDEO_L2_CHANNELS = VIDEO_SUPPLIERS.filter((c) => c.l2);
export const VIDEO_L3_CHANNELS = VIDEO_SUPPLIERS.filter((c) => c.l3);
export const VIDEO_L4_COMPARE_CHANNELS = VIDEO_SUPPLIERS.filter((c) => c.l4 !== false);
/** Excel 供应商分表（已接入 + 火山方舟参照） */
export const VIDEO_L3_SHEET_SUPPLIERS = VIDEO_SUPPLIERS.filter(
  (c) => c.connected || c.key === "volcengine",
);
export const VIDEO_L4_SHEET_SUPPLIERS = VIDEO_CONNECTED_SUPPLIERS;
