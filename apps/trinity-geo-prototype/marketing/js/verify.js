/** Trinity GEO · 效果验证筛选与深链 */
(function () {
  var filterType = "all";
  var filterQuery = "";
  var searchInput = document.getElementById("verify-search");
  var resultCountEl = document.getElementById("verify-result-count");
  var emptyEl = document.getElementById("verify-empty");
  var listMetaEl = document.getElementById("verify-list-meta");
  var spotlightEl = document.getElementById("verify-q00");
  var detailGridEl = document.getElementById("verify-detail-grid");

  function indexRows() {
    return Array.prototype.slice.call(document.querySelectorAll(".geo-verify-index-row"));
  }

  function caseBlocks() {
    return Array.prototype.slice.call(document.querySelectorAll(".geo-verify-case"));
  }

  function matchesFilter(el) {
    var type = el.getAttribute("data-verify-filter") || "";
    var search = (el.getAttribute("data-search") || "").toLowerCase();
    var q = filterQuery.trim().toLowerCase();
    var matchType = filterType === "all" || filterType === type;
    var matchQuery = !q || search.indexOf(q) !== -1;
    return matchType && matchQuery;
  }

  function applyFilters() {
    var visible = 0;
    indexRows().forEach(function (row) {
      var show = matchesFilter(row);
      row.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });
    caseBlocks().forEach(function (block) {
      block.classList.toggle("is-filtered-out", !matchesFilter(block));
    });
    if (detailGridEl) {
      var visibleCases = caseBlocks().filter(function (block) {
        return !block.classList.contains("is-filtered-out");
      }).length;
      detailGridEl.classList.toggle("is-single-col", visibleCases <= 1);
    }
    if (spotlightEl) {
      spotlightEl.classList.toggle("is-filtered-out", !matchesFilter(spotlightEl));
    }
    if (resultCountEl) resultCountEl.textContent = "显示 " + visible + " 项";
    if (emptyEl) emptyEl.hidden = visible > 0;
    if (listMetaEl) {
      var filtered = filterType !== "all" || filterQuery.trim();
      listMetaEl.textContent = filtered ? visible + " 项匹配" : indexRows().length + " 项";
    }
  }

  function setTypeFilter(type) {
    filterType = type;
    document.querySelectorAll("[data-verify-filter]").forEach(function (btn) {
      if (!btn.matches(".geo-kw-status-filters button")) return;
      var on = btn.getAttribute("data-verify-filter") === type;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  document.querySelectorAll(".geo-verify-type-filters [data-verify-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTypeFilter(btn.getAttribute("data-verify-filter") || "all");
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterQuery = searchInput.value;
      applyFilters();
    });
  }

  function resolveHashTarget(id) {
    if (!id) return null;
    var el = document.getElementById(id);
    if (el) return el;
    if (id === "verify-q00") return document.getElementById("verify-q00-detail") || document.getElementById("verify-q00");
    if (id === "verify-q01") return document.getElementById("verify-q01-detail");
    return null;
  }

  function scrollToHash() {
    var id = window.location.hash.replace("#", "");
    var el = resolveHashTarget(id);
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
