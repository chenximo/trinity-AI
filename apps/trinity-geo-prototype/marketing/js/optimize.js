/** Trinity GEO · 优化待办筛选与深链 */
(function () {
  var filterStatus = "all";
  var filterQuery = "";
  var searchInput = document.getElementById("opt-search");
  var resultCountEl = document.getElementById("opt-result-count");
  var emptyEl = document.getElementById("opt-empty");
  var listMetaEl = document.getElementById("opt-list-meta");

  function rows() {
    return Array.prototype.slice.call(document.querySelectorAll(".geo-opt-row"));
  }

  function applyFilters() {
    var q = filterQuery.trim().toLowerCase();
    var visible = 0;
    rows().forEach(function (row) {
      var status = row.getAttribute("data-opt-status") || "";
      var search = (row.getAttribute("data-search") || "").toLowerCase();
      var matchStatus = filterStatus === "all" || filterStatus === status;
      var matchQuery = !q || search.indexOf(q) !== -1;
      var show = matchStatus && matchQuery;
      row.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });
    if (resultCountEl) resultCountEl.textContent = "显示 " + visible + " 条";
    if (emptyEl) emptyEl.hidden = visible > 0;
    if (listMetaEl) {
      var filtered = filterStatus !== "all" || q;
      listMetaEl.textContent = filtered ? visible + " 项匹配" : rows().length + " 项";
    }
  }

  function setStatusFilter(status) {
    filterStatus = status;
    document.querySelectorAll("[data-opt-filter]").forEach(function (btn) {
      var on = btn.getAttribute("data-opt-filter") === status;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  document.querySelectorAll("[data-opt-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setStatusFilter(btn.getAttribute("data-opt-filter") || "all");
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
    if (id.indexOf("opt-row-") === 0) return null;
    if (id.indexOf("opt-") === 0) {
      return document.getElementById("opt-row-" + id.slice(4));
    }
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
