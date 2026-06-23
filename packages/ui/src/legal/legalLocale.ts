import { onMounted, onUnmounted, ref, type Ref } from "vue";

/** 与 trinity-ai / trinity-docs / ai-cloud 壳层 `TRINITY_UI_LANG_KEY` 一致 */
export const TRINITY_UI_LANG_KEY = "trinity_ui_lang";

export type LegalLocale = "zh" | "en";

export const TRINITY_UI_LANG_CHANGE_EVENT = "trinity:ui-lang-change";

export function readLegalLocale(): LegalLocale {
  try {
    const v = localStorage.getItem(TRINITY_UI_LANG_KEY);
    if (v === "en" || v === "zh") return v;
  } catch {
    /* ignore */
  }
  return "zh";
}

/** 协议页读壳层语言；同一路由 `/legal/*`，不按 URL 分 /en */
export function useLegalLocale(): Ref<LegalLocale> {
  const locale = ref<LegalLocale>(readLegalLocale());

  function sync() {
    locale.value = readLegalLocale();
    try {
      document.documentElement.lang = locale.value === "en" ? "en" : "zh-CN";
    } catch {
      /* ignore */
    }
  }

  function onLangChange() {
    sync();
  }

  onMounted(() => {
    sync();
    window.addEventListener(TRINITY_UI_LANG_CHANGE_EVENT, onLangChange);
    window.addEventListener("storage", onLangChange);
  });

  onUnmounted(() => {
    window.removeEventListener(TRINITY_UI_LANG_CHANGE_EVENT, onLangChange);
    window.removeEventListener("storage", onLangChange);
  });

  return locale;
}
