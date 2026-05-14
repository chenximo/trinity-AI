/**
 * Account 域：与静态 `TrinityAI/account/` 对齐的常量（无 DOM）。
 * 壳与对话页通过本文件引用控制台 hash，避免与 `TrinityAiShellLayout` 内链硬编码双轨漂移。
 */

export const ACCOUNT_STATIC_DIR = "TrinityAI/account";

export const CONSOLE_HTML = "console.html";

/** 与 `console.html` 侧栏 `href="#…"` 及壳菜单 `RouterLink` 对齐 */
export const ACCOUNT_CONSOLE_HASH = {
  KEYS: "#keys",
  PRESET: "#preset",
  CREDITS: "#credits",
  ACTIVITY: "#activity",
  LOGS: "#logs",
} as const;
