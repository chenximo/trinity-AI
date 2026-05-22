/** 登录「记住我」、演示会话 / 主题 / 界面语言等 localStorage 键名；主导航项（与 `trinityAiRoutes` name / `meta.orPage` 对齐）。 */

export const TRINITY_OR_REMEMBER_KEY = "trinity_or_remember";
export const TRINITY_OR_SESSION_KEY = "trinity_or_session";
export const TRINITY_OR_THEME_KEY = "trinity_or_theme";
export const TRINITY_UI_LANG_KEY = "trinity_ui_lang";

export type ShellNavItem = {
  name: string;
  label: string;
  orPage: string;
  /** 外链：浏览器内为同源 /docs/（dev 由 Vite 代理到 :5205） */
  external?: boolean;
};

export const SHELL_PRIMARY_NAV: ShellNavItem[] = [
  { name: "tai-home", label: "首页", orPage: "home" },
  { name: "tai-models", label: "模型", orPage: "models" },
  { name: "tai-chat", label: "对话", orPage: "chat" },
  { name: "tai-docs", label: "文档", orPage: "docs", external: true },
];
