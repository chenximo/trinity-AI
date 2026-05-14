/** 登录「记住我」、演示会话 / 主题 / 界面语言等 localStorage 键名；主导航项（与 `trinityAiRoutes` name / `meta.orPage` 对齐）。 */

export const TRINITY_OR_REMEMBER_KEY = "trinity_or_remember";
export const TRINITY_OR_SESSION_KEY = "trinity_or_session";
export const TRINITY_OR_THEME_KEY = "trinity_or_theme";
export const TRINITY_UI_LANG_KEY = "trinity_ui_lang";

export const SHELL_PRIMARY_NAV = [
  { name: "tai-home" as const, label: "首页", orPage: "home" },
  { name: "tai-models" as const, label: "模型", orPage: "models" },
  { name: "tai-chat" as const, label: "对话", orPage: "chat" },
  { name: "tai-docs" as const, label: "文档", orPage: "docs" },
] as const;
