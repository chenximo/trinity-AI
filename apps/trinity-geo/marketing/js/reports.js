/** Trinity GEO · 报告列表筛选 */
(function () {
  var filterType = "all";
  var filterQuery = "";
  var searchInput = document.getElementById("rep-search");
  var resultCountEl = document.getElementById("rep-result-count");
  var emptyEl = document.getElementById("rep-empty");
  var listMetaEl = document.getElementById("rep-list-meta");
  var spotlightEl = document.getElementById("rep-w24");

  function rows() {
    return Array.prototype.slice.call(document.querySelectorAll(".geo-reports-row"));
  }

  function applyFilters() {
    var q = filterQuery.trim().toLowerCase();
    var visible = 0;
    rows().forEach(function (row) {
      var type = row.getAttribute("data-rep-type") || "";
      var search = (row.getAttribute("data-search") || "").toLowerCase();
      var matchType = filterType === "all" || filterType === type;
      var matchQuery = !q || search.indexOf(q) !== -1;
      var show = matchType && matchQuery;
      row.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });
    if (spotlightEl) {
      var showSpotlight = (filterType === "all" || filterType === "weekly") && (!q || "geo 周报 w24 2026 全球 soa".indexOf(q) !== -1);
      spotlightEl.classList.toggle("is-filtered-out", !showSpotlight);
    }
    if (resultCountEl) resultCountEl.textContent = "显示 " + visible + " 条";
    if (emptyEl) emptyEl.hidden = visible > 0;
    if (listMetaEl) {
      var filtered = filterType !== "all" || q;
      listMetaEl.textContent = filtered ? visible + " 份匹配" : rows().length + " 份";
    }
  }

  function setTypeFilter(type) {
    filterType = type;
    document.querySelectorAll(".geo-reports-type-filters [data-rep-filter]").forEach(function (btn) {
      var on = btn.getAttribute("data-rep-filter") === type;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  document.querySelectorAll(".geo-reports-type-filters [data-rep-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTypeFilter(btn.getAttribute("data-rep-filter") || "all");
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
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("is-highlighted");
    window.setTimeout(function () {
      el.classList.remove("is-highlighted");
    }, 2400);
  }

  if (window.location.hash) {
    window.setTimeout(scrollToHash, 100);
  }
  window.addEventListener("hashchange", scrollToHash);

  applyFilters();
})();
