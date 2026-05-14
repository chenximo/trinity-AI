import { onMounted, ref } from "vue";

const STORAGE_THEME = "trinity_or_theme";

export type TrinityOrThemePick = "light" | "dark" | "system";

function readTheme(): TrinityOrThemePick {
  try {
    const t = localStorage.getItem(STORAGE_THEME);
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch {
    /* ignore */
  }
  return "system";
}

function applyToDocument(theme: TrinityOrThemePick) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** 与 `TrinityAI/static/trinity-ai-app-shell.js` 中 `STORAGE_THEME` / `applyThemePick` 对齐 */
export function useTrinityOrTheme() {
  const pick = ref<TrinityOrThemePick>("system");

  function boot() {
    pick.value = readTheme();
    applyToDocument(pick.value);
  }

  function setTheme(theme: TrinityOrThemePick) {
    pick.value = theme;
    try {
      localStorage.setItem(STORAGE_THEME, theme);
    } catch {
      /* ignore */
    }
    applyToDocument(theme);
  }

  onMounted(boot);

  return { pick, setTheme, boot };
}
