const STORAGE_THEME = "trinity_or_theme";

export function syncDtThemeButtons() {
  let cur: string = "system";
  try {
    cur = localStorage.getItem(STORAGE_THEME) || "system";
  } catch {
    /* ignore */
  }
  if (cur !== "light" && cur !== "dark" && cur !== "system") cur = "system";
  document.querySelectorAll(".dt-theme-btn").forEach((b) => {
    b.classList.toggle("is-active", b.getAttribute("data-dt-theme") === cur);
  });
}

export function applyDesignHubTheme(which: string) {
  try {
    localStorage.setItem(STORAGE_THEME, which);
  } catch {
    /* ignore */
  }
  document.documentElement.setAttribute("data-theme", which);
  syncDtThemeButtons();
  window.dispatchEvent(new CustomEvent("trinity-design-theme"));
}

export function bootDesignHubThemeFromStorage() {
  try {
    const t = localStorage.getItem(STORAGE_THEME);
    if (t === "light" || t === "dark" || t === "system") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch {
    /* ignore */
  }
  syncDtThemeButtons();
}
