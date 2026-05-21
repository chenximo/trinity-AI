/**
 * AI 云控制台：hash ↔ data-or-panel 显隐（无 legacy 脚本）。
 */

import {
  AI_CLOUD_CONSOLE_DEFAULT_PANEL,
  AI_CLOUD_CONSOLE_PANELS,
  type AiCloudConsolePanelId,
} from "./mock";

const ALLOWED = new Set<AiCloudConsolePanelId>(
  AI_CLOUD_CONSOLE_PANELS.map((p) => p.id)
);

function parseHash(): AiCloudConsolePanelId {
  const raw = (window.location.hash || "").replace(/^#/, "");
  if (ALLOWED.has(raw as AiCloudConsolePanelId)) return raw as AiCloudConsolePanelId;
  return AI_CLOUD_CONSOLE_DEFAULT_PANEL;
}

export type AiCloudConsoleHandle = {
  dispose: () => void;
  getPanel: () => AiCloudConsolePanelId;
  setPanel: (id: AiCloudConsolePanelId) => void;
  syncHashPanels: () => void;
};

export function mountAiCloudConsoleInteractions(
  root: HTMLElement,
  onPanelChange: (id: AiCloudConsolePanelId) => void
): AiCloudConsoleHandle {
  const panels = root.querySelectorAll<HTMLElement>("[data-or-panel]");
  const dashNavs = root.querySelectorAll<HTMLAnchorElement>(".or-side a.or-dash-nav");

  function show(id: AiCloudConsolePanelId) {
    panels.forEach((el) => {
      el.hidden = el.getAttribute("data-or-panel") !== id;
    });
    dashNavs.forEach((a) => {
      const h = (a.getAttribute("href") || "").replace(/^.*#/, "");
      a.classList.toggle("is-active", h === id);
    });
    onPanelChange(id);
  }

  function routeFromHash() {
    show(parseHash());
  }

  function setPanel(id: AiCloudConsolePanelId) {
    const next = ALLOWED.has(id) ? id : AI_CLOUD_CONSOLE_DEFAULT_PANEL;
    if (window.location.hash !== `#${next}`) {
      window.location.hash = next;
    } else {
      show(next);
    }
  }

  routeFromHash();
  const onHashChange = () => routeFromHash();
  window.addEventListener("hashchange", onHashChange);

  return {
    dispose: () => window.removeEventListener("hashchange", onHashChange),
    getPanel: parseHash,
    setPanel,
    syncHashPanels: routeFromHash,
  };
}
