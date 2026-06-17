/** Trinity GEO · 诊断列表筛选 */
(function () {
  document.querySelectorAll("[data-diag-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-diag-filter");
      document.querySelectorAll("[data-diag-filter]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      document.querySelectorAll(".geo-diag-row").forEach(function (row) {
        var type = row.getAttribute("data-diag-type");
        var show = filter === "all" || filter === type;
        row.style.display = show ? "" : "none";
      });
    });
  });
})();
