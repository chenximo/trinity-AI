import type { App, Plugin } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";

/** 全项目统一：注册 Element Plus + 中文 locale + 基础样式（各 app 的 main.ts 调用一次） */
export function installTrinityElementPlus(app: App): void {
  app.use(ElementPlus, { locale: zhCn });
}

export const trinityElementPlusPlugin: Plugin = {
  install(app) {
    installTrinityElementPlus(app);
  },
};

export { ElementPlus, zhCn };
