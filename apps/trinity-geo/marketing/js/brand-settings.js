/** Trinity GEO · 品牌设置原型交互 */
(function () {
  var tbody = document.getElementById("alias-tbody");
  var aliasInput = document.getElementById("alias-input");
  var aliasAddBtn = document.getElementById("alias-add-btn");
  var aliasCountBadge = document.getElementById("alias-count-badge");
  var aliasEnabledCount = document.getElementById("alias-enabled-count");
  var recalcStatus = document.getElementById("recalc-status");
  var recalcBtn = document.getElementById("recalc-btn");
  var saveBtn = document.getElementById("brand-save-btn");
  var toast = document.getElementById("geo-toast");

  var dirty = false;

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

  function countAliases() {
    if (!tbody) return { total: 0, enabled: 0 };
    var rows = tbody.querySelectorAll("tr[data-alias]");
    var enabled = 0;
    rows.forEach(function (row) {
      var cb = row.querySelector(".alias-enabled");
      if (!cb || cb.checked) enabled += 1;
    });
    return { total: rows.length, enabled: enabled };
  }

  function refreshCounts() {
    var c = countAliases();
    if (aliasCountBadge) aliasCountBadge.textContent = c.total + " 个别名";
    if (aliasEnabledCount) aliasEnabledCount.textContent = String(c.enabled);
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
    if (!tbody) return false;
    var lower = name.toLowerCase();
    var rows = tbody.querySelectorAll("tr[data-alias]");
    for (var i = 0; i < rows.length; i++) {
      var a = rows[i].getAttribute("data-alias") || "";
      if (a.toLowerCase() === lower) return true;
    }
    return false;
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

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  document.querySelectorAll(".geo-chip-suggest").forEach(function (chip) {
    chip.addEventListener("click", function () {
      addAliasRow(chip.getAttribute("data-alias") || chip.textContent || "");
    });
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      dirty = false;
      if (recalcStatus) {
        recalcStatus.textContent = "队列中 · 约 5 分钟";
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
