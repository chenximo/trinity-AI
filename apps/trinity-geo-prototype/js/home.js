/** Trinity GEO 首页 — 轻交互 */
(function () {
  var header = document.querySelector(".geo-header");
  if (header) {
    window.addEventListener(
      "scroll",
      function () {
        header.style.boxShadow = window.scrollY > 8 ? "0 4px 24px rgba(15,23,42,0.06)" : "none";
      },
      { passive: true }
    );
  }

  var tabs = document.querySelectorAll(".geo-dashboard-tabs span");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("on");
      });
      tab.classList.add("on");
    });
  });

  var navLinks = document.querySelectorAll(".geo-nav a");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.forEach(function (l) {
        l.classList.remove("is-active");
      });
      link.classList.add("is-active");
    });
  });
})();
