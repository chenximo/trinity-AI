<script setup lang="ts">
/**
 * 用户后台 · 规范（条文 + 内联样例，单页阅读）。
 */
import "@trinity-ai/views/account/account.css";
import LayoutSpecCallout from "./console-sample/LayoutSpecCallout.vue";
import TableSpecCallout from "./console-sample/TableSpecCallout.vue";
import SpecHubCrossNav from "../_shared/SpecHubCrossNav.vue";
import "../_shared/spec-hub-chrome.css";
import "./user-console-spec-guide.css";
</script>

<template>
  <div class="spec-hub spec-hub--doc-only user-console-spec-guide">
    <header class="spec-hub__bar" aria-label="用户后台规范">
      <div class="spec-hub__bar-inner">
        <RouterLink to="/design-tokens" class="spec-hub__back">← 设计枢纽</RouterLink>
        <SpecHubCrossNav />
        <h1 class="spec-hub__title">用户后台 · 规范</h1>
        <p class="spec-hub__note">
          路由 <code>/user-console-spec</code> · Agent 读 <code>trinity-user-console</code> Skill · 完整交互
          <a href="/trinity-ai/account/console">/trinity-ai/account/console</a>
        </p>
      </div>
    </header>

    <main class="spec-hub__main">
      <p class="user-console-spec-guide__intro">
        <strong>唯一示范</strong>：§2 主列样例（API 密钥全流程）代表用户后台统一风格；§3 仅为<strong>同一风格</strong>下操作列两种分支（&lt;4 按钮 / ≥4 ⋮），不是第二套界面。
        Agent 先读 <code>trinity-user-console</code> Skill，再对照本节样例。控件 <RouterLink to="/design-spec">/design-spec</RouterLink>。
      </p>
      <p class="user-console-spec-guide__status" role="note">
        <span class="user-console-spec-guide__status-title">唯一整页示范</span>
        若需第二个全屏示范才能说清风格，说明尚未统一——应收敛到本页 §2。产品 <code>#preset</code>、<code>#logs</code> 等对齐
        <a href="#spec-sample-main"><code>#spec-sample-main</code></a> 即可。
      </p>
      <p id="uc-spec-note-col-layout" class="user-console-spec-guide__status" role="note">
        <span class="user-console-spec-guide__status-title">自适应表头与列宽 · UC-TBL-COL-01</span>
        列表表使用 <code>table.data-table { width: 100% }</code>、默认 <code>table-layout: auto</code>（按内容与少量 min/max 分栏，<strong>表头不设独立宽度</strong>）。
        外框 <code>.table-wrap { overflow-x: auto }</code>。禁止在常规列表上 <code>table-layout: fixed</code> + 全列百分比 / <code>colgroup</code> 锁死列宽。验收见
        <a href="#spec-sample-main"><code>#spec-sample-main</code></a> 内表格；条文见 §3。
      </p>

      <section class="user-console-spec-guide__section" aria-labelledby="uc-spec-blue-index-h">
        <h2 id="uc-spec-blue-index-h" class="user-console-spec-guide__h2">重要规范索引（蓝条）</h2>
        <p class="user-console-spec-guide__intro" style="margin-bottom: 0.5rem">
          下列与页内蓝条一一对应；缺项即待补规范。Agent 真源仍为 Skill 规则 ID。
        </p>
        <ul class="user-console-spec-guide__status-index">
          <li><a href="#uc-spec-note-col-layout">UC-TBL-COL-01</a> · 自适应表头与列宽（页顶蓝条）</li>
          <li><a href="#spec-sample-main">UC-SHELL / UC-MAIN-*</a> · 唯一整页示范（§2 样例）</li>
          <li><a href="#uc-spec-note-pagehead-layout">UC-MAIN-HEAD-01</a> · 页头：左标题+下说明ⓘ / 右筛选·按钮（§2 蓝条）</li>
          <li><a href="#uc-spec-note-lead-tip">UC-MAIN-03</a> · ⓘ 紧跟说明小标题（§2 蓝条）</li>
          <li><a href="#uc-spec-note-search">UC-MAIN-04</a> · 搜索 <code>SearchForm1Fixed</code>（§2 蓝条）</li>
          <li><a href="#uc-spec-note-tbl-align">UC-TBL-ALIGN-*</a> · 全表左对齐（§3 蓝条）</li>
          <li><a href="#spec-sample-table-actions-buttons">UC-TBL-OPS-01</a> · 操作 &lt;4 横排（§3 样例）</li>
          <li><a href="#spec-sample-table-actions-menu">UC-TBL-OPS-02</a> · 操作 ≥4 ⋮（§3 样例）</li>
        </ul>
      </section>

      <LayoutSpecCallout />
      <TableSpecCallout />

      <section class="user-console-spec-guide__section" aria-labelledby="uc-guide-ia-h">
        <h2 id="uc-guide-ia-h" class="user-console-spec-guide__h2">信息架构（Trinity AI Account）</h2>
        <table class="user-console-spec-guide__table">
          <thead>
            <tr>
              <th>侧栏分组</th>
              <th>hash</th>
              <th>表格类型</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>API 管理</td>
              <td><code>#keys</code>、<code>#preset</code></td>
              <td>表头风格统一（类名可不同）；操作 &lt;4 / ≥4</td>
            </tr>
            <tr>
              <td>账户</td>
              <td><code>#credits</code> …</td>
              <td>见产品原型</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="user-console-spec-guide__section" aria-labelledby="uc-guide-links-h">
        <h2 id="uc-guide-links-h" class="user-console-spec-guide__h2">入口</h2>
        <ul class="spec-hub__links">
          <li>
            <strong>完整原型</strong>：
            <a href="/trinity-ai/account/console">/trinity-ai/account/console</a>
            （<a href="/trinity-ai/account/console#keys">#keys</a> ·
            <a href="/trinity-ai/account/console#preset">#preset</a>）
          </li>
          <li>
            <strong>AI 云用户中心</strong>（B 列表表 · 多云账号）：
            <a href="/ai-cloud/account/console#accounts">/ai-cloud/account/console#accounts</a>
          </li>
          <li>
            文档：
            <code>docs/03-用户后台管理系统/用户后台管理风格统一规范.md</code>、
            <code>用户控制台-布局与样式规范.md</code> §4
          </li>
          <li>工程母版：<code>apps/trinity-ai/src/views/account/</code></li>
        </ul>
      </section>

      <p class="user-console-spec-guide__cta">
        <a href="/trinity-ai/account/console#keys" class="btn btn-gradient">打开完整控制台 →</a>
      </p>
    </main>
  </div>
</template>
