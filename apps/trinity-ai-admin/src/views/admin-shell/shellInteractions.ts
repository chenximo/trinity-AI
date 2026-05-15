import type { NavigationGuard } from "vue-router";
import type { AdminSessionUser } from "./sessionMock";

const SIDEBAR_KEY = "trinity-ai-admin:sidebar-collapsed";
const SESSION_KEY = "trinity-ai-admin:session";

export function readSidebarCollapsed(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(SIDEBAR_KEY) === "1";
}

export function writeSidebarCollapsed(collapsed: boolean): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
}

export function readAdminSession(): AdminSessionUser | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminSessionUser;
  } catch {
    return null;
  }
}

export function writeAdminSession(user: AdminSessionUser): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearAdminSession(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function isAdminSignedIn(): boolean {
  return readAdminSession() !== null;
}

function formatLoginTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function signInAdmin(user: AdminSessionUser): void {
  writeAdminSession({ ...user, lastLoginAt: formatLoginTime() });
}

export function signOutAdmin(): void {
  clearAdminSession();
}

/** 壳层路由：未登录时跳转登录页并保留 redirect */
export const adminShellAuthGuard: NavigationGuard = (to, _from, next) => {
  if (isAdminSignedIn()) {
    next();
    return;
  }
  next({
    name: "tai-admin-login",
    query: { redirect: to.fullPath },
  });
};
