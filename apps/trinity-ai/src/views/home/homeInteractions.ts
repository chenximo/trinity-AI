import { useRouter } from "vue-router";
import { getTrinityDocsSiteUrl } from "../../trinityDocsSite";

/** 首页 CTA 与 OAuth 演示按钮（依赖壳挂载的 `window.TrinityOR`） */
export function useHomeNavigation() {
  const router = useRouter();
  const docsSiteUrl = getTrinityDocsSiteUrl();

  function goConsole() {
    void router.push({ name: "tai-account-console" });
  }

  function goDocs() {
    window.location.assign(getTrinityDocsSiteUrl());
  }

  function openDemoAuth() {
    window.TrinityOR?.openSignIn?.("signin");
  }

  return { goConsole, goDocs, openDemoAuth, docsSiteUrl };
}
