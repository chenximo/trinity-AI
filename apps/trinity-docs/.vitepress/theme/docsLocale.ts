import { computed } from "vue";
import { useData, useRouter, withBase } from "vitepress";

/** 与 trinity-ai `TRINITY_UI_LANG_KEY` 一致，跨产品页与文档站同步 */
export const TRINITY_UI_LANG_KEY = "trinity_ui_lang";

function slugToLocalePath(slug: string, locale: "zh" | "en"): string {
  const clean = slug.replace(/\.md$/i, "").replace(/^en\//i, "");
  if (!clean || clean === "index") return locale === "en" ? "/en/quickstart" : "/quickstart";
  return locale === "en" ? `/en/${clean}` : `/${clean}`;
}

export function useDocsLocaleToggle() {
  const { page } = useData();
  const router = useRouter();

  const isEn = computed(() => page.value.relativePath?.startsWith("en/") ?? false);

  const labelText = computed(() => (isEn.value ? "English" : "简体中文"));
  const titleText = computed(() => (isEn.value ? "Language" : "语言"));
  const ariaLabel = computed(() => (isEn.value ? "Switch language" : "切换语言"));

  function persistLang(next: "zh" | "en") {
    try {
      localStorage.setItem(TRINITY_UI_LANG_KEY, next);
    } catch {
      /* ignore */
    }
    try {
      document.documentElement.lang = next === "en" ? "en" : "zh-CN";
    } catch {
      /* ignore */
    }
  }

  function toggle() {
    const rel = page.value.relativePath || "index.md";
    const next: "zh" | "en" = isEn.value ? "zh" : "en";
    const slug = isEn.value ? rel.replace(/^en\//, "") : rel;
    persistLang(next);
    void router.go(withBase(slugToLocalePath(slug, next)));
  }

  return { isEn, labelText, titleText, ariaLabel, toggle };
}
