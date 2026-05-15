/** 运营后台当前登录管理员（Mock 契约，与 §4.12 管理员表字段对齐） */

export type AdminSessionUser = {
  id: string;
  displayName: string;
  loginId: string;
  email: string;
  roleLabel: string;
  lastLoginAt: string;
};

export const DEMO_ADMIN_CREDENTIALS = {
  loginId: "zhang.san",
  password: "demo",
} as const;

export const DEFAULT_ADMIN_SESSION_USER: AdminSessionUser = {
  id: "adm-001",
  displayName: "张三",
  loginId: "zhang.san",
  email: "zhang.san@trinity.internal",
  roleLabel: "平台超级管理员",
  lastLoginAt: "2026-05-15 09:30",
};

export function adminUserInitials(user: AdminSessionUser): string {
  const name = user.displayName.trim();
  if (name) return name.charAt(0);
  const login = user.loginId.trim();
  return login ? login.charAt(0).toUpperCase() : "?";
}
