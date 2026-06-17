/** Trinity GEO · 竞品管理原型交互 */
(function () {
  var compList = document.getElementById("comp-list");
  var toast = document.getElementById("geo-toast");
  var saveBtn = document.getElementById("comp-save-btn");
  var activeCountEl = document.getElementById("comp-active-count");
  var aliasTotalEl = document.getElementById("comp-alias-total");
  var syncCountEl = document.getElementById("comp-sync-count");
  var syncAliasesEl = document.getElementById("comp-sync-aliases");
  var quotaBar = document.getElementById("comp-quota-bar");
  var recalcStatus = document.getElementById("comp-recalc-status");
  var recalcBtn = document.getElementById("comp-recalc-btn");
  var addName = document.getElementById("comp-add-name");
  var addMarket = document.getElementById("comp-add-market");
  var addAlias = document.getElementById("comp-add-alias");
  var addSubmit = document.getElementById("comp-add-submit");
  var aiPanel = document.getElementById("comp-ai-panel");
  var aiSuggestBtn = document.getElementById("comp-ai-suggest-btn");
  var aiCloseBtn = document.getElementById("comp-ai-close");
  var aiApplyBtn = document.getElementById("comp-ai-apply");

  var nextCompNum = 7;

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

  function cards() {
    return compList ? Array.prototype.slice.call(compList.querySelectorAll(".geo-comp-card")) : [];
  }

  function countAliasesInCard(card) {
    return card.querySelectorAll(".geo-comp-alias-list li[data-alias]").length;
  }

  function refreshCounts() {
    var active = 0;
    var aliases = 0;
    cards().forEach(function (card) {
      if (card.getAttribute("data-status") === "active") active += 1;
      aliases += countAliasesInCard(card);
      var countEl = card.querySelector(".comp-alias-count");
      if (countEl) countEl.textContent = String(countAliasesInCard(card));
    });

    if (activeCountEl) activeCountEl.textContent = String(active);
    if (aliasTotalEl) aliasTotalEl.textContent = "共 " + aliases + " 个别名";
    if (syncCountEl) syncCountEl.textContent = String(cards().length);
    if (syncAliasesEl) syncAliasesEl.textContent = String(aliases);
    if (quotaBar) quotaBar.style.width = Math.min(100, active * 10) + "%";
  }

  function markDirty() {
    if (recalcStatus) {
      recalcStatus.textContent = "保存后排队";
      recalcStatus.classList.add("is-pending");
    }
    if (recalcBtn) recalcBtn.disabled = false;
  }

  function toggleCard(card, open) {
    var body = card.querySelector(".geo-comp-card-body");
    var btn = card.querySelector(".geo-comp-expand");
    var isOpen = open !== undefined ? open : !card.classList.contains("is-open");
    card.classList.toggle("is-open", isOpen);
    if (body) body.hidden = !isOpen;
    if (btn) {
      btn.textContent = isOpen ? "▾" : "▸";
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  }

  function setPaused(card, paused) {
    card.setAttribute("data-status", paused ? "paused" : "active");
    var label = card.querySelector(".comp-status-label");
    var toggle = card.querySelector(".comp-toggle");
    if (label) {
      label.textContent = paused ? "已暂停" : "监测中";
      label.classList.toggle("on", !paused);
      label.classList.toggle("off", paused);
    }
    if (toggle) toggle.textContent = paused ? "恢复" : "暂停";
    card.classList.toggle("is-paused", paused);
    refreshCounts();
    markDirty();
    showToast(paused ? "已暂停该竞品对比" : "已恢复竞品监测");
  }

  function addAliasToCard(card, alias) {
    var trimmed = alias.trim();
    if (!trimmed) return;
    var list = card.querySelector(".geo-comp-alias-list");
    if (!list) return;
    var exists = list.querySelector('li[data-alias="' + trimmed.replace(/"/g, '\\"') + '"]');
    if (!exists) {
      var all = list.querySelectorAll("li[data-alias]");
      for (var i = 0; i < all.length; i++) {
        if ((all[i].getAttribute("data-alias") || "").toLowerCase() === trimmed.toLowerCase()) {
          showToast("别名已存在");
          return;
        }
      }
    } else {
      showToast("别名已存在");
      return;
    }

    var li = document.createElement("li");
    li.setAttribute("data-alias", trimmed);
    li.innerHTML =
      "<span>" +
      escapeHtml(trimmed) +
      '</span> <button type="button" class="geo-btn text danger comp-alias-remove">删除</button>';
    list.appendChild(li);
    refreshCounts();
    markDirty();
  }

  function createCard(id, name, market, aliases) {
    var ml = marketLabel(market);
    var article = document.createElement("article");
    article.className = "geo-comp-card is-open";
    article.setAttribute("data-id", id);
    article.setAttribute("data-status", "active");
    article.setAttribute("data-market", market);

    var aliasItems = aliases
      .map(function (a, i) {
        var primary = i === 0 ? ' <span class="geo-alias-tag">主名称</span>' : "";
        var del =
          i === 0
            ? '<button type="button" class="geo-btn text danger comp-alias-remove" disabled>—</button>'
            : '<button type="button" class="geo-btn text danger comp-alias-remove">删除</button>';
        return (
          '<li data-alias="' +
          escapeHtml(a) +
          '"><span>' +
          escapeHtml(a) +
          "</span>" +
          primary +
          " " +
          del +
          "</li>"
        );
      })
      .join("");

    article.innerHTML =
      '<header class="geo-comp-card-head">' +
      '<button type="button" class="geo-comp-expand" aria-expanded="true">▾</button>' +
      '<div class="geo-comp-title"><strong>' +
      escapeHtml(name) +
      "</strong><code class=\"geo-comp-id\">" +
      escapeHtml(id) +
      '</code><span class="geo-market-pill ' +
      ml.cls +
      '">' +
      ml.text +
      "</span></div>" +
      '<span class="geo-comp-meta"><span class="comp-alias-count">' +
      aliases.length +
      '</span> 个别名</span>' +
      '<span class="geo-kw-status on comp-status-label">监测中</span>' +
      '<div class="geo-comp-head-actions">' +
      '<button type="button" class="geo-btn text comp-toggle">暂停</button>' +
      '<button type="button" class="geo-btn text danger comp-remove">删除</button>' +
      "</div></header>" +
      '<div class="geo-comp-card-body">' +
      '<div class="geo-alias-add"><input type="text" class="comp-alias-input" placeholder="添加竞品别名" /><button type="button" class="geo-btn primary sm comp-alias-add">添加</button></div>' +
      '<ul class="geo-comp-alias-list">' +
      aliasItems +
      "</ul></div>";

    if (compList) compList.insertBefore(article, compList.firstChild);
    refreshCounts();
    markDirty();
  }

  if (compList) {
    compList.addEventListener("click", function (e) {
      var target = e.target;
      if (!(target instanceof HTMLElement)) return;
      var card = target.closest(".geo-comp-card");
      if (!card) return;

      if (target.classList.contains("geo-comp-expand")) {
        toggleCard(card);
        return;
      }

      if (target.classList.contains("comp-toggle")) {
        setPaused(card, card.getAttribute("data-status") !== "paused");
        return;
      }

      if (target.classList.contains("comp-remove")) {
        if (!window.confirm("确定删除该竞品？")) return;
        card.remove();
        refreshCounts();
        markDirty();
        showToast("已删除竞品");
        return;
      }

      if (target.classList.contains("comp-alias-add")) {
        var input = card.querySelector(".comp-alias-input");
        if (input) addAliasToCard(card, input.value);
        if (input) input.value = "";
        return;
      }

      if (target.classList.contains("comp-alias-remove") && !target.disabled) {
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
      if (document.querySelector('.geo-comp-card[data-id="' + id + '"]')) {
        id = id + "-" + nextCompNum;
      }
      nextCompNum += 1;
      createCard(id, name, market, aliases);
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
        createCard(slugify(name) + "-" + nextCompNum++, name, market, [name, alias]);
        n += 1;
      });
      aiPanel.hidden = true;
      showToast(n ? "已加入 " + n + " 个竞品" : "请先勾选");
    });
  }

  refreshCounts();
})();
