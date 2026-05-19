const FILTER_KEY = "trinity-ai-admin:suppliers-list-filter";
const LIST_ROWS_KEY = "trinity-ai-admin:suppliers-list-rows";
const INTEGRATION_KEY = "trinity-ai-admin:suppliers-integration-bindings";
const PROFILE_KEY = "trinity-ai-admin:suppliers-profiles";
const GATEWAY_KEY = "trinity-ai-admin:suppliers-gateway";
const PROBE_KEY = "trinity-ai-admin:suppliers-probe-rows";
const ROTATION_KEY = "trinity-ai-admin:suppliers-rotation";
const PROFILE_SELECTED_KEY = "trinity-ai-admin:suppliers-profile-selected-id";

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

export function readSupplierProfilesJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(PROFILE_KEY);
  } catch {
    return null;
  }
}

export function writeSupplierProfilesJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readProfileSelectedSupplierId(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(PROFILE_SELECTED_KEY) ?? "";
  } catch {
    return "";
  }
}

export function readSupplierGatewaysJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(GATEWAY_KEY);
  } catch {
    return null;
  }
}

export function writeSupplierGatewaysJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(GATEWAY_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readSupplierProbeRowsJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(PROBE_KEY);
  } catch {
    return null;
  }
}

export function writeSupplierProbeRowsJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PROBE_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readSupplierRotationJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(ROTATION_KEY);
  } catch {
    return null;
  }
}

export function writeSupplierRotationJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(ROTATION_KEY, json);
  } catch {
    /* ignore */
  }
}

export function writeProfileSelectedSupplierId(id: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (!id.trim()) localStorage.removeItem(PROFILE_SELECTED_KEY);
    else localStorage.setItem(PROFILE_SELECTED_KEY, id);
  } catch {
    /* ignore */
  }
}

/** 与 DesignSpec / 产品一致：弹层打开时锁 body 滚动（`trinity-base` 未全量引入时的兜底） */
export function setSupplierModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
