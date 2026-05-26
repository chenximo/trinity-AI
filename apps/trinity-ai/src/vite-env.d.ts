/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 顶栏品牌「AI 云首页」链接，门户默认 `/ai-cloud` */
  readonly VITE_TRINITY_SUITE_HOME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    /** 与静态 `TrinityAI/static/trinity-ai-app-shell.js` 中 `data-or-page` 一致 */
    orPage?: string;
  }
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "*.html?raw" {
  const html: string;
  export default html;
}

export {};

declare global {
  interface Window {
    TrinityOR?: {
      openSignIn?: (mode?: string) => void;
      signOut?: () => void;
      isSignedIn?: () => boolean;
    };
  }
}
