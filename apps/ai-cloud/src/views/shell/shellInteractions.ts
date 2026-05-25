import { computed, onMounted, ref } from "vue";
import { TRINITY_OR_SESSION_KEY, TRINITY_UI_LANG_KEY } from "./mock";

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
