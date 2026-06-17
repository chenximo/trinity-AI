/** Trinity GEO · 竞品概览 */
(function () {
  document.querySelectorAll("[data-comp-market]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-comp-market]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
    });
  });
})();
