/** Trinity GEO · 优化待办筛选 */
(function () {
  document.querySelectorAll("[data-opt-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-opt-filter");
      document.querySelectorAll("[data-opt-filter]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      document.querySelectorAll(".geo-opt-row").forEach(function (row) {
        var status = row.getAttribute("data-opt-status");
        var show = filter === "all" || filter === status;
        row.style.display = show ? "" : "none";
      });
    });
  });
})();
