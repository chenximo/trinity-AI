const FILTER_KEY = "trinity-ai-admin:models-list-filter";
const LIST_ROWS_KEY = "trinity-ai-admin:models-list-rows";

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

export function setModelsModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
