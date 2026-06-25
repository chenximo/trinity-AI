/**
 * 控制台页：hash ↔ `data-or-panel` 显隐（对齐 `TrinityAI/static/trinity-ai-app-shell.js` 中 `initDashboardPanels`）。
 * Legacy 行为自 `TrinityAI/account/console.html` 内联脚本迁入 `legacy/inline1.js`、`legacy/inline2.js`，在首段之后加载 `adm-form2-dd.js`（与静态顺序一致）。
 */

import inline1 from "./legacy/inline1.js?raw";
import inline2 from "./legacy/inline2.js?raw";
import inline3 from "./legacy/inline3.js?raw";
import inline4 from "./legacy/inline4.js?raw";

export type AccountConsoleHandle = {
  dispose: () => void;
  /** KeepAlive 回到控制台时与壳外链更新 hash 后对主列显隐再对齐一次 */
  syncHashPanels: () => void;
};

/**
 * 遗留脚本只应注入一次。模块级 `let` 在 Vite HMR 重载本文件后会重置，若再次 `appendBodyScript` 会抛错并拖垮热更新。
 * 用 `window` 持久标记（整页刷新会清空）。
 */
const LEGACY_GLOBAL_KEY = "__taiAccountConsoleLegacyBooted";

function wasLegacyBooted(): boolean {
  return Boolean((globalThis as unknown as Record<string, boolean | undefined>)[LEGACY_GLOBAL_KEY]);
}

function markLegacyBooted(): void {
  (globalThis as unknown as Record<string, boolean>)[LEGACY_GLOBAL_KEY] = true;
}

function appendBodyScript(source: string): HTMLScriptElement {
  const el = document.createElement("script");
  el.textContent = source;
  document.body.appendChild(el);
  return el;
}

function mountDashboardPanels(root: HTMLElement): { stop: () => void; sync: () => void } {
  const panels = root.querySelectorAll<HTMLElement>("[data-or-panel]");
  const dashNavs = root.querySelectorAll<HTMLAnchorElement>(".or-side a.or-dash-nav");

  function show(id: string) {
    panels.forEach((el) => {
      el.hidden = el.getAttribute("data-or-panel") !== id;
    });
    dashNavs.forEach((a) => {
      const h = (a.getAttribute("href") || "").replace(/^.*#/, "");
      a.classList.toggle("is-active", h === id);
    });
  }

  function routeFromHash() {
    let h = (window.location.hash || "#keys").replace(/^#/, "") || "keys";
    const allowed = new Set(["keys", "credits", "activity", "logs", "preset"]);
    if (!allowed.has(h)) h = "keys";
    show(h);
  }

  routeFromHash();
  window.addEventListener("hashchange", routeFromHash);
  return {
    sync: routeFromHash,
    stop: () => {
      window.removeEventListener("hashchange", routeFromHash);
    },
  };
}

/**
 * 挂载控制台 DOM 后调用：面板 hash 路由 + 静态页遗留脚本（复制 / 下拉 / 密钥与角色弹层等）。
 * 离开路由时仅移除 hash 监听；遗留脚本注册的 document/window 监听在原型阶段不撤销（见 README）。
 */
export async function mountAccountConsoleInteractions(root: HTMLElement): Promise<AccountConsoleHandle> {
  const panels = mountDashboardPanels(root);

  if (!wasLegacyBooted()) {
    markLegacyBooted();
    appendBodyScript(inline1);
    await import("@repo/assets/adm-form2-dd.js");
    appendBodyScript(inline2);
    appendBodyScript(inline3);
    appendBodyScript(inline4);
  }

  return {
    syncHashPanels: panels.sync,
    dispose: () => {
      panels.stop();
    },
  };
}
