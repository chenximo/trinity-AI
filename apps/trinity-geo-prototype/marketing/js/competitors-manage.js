/** Trinity GEO · 竞品管理原型交互 */
(function () {
  var compTbody = document.getElementById("comp-tbody");
  var toast = document.getElementById("geo-toast");
  var saveBtn = document.getElementById("comp-save-btn");
  var activeCountEl = document.getElementById("comp-active-count");
  var aliasTotalEl = document.getElementById("comp-alias-total");
  var listMetaEl = document.getElementById("comp-list-meta");
  var syncCountEl = document.getElementById("comp-sync-count");
  var syncAliasesEl = document.getElementById("comp-sync-aliases");
  var quotaBar = document.getElementById("comp-quota-bar");
  var recalcStatus = document.getElementById("comp-recalc-status");
  var recalcBtn = document.getElementById("comp-recalc-btn");
  var addName = document.getElementById("comp-add-name");
  var addMarket = document.getElementById("comp-add-market");
  var addAlias = document.getElementById("comp-add-alias");
  var addSubmit = document.getElementById("comp-add-submit");
  var addToggle = document.getElementById("comp-add-toggle");
  var manualAdd = document.getElementById("comp-manual-add");
  var aiPanel = document.getElementById("comp-ai-panel");
  var aiSuggestBtn = document.getElementById("comp-ai-suggest-btn");
  var aiCloseBtn = document.getElementById("comp-ai-close");
  var aiApplyBtn = document.getElementById("comp-ai-apply");
  var searchInput = document.getElementById("comp-search");
  var resultCountEl = document.getElementById("comp-result-count");
  var emptyEl = document.getElementById("comp-empty");
  var marketSummary = document.getElementById("comp-market-summary");

  var nextCompNum = 7;
  var filterMarket = "all";
  var filterStatus = "all";
  var filterQuery = "";

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.removeAttribute("hidden");
    toast.classList.add("is-visible");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.setAttribute("hidden", "");
    }, 2800);
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugify(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "competitor-" + nextCompNum;
  }

  function marketLabel(market) {
    if (market === "domestic") return { text: "国内", cls: "domestic" };
    if (market === "both") return { text: "双市场", cls: "both" };
    return { text: "海外", cls: "overseas" };
  }

  function rows() {
    return compTbody ? Array.prototype.slice.call(compTbody.querySelectorAll(".geo-comp-row")) : [];
  }

  function getDetailRow(row) {
    var next = row.nextElementSibling;
    return next && next.classList.contains("geo-comp-detail") ? next : null;
  }

  function aliasChipList(row) {
    var detail = getDetailRow(row);
    return detail ? detail.querySelector(".geo-comp-alias-chips") : null;
  }

  function countAliasesInRow(row) {
    var list = aliasChipList(row);
    return list ? list.querySelectorAll("li[data-alias]").length : 0;
  }

  function buildSearchText(name, market, aliases) {
    return (name + " " + aliases.join(" ") + " " + market).toLowerCase();
  }

  function updateAliasPreview(row) {
    var preview = row.querySelector(".geo-comp-alias-preview");
    var list = aliasChipList(row);
    if (!preview || !list) return;
    var parts = [];
    list.querySelectorAll("li[data-alias]").forEach(function (li) {
      if (!li.classList.contains("is-primary")) {
        parts.push(li.getAttribute("data-alias") || "");
      }
    });
    var text = parts.join("、");
    preview.textContent = text.length > 36 ? text.slice(0, 34) + "…" : text || "—";
  }

  function aliasChipHtml(alias, isPrimary) {
    if (isPrimary) {
      return (
        '<li data-alias="' +
        escapeHtml(alias) +
        '" class="geo-alias-chip is-primary"><span>' +
        escapeHtml(alias) +
        '</span><span class="geo-alias-tag">主</span></li>'
      );
    }
    return (
      '<li data-alias="' +
      escapeHtml(alias) +
      '" class="geo-alias-chip"><span>' +
      escapeHtml(alias) +
      '</span><button type="button" class="comp-alias-remove" aria-label="删除别名 ' +
      escapeHtml(alias) +
      '">×</button></li>'
    );
  }

  function updateMarketSummary() {
    if (!marketSummary) return;
    var counts = { all: 0, overseas: 0, domestic: 0, both: 0 };
    rows().forEach(function (row) {
      counts.all += 1;
      var m = row.getAttribute("data-market") || "overseas";
      if (counts[m] !== undefined) counts[m] += 1;
    });
    marketSummary.querySelectorAll("[data-comp-market]").forEach(function (btn) {
      var key = btn.getAttribute("data-comp-market");
      var strong = btn.querySelector("strong");
      if (strong && counts[key] !== undefined) strong.textContent = String(counts[key]);
    });
  }

  function applyFilters() {
    var q = filterQuery.trim().toLowerCase();
    var visible = 0;
    rows().forEach(function (row) {
      var market = row.getAttribute("data-market") || "";
      var status = row.getAttribute("data-status") || "active";
      var search = (row.getAttribute("data-search") || "").toLowerCase();
      var matchMarket = filterMarket === "all" || market === filterMarket;
      var matchStatus = filterStatus === "all" || status === filterStatus;
      var matchQuery = !q || search.indexOf(q) !== -1 || (row.getAttribute("data-id") || "").indexOf(q) !== -1;
      var show = matchMarket && matchStatus && matchQuery;
      row.classList.toggle("is-filtered-out", !show);
      var detail = getDetailRow(row);
      if (detail) {
        detail.classList.toggle("is-filtered-out", !show);
        if (!show) detail.hidden = true;
      }
      if (show) visible += 1;
    });
    if (resultCountEl) resultCountEl.textContent = "显示 " + visible + " 家";
    if (emptyEl) emptyEl.hidden = visible > 0;
  }

  function setMarketFilter(market) {
    filterMarket = market;
    document.querySelectorAll("[data-comp-market]").forEach(function (btn) {
      var key = btn.getAttribute("data-comp-market");
      var on = key === market;
      btn.classList.toggle("on", on);
      if (btn.getAttribute("role") === "tab") btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  function setStatusFilter(status) {
    filterStatus = status;
    document.querySelectorAll("[data-comp-status]").forEach(function (btn) {
      var key = btn.getAttribute("data-comp-status");
      var on = key === status;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  function refreshCounts() {
    var active = 0;
    var paused = 0;
    var aliases = 0;
    rows().forEach(function (row) {
      if (row.getAttribute("data-status") === "active") active += 1;
      else paused += 1;
      aliases += countAliasesInRow(row);
      updateAliasPreview(row);
    });

    if (activeCountEl) activeCountEl.textContent = String(active);
    if (aliasTotalEl) {
      aliasTotalEl.innerHTML =
        "共 " + aliases + ' 个别名 · <span id="comp-paused-note">' + paused + " 家已暂停</span>";
    }
    if (listMetaEl) listMetaEl.textContent = active + " 家监测中" + (paused ? " · " + paused + " 家已暂停" : "");
    if (syncCountEl) syncCountEl.textContent = String(rows().length);
    if (syncAliasesEl) syncAliasesEl.textContent = String(aliases);
    if (quotaBar) quotaBar.style.width = Math.min(100, active * 10) + "%";
    updateMarketSummary();
    applyFilters();
  }

  function markDirty() {
    if (recalcStatus) {
      recalcStatus.textContent = "保存后排队";
      recalcStatus.classList.add("is-pending");
    }
    if (recalcBtn) recalcBtn.disabled = false;
  }

  function toggleRow(row, open) {
    var detail = getDetailRow(row);
    var btn = row.querySelector(".geo-comp-expand");
    var isOpen = open !== undefined ? open : !!(detail && detail.hidden);
    if (detail) detail.hidden = !isOpen;
    row.classList.toggle("is-open", isOpen);
    if (btn) {
      btn.textContent = isOpen ? "▾" : "▸";
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  }

  function setPaused(row, paused) {
    row.setAttribute("data-status", paused ? "paused" : "active");
    var label = row.querySelector(".comp-status-label");
    var toggle = row.querySelector(".comp-toggle");
    if (label) {
      label.textContent = paused ? "已暂停" : "监测中";
      label.classList.toggle("on", !paused);
      label.classList.toggle("off", paused);
    }
    if (toggle) toggle.textContent = paused ? "恢复" : "暂停";
    row.classList.toggle("is-paused", paused);
    refreshCounts();
    markDirty();
    showToast(paused ? "已暂停该竞品对比" : "已恢复竞品监测");
  }

  function addAliasToRow(row, alias) {
    var trimmed = alias.trim();
    if (!trimmed) return;
    var list = aliasChipList(row);
    if (!list) return;
    var all = list.querySelectorAll("li[data-alias]");
    for (var i = 0; i < all.length; i++) {
      if ((all[i].getAttribute("data-alias") || "").toLowerCase() === trimmed.toLowerCase()) {
        showToast("别名已存在");
        return;
      }
    }

    var li = document.createElement("li");
    li.setAttribute("data-alias", trimmed);
    li.className = "geo-alias-chip";
    li.innerHTML =
      "<span>" +
      escapeHtml(trimmed) +
      '</span><button type="button" class="comp-alias-remove" aria-label="删除别名 ' +
      escapeHtml(trimmed) +
      '">×</button>';
    list.appendChild(li);
    var search = row.getAttribute("data-search") || "";
    row.setAttribute("data-search", (search + " " + trimmed).trim());
    refreshCounts();
    markDirty();
  }

  function createRowPair(id, name, market, aliases) {
    var ml = marketLabel(market);
    var aliasItems = aliases
      .map(function (a, i) {
        return aliasChipHtml(a, i === 0);
      })
      .join("");

    var tr = document.createElement("tr");
    tr.className = "geo-comp-row is-open";
    tr.setAttribute("data-id", id);
    tr.setAttribute("data-status", "active");
    tr.setAttribute("data-market", market);
    tr.setAttribute("data-search", buildSearchText(name, market, aliases));

    tr.innerHTML =
      '<td class="geo-comp-expand-cell"><button type="button" class="geo-comp-expand" aria-expanded="true">▾</button></td>' +
      '<td class="geo-comp-name-cell"><strong>' +
      escapeHtml(name) +
      "</strong> <code class=\"geo-comp-id\">" +
      escapeHtml(id) +
      "</code></td>" +
      '<td><span class="geo-market-pill ' +
      ml.cls +
      '">' +
      ml.text +
      "</span></td>" +
      '<td class="num"><span class="geo-muted">—</span></td>' +
      '<td class="geo-comp-alias-preview">—</td>' +
      '<td><span class="geo-kw-status on comp-status-label">监测中</span></td>' +
      '<td class="geo-kw-actions">' +
      '<button type="button" class="geo-btn text comp-toggle">暂停</button> ' +
      '<button type="button" class="geo-btn text danger comp-remove">删除</button>' +
      "</td>";

    var detail = document.createElement("tr");
    detail.className = "geo-comp-detail";
    detail.innerHTML =
      '<td colspan="7"><div class="geo-comp-alias-panel">' +
      '<ul class="geo-comp-alias-chips">' +
      aliasItems +
      "</ul>" +
      '<div class="geo-alias-add geo-comp-alias-add">' +
      '<input type="text" class="comp-alias-input" placeholder="添加别名…" />' +
      '<button type="button" class="geo-btn ghost sm comp-alias-add">添加</button>' +
      "</div></div></td>";

    if (compTbody) {
      compTbody.insertBefore(detail, compTbody.firstChild);
      compTbody.insertBefore(tr, detail);
    }
    refreshCounts();
    markDirty();
  }

  if (addToggle && manualAdd) {
    addToggle.addEventListener("click", function () {
      var collapsed = manualAdd.classList.toggle("is-collapsed");
      addToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      addToggle.textContent = collapsed ? "展开添加表单" : "收起添加表单";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterQuery = searchInput.value;
      applyFilters();
    });
  }

  document.querySelectorAll("[data-comp-market]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMarketFilter(btn.getAttribute("data-comp-market") || "all");
    });
  });

  document.querySelectorAll("[data-comp-status]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setStatusFilter(btn.getAttribute("data-comp-status") || "all");
    });
  });

  if (compTbody) {
    compTbody.addEventListener("click", function (e) {
      var target = e.target;
      if (!(target instanceof HTMLElement)) return;
      var row = target.closest(".geo-comp-row");
      if (!row) return;

      if (target.classList.contains("geo-comp-expand")) {
        var detail = getDetailRow(row);
        toggleRow(row, !!(detail && detail.hidden));
        return;
      }

      if (target.classList.contains("comp-toggle")) {
        setPaused(row, row.getAttribute("data-status") !== "paused");
        return;
      }

      if (target.classList.contains("comp-remove")) {
        if (!window.confirm("确定删除该竞品？")) return;
        var detailRow = getDetailRow(row);
        if (detailRow) detailRow.remove();
        row.remove();
        refreshCounts();
        markDirty();
        showToast("已删除竞品");
        return;
      }

      if (target.classList.contains("comp-alias-add")) {
        var input = getDetailRow(row) && getDetailRow(row).querySelector(".comp-alias-input");
        if (input) addAliasToRow(row, input.value);
        if (input) input.value = "";
        return;
      }

      if (target.classList.contains("comp-alias-remove")) {
        var li = target.closest("li[data-alias]");
        if (li) li.remove();
        refreshCounts();
        markDirty();
        return;
      }
    });
  }

  if (addSubmit) {
    addSubmit.addEventListener("click", function () {
      var name = addName ? addName.value.trim() : "";
      var alias = addAlias ? addAlias.value.trim() : "";
      var market = addMarket ? addMarket.value : "overseas";
      if (!name) {
        showToast("请填写竞品主名称");
        return;
      }
      var aliases = alias ? [name, alias] : [name];
      if (alias && alias.toLowerCase() === name.toLowerCase()) aliases = [name];
      var id = slugify(name);
      if (document.querySelector('.geo-comp-row[data-id="' + id + '"]')) {
        id = id + "-" + nextCompNum;
      }
      nextCompNum += 1;
      createRowPair(id, name, market, aliases);
      if (addName) addName.value = "";
      if (addAlias) addAlias.value = "";
      showToast("已添加竞品（记得保存）");
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      if (recalcStatus) {
        recalcStatus.textContent = "队列中 · 约 5 分钟";
        recalcStatus.classList.add("is-pending");
      }
      showToast("竞品库已保存，标注重算已排队");
    });
  }

  if (recalcBtn) {
    recalcBtn.addEventListener("click", function () {
      if (recalcBtn.disabled) return;
      showToast("已触发竞品提及重算");
    });
  }

  if (aiSuggestBtn && aiPanel) {
    aiSuggestBtn.addEventListener("click", function () {
      aiPanel.hidden = !aiPanel.hidden;
      if (!aiPanel.hidden && manualAdd) {
        manualAdd.classList.remove("is-collapsed");
        if (addToggle) {
          addToggle.setAttribute("aria-expanded", "true");
          addToggle.textContent = "收起添加表单";
        }
      }
    });
  }
  if (aiCloseBtn && aiPanel) aiCloseBtn.addEventListener("click", function () { aiPanel.hidden = true; });
  if (aiApplyBtn && aiPanel) {
    aiApplyBtn.addEventListener("click", function () {
      var n = 0;
      aiPanel.querySelectorAll("input:checked").forEach(function (cb) {
        var name = cb.getAttribute("data-name") || "";
        var market = cb.getAttribute("data-market") || "overseas";
        var alias = cb.getAttribute("data-alias") || name;
        if (!name) return;
        var aliases = alias && alias !== name ? [name, alias] : [name];
        createRowPair(slugify(name) + "-" + nextCompNum++, name, market, aliases);
        n += 1;
      });
      aiPanel.hidden = true;
      showToast(n ? "已加入 " + n + " 个竞品" : "请先勾选");
    });
  }

  refreshCounts();
})();
