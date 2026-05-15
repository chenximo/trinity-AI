import type { OpsTabId } from "./mock";

const KEY = "trinity-ai-admin:ops-active-tab";

export function readOpsTab(): OpsTabId {
  if (typeof sessionStorage === "undefined") return "live";
  const v = sessionStorage.getItem(KEY);
  if (v === "live") return v;
  return "live";
}

export function writeOpsTab(id: OpsTabId): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(KEY, id);
}
