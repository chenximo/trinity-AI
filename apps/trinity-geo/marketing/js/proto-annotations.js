/**
 * Trinity GEO · 原型标注 ⓘ
 * 对齐 InternalHelpTip / orc-help-tip：不占主排版，交付前可剥离 data-geo-prototype-annotation。
 */
(function () {
  var anchor = null;

  function $(sel) {
    return document.querySelector(sel);
  }

  function closeGeoHelpTip() {
    var pop = $("#geo-help-tip-popover");
    if (pop) pop.hidden = true;
    document.querySelectorAll(".geo-help-tip-btn[aria-expanded='true']").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
    });
    anchor = null;
  }

  function positionGeoHelpTip() {
    var btn = anchor;
    var pop = $("#geo-help-tip-popover");
    if (!btn || !pop || pop.hidden) return;
    var r = btn.getBoundingClientRect();
    var w = Math.min(360, window.innerWidth - 16);
    pop.style.width = w + "px";
    var ph = pop.offsetHeight || 160;
    var spaceBelow = window.innerHeight - r.bottom - 12;
    var placeBelow = spaceBelow >= ph + 8 || spaceBelow >= r.top - 12;
    var top = placeBelow ? r.bottom + 8 : r.top - ph - 8;
    if (top < 8) top = 8;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, window.innerHeight - ph - 8);
    var gap = 8;
    var left = r.right + gap;
    if (left + w > window.innerWidth - gap) left = r.left - w - gap;
    left = Math.max(gap, Math.min(left, window.innerWidth - w - gap));
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function openGeoHelpTip(btn) {
    var tplId = btn.getAttribute("data-geo-help-tpl");
    var tpl = tplId ? document.getElementById(tplId) : null;
    var pop = $("#geo-help-tip-popover");
    var titleEl = $("#geo-help-tip-title");
    var bodyEl = $("#geo-help-tip-body");
    if (!tpl || !pop || !titleEl || !bodyEl) return;
    closeGeoHelpTip();
    titleEl.textContent = btn.getAttribute("data-geo-help-title") || "说明";
    bodyEl.innerHTML = "";
    bodyEl.appendChild(tpl.content.cloneNode(true));
    anchor = btn;
    pop.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(function () {
      positionGeoHelpTip();
      window.requestAnimationFrame(positionGeoHelpTip);
    });
  }

  function bindGeoHelpTips() {
    var pop = $("#geo-help-tip-popover");
    if (!pop) return;

    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".geo-help-tip-btn[data-geo-help-tpl]");
      if (!btn) return;
      e.stopPropagation();
      if (!pop.hidden && anchor === btn) {
        closeGeoHelpTip();
        return;
      }
      openGeoHelpTip(btn);
    });

    window.addEventListener(
      "resize",
      function () {
        if (pop && !pop.hidden) positionGeoHelpTip();
      },
      { passive: true }
    );

    document.addEventListener("mousedown", function (e) {
      if (!pop || pop.hidden) return;
      if (pop.contains(e.target) || e.target.closest(".geo-help-tip-btn")) return;
      closeGeoHelpTip();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeGeoHelpTip();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindGeoHelpTips);
  } else {
    bindGeoHelpTips();
  }
})();
