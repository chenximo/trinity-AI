/** Trinity GEO · 控制台 Dashboard 原型交互 */
(function () {
  var market = "all";
  var period = "week";

  var marketBtns = document.querySelectorAll("[data-market]");
  var periodBtns = document.querySelectorAll("[data-period]");
  var platformRows = document.querySelectorAll("[data-platform-market]");
  var kpiCards = document.querySelectorAll("[data-kpi-market]");
  var trendOverseas = document.querySelector(".dash-trend-line-overseas");
  var trendDomestic = document.querySelector(".dash-trend-line-domestic");
  var periodLabel = document.querySelector("[data-period-label]");

  var periodLabels = {
    day: "近 7 日",
    week: "近 8 周",
    month: "近 6 月",
  };

  function setMarket(next) {
    market = next;
    marketBtns.forEach(function (btn) {
      btn.classList.toggle("on", btn.getAttribute("data-market") === next);
    });

    platformRows.forEach(function (row) {
      var m = row.getAttribute("data-platform-market");
      var show = next === "all" || m === next;
      row.classList.toggle("is-hidden", !show);
    });

    kpiCards.forEach(function (card) {
      var m = card.getAttribute("data-kpi-market");
      if (next === "all") {
        card.classList.remove("is-dim", "is-highlight");
        return;
      }
      card.classList.toggle("is-dim", m !== "all" && m !== next);
      card.classList.toggle("is-highlight", m === next);
    });

    if (trendOverseas) {
      trendOverseas.style.display = next === "domestic" ? "none" : "";
    }
    if (trendDomestic) {
      trendDomestic.style.display = next === "overseas" ? "none" : "";
    }
  }

  function setPeriod(next) {
    period = next;
    periodBtns.forEach(function (btn) {
      btn.classList.toggle("on", btn.getAttribute("data-period") === next);
    });
    if (periodLabel && periodLabels[next]) {
      periodLabel.textContent = periodLabels[next];
    }
  }

  marketBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMarket(btn.getAttribute("data-market") || "all");
    });
  });

  periodBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setPeriod(btn.getAttribute("data-period") || "week");
    });
  });

  function hideOnboard() {
    if (!onboard) return;
    onboard.classList.add("is-hidden");
    onboard.setAttribute("hidden", "");
    try {
      localStorage.setItem("geo_dash_onboard_done", "1");
    } catch (e) {
      /* private mode */
    }
  }

  window.__geoHideOnboard = hideOnboard;

  var onboard = document.getElementById("dash-onboard");
  var onboardClose = document.getElementById("dash-onboard-close");
  var onboardDismiss = document.getElementById("dash-onboard-dismiss");
  var onboardPanel = onboard && onboard.querySelector(".dash-onboard");

  if (onboard) {
    try {
      if (localStorage.getItem("geo_dash_onboard_done") === "1") {
        hideOnboard();
      }
    } catch (e) {
      /* private mode */
    }

    if (onboardClose) {
      onboardClose.addEventListener("click", function (e) {
        e.preventDefault();
        hideOnboard();
      });
    }

    if (onboardDismiss) {
      onboardDismiss.addEventListener("click", function (e) {
        e.preventDefault();
        hideOnboard();
      });
    }

    onboard.addEventListener("click", function (e) {
      if (e.target === onboard) hideOnboard();
    });

    if (onboardPanel) {
      onboardPanel.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }
  }

  setMarket("all");
  setPeriod("week");
})();
