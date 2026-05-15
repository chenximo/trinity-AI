const AUDIT_KEY = "trinity-ai-admin:system-audit-rows";
const SENSITIVE_KEY = "trinity-ai-admin:system-sensitive-rules";
const EXPORT_KEY = "trinity-ai-admin:system-export-approvals";
const FLAGS_KEY = "trinity-ai-admin:system-feature-flags";
const GLOBAL_KEY = "trinity-ai-admin:system-global-params";
const AUDIT_FILTER_KEY = "trinity-ai-admin:system-audit-filter";

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

export function readAuditRowsJson(): string | null {
  return lsGet(AUDIT_KEY);
}

export function writeAuditRowsJson(json: string): void {
  lsSet(AUDIT_KEY, json);
}

export function readSensitiveRulesJson(): string | null {
  return lsGet(SENSITIVE_KEY);
}

export function writeSensitiveRulesJson(json: string): void {
  lsSet(SENSITIVE_KEY, json);
}

export function readExportApprovalsJson(): string | null {
  return lsGet(EXPORT_KEY);
}

export function writeExportApprovalsJson(json: string): void {
  lsSet(EXPORT_KEY, json);
}

export function readFeatureFlagsJson(): string | null {
  return lsGet(FLAGS_KEY);
}

export function writeFeatureFlagsJson(json: string): void {
  lsSet(FLAGS_KEY, json);
}

export function readGlobalParamsJson(): string | null {
  return lsGet(GLOBAL_KEY);
}

export function writeGlobalParamsJson(json: string): void {
  lsSet(GLOBAL_KEY, json);
}

export function readAuditFilter(): string {
  return lsGet(AUDIT_FILTER_KEY) ?? "";
}

export function writeAuditFilter(value: string): void {
  if (value.trim() === "") lsRemove(AUDIT_FILTER_KEY);
  else lsSet(AUDIT_FILTER_KEY, value);
}

export function setSystemModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
