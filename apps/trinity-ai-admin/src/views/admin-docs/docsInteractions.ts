const DOCS_ROWS = "trinity-ai-admin:docs-rows";
const DOCS_VERSIONS = "trinity-ai-admin:docs-versions";
const DOCS_PUBLISH = "trinity-ai-admin:docs-publish-jobs";
const DOCS_VISIBILITY = "trinity-ai-admin:docs-visibility-rules";
const DOCS_SEARCH = "trinity-ai-admin:docs-search-q";
const DOCS_FILTER_TYPE = "trinity-ai-admin:docs-filter-type";
const DOCS_FILTER_STATUS = "trinity-ai-admin:docs-filter-status";

function lsGet(key: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function lsRemove(key: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readDocsRowsJson(): string | null {
  return lsGet(DOCS_ROWS);
}

export function writeDocsRowsJson(json: string): void {
  lsSet(DOCS_ROWS, json);
}

export function readDocsVersionsJson(): string | null {
  return lsGet(DOCS_VERSIONS);
}

export function writeDocsVersionsJson(json: string): void {
  lsSet(DOCS_VERSIONS, json);
}

export function readDocsPublishJson(): string | null {
  return lsGet(DOCS_PUBLISH);
}

export function writeDocsPublishJson(json: string): void {
  lsSet(DOCS_PUBLISH, json);
}

export function readDocsVisibilityJson(): string | null {
  return lsGet(DOCS_VISIBILITY);
}

export function writeDocsVisibilityJson(json: string): void {
  lsSet(DOCS_VISIBILITY, json);
}

export function readDocsSearchQ(): string {
  return lsGet(DOCS_SEARCH) ?? "";
}

export function writeDocsSearchQ(value: string): void {
  if (value.trim() === "") lsRemove(DOCS_SEARCH);
  else lsSet(DOCS_SEARCH, value);
}

export function readDocsFilterType(): string {
  return lsGet(DOCS_FILTER_TYPE) ?? "";
}

export function writeDocsFilterType(value: string): void {
  if (value.trim() === "") lsRemove(DOCS_FILTER_TYPE);
  else lsSet(DOCS_FILTER_TYPE, value);
}

export function readDocsFilterStatus(): string {
  return lsGet(DOCS_FILTER_STATUS) ?? "";
}

export function writeDocsFilterStatus(value: string): void {
  if (value.trim() === "") lsRemove(DOCS_FILTER_STATUS);
  else lsSet(DOCS_FILTER_STATUS, value);
}

export function setDocsModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
