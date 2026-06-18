/** Trinity GEO · 页面审计（列表筛选 + 明细切换） */
(function () {
  var AUDIT_PAGES = {
    "audit-doc-intro": {
      url: "https://doc.trinitydesk.ai/docs/introduction",
      score: 38,
      lamp: "bad",
      scanned: "6/14 22:30",
      summary:
        "首屏核心定义依赖客户端渲染；正文缺少可独立引用的「事实块」；无 Article / TechArticle JSON-LD。与 Q00 信源盘「我方域 0 命中」一致。",
      optimize: "./optimize-detail.html",
      diag: "./diagnosis.html#diag-q00",
      factors: [
        { name: "证据密度", score: "22", level: "fail", note: "首 200 字无品类定义；缺量化事实" },
        { name: "可抓取性", score: "35", level: "fail", note: "无 JS 时正文为空壳；meta 过短" },
        { name: "Schema.org", score: "0", level: "warn", note: "未检测到 JSON-LD" },
        { name: "结构语义", score: "55", level: "warn", note: "H2 层级跳跃" },
        { name: "时效信号", score: "72", level: "ok", note: "页脚有更新日期" },
      ],
      recs: [
        { pri: "P0", text: "首段增加 3 条可引用事实句", link: "./optimize-detail.html" },
        { pri: "P0", text: "SSR / 预渲染核心正文" },
        { pri: "P1", text: "添加 TechArticle JSON-LD" },
      ],
    },
    "audit-developers": {
      url: "https://doc.trinitydesk.ai/docs/developers",
      score: 44,
      lamp: "bad",
      scanned: "6/14 22:28",
      summary: "开发者入口页以导航卡片为主，缺少独立定义段落；内链多但外链引用块不足。",
      optimize: "./optimize-detail.html",
      diag: "./diagnosis.html#diag-q00",
      factors: [
        { name: "证据密度", score: "30", level: "fail", note: "无 standalone 定义句" },
        { name: "可抓取性", score: "48", level: "warn", note: "部分区块 CSR" },
        { name: "Schema.org", score: "10", level: "warn", note: "仅 WebSite" },
        { name: "结构语义", score: "58", level: "warn", note: "卡片列表非语义列表" },
        { name: "时效信号", score: "65", level: "ok", note: "无版本号" },
      ],
      recs: [
        { pri: "P0", text: "增加「什么是 Trinity API 网关」事实块" },
        { pri: "P1", text: "对标 OpenRouter Getting Started IA" },
      ],
    },
    "audit-quickstart": {
      url: "https://doc.trinitydesk.ai/docs/quickstart",
      score: 52,
      lamp: "mid",
      scanned: "6/14 22:25",
      summary: "步骤清晰但代码块多、 prose 少；缺少计费与模型列表等可引用事实。",
      optimize: "./optimize-detail.html",
      diag: "./diagnosis.html",
      factors: [
        { name: "证据密度", score: "48", level: "warn", note: "步骤为主，事实句偏少" },
        { name: "可抓取性", score: "62", level: "warn", note: "正文 SSR 尚可" },
        { name: "Schema.org", score: "20", level: "warn", note: "无 HowTo" },
        { name: "结构语义", score: "70", level: "ok", note: "标题层级正常" },
        { name: "时效信号", score: "60", level: "ok", note: "—" },
      ],
      recs: [{ pri: "P1", text: "文末增加 FAQ + 量化能力表" }],
    },
    "audit-product": {
      url: "https://trinitydesk.ai/product",
      score: 58,
      lamp: "mid",
      scanned: "6/13 18:00",
      summary: "营销话术多、可引用事实少；对比表为图片非文本。",
      optimize: "./optimize.html",
      diag: "./diagnosis.html",
      factors: [
        { name: "证据密度", score: "45", level: "warn", note: "缺模型数、计费口径" },
        { name: "可抓取性", score: "72", level: "ok", note: "静态 HTML 可读" },
        { name: "Schema.org", score: "30", level: "warn", note: "无 Product" },
        { name: "结构语义", score: "68", level: "ok", note: "—" },
        { name: "时效信号", score: "55", level: "warn", note: "无更新日期" },
      ],
      recs: [{ pri: "P1", text: "增加文本对比表与定价锚点" }],
    },
    "audit-about": {
      url: "https://trinitydesk.ai/about",
      score: 61,
      lamp: "mid",
      scanned: "6/13 18:00",
      summary: "品牌叙事完整，但缺少第三方可核验数据点。",
      optimize: "./optimize.html",
      diag: "./diagnosis.html",
      factors: [
        { name: "证据密度", score: "55", level: "warn", note: "叙事多、事实少" },
        { name: "可抓取性", score: "78", level: "ok", note: "—" },
        { name: "Schema.org", score: "40", level: "warn", note: "无 Organization" },
        { name: "结构语义", score: "72", level: "ok", note: "—" },
        { name: "时效信号", score: "50", level: "warn", note: "—" },
      ],
      recs: [{ pri: "P2", text: "补充 Organization JSON-LD" }],
    },
    "audit-api-ref": {
      url: "https://doc.trinitydesk.ai/docs/api-reference",
      score: 55,
      lamp: "mid",
      scanned: "6/14 22:20",
      summary: "API 列表完整但参数说明偏简；缺少总览性定义段。",
      optimize: "./optimize-detail.html",
      diag: "./diagnosis.html",
      factors: [
        { name: "证据密度", score: "50", level: "warn", note: "缺端点总览事实块" },
        { name: "可抓取性", score: "58", level: "warn", note: "Tab 切换藏内容" },
        { name: "Schema.org", score: "15", level: "warn", note: "—" },
        { name: "结构语义", score: "62", level: "warn", note: "—" },
        { name: "时效信号", score: "70", level: "ok", note: "—" },
      ],
      recs: [{ pri: "P1", text: "增加 OpenAPI 摘要段落在首屏" }],
    },
    "audit-changelog": {
      url: "https://trinitydesk.ai/blog/changelog",
      score: 71,
      lamp: "ok",
      scanned: "6/12 10:00",
      summary: "时效信号强；条目短、适合引用版本事实。",
      optimize: "./optimize.html",
      diag: "./diagnosis.html",
      factors: [
        { name: "证据密度", score: "68", level: "ok", note: "版本事实清晰" },
        { name: "可抓取性", score: "80", level: "ok", note: "—" },
        { name: "Schema.org", score: "55", level: "warn", note: "无 BlogPosting" },
        { name: "结构语义", score: "75", level: "ok", note: "—" },
        { name: "时效信号", score: "88", level: "ok", note: "更新频繁" },
      ],
      recs: [{ pri: "P2", text: "保持 changelog 与 docs 交叉链" }],
    },
    "audit-pricing": {
      url: "https://trinitydesk.ai/pricing",
      score: 74,
      lamp: "ok",
      scanned: "6/13 18:00",
      summary: "价格表文本化良好；可补充模型单价示例句。",
      optimize: "./optimize.html",
      diag: "./diagnosis.html",
      factors: [
        { name: "证据密度", score: "72", level: "ok", note: "价格数字可引用" },
        { name: "可抓取性", score: "82", level: "ok", note: "—" },
        { name: "Schema.org", score: "45", level: "warn", note: "无 Offer" },
        { name: "结构语义", score: "78", level: "ok", note: "表格语义正确" },
        { name: "时效信号", score: "70", level: "ok", note: "—" },
      ],
      recs: [{ pri: "P2", text: "增加 FAQ 定价说明块" }],
    },
  };

  var filterLamp = "all";
  var filterQuery = "";
  var toast = document.getElementById("geo-toast");
  var searchInput = document.getElementById("audit-search");
  var resultCountEl = document.getElementById("audit-result-count");
  var emptyEl = document.getElementById("audit-empty");
  var listMetaEl = document.getElementById("audit-list-meta");
  var scanForm = document.getElementById("audit-scan-form");
  var urlInput = document.getElementById("audit-url-input");

  function rows() {
    return Array.prototype.slice.call(document.querySelectorAll(".geo-audit-row"));
  }

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

  function renderDetail(id) {
    var data = AUDIT_PAGES[id];
    if (!data) return;

    var urlLink = document.getElementById("audit-detail-url-link");
    var scanned = document.getElementById("audit-detail-scanned");
    var ring = document.getElementById("audit-detail-ring");
    var scoreEl = document.getElementById("audit-detail-score");
    var summary = document.getElementById("audit-detail-summary");
    var factorsBody = document.getElementById("audit-detail-factors");
    var recsEl = document.getElementById("audit-detail-recs");
    var optLink = document.getElementById("audit-detail-optimize");
    var diagLink = document.getElementById("audit-detail-diag");

    if (urlLink) {
      urlLink.href = data.url;
      urlLink.textContent = data.url.replace(/^https?:\/\//, "");
    }
    if (scanned) scanned.textContent = "· 上次 " + data.scanned;
    if (scoreEl) scoreEl.textContent = String(data.score);
    if (ring) {
      ring.className = "geo-audit-score-ring " + data.lamp;
    }
    if (summary) summary.textContent = data.summary;
    if (optLink) optLink.href = data.optimize;
    if (diagLink) diagLink.href = data.diag;

    if (factorsBody) {
      factorsBody.innerHTML = data.factors
        .map(function (f) {
          return (
            '<tr class="geo-audit-factor-' +
            f.level +
            '"><td><strong>' +
            f.name +
            '</strong></td><td class="num">' +
            f.score +
            '</td><td class="geo-muted">' +
            f.note +
            "</td></tr>"
          );
        })
        .join("");
    }

    if (recsEl) {
      recsEl.innerHTML = data.recs
        .map(function (r) {
          var link = r.link ? ' <a href="' + r.link + '">→</a>' : "";
          return "<li><strong>" + r.pri + "</strong> " + r.text + link + "</li>";
        })
        .join("");
    }
  }

  function selectRow(row) {
    rows().forEach(function (r) {
      r.classList.toggle("is-selected", r === row);
    });
    var id = row.getAttribute("data-audit-id");
    if (id) renderDetail(id);
  }

  function applyFilters() {
    var q = filterQuery.trim().toLowerCase();
    var visible = 0;
    rows().forEach(function (row) {
      var lamp = row.getAttribute("data-audit-lamp") || "";
      var search = (row.getAttribute("data-search") || "").toLowerCase();
      var matchLamp = filterLamp === "all" || filterLamp === lamp;
      var matchQuery = !q || search.indexOf(q) !== -1;
      var show = matchLamp && matchQuery;
      row.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });
    if (resultCountEl) resultCountEl.textContent = "显示 " + visible + " 条";
    if (emptyEl) emptyEl.hidden = visible > 0;
    if (listMetaEl) {
      var filtered = filterLamp !== "all" || q;
      listMetaEl.textContent = filtered ? visible + " 页匹配" : rows().length + " 页";
    }
  }

  function setLampFilter(lamp) {
    filterLamp = lamp;
    document.querySelectorAll("[data-audit-lamp]").forEach(function (btn) {
      if (!btn.closest(".geo-audit-lamp-filters")) return;
      var on = btn.getAttribute("data-audit-lamp") === lamp;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    applyFilters();
  }

  rows().forEach(function (row) {
    row.addEventListener("click", function () {
      selectRow(row);
    });
  });

  document.querySelectorAll(".geo-audit-lamp-filters [data-audit-lamp]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLampFilter(btn.getAttribute("data-audit-lamp") || "all");
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterQuery = searchInput.value;
      applyFilters();
    });
  }

  if (scanForm) {
    scanForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("审计已排队（Mock）· " + (urlInput ? urlInput.value : ""));
    });
  }

  var initial = document.querySelector(".geo-audit-row.is-selected");
  if (initial) renderDetail(initial.getAttribute("data-audit-id") || "audit-doc-intro");
  applyFilters();
})();
