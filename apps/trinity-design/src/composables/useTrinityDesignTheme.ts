import { onMounted, onUnmounted } from "vue";
import { applyDesignHubTheme, bootDesignHubThemeFromStorage, syncDtThemeButtons } from "../lib/trinityDesignTheme";

export function useTrinityDesignThemeBar() {
  function onStorage(e: StorageEvent) {
    if (e.key === "trinity_or_theme") syncDtThemeButtons();
  }

  onMounted(() => {
    bootDesignHubThemeFromStorage();
    window.addEventListener("storage", onStorage);
  });

  onUnmounted(() => {
    window.removeEventListener("storage", onStorage);
  });

  return { setTheme: applyDesignHubTheme };
}
