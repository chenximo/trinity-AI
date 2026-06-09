import type { DefaultTheme } from "vitepress";

/** 中文（root）主题壳层文案 */
export const themeZh: Partial<DefaultTheme.Config> = {
  /** 默认仅 h2；含 [2,3] 后「快速开始」下的「步骤 1」等 h3 会缩进显示 */
  outline: { label: "本页目录", level: [2, 3] },
  docFooter: { prev: "上一页", next: "下一页" },
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
  outline: { label: "On this page", level: [2, 3] },
  docFooter: { prev: "Previous", next: "Next" },
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
