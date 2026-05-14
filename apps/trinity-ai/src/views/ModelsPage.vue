<script setup lang="ts">
import { SearchForm1Fixed } from "@trinity/ui";
import { computed, onUnmounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import {
  CATALOG_MODELS,
  CTX_MARK_LABELS,
  CTX_STEPS,
  type CatalogModel,
  contextLabel,
  MODALITY_ORDER,
  priceInSortKey,
  PROVIDER_PILLS,
} from "../data/modelsCatalog";
import "./models-page.css";

type SortMode = "name" | "newest" | "ctx" | "price-asc";
type ProviderId = (typeof PROVIDER_PILLS)[number]["id"];
type ModalityCap = (typeof MODALITY_ORDER)[number];

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "name", label: "名称" },
  { id: "newest", label: "最新" },
  { id: "ctx", label: "上下文从大到小" },
  { id: "price-asc", label: "输入价格从低到高" },
];

const filtersOpen = ref(false);
const sideSearch = ref("");
const mainSearch = ref("");
const activeProvider = ref<ProviderId>("all");
const activeCap = ref<ModalityCap>("all");
const ctxIdx = ref(0);
const sortMode = ref<SortMode>("newest");

function setFiltersOpen(open: boolean) {
  filtersOpen.value = open;
}

watch(
  filtersOpen,
  (open) => {
    document.body.classList.toggle("tai-models-filters-open", open);
  },
  { immediate: true }
);

onUnmounted(() => {
  document.body.classList.remove("tai-models-filters-open");
});

const ctxAriaText = computed(() => CTX_MARK_LABELS[Number(ctxIdx.value)] ?? "全部");

function countForModality(cap: ModalityCap): number {
  if (cap === "all") return CATALOG_MODELS.length;
  return CATALOG_MODELS.filter((m) => m.categories.includes(cap)).length;
}

const modalityRows = computed(() =>
  MODALITY_ORDER.map((cap) => ({
    cap,
    count: countForModality(cap),
    label: cap === "all" ? "全部" : cap,
  }))
);

const quickPillRows = computed(() =>
  MODALITY_ORDER.map((cap) => ({
    cap,
    label: cap === "all" ? "全部" : `${cap} ${countForModality(cap)}`,
  }))
);

function searchHaystack(m: CatalogModel): string {
  return [m.title, m.slug, m.provider, m.orgSlug, ...m.categories].join(" ").toLowerCase();
}

function rowMatches(m: CatalogModel): boolean {
  const q = `${sideSearch.value} ${mainSearch.value}`.trim().toLowerCase();
  const step = Number(ctxIdx.value);
  const minCtx = CTX_STEPS[Number.isFinite(step) ? step : 0] ?? 0;
  const okProv = activeProvider.value === "all" || m.provider === activeProvider.value;
  const okCap = activeCap.value === "all" || m.categories.includes(activeCap.value);
  const okCtx = minCtx === 0 || m.contextK >= minCtx;
  const okQ = !q || searchHaystack(m).includes(q);
  return okProv && okCap && okCtx && okQ;
}

const filteredModels = computed(() => CATALOG_MODELS.filter(rowMatches));

const sortedModels = computed(() => {
  const list = [...filteredModels.value];
  const mode = sortMode.value;
  list.sort((a, b) => {
    if (mode === "name") {
      return a.title.localeCompare(b.title, "zh-Hans-CN");
    }
    if (mode === "newest") {
      return (b.released || "").localeCompare(a.released || "");
    }
    if (mode === "ctx") {
      return b.contextK - a.contextK;
    }
    if (mode === "price-asc") {
      return priceInSortKey(a.priceInPerM) - priceInSortKey(b.priceInPerM);
    }
    return 0;
  });
  return list;
});

const modelCountLabel = computed(() => `共 ${sortedModels.value.length} 个模型`);

function resetFilters() {
  sideSearch.value = "";
  mainSearch.value = "";
  ctxIdx.value = 0;
  activeProvider.value = "all";
  activeCap.value = "all";
  setFiltersOpen(false);
}

function setProvider(p: ProviderId) {
  activeProvider.value = p;
}

function setCap(cap: ModalityCap) {
  activeCap.value = cap;
}
</script>

<template>
  <div class="models-root">
    <a class="skip" href="#models-main">跳转至正文</a>

    <div
      class="filters-backdrop"
      aria-hidden="true"
      @click="setFiltersOpen(false)"
    />

    <div id="models-main" class="models-shell">
      <button type="button" class="btn-filter-mobile" @click="setFiltersOpen(true)">
        筛选
      </button>

      <aside class="sidebar" aria-label="筛选条件">
        <div class="side-head">
          <h2>筛选</h2>
          <button type="button" class="link-reset" @click="resetFilters">重置</button>
        </div>
        <div class="side-label">筛选搜索</div>
        <input
          v-model="sideSearch"
          type="search"
          class="input-side"
          placeholder="提供商、模型名…"
          autocomplete="off"
        />

        <div class="side-label">提供商</div>
        <div class="pill-row">
          <button
            v-for="p in PROVIDER_PILLS"
            :key="p.id"
            type="button"
            class="pill"
            :class="{ 'is-active': activeProvider === p.id }"
            @click="setProvider(p.id)"
          >
            {{ p.label }}
          </button>
        </div>

        <div class="side-label">上下文</div>
        <div class="ctx-slider-wrap">
          <input
            v-model.number="ctxIdx"
            type="range"
            class="ctx-range"
            min="0"
            max="4"
            step="1"
            :aria-valuetext="ctxAriaText"
          />
          <div class="ctx-marks">
            <span v-for="lab in CTX_MARK_LABELS" :key="lab">{{ lab }}</span>
          </div>
        </div>

        <div class="side-label">模态</div>
        <div class="cap-list">
          <button
            v-for="row in modalityRows"
            :key="row.cap"
            type="button"
            class="cap-btn"
            :class="{ 'is-active': activeCap === row.cap }"
            @click="setCap(row.cap)"
          >
            <span>{{ row.label }}</span>
            <span class="n">{{ row.count }}</span>
          </button>
        </div>

        <details class="filter-details" open>
          <summary>输入模态</summary>
          <div class="filter-checks">
            <label><input type="checkbox" checked /> 文本</label>
            <label><input type="checkbox" checked /> 图像</label>
            <label><input type="checkbox" checked /> 音频</label>
            <label><input type="checkbox" checked /> 视频 / 向量</label>
          </div>
        </details>
        <details class="filter-details">
          <summary>提示计价</summary>
          <div class="filter-checks">
            <label><input type="checkbox" checked /> 免费额度</label>
            <label><input type="checkbox" checked /> &lt; $1 / M</label>
            <label><input type="checkbox" checked /> $1 – $10 / M</label>
            <label><input type="checkbox" checked /> &gt; $10 / M</label>
          </div>
        </details>
        <details class="filter-details">
          <summary>系列 / 家族</summary>
          <div class="filter-checks">
            <label><input type="checkbox" checked /> GPT</label>
            <label><input type="checkbox" checked /> Claude</label>
            <label><input type="checkbox" checked /> Gemini</label>
            <label><input type="checkbox" checked /> Llama</label>
            <label><input type="checkbox" checked /> Mistral / 其他</label>
          </div>
        </details>
        <details class="filter-details">
          <summary>能力标签</summary>
          <div class="filter-checks">
            <label><input type="checkbox" checked /> 工具调用</label>
            <label><input type="checkbox" checked /> 视觉</label>
            <label><input type="checkbox" checked /> JSON 模式</label>
            <label><input type="checkbox" checked /> 推理链</label>
          </div>
        </details>
        <details class="filter-details">
          <summary>支持参数</summary>
          <div class="filter-checks">
            <label><input type="checkbox" checked /> tools</label>
            <label><input type="checkbox" checked /> temperature</label>
            <label><input type="checkbox" checked /> top_p</label>
            <label><input type="checkbox" checked /> max_tokens</label>
          </div>
        </details>
        <details class="filter-details">
          <summary>数据与路由</summary>
          <div class="filter-checks">
            <label><input type="checkbox" /> 零数据留存（ZDR）</label>
            <label><input type="checkbox" /> 区域内路由</label>
            <label><input type="checkbox" /> 可蒸馏</label>
          </div>
        </details>
        <details class="filter-details">
          <summary>推理后端</summary>
          <div class="filter-checks">
            <label><input type="checkbox" checked /> 直连厂商</label>
            <label><input type="checkbox" checked /> Azure</label>
            <label><input type="checkbox" checked /> AWS Bedrock</label>
            <label><input type="checkbox" checked /> GCP</label>
          </div>
        </details>
        <details class="filter-details">
          <summary>作者 / 组织</summary>
          <div class="filter-checks">
            <label><input type="checkbox" checked /> openai</label>
            <label><input type="checkbox" checked /> anthropic</label>
            <label><input type="checkbox" checked /> google</label>
            <label><input type="checkbox" checked /> meta</label>
            <label><input type="checkbox" checked /> 其他</label>
          </div>
        </details>
        <details class="filter-details">
          <summary>其他</summary>
          <div class="filter-checks">
            <label><input type="checkbox" /> 显示已下线模型</label>
            <label><input type="checkbox" checked /> 隐藏预览版</label>
          </div>
        </details>
      </aside>

      <section class="catalog" aria-label="模型列表">
        <div class="catalog-eyebrow">
          <span class="catalog-eyebrow-dot" aria-hidden="true" />
          模型目录 · 示例数据
        </div>
        <div class="catalog-top">
          <div class="catalog-search-slot">
            <SearchForm1Fixed
              v-model="mainSearch"
              placeholder="筛选模型…"
              width="min(100%, 36rem)"
              aria-label="筛选模型"
              input-id="models-main-search"
            />
          </div>
          <select v-model="sortMode" class="sort-select" aria-label="排序">
            <option v-for="o in SORT_OPTIONS" :key="o.id" :value="o.id">
              {{ o.label }}
            </option>
          </select>
        </div>

        <div class="catalog-sub">
          <div class="quick-pills">
            <button
              v-for="row in quickPillRows"
              :key="row.cap"
              type="button"
              class="quick-pill"
              :class="{ 'is-active': activeCap === row.cap }"
              @click="setCap(row.cap)"
            >
              {{ row.label }}
            </button>
          </div>
          <div class="view-row">
            <span class="count-models">{{ modelCountLabel }}</span>
          </div>
        </div>

        <div class="model-list">
          <article v-for="m in sortedModels" :key="m.id" class="m-card">
            <h3 class="m-name">{{ m.title }}</h3>
            <div class="m-path">{{ m.slug }}</div>
            <div class="m-tags">
              <span v-for="t in m.categories" :key="t">{{ t }}</span>
            </div>
            <p class="m-desc">{{ m.description }}</p>
            <div class="m-meta">
              <span>由 <a href="#" class="m-meta-a">{{ m.orgSlug }}</a></span>
              <span class="m-meta-dot" aria-hidden="true">·</span>
              <time :datetime="m.released">{{ m.released }}</time>
              <span class="m-meta-dot" aria-hidden="true">·</span>
              <span>{{ contextLabel(m.contextK) }}</span>
              <span class="m-meta-dot" aria-hidden="true">·</span>
              <span>{{ m.inputPriceDisplay }}</span>
              <template v-if="m.priceOutLabel">
                <span class="m-meta-dot" aria-hidden="true">·</span>
                <span>{{ m.priceOutLabel }}</span>
              </template>
              <span class="m-meta-dot" aria-hidden="true">·</span>
              <span class="m-trend" :class="[`is-${m.trend}`]">{{ m.trendLabel }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>

    <footer class="page-foot">
      <RouterLink class="text-link" :to="{ name: 'tai-home' }">← 返回首页</RouterLink>
      ·
      <span>© 2026 Trinity AI</span>
    </footer>
  </div>
</template>
