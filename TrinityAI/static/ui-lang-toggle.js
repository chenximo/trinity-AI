/**
 * 顶栏语言切换：在「简体中文」与「English」标签间切换，写入 localStorage（trinity_ui_lang），并同步 html[lang]。
 * 需在含 .or-lang-btn 的页面于壳脚本之后引入。
 */
(function () {
  "use strict";

  var STORAGE_UI_LANG = "trinity_ui_lang";

  function get() {
    try {
      var v = localStorage.getItem(STORAGE_UI_LANG);
      if (v === "en" || v === "zh") return v;
    } catch (e) {}
    return "zh";
  }

  function apply() {
    var lang = get();
    document.querySelectorAll(".or-lang-btn").forEach(function (btn) {
      var lab = btn.querySelector(".or-lang-label");
      if (lab) lab.textContent = lang === "en" ? "English" : "简体中文";
      btn.setAttribute("aria-label", lang === "en" ? "Switch language" : "切换语言");
      btn.title = lang === "en" ? "Language" : "语言";
    });
    try {
      document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    } catch (e2) {}
  }

  document.body.addEventListener("click", function (e) {
    var btn = e.target.closest(".or-lang-btn");
    if (!btn) return;
    e.preventDefault();
    var next = get() === "zh" ? "en" : "zh";
    try {
      localStorage.setItem(STORAGE_UI_LANG, next);
    } catch (e3) {}
    apply();
  });

  function boot() {
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
