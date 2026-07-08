/**
 * 生图渠道注册表 — L2/L3 校验 · L4 Excel 共用
 *
 * **接入（connected）**：Trinity 生图当前实际进货/转售渠道，出 Excel 汇总 + 分表。
 * **参照（connected: false）**：仅有价目 scrape 或未作为生图进货接入；接入后设 connected: true 并补 Sheet。
 *
 * 生图暂无百炼 / 网聚 / 中转（生文专属）；若未来接入，在本文件新增条目即可。
 */

export const IMAGE_PRICE_UNIT_CNY = "元/张";
export const IMAGE_PRICE_UNIT_USD = "美元/张";

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
 * }} ImageSupplierChannel */

/** @type {ImageSupplierChannel[]} */
export const IMAGE_SUPPLIERS = [
  {
    key: "aigc-domestic",
    excelSheet: "AIGC国内站-生图",
    title: "腾讯云 AIGC · 国内站 · 生图",
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
    excelSheet: "AIGC国际站-生图",
    title: "腾讯云 AIGC · 国际站 · 生图",
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
    excelSheet: "TokenHub-生图",
    title: "腾讯云 TokenHub · 生图",
    catalog: "tokenhub",
    currency: "CNY",
    connected: false,
    l2: true,
    l3: true,
    l4: false,
    note: "价目参照（hy-image*）；未作为生图进货渠道接入，接入后改 connected: true",
  },
  {
    key: "volcengine",
    excelSheet: "火山方舟-生图",
    title: "火山方舟 · 生图",
    catalog: "volcengine",
    currency: "CNY",
    connected: false,
    l3: true,
    l4: false,
    note: "价目参照（Seedream 等）；未作为生图进货渠道接入，接入后改 connected: true",
  },
];

/** 当前已接入 · Excel 汇总 + 分表 */
export const IMAGE_CONNECTED_SUPPLIERS = IMAGE_SUPPLIERS.filter((c) => c.connected);

/** 待接入 / 仅参照（不出分表） */
export const IMAGE_PENDING_SUPPLIERS = IMAGE_SUPPLIERS.filter((c) => !c.connected);

export const IMAGE_L2_CHANNELS = IMAGE_SUPPLIERS.filter((c) => c.l2);
export const IMAGE_L3_CHANNELS = IMAGE_SUPPLIERS.filter((c) => c.l3);
/** 刊例对比主表可展示的进货参照列（L2 + OpenRouter；不含 L3 火山/百炼） */
export const IMAGE_L4_COMPARE_CHANNELS = IMAGE_SUPPLIERS.filter((c) => c.l4 === true);
/** Excel 供应商分表（仅 connected） */
export const IMAGE_L4_SHEET_SUPPLIERS = IMAGE_CONNECTED_SUPPLIERS;
