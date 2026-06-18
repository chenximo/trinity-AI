/** Trinity GEO · 问题集管理原型交互 */
(function () {
  var tbody = document.getElementById("kw-tbody");
  var searchInput = document.getElementById("kw-search");
  var filterBtns = document.querySelectorAll(".geo-kw-filters [data-type]");
  var statusFilterBtns = document.querySelectorAll(".geo-kw-status-filters [data-status]");
  var typeSummary = document.getElementById("kw-type-summary");
  var activeCountEl = document.getElementById("kw-active-count");
  var asideActiveEl = document.getElementById("kw-aside-active");
  var pausedNoteEl = document.getElementById("kw-paused-note");
  var listMetaEl = document.getElementById("kw-list-meta");
  var resultCountEl = document.getElementById("kw-result-count");
  var emptyEl = document.getElementById("kw-empty");
  var manualAdd = document.getElementById("kw-manual-add");
  var addToggleBtn = document.getElementById("kw-add-toggle");
  var aiPanel = document.getElementById("kw-ai-panel");
  var aiSuggestBtn = document.getElementById("kw-ai-suggest-btn");
  var aiCloseBtn = document.getElementById("kw-ai-close");
  var aiApplyBtn = document.getElementById("kw-ai-apply");
  var addSubmitBtn = document.getElementById("kw-add-submit");
  var addType = document.getElementById("kw-add-type");
  var addText = document.getElementById("kw-add-text");
  var toast = document.getElementById("geo-toast");

  var currentFilter = "all";
  var currentStatusFilter = "all";
  var nextId = 11;

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

  function typeClass(type) {
    if (type === "品类词") return "type-category";
    if (type === "品牌词") return "type-brand";
    if (type === "对比词") return "type-compare";
    return "type-scenario";
  }

  function typeShort(type) {
    if (type === "品类词") return "品类";
    if (type === "品牌词") return "品牌";
    if (type === "对比词") return "对比";
    return "场景";
  }

  function rows() {
    return tbody ? Array.prototype.slice.call(tbody.querySelectorAll("tr[data-id]")) : [];
  }

  function refreshCounts() {
    var active = 0;
    var paused = 0;
    var byType = { 品类词: 0, 品牌词: 0, 对比词: 0, 场景词: 0 };

    rows().forEach(function (row) {
      var status = row.getAttribute("data-status");
      var type = row.getAttribute("data-type") || "";
      if (status === "active") {
        active += 1;
        if (byType[type] !== undefined) byType[type] += 1;
      } else {
        paused += 1;
      }
    });

    if (activeCountEl) activeCountEl.textContent = String(active);
    if (asideActiveEl) asideActiveEl.textContent = String(active);
    if (pausedNoteEl) pausedNoteEl.textContent = paused + " 条已暂停，不计入 SOA 分母";
    if (listMetaEl) {
      listMetaEl.textContent = active + " 条监测中 · " + paused + " 条已暂停";
    }

    if (typeSummary) {
      typeSummary.querySelectorAll("[data-type-filter]").forEach(function (chip) {
        var t = chip.getAttribute("data-type-filter");
        var strong = chip.querySelector("strong");
        if (strong && byType[t] !== undefined) strong.textContent = String(byType[t]);
      });
    }
  }

  function applyFilters() {
    var q = (searchInput && searchInput.value ? searchInput.value : "").trim().toLowerCase();
    var visible = 0;

    rows().forEach(function (row) {
      var type = row.getAttribute("data-type") || "";
      var status = row.getAttribute("data-status") || "";
      var id = (row.getAttribute("data-id") || "").toLowerCase();
      var textEl = row.querySelector(".geo-kw-text");
      var text = textEl ? textEl.textContent.toLowerCase() : "";
      var typeOk = currentFilter === "all" || type === currentFilter;
      var statusOk =
        currentStatusFilter === "all" ||
        (currentStatusFilter === "active" && status === "active") ||
        (currentStatusFilter === "paused" && status === "paused");
      var searchOk = !q || id.indexOf(q) !== -1 || text.indexOf(q) !== -1;
      var show = typeOk && statusOk && searchOk;
      row.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (resultCountEl) resultCountEl.textContent = "显示 " + visible + " 条";
    if (emptyEl) emptyEl.hidden = visible > 0;
  }

  function setFilter(type) {
    currentFilter = type;
    filterBtns.forEach(function (btn) {
      var on = btn.getAttribute("data-type") === type;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  function setStatusFilter(status) {
    currentStatusFilter = status;
    statusFilterBtns.forEach(function (btn) {
      var on = btn.getAttribute("data-status") === status;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  function focusManualForm() {
    if (manualAdd) {
      manualAdd.hidden = false;
      manualAdd.classList.remove("is-collapsed");
    }
    if (addToggleBtn) {
      addToggleBtn.setAttribute("aria-expanded", "true");
      addToggleBtn.textContent = "收起添加表单";
    }
    if (manualAdd) manualAdd.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (addText) addText.focus();
  }

  function setPaused(row, paused) {
    row.setAttribute("data-status", paused ? "paused" : "active");
    row.classList.toggle("is-paused", paused);

    var statusEl = row.querySelector(".geo-kw-status");
    if (statusEl) {
      statusEl.textContent = paused ? "已暂停" : "监测中";
      statusEl.classList.toggle("on", !paused);
      statusEl.classList.toggle("off", paused);
    }

    var soaCell = row.querySelector(".kw-soa-cell");
    if (soaCell && paused) {
      soaCell.textContent = "—";
      soaCell.className = "num geo-muted kw-soa-cell";
    }

    var signalsCell = row.querySelector(".geo-kw-signals");
    if (signalsCell && paused) {
      signalsCell.innerHTML = '<span class="geo-kw-signal muted">—</span>';
    }

    var link = row.querySelector("a.geo-kw-text");
    if (paused && link) {
      var span = document.createElement("span");
      span.className = "geo-kw-text muted";
      span.textContent = link.textContent;
      link.replaceWith(span);
    } else if (!paused) {
      var muted = row.querySelector("span.geo-kw-text.muted");
      if (muted) {
        var a = document.createElement("a");
        a.href = "#";
        a.className = "geo-kw-text";
        a.title = "关键词详情 · 待做";
        a.textContent = muted.textContent;
        muted.replaceWith(a);
      }
    }

    var toggleBtn = row.querySelector(".kw-toggle");
    if (toggleBtn) toggleBtn.textContent = paused ? "恢复" : "暂停";

    refreshCounts();
    applyFilters();
    showToast(paused ? "已暂停监测，不再计入 SOA 分母" : "已恢复监测");
  }

  function addQuestion(type, text, silent) {
    if (!tbody || !text.trim()) return false;
    var id = "Q" + String(nextId).padStart(2, "0");
    nextId += 1;

    var tr = document.createElement("tr");
    tr.setAttribute("data-id", id);
    tr.setAttribute("data-type", type);
    tr.setAttribute("data-status", "active");
    tr.innerHTML =
      '<td class="mono">' +
      id +
      '</td><td><span class="geo-kw-type ' +
      typeClass(type) +
      '">' +
      typeShort(type) +
      '</span></td><td><a href="#" class="geo-kw-text" title="关键词详情 · 待做">' +
      escapeHtml(text.trim()) +
      '</a></td><td class="num geo-muted kw-soa-cell">—</td><td class="geo-kw-signals"><span class="geo-kw-signal muted">—</span></td><td><span class="geo-kw-status on">监测中</span></td><td class="geo-kw-actions"><a href="#" class="geo-btn text">详情</a><button type="button" class="geo-btn text kw-toggle">暂停</button></td>';
    tbody.insertBefore(tr, tbody.firstChild);
    refreshCounts();
    applyFilters();
    if (!silent) showToast("已添加，明日采集周期生效");
    return true;
  }

  if (tbody) {
    tbody.addEventListener("click", function (e) {
      var target = e.target;
      if (!(target instanceof HTMLElement)) return;
      var row = target.closest("tr[data-id]");
      if (!row) return;

      if (target.classList.contains("kw-toggle")) {
        setPaused(row, row.getAttribute("data-status") !== "paused");
      }
      if (target.classList.contains("kw-remove")) {
        if (!window.confirm("确定删除该监测问题？")) return;
        row.remove();
        refreshCounts();
        applyFilters();
        showToast("已删除");
      }
    });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFilter(btn.getAttribute("data-type") || "all");
    });
  });

  statusFilterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setStatusFilter(btn.getAttribute("data-status") || "all");
    });
  });

  if (typeSummary) {
    typeSummary.querySelectorAll("[data-type-filter]").forEach(function (chip) {
      chip.style.cursor = "pointer";
      chip.addEventListener("click", function () {
        setFilter(chip.getAttribute("data-type-filter") || "all");
      });
    });
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);

  if (addToggleBtn && manualAdd) {
    addToggleBtn.addEventListener("click", function () {
      var collapsed = manualAdd.classList.toggle("is-collapsed");
      manualAdd.hidden = collapsed;
      addToggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      addToggleBtn.textContent = collapsed ? "添加监测问题" : "收起添加表单";
      if (!collapsed) focusManualForm();
    });
  }

  if (addSubmitBtn) {
    addSubmitBtn.addEventListener("click", function () {
      var text = addText ? addText.value : "";
      var type = addType ? addType.value : "品类词";
      if (!text.trim()) {
        showToast("请填写问法");
        focusManualForm();
        return;
      }
      if (addQuestion(type, text)) {
        if (addText) addText.value = "";
      }
    });
  }

  if (addText) {
    addText.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (addSubmitBtn) addSubmitBtn.click();
      }
    });
  }

  document.querySelectorAll(".kw-template").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (addType) addType.value = btn.getAttribute("data-type") || "品类词";
      if (addText) addText.value = btn.getAttribute("data-text") || "";
      focusManualForm();
      showToast("已填入上方表单，可修改后添加");
    });
  });

  if (aiSuggestBtn && aiPanel) {
    aiSuggestBtn.addEventListener("click", function () {
      aiPanel.hidden = !aiPanel.hidden;
      if (!aiPanel.hidden) aiPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  if (aiCloseBtn && aiPanel) {
    aiCloseBtn.addEventListener("click", function () {
      aiPanel.hidden = true;
    });
  }

  if (aiApplyBtn && aiPanel) {
    aiApplyBtn.addEventListener("click", function () {
      var added = 0;
      aiPanel.querySelectorAll(".geo-kw-ai-list input:checked").forEach(function (cb) {
        var type = cb.getAttribute("data-type") || "品类词";
        var text = cb.getAttribute("data-text") || "";
        if (addQuestion(type, text, true)) added += 1;
      });
      aiPanel.hidden = true;
      showToast(added ? "已加入 " + added + " 条问题" : "请先勾选建议问法");
    });
  }

  refreshCounts();
  applyFilters();
})();
