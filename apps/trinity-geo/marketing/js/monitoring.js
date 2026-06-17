/** Trinity GEO · 监测概览 */
(function () {
  var market = "all";
  var cards = document.querySelectorAll("#mon-platform-grid [data-market]");
  var btns = document.querySelectorAll("[data-mon-market]");
  var refreshBtn = document.getElementById("mon-refresh-btn");
  var toast = document.getElementById("geo-toast");

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

  btns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      market = btn.getAttribute("data-mon-market") || "all";
      btns.forEach(function (b) {
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
