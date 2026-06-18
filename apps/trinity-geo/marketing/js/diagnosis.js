/** Trinity GEO · 诊断列表筛选 */
(function () {
  var filterType = "all";
  var filterPriority = "all";
  var filterQuery = "";
  var searchInput = document.getElementById("diag-search");
  var resultCountEl = document.getElementById("diag-result-count");
  var emptyEl = document.getElementById("diag-empty");
  var listMetaEl = document.getElementById("diag-list-meta");

  function rows() {
    return Array.prototype.slice.call(document.querySelectorAll(".geo-diag-row"));
  }

  function applyFilters() {
    var q = filterQuery.trim().toLowerCase();
    var visible = 0;
    rows().forEach(function (row) {
      var type = row.getAttribute("data-diag-type") || "";
      var pri = row.getAttribute("data-diag-priority") || "";
      var search = (row.getAttribute("data-search") || "").toLowerCase();
      var matchType = filterType === "all" || filterType === type;
      var matchPri = filterPriority === "all" || filterPriority === pri;
      var matchQuery = !q || search.indexOf(q) !== -1;
      var show = matchType && matchPri && matchQuery;
      row.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });
    if (resultCountEl) resultCountEl.textContent = "显示 " + visible + " 条";
    if (emptyEl) emptyEl.hidden = visible > 0;
    if (listMetaEl) {
      var filtered = filterType !== "all" || filterPriority !== "all" || q;
      listMetaEl.textContent = filtered ? visible + " 条匹配" : rows().length + " 条开放";
    }
  }

  function setTypeFilter(type) {
    filterType = type;
    document.querySelectorAll("[data-diag-filter]").forEach(function (btn) {
      var on = btn.getAttribute("data-diag-filter") === type;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  function setPriorityFilter(pri) {
    filterPriority = pri;
    document.querySelectorAll("[data-diag-priority]").forEach(function (btn) {
      var on = btn.getAttribute("data-diag-priority") === pri;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  document.querySelectorAll("[data-diag-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTypeFilter(btn.getAttribute("data-diag-filter") || "all");
    });
  });

  document.querySelectorAll("[data-diag-priority]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setPriorityFilter(btn.getAttribute("data-diag-priority") || "all");
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterQuery = searchInput.value;
      applyFilters();
    });
  }

  function scrollToHash() {
    var id = window.location.hash.replace("#", "");
    if (!id) return;
    var el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("is-highlighted");
      window.setTimeout(function () {
        el.classList.remove("is-highlighted");
      }, 2400);
    }
  }

  if (window.location.hash) {
    window.setTimeout(scrollToHash, 100);
  }
  window.addEventListener("hashchange", scrollToHash);

  applyFilters();
})();
