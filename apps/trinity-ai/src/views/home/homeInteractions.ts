import { useRouter } from "vue-router";

/** 首页 CTA 与 OAuth 演示按钮（依赖壳挂载的 `window.TrinityOR`） */
export function useHomeNavigation() {
  const router = useRouter();

  function goConsole() {
    void router.push({ name: "tai-account-console" });
  }

  function goDocs() {
    void router.push({ name: "tai-docs" });
  }

  function openDemoAuth() {
    window.TrinityOR?.openSignIn?.("signin");
  }

  return { goConsole, goDocs, openDemoAuth };
}
