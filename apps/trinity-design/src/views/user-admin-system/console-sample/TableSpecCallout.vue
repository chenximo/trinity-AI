<script setup lang="ts">
import "../user-console-spec-guide.css";
import ListTableOpsMenuSample from "./ListTableOpsMenuSample.vue";
import PresetPanelSample from "./PresetPanelSample.vue";
import SpecSampleFrame from "./SpecSampleFrame.vue";

withDefaults(
  defineProps<{
    active?: "keys" | "preset" | "list";
  }>(),
  { active: undefined }
);
</script>

<template>
  <details id="spec-3-table" class="user-console-spec-block user-console-table-spec" open>
    <summary class="user-console-spec-block__sum">3 · 列表表格 · 表头与操作列</summary>
    <div class="user-console-spec-block__body">
      <p class="user-console-spec-block__lead user-console-spec-block__lead--agent">
        <strong>表格风格只有一个</strong>：扁平表头、全表左对齐在
        <a href="#spec-sample-main">§2 主列样例</a>（<code>#spec-sample-main</code>）内表格验收
        <code>UC-TBL-HEAD-01</code> / <code>UC-TBL-ALIGN-01</code>。§3 下方<strong>仅两块</strong>操作列分叉（&lt;4 横排 vs ≥4 ⋮），不是第二套界面。
        规则 ID 见 Skill <code>trinity-user-console</code>。
      </p>

      <p id="uc-spec-note-tbl-align" class="user-console-spec-guide__status" role="note">
        <span class="user-console-spec-guide__status-title">表头扁平 + 全表左对齐 · UC-TBL-HEAD-01 / UC-TBL-ALIGN-01</span>
        表头与数据列同一套自适应分栏（<a href="#uc-spec-note-col-layout">UC-TBL-COL-01</a>）。禁止 <code>or-keys-th-center</code> / 渐变表头。样例表在
        <a href="#spec-sample-main"><code>#spec-sample-main</code></a>。
      </p>

      <p class="user-console-spec-guide__status" role="note">
        <span class="user-console-spec-guide__status-title">操作列二选一 · UC-TBL-OPS-01 / 02</span>
        行内主操作 &lt;4 → 线框横排；≥4 → ⋮。禁止窄列 <code>or-keys-th-actions</code> 挡线框、禁止同一行混用。下方两块样例仅验操作分支。
      </p>

      <table class="user-console-spec-block__matrix user-console-spec-block__matrix--agent">
        <thead>
          <tr>
            <th scope="col">规则 ID</th>
            <th scope="col">必达 / 禁止</th>
          </tr>
        </thead>
        <tbody>
          <tr class="is-highlight">
            <td><code>UC-TBL-COL-01</code></td>
            <td>
              <strong>必达</strong>：<code>table.data-table</code> 宽 <code>100%</code>；默认 <code>table-layout: auto</code>；
              <code>th</code>/<code>td</code> 同列按内容自适应；<code>.table-wrap { overflow-x: auto }</code>。<br />
              <strong>允许</strong>：个别列 <code>min-width</code> / <code>max-width</code>（例 <code>.or-keys-col-key</code>）。<br />
              <strong>禁止</strong>：常规列表 <code>table-layout: fixed</code> + 全表百分比锁列；JS 量宽分列（宽表滚动场景除外）。
            </td>
          </tr>
          <tr class="is-highlight">
            <td><code>UC-TBL-ALIGN-01</code><br /><code>UC-TBL-ALIGN-02</code></td>
            <td>
              <strong>必达</strong>：全部 <code>th</code>、数据 <code>td</code> 左对齐。<br />
              <strong>禁止</strong>：<code>or-keys-th-center</code>、<code>or-keys-col-center</code>。
            </td>
          </tr>
          <tr>
            <td><code>UC-TBL-HEAD-01</code><br /><code>UC-TBL-WRAP-01</code></td>
            <td>
              <strong>必达</strong>：扁平 <code>.data-table th</code>；<code>table-wrap</code> 外框。<br />
              <strong>禁止</strong>：渐变表头（旧 <code>or-preset-table</code> 气质）。
            </td>
          </tr>
          <tr :class="{ 'is-highlight': active === 'preset' || active === 'list' }">
            <td><code>UC-TBL-OPS-01</code><br /><code>UC-TBL-OPS-03</code></td>
            <td>
              <strong>必达</strong>：主操作 &lt; 4 → <code>or-preset-actions</code> 横排、左对齐。<br />
              <strong>禁止</strong>：线框列使用 <code>or-keys-th-actions</code>（窄列致竖排）。
            </td>
          </tr>
          <tr :class="{ 'is-highlight': active === 'keys' }">
            <td><code>UC-TBL-OPS-02</code><br /><code>UC-TBL-OPS-04</code></td>
            <td>
              <strong>必达</strong>：主操作 ≥ 4 → <code>or-keys-ops</code> ⋮。<br />
              <strong>禁止</strong>：同一行混用横排线框与 ⋮。
            </td>
          </tr>
        </tbody>
      </table>
      <p class="user-console-spec-block__skill-ref">
        类名示例、母版路径、完整清单 →
        <code>.cursor/skills/trinity-user-console/SKILL.md</code> 附录 A、§5。
      </p>

      <SpecSampleFrame
        id="spec-sample-table-actions-buttons"
        caption="验收 · UC-TBL-OPS-01（&lt; 4 线框横排）"
      >
        <div class="or-main user-console-spec-sample__main-inline">
          <PresetPanelSample fragment="table" />
        </div>
      </SpecSampleFrame>

      <SpecSampleFrame
        id="spec-sample-table-actions-menu"
        caption="验收 · UC-TBL-OPS-02（≥ 4 ⋮）"
      >
        <div class="or-main user-console-spec-sample__main-inline">
          <ListTableOpsMenuSample />
        </div>
      </SpecSampleFrame>

      <ul class="user-console-spec-block__refs">
        <li>Skill：<code>trinity-user-console</code></li>
        <li>
          完整交互：
          <a href="/trinity-ai/account/console#keys">#keys</a> ·
          <a href="/trinity-ai/account/console#preset">#preset</a>
        </li>
      </ul>
    </div>
  </details>
</template>
