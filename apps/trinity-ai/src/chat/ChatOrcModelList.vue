<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  filterBrowseModels,
  getOrcModelById,
  groupModelsForSidebar,
  MOCK_ORC_MODELS,
  ORC_FAV_MODEL_STORAGE_KEY,
} from "./mock";

type ChatOrcModel = (typeof MOCK_ORC_MODELS)[number];

const props = defineProps<{ query: string }>();
const orcModelId = defineModel<string>("orcModelId", { default: "r3" });

const favoriteIds = ref<string[]>([]);

function loadFav() {
  try {
    const raw = localStorage.getItem(ORC_FAV_MODEL_STORAGE_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw) as unknown;
    if (Array.isArray(arr)) {
      favoriteIds.value = arr.filter((id): id is string => typeof id === "string" && !!getOrcModelById(id));
    }
  } catch {
    favoriteIds.value = [];
  }
}

function saveFav() {
  try {
    localStorage.setItem(ORC_FAV_MODEL_STORAGE_KEY, JSON.stringify(favoriteIds.value));
  } catch {
    /* ignore */
  }
}

onMounted(loadFav);

const sections = computed(() => {
  const filtered = filterBrowseModels(MOCK_ORC_MODELS, props.query, true);
  return groupModelsForSidebar(filtered, favoriteIds.value);
});

function brandPvExtra(m: ChatOrcModel): string {
  const b = m.brand || "";
  if (b === "google") return " orc-pv--google";
  if (b === "openai") return " orc-pv--openai";
  if (b === "anthropic") return " orc-pv--anthropic";
  if (b === "xai") return " orc-pv--xai";
  if (b === "recraft") return " orc-pv--recraft";
  return " orc-pv--letter";
}

function isLetterPv(m: ChatOrcModel): boolean {
  return brandPvExtra(m).includes("letter");
}

function toggleFav(id: string, e: MouseEvent) {
  e.stopPropagation();
  const i = favoriteIds.value.indexOf(id);
  if (i === -1) favoriteIds.value.push(id);
  else favoriteIds.value.splice(i, 1);
  saveFav();
}

function onRowClick(id: string) {
  orcModelId.value = id;
}

function isFavorite(id: string) {
  return favoriteIds.value.includes(id);
}
</script>

<template>
  <div id="orc-model-list" class="orc-model-list" role="listbox" aria-label="添加模型">
    <template v-for="sec in sections" :key="sec.key">
      <div class="orc-side-model-group">
        <h4 class="orc-side-model-group-title">{{ sec.key }}</h4>
        <button
          v-for="m in sec.models"
          :key="m.id"
          type="button"
          class="orc-model-row"
          :class="{ 'is-active': m.id === orcModelId }"
          :data-model-id="m.id"
          :aria-current="m.id === orcModelId ? 'true' : undefined"
          @click="onRowClick(m.id)"
        >
          <span class="orc-pv" :class="brandPvExtra(m).trim()" aria-hidden="true">
            {{ isLetterPv(m) ? m.provider : "" }}
          </span>
          <span class="orc-model-row-name">{{ m.name }}</span>
          <span
            class="orc-model-row-fav"
            :title="isFavorite(m.id) ? '取消收藏' : '加入收藏'"
            aria-hidden="true"
            @click="toggleFav(m.id, $event)"
          >
            {{ isFavorite(m.id) ? "★" : "☆" }}
          </span>
          <span v-if="m.id === orcModelId" class="orc-model-row-mark" aria-hidden="true">✓</span>
        </button>
      </div>
    </template>
  </div>
</template>
