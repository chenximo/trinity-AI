const ADMINS_KEY = "trinity-ai-admin:platform-admins-rows";
const ROLES_KEY = "trinity-ai-admin:platform-roles-rows";
const ADMIN_FILTER_KEY = "trinity-ai-admin:platform-admins-filter";
const ROLE_FILTER_KEY = "trinity-ai-admin:platform-roles-filter";

export function readPlatformAdminsJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(ADMINS_KEY);
  } catch {
    return null;
  }
}

export function writePlatformAdminsJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(ADMINS_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readPlatformRolesJson(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(ROLES_KEY);
  } catch {
    return null;
  }
}

export function writePlatformRolesJson(json: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(ROLES_KEY, json);
  } catch {
    /* ignore */
  }
}

export function readAdminListFilter(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(ADMIN_FILTER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeAdminListFilter(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(ADMIN_FILTER_KEY);
    else localStorage.setItem(ADMIN_FILTER_KEY, value);
  } catch {
    /* ignore */
  }
}

export function readRoleListFilter(): string {
  if (typeof localStorage === "undefined") return "";
  try {
    return localStorage.getItem(ROLE_FILTER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeRoleListFilter(value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (value.trim() === "") localStorage.removeItem(ROLE_FILTER_KEY);
    else localStorage.setItem(ROLE_FILTER_KEY, value);
  } catch {
    /* ignore */
  }
}

export function setAccessModalBodyLock(open: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("or-modal-open", open);
}
