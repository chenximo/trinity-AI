const USERS_LIST_KEY = "trinity-ai-admin:terminal-users-rows";
const USERS_FILTER_KEY = "trinity-ai-admin:terminal-users-filter";
const WHITELIST_KEY = "trinity-ai-admin:users-whitelist-rows";
const BLACKLIST_KEY = "trinity-ai-admin:users-blacklist-rows";
const KYC_KEY = "trinity-ai-admin:users-kyc-rows";

export function readTerminalUsersJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(USERS_LIST_KEY);
  } catch {
    return null;
  }
}

export function writeTerminalUsersJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(USERS_LIST_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readUsersListFilter(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(USERS_FILTER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeUsersListFilter(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(USERS_FILTER_KEY);
    else localStorage.setItem(USERS_FILTER_KEY, value);
  } catch {
    /* ignore */
  }
}

export function readWhitelistJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(WHITELIST_KEY);
  } catch {
    return null;
  }
}

export function writeWhitelistJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(WHITELIST_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readBlacklistJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(BLACKLIST_KEY);
  } catch {
    return null;
  }
}

export function writeBlacklistJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(BLACKLIST_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readKycJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(KYC_KEY);
  } catch {
    return null;
  }
}

export function writeKycJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KYC_KEY, json);
  } catch {
    /* ignore */
  }
}

export function setUsersModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
