<script setup lang="ts">
/** §3 样例 · 行内操作 ≥4 项时用 ⋮ 菜单（与 or-keys-table 同表头） */
</script>

<template>
  <div class="table-wrap or-keys-table-wrap">
    <table class="data-table or-keys-table">
      <thead>
        <tr>
          <th>名称</th>
          <th>说明</th>
          <th class="or-table-th-ops">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="or-keys-col-name">演示行 · 多操作</td>
          <td style="color: var(--muted); font-size: 0.8125rem">行内可见操作 ≥4 时收进 ⋮，勿并排 4+ 个线框按钮</td>
          <td class="or-table-td-ops">
            <div class="or-keys-ops" data-or-keys-ops>
              <button type="button" class="or-keys-ops-trigger" title="操作" aria-label="行操作菜单">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="5" r="1.75" />
                  <circle cx="12" cy="12" r="1.75" />
                  <circle cx="12" cy="19" r="1.75" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
