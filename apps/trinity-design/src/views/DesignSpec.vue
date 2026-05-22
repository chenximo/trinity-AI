<script setup lang="ts">
/** 设计规范真源（路由 `/design-spec`）。`design-spec-main-inner.html` 仅 REFERENCE ONLY，勿双轨维护。新增组件流程见 `docs/Trinity开发枢纽与AI协作流程.md` §4.1.5。 */
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  FilterForm1More,
  FilterForm2PillListbox,
  FilterForm3LabeledSegmented,
  InternalHelpTip,
  ModalPanel,
  SearchForm1Fixed,
  SearchForm2Grow,
  SelectListForm1ModelRow,
  TabSwitch1Underline,
  TabSwitch2Capsule,
  TextField1Labeled,
  TButton,
  TextLink,
  type FilterForm1MenuItem,
  type FilterForm2ListboxItem,
  type FilterForm3SegmentItem,
  type TabSwitchItem,
} from "@trinity/ui";
import "@repo/TrinityAI/app/chat/chat-openrouter.css";
import "../assets/design-spec-page.css";
import { useDesignSpecDropdowns } from "../composables/useDesignSpecDropdowns";

const router = useRouter();
const root = ref<HTMLElement | null>(null);

useDesignSpecDropdowns(root);

/** 形式1 画板菜单：示意数据在 app，结构与 `useDesignSpecDropdowns` 依赖的 id 不变 */
const designSpecFilterForm1MenuItems: FilterForm1MenuItem[] = [
  { label: "自定义角色", active: true, icon: "diagram" },
  { label: "打开模型设置（暂不支持）", disabled: true, icon: "dial" },
  { label: "添加角色", icon: "user-add" },
];

const designSpecModelListboxItems: FilterForm2ListboxItem[] = [
  { label: "按模型", checked: true, dataAttrs: { "data-ds-model-opt": "按模型" } },
  { label: "按提供商", dataAttrs: { "data-ds-model-opt": "按提供商" } },
];

const designSpecModalTypeListboxItems: FilterForm2ListboxItem[] = [
  { label: "选项一", checked: true, dataAttrs: { "data-ds-spec-modal-opt": "选项一" } },
  { label: "选项二", dataAttrs: { "data-ds-spec-modal-opt": "选项二" } },
];

const designSpecExpirySegments: FilterForm3SegmentItem[] = [
  { label: "全部", active: true },
  { label: "过期" },
  { label: "不过期" },
];

const designSpecSearchFixed = ref("");
const designSpecSearchGrow = ref("");
const designSpecTextName = ref("演示项");
const designSpecTextType = ref("");

const designSpecTabItems: TabSwitchItem[] = [
  { id: "models", label: "模型" },
  { id: "rooms", label: "会话历史" },
  { id: "docs", label: "文档", disabled: true },
];
const designSpecTabUnderline = ref("models");
const designSpecTabCapsule = ref("models");

function onClickNav(e: MouseEvent) {
  const t = e.target;
  const el = t instanceof Element ? t : t instanceof Node ? t.parentElement : null;
  if (!el) return;
  const a = el.closest("a[href]");
  if (!a) return;
  const href = a.getAttribute("href") || "";
  if (
    href === "/design-spec" ||
    href === "/design-tokens" ||
    href === "/admin-ops-spec" ||
    href === "/user-console-spec"
  ) {
    e.preventDefault();
    if (router.currentRoute.value.path === href) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    void router.push(href);
  }
}
</script>

<template>
  <main id="ds-main" ref="root" class="ds-main" @click="onClickNav">
      <header class="ds-hero">
        <h1>设计规范</h1>
        <nav class="ds-nav" aria-label="规范章节">
          <a href="#ds-filters">筛选</a>
          <a href="#ds-search">搜索</a>
          <a href="#ds-text-field">输入</a>
          <a href="#ds-tabs">Tab</a>
          <a href="#ds-modal">弹窗</a>
          <a href="#ds-select-list">多选列表</a>
          <a href="#ds-internal-tip">标注</a>
          <a href="#ds-buttons">按钮</a>
          <RouterLink to="/design-tokens">色板 →</RouterLink>
          <RouterLink to="/admin-ops-spec">运营后台管理系统 →</RouterLink>
          <RouterLink to="/user-console-spec">用户控制台系统 →</RouterLink>
        </nav>
      </header>

      <p class="ds-atom-prose" style="max-width: 44rem; margin: 0 0 0.65rem">
        <strong>新增组件流程</strong>（与仓库 <code>docs/Trinity开发枢纽与AI协作流程.md</code> §4.1.5 一致）：<strong>1）</strong>先在本页写说明、画板与灰条 <code>.ds-ui-ref</code>（新小节加顶栏锚点）；<strong>2）</strong>在 <code>packages/ui</code> 实现并从 <code>index.ts</code> 导出；<strong>3）</strong>回到本页 <code>import</code> 接线。<strong>验收</strong>即打开本页 <strong>/design-spec</strong> 直接可看、可点。
      </p>
      <p class="ds-atom-prose" style="max-width: 44rem; margin: 0 0 1.25rem">
        本页按<strong>原子</strong>列出控件与类名；<strong><code>@trinity/ui</code> 每新增一个对外组件</strong>，应在本页补一节画板与灰条说明，便于设计与 AI 对齐。细色值与主题见 <RouterLink to="/design-tokens">设计色板</RouterLink>。
        画板中已接 <code>@trinity/ui</code> 的片段，在对应小节用<strong>灰底提示条</strong>标出<strong>组件名</strong>与推荐 <code>import</code>，便于你对 AI 说「按设计规范筛选形式2」时直接落到可引用实现。
      </p>

      <section class="ds-spec-block" id="ds-filters" aria-labelledby="ds-filters-title">
        <h2 id="ds-filters-title">筛选 · 应用侧</h2>
        <p class="ds-atom-prose" style="margin-bottom: 0.65rem">
          三种形式用于在<strong>产品内统一</strong>视觉与控件尺寸，避免各页各写一套。约定「<strong>形式1</strong> / <strong>形式2</strong> / <strong>形式3</strong>」即可：<strong>形式1</strong> 渐变「更多」+ icon 菜单；<strong>形式2</strong> 分组药丸 + 列表 + 右侧 ✓；<strong>形式3</strong> 文案标签 + 芯片分段。色与圆角见 <RouterLink to="/design-tokens">设计色板</RouterLink>。<strong>PC 与移动端</strong>须同一套比例下<strong>自适应</strong>（优先用 <code>rem</code> 随根字号，窄屏再辅以断点微调字号/内边距/触控面积），脚注为<strong>桌面基线</strong>的字号与行高。
        </p>
        <p class="ds-atom-prose" style="margin: -0.2rem 0 0.6rem; font-size: 0.8125rem; color: var(--muted); line-height: 1.45">
          <strong>备注</strong>：<strong>后台管理</strong>筛选、<strong>删选</strong>用<strong>形式2</strong>（标签 + 分组下拉；灰阶样式在控制台实现，字号行高与本节形式2 对齐即可）。
        </p>
        <p class="ds-ui-ref">
          <strong>原型 / AI 提示</strong>：需要「筛选形式2」时写明对齐本页 <code>#ds-filters</code> 形式2，并在 Vue 中 <code>import { FilterForm2PillListbox, type FilterForm2ListboxItem } from &quot;@trinity/ui&quot;</code>；形式1 → <code>FilterForm1More</code>；形式3 → <code>FilterForm3LabeledSegmented</code>。<strong>搜索</strong>见 <a href="#ds-search"><code>#ds-search</code></a>。各小节下另有<strong>组件名一行</strong>。
        </p>
        <p class="ds-one">主题随顶栏切换。</p>
        <figure class="ds-board">
          <div class="ds-board-canvas ds-board-canvas--app" style="overflow: visible">
            <div class="ds-app-filter-form">
              <p class="ds-app-filter-form-title">形式1 · 更多 — 渐变主操作 + 下拉菜单（icon + 标题）</p>
              <p class="ds-ui-ref ds-ui-ref--tight">
                <strong>@trinity/ui</strong>：<code>FilterForm1More</code> ·
                <code>import { FilterForm1More, type FilterForm1MenuItem } from &quot;@trinity/ui&quot;</code> · 传 <code>items</code> 带面板；不传 <code>items</code> 仅按钮。
              </p>
              <div class="or-app-filter-row" style="overflow: visible">
                <FilterForm1More
                  wrap-id="ds-app-filter-more-wrap"
                  btn-id="ds-app-filter-more-btn"
                  panel-id="ds-app-filter-more-panel"
                  :items="designSpecFilterForm1MenuItems"
                />
              </div>
            </div>
            <div class="ds-app-filter-form">
              <p class="ds-app-filter-form-title">形式2 · 分组 — 药丸触发 + 列表选项 + 右侧 ✓</p>
              <p class="ds-ui-ref ds-ui-ref--tight">
                <strong>@trinity/ui</strong>：<code>FilterForm2PillListbox</code> ·
                <code>import { FilterForm2PillListbox, type FilterForm2ListboxItem } from &quot;@trinity/ui&quot;</code> · 列表项用 <code>dataAttrs</code> 与业务脚本约定（本页 <code>data-ds-model-opt</code>）。
              </p>
              <p class="ds-app-filter-form-note">
                药丸在<strong>键盘 <code>:focus-visible</code></strong> 与<strong>列表展开（<code>aria-expanded="true"</code>）</strong>时均为<strong>品牌色内描边 + 3px 外环</strong>（<code>border-color: var(--blue)</code>、<code>box-shadow: 0 0 0 3px var(--blue-ring)</code>），与 <code>select.or-select--app:focus</code> 一致；展开时悬停不改变该描边（规则见 <code>packages/ui/styles/ui-kit.css</code>；整站经 <code>assets/trinity-base.css</code> 引入，或单独 <code>import &quot;@trinity/ui/styles/ui-base.css&quot;</code>）。
              </p>
              <div class="or-app-filter-row" style="overflow: visible">
                <FilterForm2PillListbox
                  wrap-id="ds-app-model-dd-wrap"
                  btn-id="ds-app-model-dd-btn"
                  panel-id="ds-app-model-dd-panel"
                  label-span-id="ds-app-model-dd-label"
                  listbox-aria-label="分组"
                  beak-x="2.75rem"
                  :items="designSpecModelListboxItems"
                />
              </div>
            </div>
            <div class="ds-app-filter-form">
              <p class="ds-app-filter-form-title">形式3 · 分段 — 前置标签 + 芯片按钮组</p>
              <p class="ds-ui-ref ds-ui-ref--tight">
                <strong>@trinity/ui</strong>：<code>FilterForm3LabeledSegmented</code> ·
                <code>import { FilterForm3LabeledSegmented, type FilterForm3SegmentItem } from &quot;@trinity/ui&quot;</code> · 芯片用 <code>:segments</code> 或默认插槽。
              </p>
              <FilterForm3LabeledSegmented label="到期" label-id="ds-app-expiry-lbl" :segments="designSpecExpirySegments" />
            </div>
            <p class="ds-app-filter-foot">
              <strong>桌面基线</strong> — 形式1、2 药丸触发器：13px（0.8125rem）、行高 1.25。形式1 菜单与形式2 列表：14px（0.875rem）、行高继承。形式3「到期」与芯片：13px（0.8125rem）、行高继承。<strong>移动端</strong>在保持三档比例一致前提下随视口微调（仍用 rem / 断点），与 PC 同一套形式对齐。
            </p>
          </div>
        </figure>
      </section>

      <section class="ds-spec-block" id="ds-search" aria-labelledby="ds-search-title">
        <h2 id="ds-search-title">搜索 · 工具栏</h2>
        <p class="ds-atom-prose" style="margin-bottom: 0.55rem; max-width: 44rem">
          <strong>形式1</strong>（<code>SearchForm1Fixed</code>）为<strong>圆角矩形</strong>（<code>var(--radius-md)</code>、灰描边），与历史控制台式 <code>or-keys-search</code> 一致；<strong>形式2</strong>（<code>SearchForm2Grow</code>）与
          <code>TrinityAI/app/chat/index.html</code> 侧栏 / 弹层 / 会话列表同为<strong>全圆角药丸</strong>（<code>border-radius: 9999px</code>），规则见 <code>packages/ui/styles/ui-kit.css</code> 中 <code>.orc-*-search</code> 与 <code>.or-keys-search.t-ui-search--grow</code>（<code>trinity-base.css</code> 会 <code>@import</code> 该文件）。二者均 <code>var(--ctrl-h)</code>、左放大镜 + <code>or-input or-keys-search-input</code>、轻 <code>box-shadow</code>；聚焦时 <code>.or-input.or-keys-search-input:focus</code> 为外环（形式1 失焦时仍有灰边）。
        </p>
        <p class="ds-ui-ref">
          <strong>@trinity/ui</strong>：<code>import { SearchForm1Fixed, SearchForm2Grow } from &quot;@trinity/ui&quot;</code> · 对 AI：「设计规范搜索形式1 / 形式2」→ <code>#ds-search</code>。
        </p>
        <figure class="ds-board">
          <div class="ds-board-canvas ds-board-canvas--app" style="overflow: visible">
            <div class="ds-app-filter-form">
              <p class="ds-app-filter-form-title">形式1 · 固定宽度（圆角矩形）</p>
              <p class="ds-ui-ref ds-ui-ref--tight">
                <strong>@trinity/ui</strong>：<code>SearchForm1Fixed</code> · <code>v-model</code> · 可选 <code>width</code>（默认 <code>17.5rem</code>）。
              </p>
              <div class="or-app-filter-row" style="flex-wrap: wrap; align-items: center; gap: 0.5rem">
                <SearchForm1Fixed v-model="designSpecSearchFixed" input-id="ds-spec-search-fixed" placeholder="固定宽搜索…" />
                <span class="ds-atom-prose" style="margin: 0; font-size: 0.75rem; color: var(--muted-2)">旁可接筛选药丸等</span>
              </div>
            </div>
            <div class="ds-app-filter-form">
              <p class="ds-app-filter-form-title">形式2 · 失焦按字数变宽；聚焦拉满（药丸 · 有最小 / 最大）</p>
              <p class="ds-ui-ref ds-ui-ref--tight">
                <strong>@trinity/ui</strong>：<code>SearchForm2Grow</code> · 失焦 <code>clamp</code>；聚焦用 <code>max-width</code> · <code>expand-on-focus</code>（默认 true）· <code>min-ch</code> / <code>max-ch</code> 等。
              </p>
              <div class="or-app-filter-row" style="flex-wrap: wrap; align-items: center; gap: 0.5rem">
                <SearchForm2Grow
                  v-model="designSpecSearchGrow"
                  input-id="ds-spec-search-grow"
                  placeholder="输入变长…"
                  :min-ch="10"
                  :max-ch="36"
                  min-width="9rem"
                />
              </div>
            </div>
          </div>
        </figure>
        <p class="ds-board-note" style="margin-top: 0.65rem">
          窄屏时外框仍受 <code>max-width: 100%</code> 与父级 flex 约束，避免溢出视口。
        </p>
      </section>

      <section class="ds-spec-block" id="ds-text-field" aria-labelledby="ds-text-field-title">
        <h2 id="ds-text-field-title">输入 · 带标签文本</h2>
        <p class="ds-atom-prose" style="margin-bottom: 0.55rem; max-width: 44rem">
          与弹窗表单里「名称 / 类型」同款排版：<strong>标签</strong>（<code>0.8125rem</code>、字重 <code>600</code>、<code>var(--muted)</code>）+ <strong>单行输入</strong>；输入框高度与搜索框一致（<code>var(--ctrl-h)</code>），圆角 <code>var(--radius-md)</code>；聚焦为 <code>border: 1px solid var(--blue)</code> + <code>box-shadow: 0 0 0 3px var(--blue-ring)</code>（与搜索、<code>textarea:focus</code> 一致）。
        </p>
        <p class="ds-ui-ref">
          <strong>@trinity/ui</strong>：<code>import { TextField1Labeled } from &quot;@trinity/ui&quot;</code> · 对 AI：「设计规范带标签文本输入」→ <code>#ds-text-field</code>。
        </p>
        <figure class="ds-board">
          <div class="ds-board-canvas ds-board-canvas--app" style="overflow: visible">
            <div class="ds-app-filter-form">
              <p class="ds-app-filter-form-title">形式1 · 标签 + 文本（与搜索同高）</p>
              <p class="ds-ui-ref ds-ui-ref--tight">
                <strong>@trinity/ui</strong>：<code>TextField1Labeled</code> · <code>v-model</code> · <code>label</code> · <code>input-id</code>（必填）· 可选 <code>placeholder</code>、<code>disabled</code>、<code>type</code>。
              </p>
              <div class="or-keys-editor-grid" style="max-width: 26rem">
                <TextField1Labeled v-model="designSpecTextName" label="名称" input-id="ds-spec-text-name" />
                <TextField1Labeled
                  v-model="designSpecTextType"
                  label="类型"
                  input-id="ds-spec-text-type"
                  placeholder="选填说明…"
                />
              </div>
            </div>
          </div>
        </figure>
      </section>

      <section class="ds-spec-block" id="ds-tabs" aria-labelledby="ds-tabs-title">
        <h2 id="ds-tabs-title">Tab · 切换</h2>
        <p class="ds-atom-prose" style="margin-bottom: 0.55rem; max-width: 44rem">
          与筛选、搜索<strong>同一行高</strong>（<code>var(--ctrl-h)</code>）。<strong>形式1</strong>为底边线指示当前项；<strong>形式2</strong>为浅底轨道 + 白色药丸高亮。选项数据为 <code>{ id, label, disabled? }[]</code>，与 <code>v-model</code> 绑定当前 <code>id</code>（字符串）。
        </p>
        <p class="ds-ui-ref">
          <strong>@trinity/ui</strong>：<code>import { TabSwitch1Underline, TabSwitch2Capsule, type TabSwitchItem } from &quot;@trinity/ui&quot;</code> · 对 AI：「设计规范 Tab 形式1 / 形式2」→ <code>#ds-tabs</code>。
        </p>
        <figure class="ds-board">
          <div class="ds-board-canvas ds-board-canvas--app" style="overflow: visible">
            <div class="ds-app-filter-form">
              <p class="ds-app-filter-form-title">形式1 · 普通切换（下划线）</p>
              <p class="ds-ui-ref ds-ui-ref--tight">
                <strong>@trinity/ui</strong>：<code>TabSwitch1Underline</code> · <code>v-model</code> · <code>tabs</code> · 可选 <code>tablist-label</code>、<code>label-id</code>。
              </p>
              <TabSwitch1Underline v-model="designSpecTabUnderline" :tabs="designSpecTabItems" tablist-label="侧栏切换示意" />
            </div>
            <div class="ds-app-filter-form">
              <p class="ds-app-filter-form-title">形式2 · 胶囊切换（轨道药丸）</p>
              <p class="ds-ui-ref ds-ui-ref--tight">
                <strong>@trinity/ui</strong>：<code>TabSwitch2Capsule</code> · 同上数据面。
              </p>
              <TabSwitch2Capsule v-model="designSpecTabCapsule" :tabs="designSpecTabItems" tablist-label="胶囊切换示意" />
            </div>
          </div>
        </figure>
      </section>

      <section class="ds-spec-block" id="ds-modal" aria-labelledby="ds-modal-title">
        <h2 id="ds-modal-title">弹窗 · 页面内对话层</h2>
        <p class="ds-atom-prose" style="margin-bottom: 0.5rem; max-width: 44rem">
          遮罩与卡片与对话「添加模型」同源（<code>--orc-modal-overlay-*</code>、<code>--orc-modal-card-*</code>）。结构上为<strong>三块</strong>：<strong>头部</strong>与<strong>底部</strong>对齐统一风格（类名与按钮规则见下）；<strong>中间</strong>为二者之间的内容槽，<strong>由业务自由编排</strong>（表单、列表、说明条等均可，不要求与示例同款栅格）。从上到下依次为：
        </p>
        <ol class="ds-atom-prose" style="margin: 0 0 0.75rem; padding-left: 1.25rem; max-width: 44rem; line-height: 1.55">
          <li style="margin-bottom: 0.4rem">
            <strong>头部</strong>（顶栏）：<code>ModalPanel</code> 内 <code>header</code> + <code>or-modal-head</code>：<strong>标题</strong>与<strong>关闭</strong>之间可插 <code>#headTrail</code>（如 <code>InternalHelpTip</code>，对内说明不占主排版）。<strong>对用户</strong>的顶栏下一行灰字用 <code>head-note</code>（下划线<strong>下方</strong>另起一行），不传则不渲染。更复杂的顶栏仍可直接手写 <code>orc-picker-modal-head</code> 等。
          </li>
          <li style="margin-bottom: 0.4rem">
            <strong>中间</strong>：<code>ModalPanel</code> 默认插槽；可含浅底说明条（<code>p.or-keys-editor-banner</code>）、表单、列表等，布局自定。
          </li>
          <li>
            <strong>底部</strong>（操作栏）：<code>#actions</code> 插槽；<strong>右下角</strong>对齐；次要 <code>TButton</code>、主路径 <code>TButton variant=&quot;gradient&quot;</code>（或等价类名）。<strong>仅文字</strong>，<strong>不加图标</strong>。
          </li>
        </ol>
        <p class="ds-ui-ref">
          <strong>@trinity/ui</strong>：<code>import { ModalPanel, InternalHelpTip, FilterForm2PillListbox, TButton } from &quot;@trinity/ui&quot;</code> — <code>ModalPanel</code>：<code>head-note</code> 可选（用户可见灰字，在顶栏线<strong>下</strong>）；顶栏内对内标注用 <code>#headTrail</code> + <code>InternalHelpTip</code>（见下画板）。详述见 <a href="#ds-internal-tip"><code>#ds-internal-tip</code></a>。遮罩与 <code>or-modal-root</code> 全屏层仍由页面组装。
        </p>
        <figure class="ds-board">
          <div class="ds-board-canvas ds-board-canvas--modal">
            <div class="ds-modal-scene-backdrop" aria-hidden="true"></div>
            <div class="ds-modal-scene-card-wrap">
              <ModalPanel
                title="示例弹窗"
                title-id="ds-spec-modal-title"
                close-label="关闭（示意）"
              >
                <template #headTrail>
                  <InternalHelpTip
                    title="head-note"
                    aria-label="关于顶栏 head-note 的对内说明"
                    layout="inline"
                  >
                    <p>顶栏下可选一行说明；不需要则省略 head-note。</p>
                  </InternalHelpTip>
                </template>
                <p class="or-keys-editor-banner" role="status">
                  中间区可再放浅底说明条（与控制台「编辑密钥」同款类名）。
                </p>
                <div class="or-keys-editor-grid">
                  <div class="form-group">
                    <label for="ds-spec-modal-name">名称</label>
                    <input id="ds-spec-modal-name" type="text" value="演示项" readonly tabindex="0" />
                  </div>
                  <div class="form-group">
                    <label for="ds-spec-modal-dd-btn">类型</label>
                    <FilterForm2PillListbox
                      wrap-id="ds-spec-modal-dd-wrap"
                      btn-id="ds-spec-modal-dd-btn"
                      panel-id="ds-spec-modal-dd-panel"
                      label-span-id="ds-spec-modal-dd-label"
                      listbox-aria-label="类型"
                      beak-x="1.35rem"
                      :items="designSpecModalTypeListboxItems"
                    />
                  </div>
                </div>
                <template #actions>
                  <TButton>取消</TButton>
                  <TButton variant="gradient">保存</TButton>
                </template>
              </ModalPanel>
            </div>
          </div>
        </figure>
        <p class="ds-board-note" style="margin-top: 0.65rem">
          画板内为静态示意；业务页使用 <code>or-modal-root</code> 全屏层、<code>body.or-modal-open</code> 等与产品一致（根层与遮罩等见 <code>packages/ui/styles/ui-kit.css</code>；<code>body.or-modal-open</code> 在 <code>assets/trinity-base.css</code>）。表单项内下拉与筛选<strong>形式 2</strong>相同（药丸 + listbox + ✓）。弹窗底栏按钮<strong>不加 SVG / 图标</strong>。
        </p>
      </section>

      <section class="ds-spec-block" id="ds-select-list" aria-labelledby="ds-select-list-title">
        <h2 id="ds-select-list-title">多选列表 · 形式1（模型行）</h2>
        <p class="ds-atom-prose" style="margin-bottom: 0.55rem; max-width: 44rem">
          纵向列表里多选；本节只约定<strong>容器</strong>与<strong>行</strong>的 DOM / 类名 / a11y，<strong>不绑业务</strong>。色、圆角、具体间距以 <code>packages/ui/styles/ui-kit.css</code>（经 <code>assets/trinity-base.css</code> 或 <code>@trinity/ui/styles/ui-base.css</code>）与下方画板为准。
        </p>
        <ul class="ds-atom-prose" style="margin: 0 0 0.75rem; padding-left: 1.15rem; max-width: 44rem; line-height: 1.55">
          <li style="margin-bottom: 0.35rem">
            <strong>列表容器</strong>：<code>div.orc-model-list</code>（<code>role="group"</code>，<code>aria-label</code> 概括用途）→ 内层 <code>div.orc-side-model-group</code>；集合多行外包 <code>orc-side-model-group--collection</code> 时与常规定距一致。
          </li>
          <li style="margin-bottom: 0.35rem">
            <strong>行（item）</strong>：用 <code>SelectListForm1ModelRow</code>（即 <code>button.orc-model-row.orc-model-row--compare</code>）；槽内顺序 <code>orc-pv</code> → <code>orc-model-row-name</code> → <code>orc-model-row-fav</code> → 已选时 <code>orc-model-row-mark</code>（✓）。<strong>收藏星</strong>点击须 <code>@click.stop</code>，避免触发行上的多选切换。
          </li>
          <li>
            <strong>选中 / 高亮</strong>：已选 <code>is-selected</code>，读屏 <code>aria-pressed</code> 为 true，并显示 ✓；可与主项 <code>is-active</code> 并存。
          </li>
        </ul>
        <p class="ds-ui-ref">
          <strong>@trinity/ui</strong>：行卡片 → <code>SelectListForm1ModelRow</code> ·
          <code>import { SelectListForm1ModelRow } from &quot;@trinity/ui&quot;</code> · 左侧图标/名称/收藏等仍用默认插槽；行壳 <code>orc-model-row*</code> 在 <code>packages/ui/styles/ui-kit.css</code>，品牌圆标等 <code>orc-pv*</code> 在 <code>TrinityAI/app/chat/chat-openrouter.css</code>；外层 <code>orc-model-list</code> 由页面组合。
        </p>
        <figure class="ds-board">
          <p class="ds-board-cap">画板 · 多选列表与行项（静态）</p>
          <div class="ds-board-canvas ds-board-canvas--app" style="max-width: 20rem">
            <div class="orc-model-list" role="group" aria-label="画板示意：可多选">
              <div class="orc-side-model-group orc-side-model-group--collection" role="presentation">
                <SelectListForm1ModelRow :selected="true" :active="true" tabindex="-1">
                  <span class="orc-pv orc-pv--google" aria-hidden="true"></span>
                  <span class="orc-model-row-name">Gemini 3.1 Flash Lite</span>
                  <span class="orc-model-row-fav" aria-hidden="true">★</span>
                  <span class="orc-model-row-mark" aria-hidden="true">✓</span>
                </SelectListForm1ModelRow>
                <SelectListForm1ModelRow :selected="true" :active="false" tabindex="-1">
                  <span class="orc-pv orc-pv--openai" aria-hidden="true"></span>
                  <span class="orc-model-row-name">GPT-5.4</span>
                  <span class="orc-model-row-fav" aria-hidden="true">☆</span>
                  <span class="orc-model-row-mark" aria-hidden="true">✓</span>
                </SelectListForm1ModelRow>
                <SelectListForm1ModelRow :selected="false" :active="false" tabindex="-1">
                  <span class="orc-pv orc-pv--anthropic" aria-hidden="true"></span>
                  <span class="orc-model-row-name">Claude 4 Sonnet</span>
                  <span class="orc-model-row-fav" aria-hidden="true">☆</span>
                  <span class="orc-model-row-mark" aria-hidden="true"></span>
                </SelectListForm1ModelRow>
              </div>
            </div>
          </div>
        </figure>
        <p class="ds-board-note" style="margin-top: 0.65rem">
          画板为静态示意；不含侧栏顶栏等周边。与 prose 不一致时以 <code>ui-kit.css</code> / 对话页补充样式与画板 DOM 为准。
        </p>
      </section>

      <section class="ds-spec-block" id="ds-internal-tip" aria-labelledby="ds-internal-tip-title">
        <h2 id="ds-internal-tip-title">标注 · 对内说明（ⓘ）</h2>
        <p class="ds-atom-prose" style="margin-bottom: 0.65rem; max-width: 44rem">
          仅供<strong>内部 / 原型</strong>：与 <code>TrinityAI/app/chat/index.html</code> 的 <code>orc-help-tip-btn</code> 同源，触发器占约 <strong>24×24px</strong>，说明在 <strong><code>fixed</code> 气泡</strong>（<code>Teleport</code> 到 <code>body</code>），<strong>不撑开主排版</strong>。<code>ModalPanel</code> 顶栏内请用 <code>#headTrail</code> 挂载；<strong>对用户</strong>的顶栏<strong>下</strong>一行灰字仍用 <code>head-note</code>，勿把对内长说明塞进 <code>head-note</code>。
        </p>
        <p class="ds-atom-prose" style="margin: -0.15rem 0 0.6rem; font-size: 0.8125rem; color: var(--muted); line-height: 1.45; max-width: 44rem">
          根节点带 <code>data-trinity-internal-annotation</code>，上线前可脚本批量剥离。属性：<code>title</code>（气泡标题）、<code>aria-label</code>、<code>layout</code> = <code>inline</code> | <code>float</code> | <code>dock</code>（后两者要求父级 <code>position: relative</code> 等定位上下文）。
        </p>
        <p class="ds-ui-ref">
          <strong>@trinity/ui</strong>：<code>import { InternalHelpTip } from &quot;@trinity/ui&quot;</code> · 兼容 <code>TInternalHelpTip</code>。对 AI：「设计规范对内标注 / ⓘ」→ 对齐本小节 <code>#ds-internal-tip</code>。
        </p>
        <figure class="ds-board">
          <p class="ds-board-cap">画板 · InternalHelpTip（点 ⓘ 打开说明）</p>
          <div class="ds-board-canvas ds-board-canvas--app" style="display: flex; flex-direction: column; gap: 1rem; overflow: visible">
            <div>
              <p class="ds-app-filter-form-title">layout=&quot;inline&quot; · 与标题同一行</p>
              <div class="ds-internal-tip-demo-row">
                <span style="font-weight: 600">示例标题</span>
                <InternalHelpTip title="inline 示意" aria-label="inline 对内说明" layout="inline">
                  <p>与标题并排，仅占小圆钮宽度；气泡锚在按钮附近。</p>
                </InternalHelpTip>
              </div>
            </div>
            <div>
              <p class="ds-app-filter-form-title">layout=&quot;float&quot; · 角标（父级需定位）</p>
              <div class="ds-internal-tip-demo-float-host">
                <p style="margin: 0; font-size: 0.8125rem; color: var(--muted)">卡片内容区；右上角 ⓘ 不占文档流。</p>
                <InternalHelpTip title="float 示意" aria-label="float 对内说明" layout="float">
                  <p>与对话页弹窗标题旁 ⓘ 一致，<code>position: absolute</code> 角标。</p>
                </InternalHelpTip>
              </div>
            </div>
            <div>
              <p class="ds-app-filter-form-title">layout=&quot;dock&quot; · 右下角（父级需定位）</p>
              <div class="ds-internal-tip-demo-dock-host">
                <p style="margin: 0; font-size: 0.8125rem; color: var(--muted)">模拟底栏区域</p>
                <InternalHelpTip title="dock 示意" aria-label="dock 对内说明" layout="dock">
                  <p>与对话页右下角全页说明 ⓘ 同源。</p>
                </InternalHelpTip>
              </div>
            </div>
          </div>
        </figure>
        <p class="ds-board-note" style="margin-top: 0.65rem">
          若气泡贴边或高度被裁，检查视口与父级 <code>overflow</code>；触发器本身在画板内，气泡在 <code>body</code> 下为 <code>fixed</code>。
        </p>
      </section>

      <section class="ds-spec-block" id="ds-buttons" aria-labelledby="ds-buttons-title">
        <h2 id="ds-buttons-title">按钮原子</h2>
        <p class="ds-atom-prose" style="margin-bottom: 0.65rem">
          <strong>主渐变</strong>表示高成本/主路径，<strong>线框</strong>表示可反悔或次要操作，<strong>文字链</strong>表示跳转学习；色跟 <code>--grad</code> 与全局 ring。下表为仓库类名。
        </p>
        <p class="ds-one">悬停列为本页示意类。</p>
        <p class="ds-ui-ref">
          <strong>@trinity/ui</strong>：线框 / 主渐变主按钮 → <code>TButton</code>；正文弱链 → <code>TextLink</code> ·
          <code>import { TButton, TextLink } from &quot;@trinity/ui&quot;</code>。下表其余为仓库 <code>.btn</code> / <code>.or-*</code> 类名示意，新页优先用 ui 或择一对齐，避免多套分叉。
        </p>

        <div class="ds-btn-mat">
          <div
            class="ds-btn-block"
            style="margin-bottom: 0.75rem; border: 1px dashed var(--border); border-radius: var(--radius-lg); padding: 0.65rem"
          >
            <p class="ds-btn-type">@trinity/ui 对照</p>
            <p class="ds-btn-meta">与上表仓库类名并行展示，便于对照迁移。</p>
            <div class="ds-btn-states" style="margin-top: 0.5rem">
              <div class="ds-btn-state">
                <TButton>线框</TButton><span>TButton</span>
              </div>
              <div class="ds-btn-state">
                <TButton variant="gradient">主渐变</TButton><span>TButton gradient</span>
              </div>
            </div>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">主要 · 渐变</p>
              <p class="ds-btn-meta">.btn.btn-gradient · 高 36px（<code>--ctrl-h</code>）· 例：<code>or-keys-btn-create</code>、<code>or-credits-btn-recharge</code></p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state">
                <button type="button" class="btn btn-gradient">主要</button>
                <span>默认</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="btn btn-gradient ds-spec--grad-hover" tabindex="-1">主要</button>
                <span>悬停</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="btn btn-gradient" disabled>主要</button>
                <span>禁用</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              全局<strong>主 CTA</strong>，用 <code>--grad</code> / <code>--grad-hover</code> 固定品牌。禁用用透明度，提示接入方应解释不可用原因。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">主要 · 顶栏胶囊</p>
              <p class="ds-btn-meta">.btn.btn-gradient.or-login-pill · 高 36px（<code>--ctrl-h</code>）· 圆角 9999px</p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state">
                <button type="button" class="btn btn-gradient or-login-pill">登录</button>
                <span>默认</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="btn btn-gradient or-login-pill ds-spec--grad-hover" tabindex="-1">登录</button>
                <span>悬停</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              顶栏登录用<strong>满药丸</strong>与内容区 8px 主按钮区分层级。高度与筛选药丸同为 <code>--ctrl-h</code>（36px），触控区一致。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">次要 · 线框</p>
              <p class="ds-btn-meta">.btn（无 gradient）· 高 36px（<code>--ctrl-h</code>）· 灰字描边</p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state">
                <button type="button" class="btn">次要</button>
                <span>默认</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="btn ds-spec--muted-hover" tabindex="-1">次要</button>
                <span>悬停</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="btn" disabled>次要</button>
                <span>禁用</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              灰字线框<strong>退后半步</strong>，与主渐变并排时一眼分得清主次。适合取消或次要提交。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">控制台线框</p>
              <p class="ds-btn-meta">.or-btn-outline · 用量/活动日期等</p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state">
                <button type="button" class="or-btn-outline">线框</button>
                <span>默认</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="or-btn-outline ds-spec--outline-hover" tabindex="-1">线框</button>
                <span>悬停</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="or-btn-outline" disabled>线框</button>
                <span>禁用</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              控制台里的<strong>日期、次要操作</strong>，比纯文字略实体，但不抢主 CTA。字重略低，和创建密钥等主按钮拉开。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">危险线框</p>
              <p class="ds-btn-meta">.or-btn-outline.is-danger</p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state">
                <button type="button" class="or-btn-outline is-danger">删除</button>
                <span>默认</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="or-btn-outline is-danger" style="background: #fef2f2; border-color: #f87171" tabindex="-1">删除</button>
                <span>悬停</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              删改等<strong>不可逆</strong>动作用红字线框提示风险，不用默认实心红块。仍应配合二次确认。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">图标格</p>
              <p class="ds-btn-meta">.or-icon-btn · 32×32</p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state">
                <button type="button" class="or-icon-btn" aria-label="设置">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                </button>
                <span>默认</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="or-icon-btn ds-spec--icon-hover" tabindex="-1" aria-label="设置">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                </button>
                <span>悬停</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              <strong>32px</strong> 工具格：刷新、设置等，默认透明减噪。不适合当唯一主路径。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">OAuth 行</p>
              <p class="ds-btn-meta">.or-oauth-btn · 高 44px · 登录弹窗</p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state" style="flex: 1; min-width: 8rem; max-width: 14rem">
                <button type="button" class="or-oauth-btn" style="width: 100%">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#94a3b8" /></svg>
                  OAuth
                </button>
                <span>默认</span>
              </div>
              <div class="ds-btn-state" style="flex: 1; min-width: 8rem; max-width: 14rem">
                <button type="button" class="or-oauth-btn ds-spec--oauth-hover" style="width: 100%" tabindex="-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#94a3b8" /></svg>
                  OAuth
                </button>
                <span>悬停</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              <strong>44px</strong> 给第三方图标与点击把握；并排 OAuth 等分宽度。中性底，品牌色交给各商图标。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">抽屉整宽</p>
              <p class="ds-btn-meta">.or-drawer-signin · 移动菜单</p>
            </div>
            <div class="ds-btn-states" style="flex: 1; max-width: 20rem">
              <div class="ds-btn-state" style="width: 100%">
                <button type="button" class="or-drawer-signin" style="width: 100%">登录</button>
                <span>默认</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              窄屏抽屉里的<strong>整宽登录</strong>，线框表示「进门」，不与内容区「创建资源」混淆。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">文字链接</p>
              <p class="ds-btn-meta">a.text-link · 无框</p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state" style="align-items: flex-start; min-width: auto">
                <TextLink href="#">查看详情</TextLink>
                <span>默认</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              正文里<strong>弱跳转</strong>，不占按钮体积。要强引导请改成线框或主渐变按钮。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">后台 · 线框主色</p>
              <p class="ds-btn-meta">a.adm-btn-logout / button.adm-btn-logout · admin-buttons.css</p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state">
                <a href="#" class="adm-btn-logout" @click.prevent>退出登录</a>
                <span>默认</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              后台<strong>身份类</strong>操作：蓝描边白底，与侧栏工作蓝同一系。类名单独 <code>adm-*</code>，避免和门户混写。
            </p>
          </div>

          <div class="ds-btn-block">
          <div class="ds-btn-row">
            <div>
              <p class="ds-btn-type">筛选条 · 渐变主操作</p>
              <p class="ds-btn-meta">.or-app-filter-more · 筛选形式1</p>
            </div>
            <div class="ds-btn-states">
              <div class="ds-btn-state">
                <button type="button" class="or-app-filter-more">
                  更多
                  <svg class="or-app-filter-more-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <span>默认</span>
              </div>
              <div class="ds-btn-state">
                <button type="button" class="or-app-filter-more ds-spec--filter-more-hover" tabindex="-1">
                  更多
                  <svg class="or-app-filter-more-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <span>悬停</span>
              </div>
            </div>
          </div>
            <p class="ds-atom-prose">
              对应筛选节<strong>形式1</strong>：行内低频主操作 + 渐变，与形式2/3 的灰白控件拉开层次。
            </p>
          </div>
        </div>
        <p class="ds-board-note" style="margin-top: 0.75rem">按压态与产品内 :active 一致；未单独做列以免与悬停混淆。</p>
      </section>

  </main>
</template>
