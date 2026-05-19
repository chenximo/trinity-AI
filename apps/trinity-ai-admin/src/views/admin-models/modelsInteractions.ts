const FILTER_KEY = "trinity-ai-admin:models-list-filter";
const SUPPLIER_FILTER_KEY = "trinity-ai-admin:models-list-supplier-filter";
const LIST_ROWS_KEY = "trinity-ai-admin:models-list-rows";
const MASTER_KEY = "trinity-ai-admin:models-master-records";
const MASTER_SELECTED_KEY = "trinity-ai-admin:models-master-selected-id";
const SUPPLY_LINES_KEY = "trinity-ai-admin:models-supply-lines";
const LINE_SUPPLIER_FILTER_KEY = "trinity-ai-admin:models-line-supplier-filter";
const PRICING_ROWS_KEY = "trinity-ai-admin:models-pricing-rows";

export function readModelListFilter(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(FILTER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeModelListFilter(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(FILTER_KEY);
    else localStorage.setItem(FILTER_KEY, value);
  } catch {
    /* ignore */
  }
}

export function readModelListSupplierFilter(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(SUPPLIER_FILTER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeModelListSupplierFilter(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(SUPPLIER_FILTER_KEY);
    else localStorage.setItem(SUPPLIER_FILTER_KEY, value);
  } catch {
    /* ignore */
  }
}

export function readModelListRowsJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(LIST_ROWS_KEY);
  } catch {
    return null;
  }
}

export function writeModelListRowsJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LIST_ROWS_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readModelMasterRecordsJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(MASTER_KEY);
  } catch {
    return null;
  }
}

export function writeModelMasterRecordsJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(MASTER_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readModelMasterSelectedId(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(MASTER_SELECTED_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeModelMasterSelectedId(id: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (!id.trim()) localStorage.removeItem(MASTER_SELECTED_KEY);
    else localStorage.setItem(MASTER_SELECTED_KEY, id);
  } catch {
    /* ignore */
  }
}

export function readModelSupplyLinesJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(SUPPLY_LINES_KEY);
  } catch {
    return null;
  }
}

export function writeModelSupplyLinesJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(SUPPLY_LINES_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readModelLineSupplierFilter(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(LINE_SUPPLIER_FILTER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeModelLineSupplierFilter(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(LINE_SUPPLIER_FILTER_KEY);
    else localStorage.setItem(LINE_SUPPLIER_FILTER_KEY, value);
  } catch {
    /* ignore */
  }
}

export function readModelPricingRowsJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(PRICING_ROWS_KEY);
  } catch {
    return null;
  }
}

export function writeModelPricingRowsJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PRICING_ROWS_KEY, json);
  } catch {
    /* ignore */
  }
}

export function setModelsModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
