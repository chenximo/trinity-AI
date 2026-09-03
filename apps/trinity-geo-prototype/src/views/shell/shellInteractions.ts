import { nextTick, onMounted, onUnmounted } from "vue";
import { useRouter, type Router } from "vue-router";
import { HTML_FILE_TO_ROUTE } from "./mock";

/** 控制台 CSS 真源写在 `body.geo-console`；Vue 壳同步打到 document.body */
export function useGeoConsoleBodyClass() {
  onMounted(() => {
    document.body.classList.add("geo-console");
  });
  onUnmounted(() => {
    document.body.classList.remove("geo-console");
  });
}

/** 迁页期：把 HTML 原型 IIFE 在当前页 DOM 上再跑一遍 */
export function useMarketingPageScripts(sources: string[]) {
  let cancelled = false;
  onMounted(() => {
    void nextTick(() => {
      if (cancelled) return;
      for (const code of sources) {
        // 原 marketing/js/*.js 均为 IIFE，非 ESM
        new Function(code)();
      }
    });
  });
  onUnmounted(() => {
    cancelled = true;
  });
}

function fileFromHref(href: string): { file: string; search: string; hash: string } | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("http") || trimmed.startsWith("mailto:")) return null;
  if (trimmed.startsWith("#")) return null;
  const noHash = trimmed.split("#")[0] ?? trimmed;
  const hash = trimmed.includes("#") ? `#${trimmed.split("#").slice(1).join("#")}` : "";
  const [pathPart, search = ""] = noHash.split("?");
  const base = pathPart.split("/").pop() ?? "";
  if (!base.endsWith(".html")) return null;
  return { file: base, search: search ? `?${search}` : "", hash };
}

export function resolveConsoleHref(href: string): { name: string; query: Record<string, string>; hash: string } | "home" | null {
  const parsed = fileFromHref(href);
  if (!parsed) {
    if (href.includes("index.html") && !href.includes("console")) return "home";
    return null;
  }
  const name = HTML_FILE_TO_ROUTE[parsed.file];
  if (!name) return null;
  const query: Record<string, string> = {};
  if (parsed.search) {
    const sp = new URLSearchParams(parsed.search);
    sp.forEach((v, k) => {
      query[k] = v;
    });
  }
  return { name, query, hash: parsed.hash };
}

export function useConsoleLinkInterceptor() {
  const router = useRouter();
  return (event: MouseEvent) => interceptConsoleClick(event, router);
}

export function interceptConsoleClick(event: MouseEvent, router: Router) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
    return;
  }
  const el = (event.target as HTMLElement | null)?.closest?.("a");
  if (!el) return;
  const href = el.getAttribute("href");
  if (!href) return;
  const dest = resolveConsoleHref(href);
  if (!dest) return;
  event.preventDefault();
  if (dest === "home") {
    if (router.hasRoute("home")) {
      void router.push({ name: "home" });
    } else if (router.hasRoute("trinity-geo")) {
      void router.push({ name: "trinity-geo" });
    } else {
      void router.push("/");
    }
    return;
  }
  void router.push({ name: dest.name, query: dest.query, hash: dest.hash || undefined });
}
