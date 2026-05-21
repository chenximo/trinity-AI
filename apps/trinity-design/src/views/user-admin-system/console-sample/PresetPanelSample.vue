<script setup lang="ts">
/** 角色管理区样例 · 对齐 account/console#preset 列表表 */
withDefaults(
  defineProps<{
    /** full：页头 + 表；table：仅 B 列表表（§3） */
    fragment?: "full" | "table";
  }>(),
  { fragment: "full" }
);
</script>

<template>
  <section
    data-or-panel="preset"
    id="or-panel-preset-sample"
    class="or-preset-page user-console-spec-sample__panel"
    :class="{ 'user-console-spec-sample__panel--table-only': fragment === 'table' }"
  >
    <template v-if="fragment === 'full'">
      <nav class="or-crumb" aria-label="面包屑">
        <a href="/trinity-ai">Trinity AI</a>
        <span aria-hidden="true"> / </span>
        <span>角色管理</span>
      </nav>

      <header class="or-preset-pagehead">
        <div class="or-preset-title-row">
          <h1 class="or-page-title or-preset-page-title">角色管理</h1>
          <div class="or-preset-title-actions">
            <button type="button" class="btn btn-gradient or-preset-btn-primary">新建角色</button>
            <button type="button" class="or-btn-outline or-preset-btn-secondary">从模板创建</button>
          </div>
        </div>
        <div class="or-preset-lead-row">
          <p class="or-lead or-preset-lead">
            为每个角色保存系统提示、默认模型与采样参数，便于 Playground 与 API 快速复用。
          </p>
        </div>
      </header>
    </template>

    <div class="table-wrap or-keys-table-wrap">
      <table class="data-table or-keys-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>preset_id</th>
            <th>默认模型</th>
            <th>角色简介</th>
            <th>更新</th>
            <th class="or-table-th-ops">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="or-preset-name-cell">
                <strong>中文技术写作</strong>
                <div class="or-preset-badges or-preset-kind-row" aria-label="来源与默认">
                  <span class="or-preset-kind-self">自建</span>
                  <span class="or-preset-kind-dot">·</span>
                  <span class="or-preset-kind-default">默认</span>
                </div>
              </div>
            </td>
            <td>
              <div class="or-preset-id-row">
                <code>preset_default_zh</code>
                <button type="button" class="or-btn-outline" style="padding: 0.2rem 0.45rem; font-size: 0.6875rem">
                  复制
                </button>
              </div>
            </td>
            <td><code>openai/gpt-4o</code></td>
            <td style="max-width: 220px; color: var(--muted); font-size: 0.8125rem">
              中文优先的技术文档与说明，Markdown 结构清晰。
            </td>
            <td class="or-mono-sm">2026-05-01</td>
            <td class="or-table-td-ops">
              <div class="or-preset-actions">
                <button type="button" class="or-btn-outline">编辑</button>
                <button type="button" class="or-btn-outline">选择默认</button>
                <button type="button" class="or-btn-outline is-danger">删除</button>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="or-preset-name-cell">
                <strong>代码审查 · 严格</strong>
                <div class="or-preset-badges or-preset-kind-row">
                  <span class="or-preset-kind-self">自建</span>
                </div>
              </div>
            </td>
            <td>
              <div class="or-preset-id-row">
                <code>preset_code_review</code>
                <button type="button" class="or-btn-outline" style="padding: 0.2rem 0.45rem; font-size: 0.6875rem">
                  复制
                </button>
              </div>
            </td>
            <td><code>anthropic/claude-3.5-sonnet</code></td>
            <td style="max-width: 220px; color: var(--muted); font-size: 0.8125rem">
              只做 PR 问题清单与补丁建议，不写空话夸奖。
            </td>
            <td class="or-mono-sm">2026-04-20</td>
            <td class="or-table-td-ops">
              <div class="or-preset-actions">
                <button type="button" class="or-btn-outline">编辑</button>
                <button type="button" class="or-btn-outline">选择默认</button>
                <button type="button" class="or-btn-outline is-danger">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
