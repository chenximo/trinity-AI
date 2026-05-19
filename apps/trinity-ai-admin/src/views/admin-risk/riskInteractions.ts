const RISK_RULES_ROWS = "trinity-ai-admin:risk-rules-rows";
const RISK_RULES_SEARCH = "trinity-ai-admin:risk-rules-search-q";
const RISK_RULES_ENABLED_FILTER = "trinity-ai-admin:risk-rules-enabled-filter";
const RISK_ACTIONS_SEARCH = "trinity-ai-admin:risk-actions-search-q";
const RISK_ACTIONS_TYPE_FILTER = "trinity-ai-admin:risk-actions-type-filter";

export function readRiskRulesJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(RISK_RULES_ROWS);
  } catch {
    return null;
  }
}

export function writeRiskRulesJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(RISK_RULES_ROWS, json);
  } catch {
    /* ignore */
  }
}

export function readRiskRulesSearchQ(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(RISK_RULES_SEARCH) ?? "";
  } catch {
    return "";
  }
}

export function writeRiskRulesSearchQ(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(RISK_RULES_SEARCH);
    else localStorage.setItem(RISK_RULES_SEARCH, value);
  } catch {
    /* ignore */
  }
}

export function readRiskRulesEnabledFilter(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(RISK_RULES_ENABLED_FILTER) ?? "";
  } catch {
    return "";
  }
}

export function writeRiskRulesEnabledFilter(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(RISK_RULES_ENABLED_FILTER);
    else localStorage.setItem(RISK_RULES_ENABLED_FILTER, value);
  } catch {
    /* ignore */
  }
}

export function readRiskActionsSearchQ(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(RISK_ACTIONS_SEARCH) ?? "";
  } catch {
    return "";
  }
}

export function writeRiskActionsSearchQ(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(RISK_ACTIONS_SEARCH);
    else localStorage.setItem(RISK_ACTIONS_SEARCH, value);
  } catch {
    /* ignore */
  }
}

export function readRiskActionsTypeFilter(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(RISK_ACTIONS_TYPE_FILTER) ?? "";
  } catch {
    return "";
  }
}

export function writeRiskActionsTypeFilter(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(RISK_ACTIONS_TYPE_FILTER);
    else localStorage.setItem(RISK_ACTIONS_TYPE_FILTER, value);
  } catch {
    /* ignore */
  }
}

export function setRiskModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
