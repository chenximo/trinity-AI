const FILTER_KEY = "trinity-ai-admin:suppliers-list-filter";
const LIST_ROWS_KEY = "trinity-ai-admin:suppliers-list-rows";
const INTEGRATION_KEY = "trinity-ai-admin:suppliers-integration-bindings";

export function readSupplierListFilter(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(FILTER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeSupplierListFilter(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(FILTER_KEY);
    else localStorage.setItem(FILTER_KEY, value);
  } catch {
    /* ignore */
  }
}

export function readSupplierListRowsJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(LIST_ROWS_KEY);
  } catch {
    return null;
  }
}

export function writeSupplierListRowsJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LIST_ROWS_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readIntegrationBindingsJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(INTEGRATION_KEY);
  } catch {
    return null;
  }
}

export function writeIntegrationBindingsJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(INTEGRATION_KEY, json);
  } catch {
    /* ignore */
  }
}

/** 与 DesignSpec / 产品一致：弹层打开时锁 body 滚动（`trinity-base` 未全量引入时的兜底） */
export function setSupplierModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
