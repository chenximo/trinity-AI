const KEYS_ROWS = "trinity-ai-admin:platform-keys-rows";
const KEYS_SEARCH_Q = "trinity-ai-admin:platform-keys-search-q";
const KEYS_FILTER_ORG = "trinity-ai-admin:platform-keys-filter-org";
const KEYS_SELECTED_ID = "trinity-ai-admin:platform-keys-selected-id";
const KEYS_AUDIT = "trinity-ai-admin:platform-keys-audit-rows";

export function readKeysRowsJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(KEYS_ROWS);
  } catch {
    return null;
  }
}

export function writeKeysRowsJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEYS_ROWS, json);
  } catch {
    /* ignore */
  }
}

export function readKeysSearchQ(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(KEYS_SEARCH_Q) ?? "";
  } catch {
    return "";
  }
}

export function writeKeysSearchQ(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(KEYS_SEARCH_Q);
    else localStorage.setItem(KEYS_SEARCH_Q, value);
  } catch {
    /* ignore */
  }
}

export function readKeysFilterOrg(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(KEYS_FILTER_ORG) ?? "";
  } catch {
    return "";
  }
}

export function writeKeysFilterOrg(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(KEYS_FILTER_ORG);
    else localStorage.setItem(KEYS_FILTER_ORG, value);
  } catch {
    /* ignore */
  }
}

export function readKeysSelectedId(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(KEYS_SELECTED_ID) ?? "";
  } catch {
    return "";
  }
}

export function writeKeysSelectedId(id: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (id.trim() === "") localStorage.removeItem(KEYS_SELECTED_ID);
    else localStorage.setItem(KEYS_SELECTED_ID, id);
  } catch {
    /* ignore */
  }
}

export function readKeyAuditJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(KEYS_AUDIT);
  } catch {
    return null;
  }
}

export function writeKeyAuditJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEYS_AUDIT, json);
  } catch {
    /* ignore */
  }
}

export function setKeysModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
