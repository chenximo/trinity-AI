import type { App, Plugin } from "vue";
import { installTrinityElementPlus } from "@trinity/element-plus";
import "./installAdminStyles";

/** 运营后台：全局 EP + 后台专用样式 */
export function installTrinityAdminUi(app: App): void {
  installTrinityElementPlus(app);
}

export const trinityAdminUiPlugin: Plugin = {
  install(app) {
    installTrinityAdminUi(app);
  },
};
