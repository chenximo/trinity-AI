<script setup lang="ts">
import "../user-console-spec-guide.css";
import KeysPanelSample from "./KeysPanelSample.vue";
import ShellLayoutSample from "./ShellLayoutSample.vue";
import SpecSampleFrame from "./SpecSampleFrame.vue";
</script>

<template>
  <details id="spec-1-layout" class="user-console-spec-block user-console-layout-spec" open>
    <summary class="user-console-spec-block__sum">1 · 整体布局（顶栏 + 左栏 + 主列）</summary>
    <div class="user-console-spec-block__body">
      <p class="user-console-spec-block__lead user-console-spec-block__lead--agent">
        <strong>UC-SHELL-01</strong> · 规则见 Skill <code>trinity-user-console</code>。产品顶栏在
        <code>TrinityAiShellLayout</code>；控制台内左栏 + 主列，无整页页脚。
      </p>

      <pre class="user-console-spec-diagram" aria-label="DOM 层级示意">产品壳 header.or-inject          ← 品牌、主导航、登录态（非 account 页内）
└─ main#main
   └─ .account-console-root
      └─ .or-shell
         ├─ aside.or-side          ← 220px · --surface · 分组标题 + .or-dash-nav
         └─ .or-main               ← --bg · 下面 2～5 为单面板内容</pre>

      <table class="user-console-spec-block__matrix">
        <thead>
          <tr>
            <th scope="col">区域</th>
            <th scope="col">类名 / 职责</th>
            <th scope="col">说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>顶栏</strong></td>
            <td><code>header.or-inject</code></td>
            <td>全站；控制台路由仍保留顶栏，不占 <code>.or-main</code> 内</td>
          </tr>
          <tr>
            <td><strong>左栏</strong></td>
            <td><code>aside.or-side</code> · <code>.or-side-heading</code> · <code>a.or-dash-nav</code></td>
            <td>分组：工作区 / 账户 / 产品（外链）；当前项 <code>.is-active</code>；hash 与 <code>data-or-panel</code> 对齐</td>
          </tr>
          <tr>
            <td><strong>主列</strong></td>
            <td><code>.or-main</code></td>
            <td>单面板自上而下：面包屑 → 页头 → 搜索（可选）→ 表格 → 摘要（可选）</td>
          </tr>
        </tbody>
      </table>

      <ShellLayoutSample />
    </div>
  </details>

  <details id="spec-2-main" class="user-console-spec-block user-console-main-spec" open>
    <summary class="user-console-spec-block__sum">2 · 主列内容区（以 API 密钥 #keys 为范本）</summary>
    <div class="user-console-spec-block__body">
      <p class="user-console-spec-block__lead">
        <strong>全站只认一个示范</strong>：本节样例（<code>#keys</code> 主列五步）。角色、用量、AI 云账号等面板<strong>统一此风格</strong>，类名可不同（如 <code>or-log-pagehead</code>），勿再单独做第二套「示范页」。
        完整交互：<a href="/trinity-ai/account/console#keys">/trinity-ai/account/console#keys</a>。
      </p>

      <p id="uc-spec-note-pagehead-layout" class="user-console-spec-guide__status" role="note">
        <span class="user-console-spec-guide__status-title">页头左右分区 · UC-MAIN-HEAD-01</span>
        <strong>左</strong>：上行 <code>h1</code> 标题，下行 <code>.or-*-lead-row</code> 标注说明 + 小圆钮 ⓘ（见 UC-MAIN-03）。<strong>右</strong>：与标题<strong>同一行</strong>的
        <code>.or-*-title-actions</code>（形式 2 筛选在左、<code>btn-gradient</code> 主按钮在最右）。说明行在标题行下方全宽，勿与右侧工具挤成一行。
        验收：<a href="#spec-sample-main"><code>#spec-sample-main</code></a> 页头 DOM。
      </p>

      <pre class="user-console-spec-diagram" aria-label="页头分区示意">┌─ header.or-keys-pagehead ─────────────────────────────────────┐
│  .or-keys-title-row          [ 筛选形式2 ]  [ btn-gradient ] │  ← 右：工具贴标题行
│  h1  API 密钥                                                 │  ← 左：标题
│  .or-keys-lead-row                                            │
│  p.or-lead …小标题… ( ⓘ )                                     │  ← 左：说明 + 圆钮（在标题下方）
└──────────────────────────────────────────────────────────────┘</pre>

      <p id="uc-spec-note-lead-tip" class="user-console-spec-guide__status" role="note">
        <span class="user-console-spec-guide__status-title">ⓘ 位置 · UC-MAIN-03</span>
        对内说明圆钮放在说明行<strong>小标题文案之后</strong>（样例：「仅在创建时展示一次」→ <code>details.or-keys-info</code>），勿贴 <code>h1</code>、勿放说明行最右端。
      </p>

      <ol class="user-console-main-spec__steps">
        <li>
          <strong>面包屑</strong>
          <code>nav.or-crumb</code>
          <span class="user-console-main-spec__ex">Trinity AI / API 密钥</span>
        </li>
        <li>
          <strong>页头</strong> <code>header.or-keys-pagehead</code>（<strong>UC-MAIN-HEAD-01</strong>：左标题+下说明ⓘ / 右筛选·按钮）
          <ul>
            <li>
              <strong>标题行</strong> <code>.or-keys-title-row</code> — 左 <code>h1</code>；右 <code>.or-keys-title-actions</code>（UC-MAIN-02）
            </li>
            <li>
              <strong>说明行</strong> <code>.or-keys-lead-row</code> — 标题行<strong>下方</strong>；<code>p.or-lead</code> + 小标题后 ⓘ（UC-MAIN-03）
            </li>
          </ul>
        </li>
        <li>
          <strong>搜索</strong>（可选）
          <code>.or-keys-toolbar</code> → <code>@trinity/ui</code> <code>SearchForm1Fixed</code>（形式1 · 固定宽，默认 <code>17.5rem</code>）
        </li>
        <li>
          <strong>表格</strong>
          <code>.table-wrap</code> + <code>.data-table</code>（<strong>UC-TBL-COL-01</strong> 自适应列宽 · 左对齐见样例；操作列见 §3）
        </li>
        <li>
          <strong>条数摘要</strong>（可选）
          <code>p.or-keys-summary</code>，如「2 个密钥」
        </li>
      </ol>

      <table class="user-console-spec-block__matrix">
        <thead>
          <tr>
            <th scope="col">块</th>
            <th scope="col">DOM</th>
            <th scope="col">要点</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>面包屑</td>
            <td><code>nav.or-crumb</code></td>
            <td>首链产品名（<code>RouterLink</code> 或 <code>a</code>），<code>/</code> 分隔，末段当前面板名（纯文本）</td>
          </tr>
          <tr>
            <td>页头分区</td>
            <td><code>header.or-*-pagehead</code></td>
            <td>两行：标题行（左标题/右工具）+ 说明行（下）；见蓝条 <a href="#uc-spec-note-pagehead-layout">UC-MAIN-HEAD-01</a></td>
          </tr>
          <tr>
            <td>标题</td>
            <td><code>h1.or-page-title</code></td>
            <td>位于标题行左侧；ⓘ 不在此行</td>
          </tr>
          <tr>
            <td>说明 + ⓘ</td>
            <td><code>p.or-lead</code> · <code>details.or-keys-info</code></td>
            <td>ⓘ 紧跟小标题「仅在创建时展示一次」后（规范样例用 <code>user-console-spec-lead-*</code> 排版）；展开 <code>.or-keys-info-panel</code></td>
          </tr>
          <tr>
            <td>右侧工具</td>
            <td><code>.or-keys-title-actions</code></td>
            <td>筛选（<code>or-app-filter-dd-wrap</code>）+ 主 CTA；B 列表表可在 <code>or-preset-title-actions</code> 放多个线框按钮</td>
          </tr>
          <tr>
            <td>搜索</td>
            <td><code>SearchForm1Fixed</code></td>
            <td><code>import { SearchForm1Fixed } from &quot;@trinity/ui&quot;</code>；对齐 <RouterLink to="/design-spec#ds-search">/design-spec#ds-search</RouterLink> 形式1；勿手写 <code>label.or-keys-search</code> 药丸搜索</td>
          </tr>
        </tbody>
      </table>

      <p id="uc-spec-note-search" class="user-console-spec-guide__status" role="note">
        <span class="user-console-spec-guide__status-title">搜索 · UC-MAIN-04</span>
        主列/toolbar 搜索统一 <code>@trinity/ui</code> <code>SearchForm1Fixed</code>（形式1 · 固定宽，默认 <code>17.5rem</code>），对齐
        <RouterLink to="/design-spec#ds-search">/design-spec#ds-search</RouterLink>。勿用药丸 <code>SearchForm2Grow</code> 或手写 <code>label.or-keys-search</code>。
      </p>

      <SpecSampleFrame
        id="spec-sample-main"
        caption="样例 · 主列五步（面包屑 → 页头 → 搜索 → 表格 → 摘要）· DOM 可复制"
      >
        <div class="or-main user-console-spec-sample__main-inline">
          <KeysPanelSample />
        </div>
      </SpecSampleFrame>
    </div>
  </details>
</template>
