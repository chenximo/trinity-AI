/** Trinity GEO · 监测采集（概览 + 日志 Tab） */
(function () {
  var market = "all";
  var cards = document.querySelectorAll("#mon-platform-grid [data-market]");
  var marketBtns = document.querySelectorAll("[data-mon-market]");
  var refreshBtn = document.getElementById("mon-refresh-btn");
  var toast = document.getElementById("geo-toast");
  var tabBtns = document.querySelectorAll("[data-mon-tab]");
  var tabLinks = document.querySelectorAll("[data-mon-tab-link]");
  var panelOverview = document.getElementById("mon-panel-overview");
  var panelLogs = document.getElementById("mon-panel-logs");
  var toolbarOverview = document.getElementById("mon-toolbar-overview");
  var toolbarLogs = document.getElementById("mon-toolbar-logs");

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.removeAttribute("hidden");
    toast.classList.add("is-visible");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.setAttribute("hidden", "");
    }, 2200);
  }

  function getTabFromUrl() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "logs") return "logs";
    if (window.location.hash === "#logs") return "logs";
    return "overview";
  }

  function setMonTab(tab, updateUrl) {
    var isLogs = tab === "logs";
    tabBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-mon-tab") === tab;
      btn.classList.toggle("on", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (panelOverview) {
      panelOverview.hidden = isLogs;
    }
    if (panelLogs) {
      panelLogs.hidden = !isLogs;
    }
    if (toolbarOverview) {
      toolbarOverview.hidden = isLogs;
    }
    if (toolbarLogs) {
      toolbarLogs.hidden = !isLogs;
    }
    if (updateUrl !== false) {
      var next = isLogs ? "?tab=logs" : window.location.pathname.split("/").pop() || "monitoring.html";
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", next);
      }
    }
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMonTab(btn.getAttribute("data-mon-tab") || "overview");
    });
  });

  tabLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      setMonTab(link.getAttribute("data-mon-tab-link") || "logs");
    });
  });

  setMonTab(getTabFromUrl(), false);

  marketBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      market = btn.getAttribute("data-mon-market") || "all";
      marketBtns.forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      cards.forEach(function (card) {
        var m = card.getAttribute("data-market");
        card.classList.toggle("is-hidden", market !== "all" && m !== market);
      });
    });
  });

  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      showToast("采集状态已刷新（Mock）");
    });
  }
})();
