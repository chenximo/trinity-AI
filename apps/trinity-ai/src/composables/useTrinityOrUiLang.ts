import { computed, onMounted, ref } from "vue";

const STORAGE_UI_LANG = "trinity_ui_lang";

export type TrinityOrUiLang = "zh" | "en";

function readLang(): TrinityOrUiLang {
  try {
    const v = localStorage.getItem(STORAGE_UI_LANG);
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
    lang.value = readLang();
    syncDocumentLangAttr();
  }

  function toggle() {
    lang.value = lang.value === "zh" ? "en" : "zh";
    try {
      localStorage.setItem(STORAGE_UI_LANG, lang.value);
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
