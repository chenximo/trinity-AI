import type { DefaultTheme } from "vitepress";

/** 中文（root）主题壳层文案 */
export const themeZh: Partial<DefaultTheme.Config> = {
  outline: { label: "本页目录" },
  docFooter: { prev: "上一页", next: "下一页" },
  darkModeSwitchLabel: "主题",
  lightModeSwitchTitle: "浅色",
  darkModeSwitchTitle: "深色",
  search: {
    provider: "local",
    options: {
      translations: {
        button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
        modal: { noResultsText: "无匹配结果", resetButtonTitle: "清除" },
      },
    },
  },
};

/** 英文主题壳层文案 */
export const themeEn: Partial<DefaultTheme.Config> = {
  outline: { label: "On this page" },
  docFooter: { prev: "Previous", next: "Next" },
  darkModeSwitchLabel: "Appearance",
  lightModeSwitchTitle: "Switch to light theme",
  darkModeSwitchTitle: "Switch to dark theme",
  search: {
    provider: "local",
    options: {
      translations: {
        button: { buttonText: "Search", buttonAriaLabel: "Search" },
        modal: { noResultsText: "No results", resetButtonTitle: "Reset" },
      },
    },
  },
};
