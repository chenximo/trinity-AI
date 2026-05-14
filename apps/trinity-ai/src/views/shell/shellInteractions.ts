import { computed, onMounted, ref } from "vue";
import {
  TRINITY_OR_SESSION_KEY,
  TRINITY_OR_THEME_KEY,
  TRINITY_UI_LANG_KEY,
} from "./mock";

/** `window.TrinityOR` 演示桥：供静态页或外链脚本触发登录 / 读会话态。 */

export type TrinityOrWindowApi = {
  openSignIn: (mode?: string) => void;
  signOut: () => void;
  isSignedIn: () => boolean;
};

export function mountTrinityOrWindowApi(api: TrinityOrWindowApi): () => void {
  (window as unknown as { TrinityOR?: TrinityOrWindowApi }).TrinityOR = api;
  return () => {
    delete (window as unknown as { TrinityOR?: unknown }).TrinityOR;
  };
}

/** 与壳脚本 `STORAGE_SESSION` / `isLoggedIn` / `setLoggedIn` 对齐（演示用 localStorage） */
export function useTrinityOrSession() {
  const isSignedIn = ref(false);

  function read() {
    try {
      return localStorage.getItem(TRINITY_OR_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  }

  function setSignedIn(v: boolean) {
    isSignedIn.value = v;
    try {
      if (v) localStorage.setItem(TRINITY_OR_SESSION_KEY, "1");
      else localStorage.removeItem(TRINITY_OR_SESSION_KEY);
    } catch {
      /* ignore */
    }
  }

  onMounted(() => {
    isSignedIn.value = read();
  });

  return { isSignedIn, setSignedIn };
}

export type TrinityOrThemePick = "light" | "dark" | "system";

function readTheme(): TrinityOrThemePick {
  try {
    const t = localStorage.getItem(TRINITY_OR_THEME_KEY);
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch {
    /* ignore */
  }
  return "system";
}

function applyThemeToDocument(theme: TrinityOrThemePick) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** 与 `TrinityAI/static/trinity-ai-app-shell.js` 中 `STORAGE_THEME` / `applyThemePick` 对齐 */
export function useTrinityOrTheme() {
  const pick = ref<TrinityOrThemePick>("system");

  function boot() {
    pick.value = readTheme();
    applyThemeToDocument(pick.value);
  }

  function setTheme(theme: TrinityOrThemePick) {
    pick.value = theme;
    try {
      localStorage.setItem(TRINITY_OR_THEME_KEY, theme);
    } catch {
      /* ignore */
    }
    applyThemeToDocument(theme);
  }

  onMounted(boot);

  return { pick, setTheme, boot };
}

export type TrinityOrUiLang = "zh" | "en";

function readUiLang(): TrinityOrUiLang {
  try {
    const v = localStorage.getItem(TRINITY_UI_LANG_KEY);
    if (v === "en" || v === "zh") return v;
  } catch {
    /* ignore */
  }
  return "zh";
}

/** 与 `TrinityAI/static/ui-lang-toggle.js` / 壳脚本内 `getUiLang` 对齐 */
export function useTrinityOrUiLang() {
  const lang = ref<TrinityOrUiLang>("zh");

  function syncDocumentLangAttr() {
    try {
      document.documentElement.lang = lang.value === "en" ? "en" : "zh-CN";
    } catch {
      /* ignore */
    }
  }

  function boot() {
    lang.value = readUiLang();
    syncDocumentLangAttr();
  }

  function toggle() {
    lang.value = lang.value === "zh" ? "en" : "zh";
    try {
      localStorage.setItem(TRINITY_UI_LANG_KEY, lang.value);
    } catch {
      /* ignore */
    }
    syncDocumentLangAttr();
  }

  const labelText = computed(() => (lang.value === "en" ? "English" : "简体中文"));
  const titleText = computed(() => (lang.value === "en" ? "Language" : "语言"));
  const ariaLabel = computed(() => (lang.value === "en" ? "Switch language" : "切换语言"));

  onMounted(boot);

  return { lang, toggle, labelText, titleText, ariaLabel, boot };
}
