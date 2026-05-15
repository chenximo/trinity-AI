import type { BillingTabId } from "./mock";

const KEY = "trinity-ai-admin:billing-active-tab";

export function readBillingTab(): BillingTabId {
  if (typeof sessionStorage === "undefined") return "usage";
  const v = sessionStorage.getItem(KEY);
  if (v === "usage" || v === "quota" || v === "sku" || v === "invoice" || v === "adjust") return v;
  return "usage";
}

export function writeBillingTab(id: BillingTabId): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(KEY, id);
}
