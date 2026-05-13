import { nextTick, onMounted, onUnmounted } from "vue";
import { bootDesignHubThemeFromStorage, syncDtThemeButtons } from "../lib/trinityDesignTheme";

function rgbToHex(rgb: string) {
  if (!rgb || rgb === "transparent") return "—";
  const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return rgb;
  const r = (+m[1]).toString(16);
  const g = (+m[2]).toString(16);
  const b = (+m[3]).toString(16);
  return (
    "#" +
    (r.length === 1 ? "0" + r : r) +
    (g.length === 1 ? "0" + g : g) +
    (b.length === 1 ? "0" + b : b)
  ).toUpperCase();
}

function readCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function useDesignTokensRuntime() {
  function fillGradients() {
    document.querySelectorAll("[data-dt-gradient] .dt-hex").forEach((el) => {
      const card = el.closest("[data-dt-gradient]");
      const sw = card?.querySelector(".dt-swatch");
      const name = card?.querySelector(".dt-var");
      const img = sw ? getComputedStyle(sw as Element).backgroundImage : "none";
      el.textContent =
        img && img !== "none"
          ? img.length > 96
            ? img.slice(0, 96) + "…"
            : img
          : "—（未解析到 background-image）";
    });
  }

  function fillGradSyntax() {
    const box = document.getElementById("dt-grad-syntax");
    if (!box) return;
    box.replaceChildren();
    const p = document.createElement("p");
    p.textContent = "以下为 :root 中渐变变量原文，便于复制。";
    const pre = document.createElement("pre");
    pre.textContent =
      "--grad: " +
      (readCssVar("--grad") || "（空）") +
      "\n--grad-hover: " +
      (readCssVar("--grad-hover") || "（空）");
    box.appendChild(p);
    box.appendChild(pre);
  }

  function fillOrcSceneSyntax() {
    const box = document.getElementById("dt-orc-scene-syntax");
    if (!box) return;
    box.replaceChildren();
    const p = document.createElement("p");
    p.textContent = "以下为场景卡四条底与边的变量原文，便于复制。";
    const pre = document.createElement("pre");
    pre.textContent =
      "--orc-scene-card-bg-1: " +
      (readCssVar("--orc-scene-card-bg-1") || "（空）") +
      "\n--orc-scene-card-bg-2: " +
      (readCssVar("--orc-scene-card-bg-2") || "（空）") +
      "\n--orc-scene-card-bg-3: " +
      (readCssVar("--orc-scene-card-bg-3") || "（空）") +
      "\n--orc-scene-card-bg-4: " +
      (readCssVar("--orc-scene-card-bg-4") || "（空）") +
      "\n--orc-scene-card-border-1: " +
      (readCssVar("--orc-scene-card-border-1") || "（空）") +
      "\n--orc-scene-card-border-2: " +
      (readCssVar("--orc-scene-card-border-2") || "（空）") +
      "\n--orc-scene-card-border-3: " +
      (readCssVar("--orc-scene-card-border-3") || "（空）") +
      "\n--orc-scene-card-border-4: " +
      (readCssVar("--orc-scene-card-border-4") || "（空）");
    box.appendChild(p);
    box.appendChild(pre);
  }

  function fillColors() {
    document.querySelectorAll("[data-dt-color]").forEach((card) => {
      const sw = card.querySelector(".dt-swatch");
      const hexEl = card.querySelector(".dt-hex");
      if (!sw || !hexEl) return;
      const cs = getComputedStyle(sw);
      const bg = cs.backgroundColor;
      const img = cs.backgroundImage;
      if (img && img !== "none") {
        hexEl.textContent = img.length > 80 ? img.slice(0, 80) + "…" : img;
        return;
      }
      hexEl.textContent = rgbToHex(bg) + " · " + bg;
    });
  }

  function fillDimensions() {
    document.querySelectorAll("[data-dt-dimension]").forEach((el) => {
      const n = el.getAttribute("data-dt-dimension");
      if (!n) return;
      el.textContent = readCssVar(n) || "（空）";
    });
  }

  function fillGlassShadow() {
    const g = document.getElementById("dt-glass-shadow");
    if (g) g.textContent = readCssVar("--or-modal-glass-shadow") || "—";
  }

  function fillFont() {
    const f = document.getElementById("dt-font-stack");
    if (f) f.textContent = "computed: " + readCssVar("--font");
  }

  function refreshAll() {
    fillColors();
    fillGradients();
    fillGradSyntax();
    fillOrcSceneSyntax();
    fillDimensions();
    fillGlassShadow();
    fillFont();
  }

  function onTheme() {
    syncDtThemeButtons();
    void nextTick(() => refreshAll());
  }

  function onResize() {
    refreshAll();
  }

  onMounted(() => {
    void nextTick(() => {
      bootDesignHubThemeFromStorage();
      refreshAll();
    });
    window.addEventListener("trinity-design-theme", onTheme);
    window.addEventListener("resize", onResize);
  });

  onUnmounted(() => {
    window.removeEventListener("trinity-design-theme", onTheme);
    window.removeEventListener("resize", onResize);
  });
}
