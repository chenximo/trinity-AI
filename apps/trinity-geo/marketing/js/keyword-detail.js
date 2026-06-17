/** Trinity GEO · 关键词详情 */
(function () {
  document.querySelectorAll("[data-kw-period]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-kw-period]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
    });
  });
})();
