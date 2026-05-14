<script setup lang="ts">
import { ref } from "vue";
import ChatOrcModelList from "./ChatOrcModelList.vue";
import { MOCK_CHAT_SESSION_GROUPS } from "./mock";
import type { ChatSideTab } from "./useChatShellLayout";

defineProps<{ sideTab: ChatSideTab; sideCollapsed: boolean }>();
const orcModelId = defineModel<string>("orcModelId", { default: "r3" });
const emit = defineEmits<{
  toggleCollapse: [];
  "select-tab": [tab: ChatSideTab];
}>();

const sideModelSearch = ref("");
</script>
<template>
<aside class="orc-sidebar" aria-label="模型与会话">
  <div class="orc-sidebar-inner" id="orc-sidebar-inner">
    <div class="orc-model-head">
      <div class="orc-side-tabs" role="tablist" aria-label="侧栏">
        <button
          type="button"
          class="orc-side-tab"
          :class="{ 'is-active': sideTab === 'models' }"
          role="tab"
          id="orc-tab-models"
          :aria-selected="sideTab === 'models' ? 'true' : 'false'"
          aria-controls="orc-panel-models"
          @click="emit('select-tab', 'models')"
        >
          模型
        </button>
        <button
          type="button"
          class="orc-side-tab"
          :class="{ 'is-active': sideTab === 'rooms' }"
          role="tab"
          id="orc-tab-rooms"
          :aria-selected="sideTab === 'rooms' ? 'true' : 'false'"
          aria-controls="orc-panel-rooms"
          @click="emit('select-tab', 'rooms')"
        >
          会话历史
        </button>
      </div>
      <button
        type="button"
        class="orc-model-collapse"
        id="orc-btn-side-collapse"
        :aria-expanded="sideCollapsed ? 'false' : 'true'"
        aria-controls="orc-sidebar-inner"
        :title="sideCollapsed ? '展开侧栏' : '收起侧栏'"
        @click="emit('toggleCollapse')"
      >
        {{ sideCollapsed ? "»" : "«" }}
      </button>
    </div>
    <div class="orc-side-panels">
      <div
        id="orc-panel-models"
        class="orc-side-panel"
        role="tabpanel"
        aria-labelledby="orc-tab-models"
        :hidden="sideTab !== 'models'"
      >
        <div class="orc-side-panel-scroll">
          <div class="orc-side-model-toolbar" id="orc-side-model-toolbar">
            <div class="orc-side-model-toolbar-row">
              <div class="orc-side-model-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <label class="visually-hidden" for="orc-side-model-search">搜索模型</label>
                <input
                  id="orc-side-model-search"
                  v-model="sideModelSearch"
                  type="search"
                  placeholder="搜索模型"
                  autocomplete="off"
                />
              </div>
              <button
                type="button"
                class="orc-filter-chip is-purple"
                id="orc-btn-model-compare"
                title="打开模型列表与多选（与消息内 Compare to 相同弹层）"
                aria-label="模型对比"
              >
                模型对比
              </button>
            </div>
            <div class="orc-side-model-filters orc-side-model-filters--na" aria-disabled="true">
              <span class="orc-side-model-filters-na-text">输入、输出、免费筛选暂不支持</span>
            </div>
          </div>
          <div id="orc-model-collection-block" class="orc-model-collection-block" hidden>
            <div class="orc-model-collection-toolbar">
              <h4 class="orc-model-collection-line">
                <span class="orc-model-collection-kicker">模型集合</span>
                <span class="orc-model-collection-sep" aria-hidden="true">·</span>
                <span id="orc-model-collection-title">综合旗舰</span>
              </h4>
              <div class="orc-model-collection-toolbar-actions">
                <button type="button" class="orc-model-collection-link" id="orc-model-collection-add" aria-label="打开添加模型">+ 添加</button>
                <button type="button" class="orc-model-collection-link" id="orc-model-collection-all">全部模型</button>
                <button type="button" class="orc-model-collection-barclose" id="orc-model-collection-dismiss" aria-label="关闭集合并显示全部模型">×</button>
              </div>
            </div>
          </div>
          <ChatOrcModelList v-model:orc-model-id="orcModelId" :query="sideModelSearch" />
        </div>
      </div>
      <div
        id="orc-panel-rooms"
        class="orc-side-panel"
        role="tabpanel"
        aria-labelledby="orc-tab-rooms"
        :hidden="sideTab !== 'rooms'"
      >
        <div class="orc-sidebar-search">
          <label class="visually-hidden" for="orc-room-search">搜索会话</label>
          <input id="orc-room-search" type="search" placeholder="搜索会话…" autocomplete="off" />
        </div>
        <div class="orc-rooms-wrap">
          <div class="orc-rooms">
            <div v-for="g in MOCK_CHAT_SESSION_GROUPS" :key="g.label" class="orc-room-group">
              <h3>{{ g.label }}</h3>
              <div v-for="r in g.rooms" :key="r.id" class="orc-room-card-wrap">
                <button type="button" class="orc-room-card" :aria-label="r.ariaLabel">
                  <span class="orc-room-card-icon" aria-hidden="true">
                    <svg class="orc-room-card-icon-svg" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linejoin="round"
                      />
                      <circle cx="9" cy="10" r="1" fill="currentColor" />
                      <circle cx="12" cy="10" r="1" fill="currentColor" />
                      <circle cx="15" cy="10" r="1" fill="currentColor" />
                    </svg>
                  </span>
                  <span class="orc-room-card-body">
                    <span class="orc-room-card-title">{{ r.title }}</span>
                    <span class="orc-room-card-meta">
                      <span class="orc-room-card-turns">{{ r.turns }}</span>
                      <span class="orc-room-card-time">{{ r.time }}</span>
                    </span>
                  </span>
                </button>
                <button type="button" class="orc-room-more" aria-label="会话操作" aria-haspopup="menu" aria-expanded="false" title="更多">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="5" r="1.75" />
                    <circle cx="12" cy="12" r="1.75" />
                    <circle cx="12" cy="19" r="1.75" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div id="orc-room-menu" class="orc-room-menu" role="menu" hidden tabindex="-1">
            <button type="button" role="menuitem" class="orc-room-menu-item" data-orc-room-action="pin">
              <span class="orc-room-menu-ic" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                </svg>
              </span>
              <span class="orc-room-menu-pin-label">置顶</span>
            </button>
            <button type="button" role="menuitem" class="orc-room-menu-item" data-orc-room-action="rename">
              <span class="orc-room-menu-ic" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </span>
              <span>重命名</span>
            </button>
            <button type="button" role="menuitem" class="orc-room-menu-item" data-orc-room-action="duplicate">
              <span class="orc-room-menu-ic" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M4 16V6a2 2 0 012-2h10" />
                </svg>
              </span>
              <span>复制会话</span>
            </button>
            <button type="button" role="menuitem" class="orc-room-menu-item orc-room-menu-item--danger" data-orc-room-action="delete">
              <span class="orc-room-menu-ic" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                </svg>
              </span>
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</aside>
</template>
