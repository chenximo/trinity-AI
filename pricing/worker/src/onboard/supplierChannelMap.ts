/** 上游渠道 supplyCode / access key → pricing CLI（B1/B2 判定共用） */

export const SUPPLIER_CLI_BY_CHANNEL: Record<string, string> = {
  tokenhub: "pricing:supplier:tokenhub:console",
  bailian: "pricing:supplier:bailian:doc",
  "bailian-intl": "pricing:supplier:bailian-intl:doc",
  volcengine: "pricing:supplier:volcengine",
  wangju: "pricing:supplier:wangju-cloudportal",
  "relay-cust": "pricing:supplier:relay-cust",
  aigc: "pricing:supplier:aigc",
};

/** upstream-access 产物 key → 供应渠道 id（与 Admin supplyCode 对齐） */
export function channelKeyToSupplyId(key: string): string {
  if (key.startsWith("aigc-")) return "aigc";
  if (key.startsWith("volcengine-")) return "volcengine";
  return key;
}

export function supplierCliForChannel(supplyId: string): string | null {
  return SUPPLIER_CLI_BY_CHANNEL[supplyId] ?? null;
}

export function hasSupplierCli(supplyId: string): boolean {
  return supplierCliForChannel(supplyId) != null;
}
