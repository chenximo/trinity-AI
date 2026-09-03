/** Trinity GEO · 品牌设置原型交互 */
(function () {
  var tbody = document.getElementById("alias-tbody");
  var aliasInput = document.getElementById("alias-input");
  var aliasAddBtn = document.getElementById("alias-add-btn");
  var aliasCountBadge = document.getElementById("alias-count-badge");
  var aliasEnabledCount = document.getElementById("alias-enabled-count");
  var aliasListMeta = document.getElementById("alias-list-meta");
  var aliasSearchInput = document.getElementById("alias-search");
  var aliasResultCount = document.getElementById("alias-result-count");
  var aliasEmpty = document.getElementById("alias-empty");
  var recalcStatus = document.getElementById("recalc-status");
  var recalcBtn = document.getElementById("recalc-btn");
  var saveBtn = document.getElementById("brand-save-btn");
  var toast = document.getElementById("geo-toast");

  var dirty = false;
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

  function rows() {
    return Array.prototype.slice.call(tbody ? tbody.querySelectorAll("tr[data-alias]") : []);
  }

  function countAliases() {
    var list = rows();
    var enabled = 0;
    list.forEach(function (row) {
      var cb = row.querySelector(".alias-enabled");
      if (!cb || cb.checked) enabled += 1;
    });
    return { total: list.length, enabled: enabled };
  }

  function applyAliasSearch() {
    var q = filterQuery.trim().toLowerCase();
    var visible = 0;
    rows().forEach(function (row) {
      var search = (row.getAttribute("data-search") || "").toLowerCase();
      var alias = (row.getAttribute("data-alias") || "").toLowerCase();
      var show = !q || search.indexOf(q) !== -1 || alias.indexOf(q) !== -1;
      row.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });
    if (aliasResultCount) aliasResultCount.textContent = "显示 " + visible + " 条";
    if (aliasEmpty) aliasEmpty.hidden = visible > 0;
  }

  function refreshCounts() {
    var c = countAliases();
    if (aliasCountBadge) aliasCountBadge.textContent = c.total + " 个别名";
    if (aliasEnabledCount) aliasEnabledCount.textContent = String(c.enabled);
    applyAliasSearch();
    if (aliasListMeta) {
      var filtered = filterQuery.trim();
      if (filtered) {
        var visible = rows().filter(function (row) {
          return !row.classList.contains("is-filtered-out");
        }).length;
        aliasListMeta.textContent = visible + " 条匹配";
      } else {
        aliasListMeta.textContent = c.total + " 条";
      }
    }
  }

  function markDirty() {
    dirty = true;
    if (recalcStatus) {
      recalcStatus.textContent = "保存后排队";
      recalcStatus.classList.add("is-pending");
    }
    if (recalcBtn) recalcBtn.disabled = false;
  }

  function aliasExists(name) {
    var lower = name.toLowerCase();
    for (var i = 0; i < rows().length; i++) {
      var a = rows()[i].getAttribute("data-alias") || "";
      if (a.toLowerCase() === lower) return true;
    }
    return false;
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function addAliasRow(name) {
    if (!tbody || !name) return;
    var trimmed = name.trim();
    if (!trimmed) return;
    if (aliasExists(trimmed)) {
      showToast("该别名已存在");
      return;
    }

    var tr = document.createElement("tr");
    tr.setAttribute("data-alias", trimmed);
    tr.setAttribute("data-search", trimmed.toLowerCase() + " 品牌");
    tr.innerHTML =
      "<td>" +
      escapeHtml(trimmed) +
      '</td><td>品牌</td><td><label class="geo-toggle"><input type="checkbox" class="alias-enabled" checked /><span class="geo-toggle-ui"></span></label></td><td><button type="button" class="geo-btn text danger alias-remove">删除</button></td>';
    tbody.appendChild(tr);
    bindRow(tr);
    refreshCounts();
    markDirty();
    showToast("已添加别名（记得保存）");
  }

  function bindRow(row) {
    var removeBtn = row.querySelector(".alias-remove");
    var enabledCb = row.querySelector(".alias-enabled");
    if (removeBtn) {
      removeBtn.addEventListener("click", function () {
        row.remove();
        refreshCounts();
        markDirty();
      });
    }
    if (enabledCb) {
      enabledCb.addEventListener("change", function () {
        refreshCounts();
        markDirty();
      });
    }
  }

  if (tbody) {
    tbody.querySelectorAll("tr[data-alias]").forEach(bindRow);
  }

  if (aliasAddBtn && aliasInput) {
    aliasAddBtn.addEventListener("click", function () {
      addAliasRow(aliasInput.value);
      aliasInput.value = "";
      aliasInput.focus();
    });
    aliasInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        aliasAddBtn.click();
      }
    });
  }

  if (aliasSearchInput) {
    aliasSearchInput.addEventListener("input", function () {
      filterQuery = aliasSearchInput.value;
      refreshCounts();
    });
  }

  document.querySelectorAll(".geo-chip-suggest").forEach(function (chip) {
    chip.addEventListener("click", function () {
      addAliasRow(chip.getAttribute("data-alias") || chip.textContent || "");
    });
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      dirty = false;
      if (recalcStatus) {
        recalcStatus.textContent = "队列中";
        recalcStatus.classList.add("is-pending");
      }
      showToast("品牌设置已保存，历史标注重算已排队");
    });
  }

  if (recalcBtn) {
    recalcBtn.addEventListener("click", function () {
      if (recalcBtn.disabled) return;
      showToast("已触发近 30 天历史重算");
      if (recalcStatus) recalcStatus.textContent = "重算中…";
    });
  }

  refreshCounts();
})();
