const TENANT_ROWS = "trinity-ai-admin:customer-tenant-rows";
const TENANT_SEARCH = "trinity-ai-admin:customer-tenant-search-q";

export function readTenantRowsJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(TENANT_ROWS);
  } catch {
    return null;
  }
}

export function writeTenantRowsJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(TENANT_ROWS, json);
  } catch {
    /* ignore */
  }
}

export function readTenantSearchQ(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(TENANT_SEARCH) ?? "";
  } catch {
    return "";
  }
}

export function writeTenantSearchQ(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(TENANT_SEARCH);
    else localStorage.setItem(TENANT_SEARCH, value);
  } catch {
    /* ignore */
  }
}

export function setCustomersModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
