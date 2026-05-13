/**
 * OpenRouter-style chat page: sidebar drawer, model picker, settings modal.
 */
(function () {
  "use strict";

  var MODELS = [
    {
      id: "r3",
      group: "置顶",
      name: "Recraft V3",
      shortName: "Recraft V3",
      provider: "R",
      brand: "recraft",
      desc:
        "Recraft V3 是来自 Recraft 的图像生成模型，支持文本与图像输入，约 1K 分辨率、多种画幅比输出。",
      weekly: "51K",
      context: "65,536",
      input: "$0 / 百万 tokens",
      output: "$0 / 百万 tokens",
      available: true,
      free: true,
      supportsInput: true,
      supportsOutput: true,
    },
    {
      id: "r4p",
      group: "置顶",
      name: "Recraft V4 Pro",
      shortName: "V4 Pro",
      provider: "R",
      brand: "recraft",
      desc: "Recraft V4 Pro：更高保真与更好构图的图像生成。",
      weekly: "12K",
      context: "128,000",
      input: "$2 / 百万 tokens",
      output: "$8 / 百万 tokens",
      available: true,
      free: false,
      supportsInput: true,
      supportsOutput: true,
    },
    {
      id: "r4",
      group: "2026 年 5 月",
      name: "Recraft V4",
      shortName: "Recraft V4",
      provider: "R",
      brand: "recraft",
      desc: "Recraft V4 图像模型。",
      weekly: "8K",
      context: "65,536",
      input: "$1 / 百万 tokens",
      output: "$4 / 百万 tokens",
      available: true,
      free: false,
      supportsInput: true,
      supportsOutput: false,
    },
    {
      id: "g31",
      group: "2026 年 5 月",
      name: "Gemini 3.1 Flash Lite",
      shortName: "Gemini Flash",
      provider: "G",
      brand: "google",
      desc: "快速多模态模型。",
      weekly: "420K",
      context: "1,000,000",
      input: "$0.10 / 百万 tokens",
      output: "$0.40 / 百万 tokens",
      available: true,
      free: false,
      supportsInput: true,
      supportsOutput: true,
    },
    {
      id: "cob",
      group: "2026 年 5 月",
      name: "CoBuddy（免费）",
      shortName: "CoBuddy",
      provider: "C",
      brand: "anthropic",
      desc: "轻量助手模型。",
      weekly: "∞",
      context: "8,192",
      input: "$0 / 百万 tokens",
      output: "$0 / 百万 tokens",
      available: true,
      free: true,
      supportsInput: true,
      supportsOutput: true,
    },
    {
      id: "gpt",
      group: "2026 年 5 月",
      name: "GPT Chat Latest",
      shortName: "GPT Latest",
      provider: "O",
      brand: "openai",
      desc: "最新 GPT 类对话模型演示占位。",
      weekly: "210K",
      context: "128,000",
      input: "$2.5 / 百万 tokens",
      output: "$10 / 百万 tokens",
      available: false,
      free: false,
      supportsInput: true,
      supportsOutput: true,
    },
  ];

  /** 侧栏与「添加模型」弹层共用：搜索文案 + 筛选 */
  var modelListFilterState = {
    text: "",
    input: false,
    output: false,
    free: false,
    hideUnavailable: true,
  };

  var FAV_STORAGE_KEY = "trinity_orc_fav_models";
  var favoriteModelIds = [];

  function loadFavoriteModelIds() {
    favoriteModelIds = [];
    try {
      var raw = localStorage.getItem(FAV_STORAGE_KEY);
      if (!raw) return;
      var arr = JSON.parse(raw);
      if (Array.isArray(arr)) favoriteModelIds = arr.filter(function (id) {
        return typeof id === "string" && getModel(id);
      });
    } catch (e) {}
  }

  function saveFavoriteModelIds() {
    try {
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favoriteModelIds));
    } catch (e) {}
  }

  function isFavoriteModel(id) {
    return favoriteModelIds.indexOf(id) !== -1;
  }

  function toggleFavoriteModel(id) {
    if (!id || !getModel(id)) return;
    hideSideModelTip();
    var i = favoriteModelIds.indexOf(id);
    if (i === -1) favoriteModelIds.push(id);
    else favoriteModelIds.splice(i, 1);
    saveFavoriteModelIds();
  }

  function onModelSearchInput(ev) {
    modelListFilterState.text = ev.target.value || "";
    var a = $("#orc-side-model-search");
    var b = $("#orc-picker-search");
    if (a && a !== ev.target) a.value = modelListFilterState.text;
    if (b && b !== ev.target) b.value = modelListFilterState.text;
    renderSideModelList();
    renderPickerList();
  }

  function getBrowseFilteredModels() {
    var ft = (modelListFilterState.text || "").toLowerCase().trim();
    return MODELS.filter(function (m) {
      if (ft && m.name.toLowerCase().indexOf(ft) === -1 && String(m.id).toLowerCase().indexOf(ft) === -1) return false;
      if (modelListFilterState.hideUnavailable && m.available === false) return false;
      if (modelListFilterState.free && !m.free) return false;
      if (modelListFilterState.input && !m.supportsInput) return false;
      if (modelListFilterState.output && !m.supportsOutput) return false;
      return true;
    });
  }

  function groupModelsForList(filteredModels) {
    var seen = {};
    var favList = [];
    favoriteModelIds.forEach(function (fid) {
      for (var i = 0; i < filteredModels.length; i++) {
        if (filteredModels[i].id === fid && !seen[fid]) {
          favList.push(filteredModels[i]);
          seen[fid] = true;
          break;
        }
      }
    });
    var rest = filteredModels.filter(function (m) {
      return !seen[m.id];
    });
    var byGroup = {};
    rest.forEach(function (m) {
      if (!byGroup[m.group]) byGroup[m.group] = [];
      byGroup[m.group].push(m);
    });
    var sections = [];
    if (favList.length) sections.push({ key: "收藏", models: favList });
    var order = ["置顶", "2026 年 5 月"];
    order.forEach(function (g) {
      if (byGroup[g] && byGroup[g].length) sections.push({ key: g, models: byGroup[g] });
    });
    Object.keys(byGroup).forEach(function (g) {
      if (order.indexOf(g) === -1 && byGroup[g].length) sections.push({ key: g, models: byGroup[g] });
    });
    return sections;
  }

  function syncFilterChipsFromState() {
    $all(".orc-filter-chip[data-filter]").forEach(function (chip) {
      var df = chip.getAttribute("data-filter");
      if (df === "input") {
        chip.classList.toggle("is-active", modelListFilterState.input);
      } else if (df === "output") {
        chip.classList.toggle("is-active", modelListFilterState.output);
      } else if (df === "free") {
        chip.classList.toggle("is-active", modelListFilterState.free);
      }
    });
  }

  function clearModelListFilters() {
    modelListFilterState.text = "";
    modelListFilterState.input = false;
    modelListFilterState.output = false;
    modelListFilterState.free = false;
    modelListFilterState.hideUnavailable = true;
    var sideS = $("#orc-side-model-search");
    var pickS = $("#orc-picker-search");
    if (sideS) sideS.value = "";
    if (pickS) pickS.value = "";
    syncFilterChipsFromState();
    renderPickerList();
    renderSideModelList();
  }

  function onFilterChipClicked(chip) {
    var df = chip.getAttribute("data-filter");
    if (df === "input") modelListFilterState.input = !modelListFilterState.input;
    else if (df === "output") modelListFilterState.output = !modelListFilterState.output;
    else if (df === "free") modelListFilterState.free = !modelListFilterState.free;
    syncFilterChipsFromState();
    renderPickerList();
    renderSideModelList();
  }

  var sideModelTipShowTimer = null;
  var sideModelTipHideTimer = null;
  var sideModelTipHoverId = null;

  function hideSideModelTip() {
    var tip = $("#orc-side-model-tip");
    if (sideModelTipShowTimer) {
      clearTimeout(sideModelTipShowTimer);
      sideModelTipShowTimer = null;
    }
    if (sideModelTipHideTimer) {
      clearTimeout(sideModelTipHideTimer);
      sideModelTipHideTimer = null;
    }
    if (tip) tip.hidden = true;
    sideModelTipHoverId = null;
  }

  function positionSideModelTip(anchorEl) {
    var tip = $("#orc-side-model-tip");
    if (!tip || !anchorEl || tip.hidden) return;
    var r = anchorEl.getBoundingClientRect();
    var tw = tip.offsetWidth || 280;
    var th = tip.offsetHeight || 220;
    var gap = 8;
    var left = r.right + gap;
    if (left + tw > window.innerWidth - gap) left = Math.max(gap, r.left - tw - gap);
    var top = r.top;
    if (top + th > window.innerHeight - gap) top = Math.max(gap, window.innerHeight - th - gap);
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function fillSideModelTip(m) {
    var tip = $("#orc-side-model-tip");
    if (!tip || !m) return;
    tip.innerHTML =
      '<div class="orc-side-tip-head">' +
      providerIconMarkup(m) +
      '<strong class="orc-side-tip-title">' +
      escapeHtml(m.name) +
      "</strong></div>" +
      '<p class="orc-side-tip-desc">' +
      escapeHtml(m.desc) +
      "</p>" +
      '<dl class="orc-side-tip-dl">' +
      '<div><dt>周 Token</dt><dd>' +
      escapeHtml(m.weekly) +
      "</dd></div>" +
      '<div><dt>上下文</dt><dd>' +
      escapeHtml(m.context) +
      "</dd></div>" +
      '<div><dt>输入</dt><dd>' +
      escapeHtml(m.input) +
      "</dd></div>" +
      '<div><dt>输出</dt><dd>' +
      escapeHtml(m.output) +
      "</dd></div>" +
      '<div><dt>可用性</dt><dd>' +
      (m.available === false ? "暂不可用" : "正常") +
      "</dd></div></dl>";
  }

  function scheduleShowSideModelTip(modelId, anchorEl) {
    if (sideModelTipHideTimer) {
      clearTimeout(sideModelTipHideTimer);
      sideModelTipHideTimer = null;
    }
    if (sideModelTipShowTimer) clearTimeout(sideModelTipShowTimer);
    sideModelTipShowTimer = setTimeout(function () {
      sideModelTipShowTimer = null;
      var m = getModel(modelId);
      var tip = $("#orc-side-model-tip");
      if (!tip || !anchorEl) return;
      fillSideModelTip(m);
      tip.hidden = false;
      sideModelTipHoverId = modelId;
      window.requestAnimationFrame(function () {
        positionSideModelTip(anchorEl);
      });
    }, 70);
  }

  function scheduleHideSideModelTip() {
    if (sideModelTipShowTimer) {
      clearTimeout(sideModelTipShowTimer);
      sideModelTipShowTimer = null;
    }
    if (sideModelTipHideTimer) clearTimeout(sideModelTipHideTimer);
    sideModelTipHideTimer = setTimeout(function () {
      sideModelTipHideTimer = null;
      var tip = $("#orc-side-model-tip");
      if (tip) tip.hidden = true;
      sideModelTipHoverId = null;
    }, 160);
  }

  function bindSideModelRowHover(listRoot) {
    if (!listRoot) return;
    listRoot.querySelectorAll(".orc-model-row[data-model-id]").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        scheduleShowSideModelTip(row.getAttribute("data-model-id"), row);
      });
      row.addEventListener("mouseleave", function () {
        scheduleHideSideModelTip();
      });
      row.addEventListener("focusin", function () {
        scheduleShowSideModelTip(row.getAttribute("data-model-id"), row);
      });
      row.addEventListener("focusout", function () {
        scheduleHideSideModelTip();
      });
    });
  }

  /** 首页分类卡片 → 侧栏展示的模型子集(静态配置）。 */
  var MODEL_COLLECTIONS = {
    flagship: {
      title: "综合旗舰",
      ids: ["g31", "gpt", "cob", "r4p"],
    },
    creative: {
      title: "人设与创意",
      ids: ["cob", "g31", "r3"],
    },
    code: {
      title: "编程与代码",
      ids: ["gpt", "g31", "cob"],
    },
    reasoning: {
      title: "复杂推理",
      ids: ["gpt", "g31", "r4p"],
    },
  };

  var activeCollectionKey = null;
  var collectionMemberIds = [];
  /** 集合对比：参与发送对比的模型 id（默认与集合一致、可点行取消/再选，「+ 选择」可追加） */
  var selectedCompareIds = [];
  var defaultCompareStripHtml = null;
  /** 助手消息「Compare to」浮层中勾选的模型 id */
  var compareToDraftIds = [];
  /** 模型弹层：多选 id（顺序即右侧集合顺序）；pickerPreviewId 为下方参数预览 */
  var pickerMultiSelectedIds = [];
  var pickerPreviewId = null;
  /** Compare to 入口打开选择器时，完成/取消后用于恢复触发条状态并可选展开侧栏 */
  var pickerOpenedFromCompareTo = false;
  /** 当前打开的说明气泡所锚定的按钮（用于 resize 重定位） */
  var orcHelpTipAnchor = null;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getModel(id) {
    for (var i = 0; i < MODELS.length; i++) {
      if (MODELS[i].id === id) return MODELS[i];
    }
    return MODELS[0];
  }

  var currentModelId = "r3";

  function showSideTab(which) {
    var tabM = $("#orc-tab-models");
    var tabR = $("#orc-tab-rooms");
    var panelM = $("#orc-panel-models");
    var panelR = $("#orc-panel-rooms");
    if (!tabM || !tabR || !panelM || !panelR) return;
    var isModels = which === "models";
    tabM.classList.toggle("is-active", isModels);
    tabR.classList.toggle("is-active", !isModels);
    tabM.setAttribute("aria-selected", isModels ? "true" : "false");
    tabR.setAttribute("aria-selected", isModels ? "false" : "true");
    panelM.hidden = !isModels;
    panelR.hidden = isModels;
    if (isModels) closeRoomMenu();
  }

  function clearModelCollection() {
    activeCollectionKey = null;
    collectionMemberIds = [];
    selectedCompareIds = [];
    renderSideModelList();
    syncCompareBarLabel();
  }

  function applyModelCollection(key) {
    var def = MODEL_COLLECTIONS[key];
    if (!def || !def.ids || !def.ids.length) return;
    activeCollectionKey = key;
    collectionMemberIds = def.ids.slice();
    selectedCompareIds = def.ids.slice();
    var titleEl = $("#orc-model-collection-title");
    if (titleEl) titleEl.textContent = def.title;
    setActiveModel(selectedCompareIds[0]);
    renderSideModelList();
    syncCompareBarLabel();
  }

  /**
   * 进入「模型集合 / 多选对比」：与首页能力卡片一致；小屏展开侧栏抽屉。
   * @param {string} [key] MODEL_COLLECTIONS 的键，缺省为 flagship
   */
  function enterCompareModeWithKey(key) {
    var k = key;
    if (!k || !MODEL_COLLECTIONS[k]) k = "flagship";
    if (!MODEL_COLLECTIONS[k]) return;
    applyModelCollection(k);
    showSideTab("models");
    var appEl = $("#orc-app");
    if (appEl && window.matchMedia && window.matchMedia("(max-width: 899px)").matches) {
      appEl.classList.add("orc-mobile-drawer-open");
    }
  }

  /** 从助手消息底部「Compare to」确认：写入侧栏多选集合（非能力卡片预设）。 */
  function applyMessageComparePick(ids) {
    var clean = [];
    var seen = {};
    var i;
    for (i = 0; i < (ids || []).length; i++) {
      var id = ids[i];
      if (!id || !getModel(id) || seen[id]) continue;
      seen[id] = true;
      clean.push(id);
    }
    if (!clean.length) return;
    activeCollectionKey = "message_compare";
    collectionMemberIds = clean.slice();
    selectedCompareIds = clean.slice();
    var titleEl = $("#orc-model-collection-title");
    if (titleEl) titleEl.textContent = "消息内对比";
    setActiveModel(selectedCompareIds[0]);
    renderSideModelList();
    syncCompareBarLabel();
  }

  function syncAssistModelPill() {
    var pill = $("#orc-assist-model-pill");
    if (pill) pill.textContent = "当前 · " + getModel(currentModelId).name;
  }

  function syncCompareBarLabel() {
    var barName = $("#orc-bar-model-name");
    if (barName) {
      if (activeCollectionKey && selectedCompareIds.length > 1) {
        barName.textContent = "对比 · " + selectedCompareIds.length + " 个模型";
      } else {
        barName.textContent = getModel(currentModelId).name;
      }
    }
  }

  function restoreDefaultCompareUI() {
    var title = $("#orc-compare-title");
    var sub = $("#orc-compare-sub");
    var strip = document.querySelector(".orc-compare-ok-strip");
    if (title) title.textContent = "多模型对比";
    if (sub) {
      sub.textContent =
        "失败合并为左栏紧凑列表；成功回答占右栏主区域并可纵向滚动。多成功模型时右栏内可横向滑动。";
    }
    if (strip && defaultCompareStripHtml) strip.innerHTML = defaultCompareStripHtml;
  }

  function updateCompareUIFromSelection(userPrompt) {
    var title = $("#orc-compare-title");
    var sub = $("#orc-compare-sub");
    var strip = document.querySelector(".orc-compare-ok-strip");
    if (!strip) return;
    var t = (userPrompt || "").trim();
    var names = selectedCompareIds.map(function (id) {
      return getModel(id).name;
    });
    if (title) title.textContent = "多模型对比（" + selectedCompareIds.length + "）";
    if (sub) {
      sub.textContent =
        "您的问题：" +
        (t ? "「" + (t.length > 56 ? t.slice(0, 56) + "…" : t) + "」" : "（空）") +
        "。参与对比：" +
        names.join("、") +
        "(静态应答，未接真实 API）。";
    }
    var demoBody =
      "<p><strong>1. 核心结论</strong>：以下为占位文案。今日西安天气请以气象局或天气 App 为准；春秋短、冬夏长，注意昼夜温差与雨雪预警。</p>" +
      "<p><strong>2. 出行</strong>：关注道路湿滑与大风沙尘；洋葱式穿衣便于调节。</p>";
    strip.innerHTML = selectedCompareIds
      .map(function (id, i) {
        var m = getModel(id);
        var logo = escapeHtml(m.provider);
        var name = escapeHtml(m.name);
        var meta = "约 " + (0.26 + i * 0.04).toFixed(2) + "s";
        return (
          '<article class="orc-mcol orc-mcol--ok" role="listitem">' +
          '<header class="orc-mcol-head orc-mcol-head--ok"><div class="orc-mcol-head-top">' +
          '<span class="orc-mcol-logo orc-mcol-logo--ok" aria-hidden="true">' +
          logo +
          "</span>" +
          '<span class="orc-mcol-name">' +
          name +
          '</span><span class="orc-mcol-badge orc-mcol-badge--ok">对比</span></div>' +
          '<span class="orc-mcol-meta">' +
          escapeHtml(meta) +
          "</span></header>" +
          '<div class="orc-mcol-body orc-mcol-body--scroll">' +
          (t
            ? "<p><strong>用户问题</strong>：" + escapeHtml(t.length > 120 ? t.slice(0, 120) + "…" : t) + "</p>"
            : "") +
          demoBody +
          "</div></article>"
        );
      })
      .join("");
  }

  /** 与控制台示例数据一致，用于顶栏芯片悬停显示角色简介。 */
  var ORC_PRESET_INTRO = {
    preset_default_zh: "中文优先的技术文档与说明，Markdown 结构清晰。",
    preset_code_review: "只做 PR 问题清单与补丁建议，不写空话夸奖。",
    preset_cs_short: "一线客服场景：语气友好、回复短、步骤可执行。",
  };

  function applyPresetChipTooltips() {
    $all(".orc-preset-chip").forEach(function (chip) {
      var id = chip.getAttribute("data-orc-preset") || "";
      var intro = ORC_PRESET_INTRO[id];
      if (intro) {
        chip.removeAttribute("title");
        var name = (chip.getAttribute("data-orc-preset-name") || "").trim() || (chip.textContent || "").trim();
        chip.setAttribute("aria-label", name + "，角色简介：" + intro);
      }
    });
  }

  var ORC_PRESET_TIP_EL = null;
  var ORC_PRESET_TIP_SHOW_T = null;
  var ORC_PRESET_TIP_HIDE_T = null;

  function getPresetIntroTipEl() {
    if (!ORC_PRESET_TIP_EL) {
      ORC_PRESET_TIP_EL = document.createElement("div");
      ORC_PRESET_TIP_EL.id = "orc-preset-intro-tip";
      ORC_PRESET_TIP_EL.className = "orc-preset-intro-bubble";
      ORC_PRESET_TIP_EL.setAttribute("role", "tooltip");
      ORC_PRESET_TIP_EL.hidden = true;
      document.body.appendChild(ORC_PRESET_TIP_EL);
    }
    return ORC_PRESET_TIP_EL;
  }

  function hidePresetIntroTip() {
    if (ORC_PRESET_TIP_SHOW_T) {
      clearTimeout(ORC_PRESET_TIP_SHOW_T);
      ORC_PRESET_TIP_SHOW_T = null;
    }
    if (ORC_PRESET_TIP_HIDE_T) {
      clearTimeout(ORC_PRESET_TIP_HIDE_T);
      ORC_PRESET_TIP_HIDE_T = null;
    }
    var el = ORC_PRESET_TIP_EL || document.getElementById("orc-preset-intro-tip");
    if (el) {
      el.hidden = true;
      el.classList.remove("is-visible");
    }
  }

  function positionPresetIntroTip(chip) {
    var el = getPresetIntroTipEl();
    if (el.hidden) return;
    var r = chip.getBoundingClientRect();
    var pad = 10;
    el.style.visibility = "hidden";
    el.hidden = false;
    var tw = el.offsetWidth;
    var th = el.offsetHeight;
    var left = r.left + (r.width - tw) / 2;
    var top = r.bottom + 8;
    if (left < pad) left = pad;
    if (left + tw > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - tw - pad);
    if (top + th > window.innerHeight - pad) top = r.top - th - 8;
    if (top < pad) top = pad;
    el.style.left = Math.round(left) + "px";
    el.style.top = Math.round(top) + "px";
    el.style.visibility = "visible";
    el.classList.add("is-visible");
  }

  function showPresetIntroTipForChip(chip) {
    var id = chip.getAttribute("data-orc-preset") || "";
    var intro = ORC_PRESET_INTRO[id];
    if (!intro) return;
    var el = getPresetIntroTipEl();
    el.textContent = intro;
    el.hidden = false;
    requestAnimationFrame(function () {
      positionPresetIntroTip(chip);
    });
  }

  var ORC_PRESET_TIP_GLOBAL = false;
  function bindPresetIntroBubbleGlobals() {
    if (ORC_PRESET_TIP_GLOBAL) return;
    ORC_PRESET_TIP_GLOBAL = true;
    window.addEventListener(
      "scroll",
      function () {
        hidePresetIntroTip();
      },
      true
    );
    window.addEventListener("resize", hidePresetIntroTip);
  }

  function bindPresetIntroBubble() {
    bindPresetIntroBubbleGlobals();
    $all(".orc-preset-chip-wrap").forEach(function (wrap) {
      if (wrap.getAttribute("data-orc-intro-tip") === "1") return;
      var chip = wrap.querySelector(".orc-preset-chip");
      if (!chip) return;
      var id = chip.getAttribute("data-orc-preset") || "";
      if (!ORC_PRESET_INTRO[id]) return;
      wrap.setAttribute("data-orc-intro-tip", "1");
      wrap.addEventListener("mouseenter", function () {
        if (ORC_PRESET_TIP_HIDE_T) {
          clearTimeout(ORC_PRESET_TIP_HIDE_T);
          ORC_PRESET_TIP_HIDE_T = null;
        }
        ORC_PRESET_TIP_SHOW_T = setTimeout(function () {
          ORC_PRESET_TIP_SHOW_T = null;
          showPresetIntroTipForChip(chip);
        }, 160);
      });
      wrap.addEventListener("mouseleave", function () {
        if (ORC_PRESET_TIP_SHOW_T) {
          clearTimeout(ORC_PRESET_TIP_SHOW_T);
          ORC_PRESET_TIP_SHOW_T = null;
        }
        ORC_PRESET_TIP_HIDE_T = setTimeout(function () {
          ORC_PRESET_TIP_HIDE_T = null;
          hidePresetIntroTip();
        }, 100);
      });
    });
  }

  /** 角色（preset）：顶栏芯片 + 设置内下拉，同一值、不落库（与 console preset_id 对齐）。 */
  function setPresetValue(v) {
    var set = $("#orc-settings-preset");
    if (set) set.value = v;
    syncPresetChipsFromSelect();
  }

  function syncPresetChipsFromSelect() {
    var set = $("#orc-settings-preset");
    var v = set ? set.value : "";
    $all(".orc-preset-chip").forEach(function (chip) {
      chip.classList.toggle("is-active", (chip.getAttribute("data-orc-preset") || "") === v && v !== "");
    });
  }

  function closePresetMoreDetails() {
    var d = document.getElementById("orc-preset-more-dd");
    if (d) d.removeAttribute("open");
  }

  /** 「添加角色」弹窗：与顶栏三芯片同源（不接接口）。 */
  var MOCK_ADD_ROLE_CARDS = [
    {
      id: "preset_default_zh",
      title: "技术写作",
      desc: "中文技术文档、Release Note 与说明文；默认偏清晰结构与术语一致。",
      origin: "self",
      avatar: "技",
    },
    {
      id: "preset_code_review",
      title: "代码审查",
      desc: "Pull Request 风格审阅：风险点、测试建议与可合并性摘要（演示占位）。",
      origin: "self",
      avatar: "码",
    },
    {
      id: "preset_cs_short",
      title: "客服简短",
      desc: "短句、礼貌收尾；适合工单首响与常见问题模板（官方示例）。",
      origin: "official",
      avatar: "服",
    },
  ];

  /** 添加角色弹窗内草稿（与「完成」应用一致；取消 / 遮罩 / Esc 丢弃）。 */
  var rolePickerDraftPresetId = "";

  function closeRolePickerModal() {
    var o = $("#orc-role-picker-overlay");
    if (o) {
      o.hidden = true;
      o.setAttribute("aria-hidden", "true");
    }
    var pick = $("#orc-picker-overlay");
    if (!pick || pick.hidden) {
      document.body.classList.remove("or-modal-open");
    }
  }

  function renderRolePickerList() {
    var host = $("#orc-role-picker-list");
    if (!host) return;
    var cur = rolePickerDraftPresetId;
    host.innerHTML = MOCK_ADD_ROLE_CARDS.map(function (r) {
      var isSel = r.id === cur;
      var tagClass = r.origin === "official" ? "orc-role-card-tag orc-role-card-tag--official" : "orc-role-card-tag orc-role-card-tag--self";
      var tagText = r.origin === "official" ? "官方" : "自建";
      return (
        '<button type="button" class="orc-role-card' +
        (isSel ? " is-selected" : "") +
        '" data-orc-preset="' +
        escapeHtml(r.id) +
        '">' +
        '<span class="orc-role-card-avatar" aria-hidden="true">' +
        escapeHtml(r.avatar) +
        "</span>" +
        '<span class="orc-role-card-main">' +
        '<span class="orc-role-card-title">' +
        escapeHtml(r.title) +
        "</span>" +
        '<span class="orc-role-card-desc">' +
        escapeHtml(r.desc) +
        "</span>" +
        "</span>" +
        '<span class="' +
        tagClass +
        '">' +
        escapeHtml(tagText) +
        "</span>" +
        "</button>"
      );
    }).join("");
    Array.prototype.forEach.call(host.querySelectorAll(".orc-role-card"), function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        rolePickerDraftPresetId = btn.getAttribute("data-orc-preset") || "";
        renderRolePickerList();
      });
    });
  }

  function openRolePickerModal() {
    cancelPicker();
    closePresetMoreDetails();
    var o = $("#orc-role-picker-overlay");
    if (!o) return;
    var set = $("#orc-settings-preset");
    rolePickerDraftPresetId = set ? (set.value || "").trim() : "";
    o.hidden = false;
    o.setAttribute("aria-hidden", "false");
    document.body.classList.add("or-modal-open");
    renderRolePickerList();
    window.requestAnimationFrame(function () {
      var c = $("#orc-role-picker-close");
      if (c) {
        try {
          c.focus();
        } catch (e0) {}
      }
    });
  }

  function bindRolePickerModal() {
    var card = document.querySelector(".orc-role-picker-card");
    var closeBtn = $("#orc-role-picker-close");
    var cancelBtn = $("#orc-role-picker-cancel");
    var doneBtn = $("#orc-role-picker-done");
    var backdrop = $("#orc-role-picker-backdrop");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        closeRolePickerModal();
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function (e) {
        e.preventDefault();
        closeRolePickerModal();
      });
    }
    if (doneBtn) {
      doneBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setPresetValue(rolePickerDraftPresetId || "");
        closeRolePickerModal();
        closePresetMoreDetails();
      });
    }
    if (backdrop) {
      backdrop.addEventListener("click", function (e) {
        e.preventDefault();
        closeRolePickerModal();
      });
    }
    if (card) {
      card.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }
  }

  /** 从顶栏与设置下拉中移除该预设(前端，不落库）。 */
  function removePresetChipById(presetId) {
    if (!presetId) return;
    var set = $("#orc-settings-preset");
    if (set && set.value === presetId) {
      set.value = "";
    }
    if (set) {
      var opts = set.options;
      var i;
      for (i = 0; i < opts.length; i++) {
        if (opts[i].value === presetId) {
          opts[i].remove();
          break;
        }
      }
    }
    $all(".orc-preset-chip-wrap").forEach(function (wrap) {
      var chip = wrap.querySelector(".orc-preset-chip");
      if (chip && (chip.getAttribute("data-orc-preset") || "") === presetId) {
        wrap.remove();
      }
    });
    syncPresetChipsFromSelect();
  }

  function syncPickerSelectionFromApp() {
    if (activeCollectionKey && selectedCompareIds.length) {
      pickerMultiSelectedIds = selectedCompareIds.slice();
    } else {
      pickerMultiSelectedIds = [currentModelId];
    }
    pickerPreviewId = currentModelId;
  }

  function ensurePickerPreviewVisible(filteredModels) {
    var map = {};
    var i;
    for (i = 0; i < filteredModels.length; i++) map[filteredModels[i].id] = true;
    if (pickerPreviewId && map[pickerPreviewId]) return;
    for (i = 0; i < pickerMultiSelectedIds.length; i++) {
      if (map[pickerMultiSelectedIds[i]]) {
        pickerPreviewId = pickerMultiSelectedIds[i];
        return;
      }
    }
    if (filteredModels.length) pickerPreviewId = filteredModels[0].id;
    else if (pickerMultiSelectedIds.length) pickerPreviewId = pickerMultiSelectedIds[0];
  }

  function fillPickerDetailPanel(m) {
    if (!m) return;
    var title = $("#orc-detail-title");
    var desc = $("#orc-detail-desc");
    var logo = $("#orc-detail-logo");
    if (title) title.textContent = m.name;
    if (desc) desc.textContent = m.desc;
    if (logo) applyProviderLogoToElement(logo, m, true);
    var wk = $("#orc-st-weekly");
    var ctx = $("#orc-st-ctx");
    var inn = $("#orc-st-in");
    var out = $("#orc-st-out");
    if (wk) wk.textContent = m.weekly;
    if (ctx) ctx.textContent = m.context;
    if (inn) inn.textContent = m.input;
    if (out) out.textContent = m.output;
  }

  function applyPickerSelectionToApp() {
    var ids = pickerMultiSelectedIds.filter(function (id) {
      return !!getModel(id);
    });
    if (!ids.length) ids = [currentModelId];
    if (ids.length === 1) {
      clearModelCollection();
      setActiveModel(ids[0]);
    } else {
      applyMessageComparePick(ids);
    }
    renderSideModelList();
  }

  function renderPickerList() {
    var listEl = $("#orc-picker-list");
    if (!listEl) return;
    var filtered = getBrowseFilteredModels();
    var sections = groupModelsForList(filtered);
    var html = "";
    var inCol = activeCollectionKey && collectionMemberIds.length > 0;
    sections.forEach(function (sec) {
      html +=
        '<div class="orc-picker-group orc-side-model-group orc-side-model-group--collection">' +
        '<h4 class="orc-side-model-group-title">' +
        escapeHtml(sec.key) +
        "</h4>";
      sec.models.forEach(function (m) {
        var fav = isFavoriteModel(m.id);
        var inMem = inCol && collectionMemberIds.indexOf(m.id) !== -1;
        var picked = !inCol && pickerMultiSelectedIds.indexOf(m.id) !== -1;
        var isPreview = !inCol && pickerPreviewId === m.id;
        var isCur = m.id === currentModelId;
        var showMark = picked || (inCol && inMem);
        var rowClass =
          "orc-model-row orc-model-row--compare" +
          (isCur ? " is-active" : "") +
          (!inCol && picked ? " is-selected" : "") +
          (!inCol && isPreview ? " is-preview" : "") +
          (inCol && inMem && !isCur ? " is-in-collection" : "");
        var ariaPressed =
          inCol && inMem
            ? ' aria-pressed="true"'
            : inCol
              ? ' aria-pressed="false"'
              : ' aria-pressed="' + (picked ? "true" : "false") + '"';
        html +=
          '<button type="button" class="' +
          rowClass +
          '"' +
          ariaPressed +
          ' data-model-id="' +
          escapeHtml(m.id) +
          '">' +
          providerIconMarkup(m) +
          '<span class="orc-model-row-name">' +
          escapeHtml(m.name) +
          "</span>" +
          '<span class="orc-model-row-fav" title="' +
          (fav ? "取消收藏" : "加入收藏") +
          '" aria-hidden="true">' +
          (fav ? "★" : "☆") +
          "</span>" +
          '<span class="orc-model-row-mark" aria-hidden="true">' +
          (showMark ? "✓" : "") +
          "</span>" +
          "</button>";
      });
      html += "</div>";
    });
    listEl.innerHTML = html || '<p class="orc-picker-desc" style="padding:1rem">没有匹配的模型。</p>';
    ensurePickerPreviewVisible(filtered);
    bindPickerRows();
    fillPickerDetailPanel(getModel(pickerPreviewId || currentModelId));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initCompareToDraftFromState() {
    compareToDraftIds = [];
    if (activeCollectionKey && selectedCompareIds.length) {
      compareToDraftIds = selectedCompareIds.slice();
      return;
    }
    compareToDraftIds = [currentModelId];
  }

  function renderCompareToTriggerIcons() {
    var wrap = $("#orc-compare-to-icons");
    if (!wrap) return;
    var ids = compareToDraftIds.slice(0, 5);
    wrap.innerHTML = ids
      .map(function (id) {
        var m = getModel(id);
        return '<span class="orc-compare-to-icon-slot">' + providerIconMarkup(m) + "</span>";
      })
      .join("");
  }

  function closeCompareToPopover() {
    var tr = $("#orc-compare-to-trigger");
    if (tr) tr.setAttribute("aria-expanded", "false");
  }

  function bindCompareToPopoverUi() {
    var tr = $("#orc-compare-to-trigger");
    if (tr) {
      tr.addEventListener("click", function (e) {
        e.stopPropagation();
        var pv = $("#orc-picker-overlay");
        if (pv && !pv.hidden) return;
        openPickerFromCompareTo();
        tr.setAttribute("aria-expanded", "true");
      });
    }
  }

  /** 与「添加模型」弹层相同 UI；初始勾选与当前对比草稿 / 集合一致 */
  function openPickerFromCompareTo() {
    initCompareToDraftFromState();
    closeRolePickerModal();
    var ids = compareToDraftIds.filter(function (id) {
      return !!getModel(id);
    });
    if (!ids.length) ids = [currentModelId];
    pickerMultiSelectedIds = ids.slice();
    pickerPreviewId = currentModelId;
    if (pickerMultiSelectedIds.indexOf(pickerPreviewId) === -1) {
      pickerPreviewId = pickerMultiSelectedIds[0];
    }
    pickerOpenedFromCompareTo = true;
    hideSideModelTip();
    closeMemoryPopover();
    closeOrcHelpTip();
    closeRoomMenu();
    var o = $("#orc-picker-overlay");
    if (o) {
      o.hidden = false;
      o.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("or-modal-open");
    var pickS = $("#orc-picker-search");
    if (pickS) pickS.value = modelListFilterState.text;
    syncFilterChipsFromState();
    renderPickerList();
  }

  /** true = 已有会话内容：显示对话区并隐藏首页分类卡片与快捷提示；false = 新会话仅展示卡片区 */
  function setConversationActive(hasMessages) {
    var empty = $("#orc-empty");
    var thread = $("#orc-thread");
    var asst = $("#orc-msg-assistant");
    if (!empty || !thread) return;
    var on = !!hasMessages;
    thread.hidden = !on;
    empty.hidden = on;
    if (asst) asst.hidden = !on;
  }

  function brandProviderExtraClass(m) {
    if (!m) return " orc-pv--letter";
    var b = m.brand || "";
    if (b === "google") return " orc-pv--google";
    if (b === "openai") return " orc-pv--openai";
    if (b === "anthropic") return " orc-pv--anthropic";
    if (b === "xai") return " orc-pv--xai";
    if (b === "recraft") return " orc-pv--recraft";
    return " orc-pv--letter";
  }

  function providerIconMarkup(m) {
    var extra = brandProviderExtraClass(m);
    if (extra.indexOf("letter") !== -1) {
      return '<span class="orc-pv' + extra + '" aria-hidden="true">' + escapeHtml(m.provider || "?") + "</span>";
    }
    return '<span class="orc-pv' + extra + '" aria-hidden="true"></span>';
  }

  /** 详情面板顶栏：与列表同源，按模型 brand 切换圆标。 */
  function applyProviderLogoToElement(el, m, asDetail) {
    if (!el || !m) return;
    var extra = brandProviderExtraClass(m);
    el.className = "orc-pv" + extra + (asDetail ? " orc-detail-pv" : "");
    el.setAttribute("aria-hidden", "true");
    if (extra.indexOf("letter") !== -1) {
      el.textContent = m.provider || "?";
    } else {
      el.textContent = "";
    }
  }

  function syncSideModelRows() {
    $all(".orc-model-row").forEach(function (row) {
      var id = row.getAttribute("data-model-id");
      var on = id === currentModelId;
      row.classList.toggle("is-active", on);
      var mark = row.querySelector(".orc-model-row-mark");
      if (row.classList.contains("orc-model-row--compare")) {
        var inCompareSel = selectedCompareIds.indexOf(id) !== -1;
        if (inCompareSel) {
          if (!mark) {
            var spanC = document.createElement("span");
            spanC.className = "orc-model-row-mark";
            spanC.setAttribute("aria-hidden", "true");
            row.appendChild(spanC);
            mark = spanC;
          }
          mark.textContent = "✓";
        } else if (mark) {
          mark.remove();
        }
        return;
      }
      if (on) {
        if (!mark) {
          var span = document.createElement("span");
          span.className = "orc-model-row-mark";
          span.setAttribute("aria-hidden", "true");
          span.textContent = "✓";
          row.appendChild(span);
        }
      } else if (mark) {
        mark.remove();
      }
      if (on) row.setAttribute("aria-current", "true");
      else row.removeAttribute("aria-current");
    });
  }

  function renderSideModelList() {
    var el = $("#orc-model-list");
    if (!el) return;
    var block = $("#orc-model-collection-block");
    var toolbar = $("#orc-side-model-toolbar");
    var inCollection = activeCollectionKey && collectionMemberIds.length > 0;
    var modelsToRender = MODELS;

    if (inCollection) {
      if (block) block.hidden = false;
      if (toolbar) toolbar.classList.add("orc-side-model-toolbar--collection");
      var ft = (modelListFilterState.text || "").toLowerCase().trim();
      modelsToRender = collectionMemberIds
        .map(function (id) {
          return getModel(id);
        })
        .filter(Boolean)
        .filter(function (m) {
          if (!ft) return true;
          return m.name.toLowerCase().indexOf(ft) !== -1 || String(m.id).toLowerCase().indexOf(ft) !== -1;
        });
    } else {
      if (block) block.hidden = true;
      if (toolbar) toolbar.classList.remove("orc-side-model-toolbar--collection");
    }

    el.hidden = false;
    el.removeAttribute("aria-hidden");

    if (inCollection) {
      var rowsHtml = modelsToRender
        .map(function (m) {
          var sel = selectedCompareIds.indexOf(m.id) !== -1;
          var fav = isFavoriteModel(m.id);
          var isCur = m.id === currentModelId;
          return (
            '<button type="button" role="button" class="orc-model-row orc-model-row--compare' +
            (sel ? " is-selected" : "") +
            (isCur ? " is-active" : "") +
            '" data-model-id="' +
            escapeHtml(m.id) +
            '" aria-pressed="' +
            (sel ? "true" : "false") +
            '" aria-label="切换是否参与多模型对比：' +
            escapeHtml(m.name) +
            '">' +
            providerIconMarkup(m) +
            '<span class="orc-model-row-name">' +
            escapeHtml(m.name) +
            "</span>" +
            '<span class="orc-model-row-fav" title="' +
            (fav ? "取消收藏" : "加入收藏") +
            '" aria-hidden="true">' +
            (fav ? "★" : "☆") +
            "</span>" +
            (sel ? '<span class="orc-model-row-mark" aria-hidden="true">✓</span>' : "") +
            "</button>"
          );
        })
        .join("");
      el.innerHTML =
        '<div class="orc-side-model-group orc-side-model-group--collection" role="presentation">' + rowsHtml + "</div>";
      el.setAttribute("role", "group");
      el.setAttribute("aria-label", "对比模型（可多选）");
    } else {
      var filtered = getBrowseFilteredModels();
      var sections = groupModelsForList(filtered);
      var html = "";
      sections.forEach(function (sec) {
        html += '<div class="orc-side-model-group"><h4 class="orc-side-model-group-title">' + escapeHtml(sec.key) + "</h4>";
        sec.models.forEach(function (m) {
          var fav = isFavoriteModel(m.id);
          html +=
            '<button type="button" class="orc-model-row' +
            (m.id === currentModelId ? " is-active" : "") +
            '" data-model-id="' +
            escapeHtml(m.id) +
            '"' +
            (m.id === currentModelId ? ' aria-current="true"' : "") +
            ">" +
            providerIconMarkup(m) +
            '<span class="orc-model-row-name">' +
            escapeHtml(m.name) +
            "</span>" +
            '<span class="orc-model-row-fav" title="' +
            (fav ? "取消收藏" : "加入收藏") +
            '" aria-hidden="true">' +
            (fav ? "★" : "☆") +
            "</span>" +
            (m.id === currentModelId ? '<span class="orc-model-row-mark" aria-hidden="true">✓</span>' : "") +
            "</button>";
        });
        html += "</div>";
      });
      el.innerHTML = html || '<p class="orc-side-model-empty">没有匹配的模型。</p>';
      el.setAttribute("role", "region");
      el.setAttribute("aria-label", "添加模型（搜索、筛选、收藏）");
    }

    el.querySelectorAll(".orc-model-row").forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest(".orc-model-row-fav")) {
          e.preventDefault();
          e.stopPropagation();
          toggleFavoriteModel(row.getAttribute("data-model-id"));
          renderSideModelList();
          renderPickerList();
          return;
        }
        if (row.classList.contains("orc-model-row--compare")) {
          var id = row.getAttribute("data-model-id");
          var pos = selectedCompareIds.indexOf(id);
          if (pos !== -1) {
            if (selectedCompareIds.length <= 1) return;
            selectedCompareIds.splice(pos, 1);
          } else {
            selectedCompareIds.push(id);
          }
          if (selectedCompareIds.indexOf(currentModelId) === -1 && selectedCompareIds.length) {
            setActiveModel(selectedCompareIds[0]);
          }
          renderSideModelList();
          syncCompareBarLabel();
          return;
        }
        var pickId = row.getAttribute("data-model-id");
        var pv = $("#orc-picker-overlay");
        if (pv && !pv.hidden) {
          pickerMultiSelectedIds = [pickId];
          pickerPreviewId = pickId;
        }
        setActiveModel(pickId);
        closePicker();
      });
    });

    syncSideModelRows();
    bindSideModelRowHover(el);
  }

  function setActiveModel(id) {
    hideSideModelTip();
    currentModelId = id;
    var m = getModel(id);
    fillPickerDetailPanel(m);
    var modelSelect = $("#orc-settings-model");
    if (modelSelect) modelSelect.value = m.id;
    syncSideModelRows();
    syncCompareBarLabel();
    syncAssistModelPill();
  }

  function bindPickerRows() {
    var pickRoot = $("#orc-picker-list");
    if (!pickRoot) return;
    pickRoot.querySelectorAll(".orc-model-row--compare").forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest(".orc-model-row-fav")) {
          e.preventDefault();
          e.stopPropagation();
          toggleFavoriteModel(row.getAttribute("data-model-id"));
          renderPickerList();
          renderSideModelList();
          return;
        }
        var id = row.getAttribute("data-model-id");
        if (activeCollectionKey && collectionMemberIds.length) {
          if (collectionMemberIds.indexOf(id) === -1) {
            collectionMemberIds.push(id);
            if (selectedCompareIds.indexOf(id) === -1) selectedCompareIds.push(id);
            setActiveModel(id);
            renderSideModelList();
            renderPickerList();
          }
          pickerMultiSelectedIds = selectedCompareIds.slice();
          pickerPreviewId = currentModelId;
          closePicker();
          return;
        }
        var ix = pickerMultiSelectedIds.indexOf(id);
        if (ix === -1) {
          pickerMultiSelectedIds.push(id);
          pickerPreviewId = id;
        } else {
          if (pickerMultiSelectedIds.length <= 1) return;
          pickerMultiSelectedIds.splice(ix, 1);
          if (pickerPreviewId === id) pickerPreviewId = pickerMultiSelectedIds[0];
        }
        renderPickerList();
      });
    });
  }

  function openPicker() {
    pickerOpenedFromCompareTo = false;
    closeRolePickerModal();
    hideSideModelTip();
    closeMemoryPopover();
    closeOrcHelpTip();
    closeRoomMenu();
    var o = $("#orc-picker-overlay");
    if (o) {
      o.hidden = false;
      o.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("or-modal-open");
    var pickS = $("#orc-picker-search");
    if (pickS) pickS.value = modelListFilterState.text;
    syncFilterChipsFromState();
    syncPickerSelectionFromApp();
    renderPickerList();
    var trCt = $("#orc-compare-to-trigger");
    if (trCt) trCt.setAttribute("aria-expanded", "false");
  }

  /** 关闭弹层且不应用当前勾选（恢复为进入弹层前的选择） */
  function cancelPicker() {
    hideSideModelTip();
    closeOrcHelpTip();
    var o = $("#orc-picker-overlay");
    if (o && !o.hidden) {
      o.hidden = true;
      o.setAttribute("aria-hidden", "true");
      syncPickerSelectionFromApp();
    }
    document.body.classList.remove("or-modal-open");
    pickerOpenedFromCompareTo = false;
    var trCt = $("#orc-compare-to-trigger");
    if (trCt) trCt.setAttribute("aria-expanded", "false");
    closeRoomMenu();
  }

  function closePicker() {
    hideSideModelTip();
    closeOrcHelpTip();
    var o = $("#orc-picker-overlay");
    var fromCompare = pickerOpenedFromCompareTo;
    if (o && !o.hidden) applyPickerSelectionToApp();
    pickerOpenedFromCompareTo = false;
    if (o) {
      o.hidden = true;
      o.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("or-modal-open");
    closeRoomMenu();
    var trCt = $("#orc-compare-to-trigger");
    if (trCt) trCt.setAttribute("aria-expanded", "false");
    if (fromCompare) {
      initCompareToDraftFromState();
      renderCompareToTriggerIcons();
      showSideTab("models");
      var appEl = $("#orc-app");
      if (appEl && window.matchMedia && window.matchMedia("(max-width: 899px)").matches) {
        appEl.classList.add("orc-mobile-drawer-open");
      }
    }
  }

  function closeMemoryPopover() {
    var pop = $("#orc-memory-popover");
    var btn = $("#orc-btn-memory");
    if (pop) {
      pop.hidden = true;
      pop.style.left = "";
      pop.style.top = "";
    }
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function positionMemoryPopover() {
    var btn = $("#orc-btn-memory");
    var pop = $("#orc-memory-popover");
    if (!btn || !pop || pop.hidden) return;
    var r = btn.getBoundingClientRect();
    var w = pop.offsetWidth || 260;
    var h = pop.offsetHeight || 120;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    var topAbove = r.top - h - 8;
    var top = topAbove >= 8 ? topAbove : r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function openMemoryPopover() {
    closeNetToolsPopover();
    var pop = $("#orc-memory-popover");
    var btn = $("#orc-btn-memory");
    var range = $("#orc-memory-range");
    if (pop) pop.hidden = false;
    if (btn) btn.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(function () {
      positionMemoryPopover();
      if (range) {
        try {
          range.focus();
        } catch (e) {}
      }
    });
  }

  function toggleMemoryPopover() {
    var pop = $("#orc-memory-popover");
    if (!pop) return;
    if (pop.hidden) openMemoryPopover();
    else closeMemoryPopover();
  }

  function syncMemoryDisplay(n) {
    var s = String(n);
    var badge = $("#orc-memory-badge");
    var pv = $("#orc-memory-pop-val");
    var hn = $("#orc-memory-hint-n");
    if (badge) badge.textContent = s;
    if (pv) pv.textContent = s;
    if (hn) hn.textContent = s;
  }

  function bindMemoryPopover() {
    var wrap = document.querySelector(".orc-memory-wrap");
    var btn = $("#orc-btn-memory");
    var pop = $("#orc-memory-popover");
    var range = $("#orc-memory-range");
    if (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleMemoryPopover();
      });
    }
    if (range) {
      range.addEventListener("input", function () {
        syncMemoryDisplay(range.value);
        window.requestAnimationFrame(positionMemoryPopover);
      });
    }
    window.addEventListener("resize", function () {
      var p = $("#orc-memory-popover");
      if (p && !p.hidden) positionMemoryPopover();
    });
    document.addEventListener("mousedown", function (e) {
      if (!wrap || !pop || pop.hidden) return;
      if (!wrap.contains(e.target)) closeMemoryPopover();
    });
  }

  function closeNetToolsPopover() {
    var pop = $("#orc-net-tools-popover");
    var btn = $("#orc-btn-net-tools");
    if (pop) {
      pop.hidden = true;
      pop.style.left = "";
      pop.style.top = "";
    }
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function positionNetToolsPopover() {
    var btn = $("#orc-btn-net-tools");
    var pop = $("#orc-net-tools-popover");
    if (!btn || !pop || pop.hidden) return;
    var r = btn.getBoundingClientRect();
    var w = pop.offsetWidth || 300;
    var h = pop.offsetHeight || 220;
    var left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
    var topAbove = r.top - h - 8;
    var top = topAbove >= 8 ? topAbove : r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function openNetToolsPopover() {
    closeMemoryPopover();
    var pop = $("#orc-net-tools-popover");
    var btn = $("#orc-btn-net-tools");
    if (pop) pop.hidden = false;
    if (btn) btn.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(function () {
      positionNetToolsPopover();
    });
  }

  function toggleNetToolsPopover() {
    var pop = $("#orc-net-tools-popover");
    if (!pop) return;
    if (pop.hidden) openNetToolsPopover();
    else closeNetToolsPopover();
  }

  function syncNetToolsBadge() {
    var n = 0;
    $all(".orc-net-tools-popover .orc-net-switch-input").forEach(function (x) {
      if (x.checked) n++;
    });
    var b = $("#orc-net-tools-badge");
    if (b) b.textContent = String(n);
  }

  function bindNetToolsPopover() {
    var wrap = document.querySelector(".orc-net-tools-wrap");
    var btn = $("#orc-btn-net-tools");
    var pop = $("#orc-net-tools-popover");
    var docLink = $("#orc-net-tools-doc");
    if (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleNetToolsPopover();
      });
    }
    if (docLink) {
      docLink.addEventListener("click", function (e) {
        e.preventDefault();
      });
    }
    $all(".orc-net-tools-popover .orc-net-switch-input").forEach(function (inp) {
      inp.addEventListener("change", function () {
        syncNetToolsBadge();
        window.requestAnimationFrame(positionNetToolsPopover);
      });
    });
    window.addEventListener("resize", function () {
      var p = $("#orc-net-tools-popover");
      if (p && !p.hidden) positionNetToolsPopover();
    });
    document.addEventListener("mousedown", function (e) {
      if (!wrap || !pop || pop.hidden) return;
      if (!wrap.contains(e.target)) closeNetToolsPopover();
    });
    syncNetToolsBadge();
  }

  function closeOrcHelpTip() {
    var pop = $("#orc-help-tip-popover");
    if (pop) pop.hidden = true;
    $all(".orc-help-tip-btn[aria-expanded='true']").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
    orcHelpTipAnchor = null;
  }

  function positionOrcHelpTip() {
    var btn = orcHelpTipAnchor;
    var pop = $("#orc-help-tip-popover");
    if (!btn || !pop || pop.hidden) return;
    var r = btn.getBoundingClientRect();
    var w = Math.min(360, window.innerWidth - 16);
    pop.style.width = w + "px";
    var ph = pop.offsetHeight || 160;
    var spaceBelow = window.innerHeight - r.bottom - 12;
    var placeBelow = spaceBelow >= ph + 8 || spaceBelow >= r.top - 12;
    var top = placeBelow ? r.bottom + 8 : r.top - ph - 8;
    if (top < 8) top = 8;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, window.innerHeight - ph - 8);
    var left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function openOrcHelpTip(btn) {
    var tplId = btn.getAttribute("data-orc-help-tpl");
    var tpl = tplId ? document.getElementById(tplId) : null;
    var pop = $("#orc-help-tip-popover");
    var titleEl = $("#orc-help-tip-title");
    var bodyEl = $("#orc-help-tip-body");
    if (!tpl || !pop || !titleEl || !bodyEl) return;
    closeOrcHelpTip();
    var title = btn.getAttribute("data-orc-help-title") || "说明";
    titleEl.textContent = title;
    bodyEl.innerHTML = "";
    bodyEl.appendChild(tpl.content.cloneNode(true));
    orcHelpTipAnchor = btn;
    pop.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(function () {
      positionOrcHelpTip();
      window.requestAnimationFrame(positionOrcHelpTip);
    });
  }

  function bindOrcHelpTips() {
    var pop = $("#orc-help-tip-popover");
    if (!pop) return;
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".orc-help-tip-btn[data-orc-help-tpl]");
      if (!btn) return;
      e.stopPropagation();
      if (!pop.hidden && orcHelpTipAnchor === btn) {
        closeOrcHelpTip();
        return;
      }
      openOrcHelpTip(btn);
    });
    window.addEventListener(
      "resize",
      function () {
        if (pop && !pop.hidden) positionOrcHelpTip();
      },
      { passive: true }
    );
    document.addEventListener("mousedown", function (e) {
      if (!pop || pop.hidden) return;
      if (pop.contains(e.target) || e.target.closest(".orc-help-tip-btn")) return;
      closeOrcHelpTip();
    });
  }

  function openSettings() {
    var o = $("#orc-settings-overlay");
    if (o) o.hidden = false;
    closePicker();
    closeMemoryPopover();
    closeOrcHelpTip();
    closeRoomMenu();
  }

  function closeSettings() {
    var o = $("#orc-settings-overlay");
    if (o) o.hidden = true;
    closeOrcHelpTip();
  }

  var roomMenuTargetWrap = null;

  function closeRoomMenu() {
    var menu = $("#orc-room-menu");
    if (menu && !menu.hidden) {
      menu.hidden = true;
    }
    $all(".orc-room-more").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
    roomMenuTargetWrap = null;
  }

  function syncRoomMenuPinLabel(wrap) {
    var menu = $("#orc-room-menu");
    if (!menu || !wrap) return;
    var span = menu.querySelector(".orc-room-menu-pin-label");
    if (span) span.textContent = wrap.classList.contains("is-pinned") ? "取消置顶" : "置顶";
  }

  function positionRoomMenu(anchor) {
    var menu = $("#orc-room-menu");
    if (!menu || !anchor) return;
    var r = anchor.getBoundingClientRect();
    var mw = menu.offsetWidth || 170;
    var mh = menu.offsetHeight || 200;
    var left = r.right - mw;
    if (left < 8) left = 8;
    if (left + mw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - mw - 8);
    var top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function openRoomMenu(wrap, anchor) {
    var menu = $("#orc-room-menu");
    if (!menu || !wrap || !anchor) return;
    closeRoomMenu();
    roomMenuTargetWrap = wrap;
    anchor.setAttribute("aria-expanded", "true");
    syncRoomMenuPinLabel(wrap);
    menu.hidden = false;
    window.requestAnimationFrame(function () {
      positionRoomMenu(anchor);
      var first = menu.querySelector('[role="menuitem"]');
      if (first) {
        try {
          first.focus();
        } catch (e2) {}
      }
    });
  }

  function bindRoomMenus() {
    var panel = $("#orc-panel-rooms");
    var menu = $("#orc-room-menu");
    var roomsWrap = document.querySelector(".orc-rooms-wrap");
    if (!panel || !menu) return;

    panel.addEventListener("click", function (e) {
      var more = e.target.closest(".orc-room-more");
      if (!more) return;
      e.preventDefault();
      e.stopPropagation();
      var wrap = more.closest(".orc-room-card-wrap");
      if (!wrap) return;
      if (!menu.hidden && roomMenuTargetWrap === wrap) {
        closeRoomMenu();
        return;
      }
      openRoomMenu(wrap, more);
    });

    menu.addEventListener("click", function (e) {
      var item = e.target.closest("[data-orc-room-action]");
      if (!item || !roomMenuTargetWrap) return;
      e.stopPropagation();
      var action = item.getAttribute("data-orc-room-action");
      var wrap = roomMenuTargetWrap;
      closeRoomMenu();
      if (action === "pin") {
        wrap.classList.toggle("is-pinned");
      } else if (action === "rename") {
        var title = wrap.querySelector(".orc-room-card-title");
        var cur = title ? title.textContent.trim() : "";
        var next = window.prompt("会话名称", cur);
        if (title && next !== null && String(next).trim() !== "") {
          var t = String(next).trim();
          title.textContent = t;
          var cardBtn = wrap.querySelector(".orc-room-card");
          if (cardBtn) cardBtn.setAttribute("aria-label", t);
        }
      } else if (action === "duplicate") {
        var clone = wrap.cloneNode(true);
        clone.querySelectorAll(".orc-room-more").forEach(function (b) {
          b.setAttribute("aria-expanded", "false");
        });
        wrap.parentNode.insertBefore(clone, wrap.nextSibling);
      } else if (action === "delete") {
        wrap.remove();
      }
    });

    document.addEventListener("mousedown", function (e) {
      if (!menu || menu.hidden) return;
      if (menu.contains(e.target)) return;
      if (e.target.closest(".orc-room-more")) return;
      closeRoomMenu();
    });

    if (roomsWrap) {
      roomsWrap.addEventListener("scroll", function () {
        if (menu && !menu.hidden) closeRoomMenu();
      });
    }

    window.addEventListener("resize", function () {
      if (menu && !menu.hidden) closeRoomMenu();
    });
  }

  function bindPresetTop() {
    $all(".orc-preset-chip-remove").forEach(function (rm) {
      rm.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var wrap = rm.closest(".orc-preset-chip-wrap");
        var chip = wrap && wrap.querySelector(".orc-preset-chip");
        var id = chip ? chip.getAttribute("data-orc-preset") || "" : "";
        removePresetChipById(id);
        closePresetMoreDetails();
      });
    });
    $all(".orc-preset-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        hidePresetIntroTip();
        setPresetValue(chip.getAttribute("data-orc-preset") || "");
        closePresetMoreDetails();
      });
    });
    $all(".orc-preset-more-item").forEach(function (btn) {
      var bid = btn.id || "";
      if (bid === "orc-preset-open-settings") return;
      if (bid === "orc-preset-add-role") {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          openRolePickerModal();
        });
        return;
      }
      if (bid === "orc-preset-goto-role-mgmt") {
        btn.addEventListener("click", function () {
          closePresetMoreDetails();
        });
        return;
      }
      btn.addEventListener("click", function () {
        setPresetValue(btn.getAttribute("data-orc-preset") || "");
        closePresetMoreDetails();
      });
    });
    var set = $("#orc-settings-preset");
    if (set) {
      set.addEventListener("change", function () {
        syncPresetChipsFromSelect();
      });
    }
    applyPresetChipTooltips();
    bindPresetIntroBubble();
  }

  function init() {
    loadFavoriteModelIds();

    var strip0 = document.querySelector(".orc-compare-ok-strip");
    if (strip0 && defaultCompareStripHtml === null) {
      defaultCompareStripHtml = strip0.innerHTML;
    }

    var app = $("#orc-app");
    var backdrop = $("#orc-sidebar-backdrop");
    var btnPicker = $("#orc-btn-model-picker");
    var btnSettings = $("#orc-btn-settings");
    var settings = $("#orc-settings-overlay");
    var searchModels = $("#orc-picker-search");

    function setDrawer(open) {
      if (!app) return;
      app.classList.toggle("orc-mobile-drawer-open", open);
      if (!open) closeRoomMenu();
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setDrawer(false);
      });
    }

    if (btnPicker) btnPicker.addEventListener("click", openPicker);

    var btnModelCompare = $("#orc-btn-model-compare");
    if (btnModelCompare) btnModelCompare.addEventListener("click", openPicker);

    bindMemoryPopover();
    bindNetToolsPopover();
    bindOrcHelpTips();
    /* 添加模型弹层：取消、完成、右上角关闭关闭；Esc 同取消；点击遮罩不关闭（避免误触） */
    var pickCancel = $("#orc-picker-cancel");
    if (pickCancel) pickCancel.addEventListener("click", cancelPicker);
    var pickDone = $("#orc-picker-done");
    if (pickDone) pickDone.addEventListener("click", closePicker);
    var pickDismiss = $("#orc-picker-dismiss");
    if (pickDismiss) pickDismiss.addEventListener("click", cancelPicker);

    if (btnSettings) btnSettings.addEventListener("click", openSettings);
    if (settings) {
      settings.addEventListener("click", function (e) {
        if (e.target === e.currentTarget) closeSettings();
      });
    }
    var closeSet = $("#orc-settings-close");
    if (closeSet) closeSet.addEventListener("click", closeSettings);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var helpPop = $("#orc-help-tip-popover");
        if (helpPop && !helpPop.hidden) {
          closeOrcHelpTip();
          return;
        }
        var roleOv = $("#orc-role-picker-overlay");
        if (roleOv && !roleOv.hidden) {
          closeRolePickerModal();
          return;
        }
        var pvoEsc = $("#orc-picker-overlay");
        if (pvoEsc && !pvoEsc.hidden) {
          cancelPicker();
          return;
        }
        hideSideModelTip();
        closeCompareToPopover();
        closeSettings();
        closeMemoryPopover();
        closeNetToolsPopover();
        closeRoomMenu();
        setDrawer(false);
        closePresetMoreDetails();
      }
    });

    if (searchModels) {
      searchModels.addEventListener("input", onModelSearchInput);
    }
    var sideSearch = $("#orc-side-model-search");
    if (sideSearch) {
      sideSearch.addEventListener("input", onModelSearchInput);
    }

    $all(".orc-filter-chip[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        onFilterChipClicked(chip);
      });
    });
    var resetF = $("#orc-filter-reset");
    if (resetF) resetF.addEventListener("click", clearModelListFilters);
    var resetSide = $("#orc-side-filter-reset");
    if (resetSide) resetSide.addEventListener("click", clearModelListFilters);

    var sideTip = $("#orc-side-model-tip");
    if (sideTip) {
      sideTip.addEventListener("mouseenter", function () {
        if (sideModelTipHideTimer) {
          clearTimeout(sideModelTipHideTimer);
          sideModelTipHideTimer = null;
        }
      });
      sideTip.addEventListener("mouseleave", function () {
        scheduleHideSideModelTip();
      });
    }
    window.addEventListener(
      "resize",
      function () {
        if (!sideTip || sideTip.hidden) return;
        var row = document.querySelector('.orc-model-row[data-model-id="' + sideModelTipHoverId + '"]');
        if (row) positionSideModelTip(row);
      },
      { passive: true }
    );

    var selModel = $("#orc-settings-model");
    if (selModel && !selModel.getAttribute("data-populated")) {
      selModel.setAttribute("data-populated", "1");
      selModel.innerHTML = MODELS.map(function (m) {
        return '<option value="' + m.id + '">' + escapeHtml(m.name) + "</option>";
      }).join("");
    }

    bindPresetTop();
    bindRolePickerModal();
    /** 与控制台「自建·默认」一致：进入对话页时默认角色已选中，顶栏芯片高亮 */
    var presetSel0 = $("#orc-settings-preset");
    if (presetSel0 && !(presetSel0.value || "").trim()) {
      presetSel0.value = "preset_default_zh";
    }
    syncPresetChipsFromSelect();

    syncFilterChipsFromState();
    renderSideModelList();
    renderPickerList();
    syncCompareBarLabel();

    var sideCol = $("#orc-btn-side-collapse");
    var sideExp = $("#orc-btn-side-expand");

    function setSidebarCollapsed(collapsed) {
      if (!app) return;
      app.classList.toggle("orc-side-collapsed", collapsed);
      if (sideCol) {
        sideCol.setAttribute("aria-expanded", collapsed ? "false" : "true");
        sideCol.textContent = collapsed ? "»" : "«";
        sideCol.setAttribute("title", collapsed ? "展开侧栏" : "收起侧栏");
      }
      if (sideExp) {
        sideExp.setAttribute("aria-hidden", collapsed ? "false" : "true");
        sideExp.tabIndex = collapsed ? 0 : -1;
      }
    }

    function toggleSidebarCollapsed() {
      if (!app) return;
      setSidebarCollapsed(!app.classList.contains("orc-side-collapsed"));
    }

    if (sideCol && app) {
      sideCol.addEventListener("click", function () {
        toggleSidebarCollapsed();
      });
    }
    if (sideExp && app) {
      sideExp.addEventListener("click", function () {
        setSidebarCollapsed(false);
      });
    }

    var railNew = $("#orc-rail-new");
    if (railNew) {
      railNew.addEventListener("click", function () {
        var bubble = $("#orc-msg-user-bubble");
        if (bubble) bubble.textContent = "";
        setConversationActive(false);
        var taMsg = $("#orc-msg");
        if (taMsg) {
          taMsg.value = "";
          taMsg.focus();
        }
        var scroll = document.querySelector(".orc-scroll");
        if (scroll) scroll.scrollTop = 0;
      });
    }

    function bindSideTabs() {
      var tabM = $("#orc-tab-models");
      var tabR = $("#orc-tab-rooms");
      if (!tabM || !tabR) return;
      tabM.addEventListener("click", function () {
        showSideTab("models");
      });
      tabR.addEventListener("click", function () {
        showSideTab("rooms");
      });
    }

    bindSideTabs();
    bindRoomMenus();

    var btnColAll = $("#orc-model-collection-all");
    var btnColDismiss = $("#orc-model-collection-dismiss");
    var btnColAdd = $("#orc-model-collection-add");
    if (btnColAll) btnColAll.addEventListener("click", clearModelCollection);
    if (btnColDismiss) btnColDismiss.addEventListener("click", clearModelCollection);
    if (btnColAdd) btnColAdd.addEventListener("click", openPicker);

    var btnPickerCompare = $("#orc-picker-compare-start");
    if (btnPickerCompare) {
      btnPickerCompare.addEventListener("click", function () {
        closePicker();
        enterCompareModeWithKey("flagship");
      });
    }
    $all(".orc-cat-card[data-orc-collection]").forEach(function (card) {
      function openCollectionFromCard() {
        var key = card.getAttribute("data-orc-collection");
        if (!key || !MODEL_COLLECTIONS[key]) return;
        enterCompareModeWithKey(key);
      }
      card.addEventListener("click", openCollectionFromCard);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openCollectionFromCard();
        }
      });
    });

    $all(".orc-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var ta = $("#orc-msg");
        if (ta) {
          ta.value = chip.getAttribute("data-prompt") || chip.textContent.trim();
          ta.focus();
          window.requestAnimationFrame(syncOrcComposerTextareaHeight);
        }
      });
    });

    var expand = $("#orc-expand-sampling");
    if (expand) {
      expand.addEventListener("click", function () {
        expand.classList.toggle("is-open");
        var body = $("#orc-expand-sampling-body");
        if (body) body.hidden = !expand.classList.contains("is-open");
      });
    }

    var toggle = $("#orc-name-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        toggle.classList.toggle("is-on");
      });
    }

    var sysTabs = $all(".orc-sys-tab");
    sysTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        sysTabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
        });
      });
    });

    function showCompareDemo(promptText) {
      var thread = $("#orc-thread");
      var bubble = $("#orc-msg-user-bubble");
      var ta = $("#orc-msg");
      if (!thread || !bubble) return;
      if (activeCollectionKey && !selectedCompareIds.length) {
        window.alert("请至少勾选一个参与对比的模型。");
        return;
      }
      var t = (promptText || "").trim();
      if (!t) t = "请介绍下西安天气与出行建议。";
      bubble.textContent = t;
      if (activeCollectionKey && selectedCompareIds.length) {
        updateCompareUIFromSelection(t);
      } else {
        restoreDefaultCompareUI();
      }
      setConversationActive(true);
      var ab = $("#orc-msg-assistant-body");
      if (ab) {
        var short = (t || "").trim();
        if (short.length > 180) short = short.slice(0, 180) + "…";
        ab.textContent = short
          ? "回复占位。你的消息：「" + short + "」。可在下方 Compare to 勾选参与对比的模型，确定后同步到侧栏。"
          : "回复占位。可在下方 Compare to 勾选参与对比的模型，确定后同步到侧栏。";
      }
      initCompareToDraftFromState();
      renderCompareToTriggerIcons();
      if (ta) ta.value = "";
      window.requestAnimationFrame(function () {
        syncOrcComposerTextareaHeight();
        try {
          thread.scrollIntoView({ block: "start", behavior: "smooth" });
        } catch (e) {}
      });
    }

    function syncOrcComposerTextareaHeight() {
      var ta = $("#orc-msg");
      if (!ta) return;
      var cs = window.getComputedStyle(ta);
      var lh = parseFloat(cs.lineHeight);
      var fs = parseFloat(cs.fontSize);
      if (!Number.isFinite(lh) || lh <= 0) lh = (Number.isFinite(fs) ? fs : 15) * 1.5;
      var padTop = parseFloat(cs.paddingTop) || 0;
      var padBot = parseFloat(cs.paddingBottom) || 0;
      var minH = padTop + padBot + lh * 2;
      var maxH = padTop + padBot + lh * 5;
      ta.style.height = "1px";
      var sh = ta.scrollHeight;
      var h = Math.min(maxH, Math.max(minH, sh));
      ta.style.height = h + "px";
      ta.style.overflowY = sh > maxH ? "auto" : "hidden";
    }

    function bindSendAndSummary() {
      var ta = $("#orc-msg");
      var btn = $("#orc-btn-send");
      function submit() {
        showCompareDemo(ta ? ta.value : "");
      }
      if (btn) btn.addEventListener("click", submit);
      if (ta) {
        ta.addEventListener("input", syncOrcComposerTextareaHeight);
        ta.addEventListener("keydown", function (e) {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        });
        window.addEventListener(
          "resize",
          function () {
            syncOrcComposerTextareaHeight();
          },
          { passive: true }
        );
        window.requestAnimationFrame(syncOrcComposerTextareaHeight);
      }
      var colBtn = $("#orc-summary-collapse");
      var content = $("#orc-summary-content");
      if (colBtn && content) {
        colBtn.addEventListener("click", function () {
          content.hidden = !content.hidden;
          var open = !content.hidden;
          colBtn.setAttribute("aria-expanded", open ? "true" : "false");
          colBtn.textContent = open ? "收起" : "展开";
        });
      }
    }

    bindSendAndSummary();
    bindCompareToPopoverUi();
    bindUserMessageActions();
  }

  function bindUserMessageActions() {
    var regen = $("#orc-user-btn-regen");
    var copyBtn = $("#orc-user-btn-copy");
    var dislike = $("#orc-user-btn-dislike");
    if (regen) {
      regen.addEventListener("click", function () {
        /* 占位：接入 API 后在此重新请求 */
      });
    }
    if (dislike) {
      dislike.addEventListener("click", function () {
        /* 占位：接入后上报负反馈 */
      });
    }
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var bubble = $("#orc-msg-user-bubble");
        var text = bubble ? String(bubble.textContent || "").trim() : "";
        if (!text) return;
        function flashCopied() {
          var prev = copyBtn.getAttribute("title") || "复制全文";
          copyBtn.setAttribute("title", "已复制");
          window.setTimeout(function () {
            copyBtn.setAttribute("title", prev);
          }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(flashCopied).catch(function () {
            fallbackCopyText(text, flashCopied);
          });
        } else {
          fallbackCopyText(text, flashCopied);
        }
      });
    }
  }

  function fallbackCopyText(text, onOk) {
    try {
      var ta2 = document.createElement("textarea");
      ta2.value = text;
      ta2.setAttribute("readonly", "");
      ta2.style.position = "fixed";
      ta2.style.left = "-9999px";
      ta2.style.top = "0";
      document.body.appendChild(ta2);
      ta2.select();
      document.execCommand("copy");
      document.body.removeChild(ta2);
      if (onOk) onOk();
    } catch (e) {
      window.alert("无法复制，请手动选中消息文本。");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
