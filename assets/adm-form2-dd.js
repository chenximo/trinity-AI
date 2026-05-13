/**
 * 形式2：药丸触发 + 下拉面板（or-app-filter-dd-wrap）
 * 在含 trinity-base.css 的页面引入；每个 wrap 内须含 button.or-app-filter-dd-trigger 与
 * .or-app-filter-more-panel[role="listbox"]（筛选项 ✓）或
 * .or-app-filter-more-panel[role="menu"].or-form2-menu-panel（操作菜单，仅开关、不改写药丸文案）。
 * 触发器文案放在带 data-dd-label 的 span 内（可选，否则取按钮内第一个非 chevron 的 span）。
 */
(function () {
  function bindListboxDd(wrap) {
    if (wrap.dataset.form2DdBound) return;
    wrap.dataset.form2DdBound = "1";

    var btn = wrap.querySelector("button.or-app-filter-dd-trigger");
    var panel =
      wrap.querySelector('.or-app-filter-more-panel[role="listbox"]') ||
      wrap.querySelector('.or-app-filter-more-panel[role="menu"].or-form2-menu-panel');
    if (!btn || !panel) return;
    var isActionMenu = panel.getAttribute("role") === "menu";

    var labelSpan =
      btn.querySelector("[data-dd-label]") ||
      (function () {
        var ch = btn.querySelector(".or-app-filter-dd-chevron");
        var spans = btn.querySelectorAll(":scope > span");
        for (var i = 0; i < spans.length; i++) {
          if (spans[i] !== ch && !spans[i].classList.contains("or-app-filter-dd-chevron")) return spans[i];
        }
        return null;
      })();

    function setOpen(open) {
      if (open) {
        panel.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
      }
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      document.querySelectorAll(".or-app-filter-dd-wrap").forEach(function (w) {
        if (w === wrap) return;
        var p = w.querySelector(".or-app-filter-more-panel");
        var b = w.querySelector("button.or-app-filter-dd-trigger");
        if (p && b && !p.hasAttribute("hidden")) {
          p.setAttribute("hidden", "");
          b.setAttribute("aria-expanded", "false");
        }
      });
      setOpen(panel.hasAttribute("hidden"));
    });

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hasAttribute("hidden")) setOpen(false);
    });

    panel.addEventListener("click", function (e) {
      var item = e.target.closest("button.or-app-filter-dd-item");
      if (!item || item.disabled) return;
      if (isActionMenu) {
        setOpen(false);
        return;
      }
      var rowLabel = item.querySelector(".or-app-filter-dd-label");
      var v =
        item.getAttribute("data-dd-value") ||
        item.getAttribute("data-or-act-model") ||
        item.getAttribute("data-ds-model-opt") ||
        (rowLabel ? rowLabel.textContent.trim() : "");
      if (labelSpan && typeof v === "string") labelSpan.textContent = v;
      panel.querySelectorAll(".or-app-filter-dd-item").forEach(function (b) {
        var on = b === item;
        b.classList.toggle("is-checked", on);
        var mk = b.querySelector(".or-app-filter-dd-mark");
        if (mk) mk.textContent = on ? "✓" : "";
      });
      setOpen(false);
    });
  }

  function run() {
    document.querySelectorAll(".or-app-filter-dd-wrap").forEach(bindListboxDd);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
