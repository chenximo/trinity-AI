<template>
  <main class="portal-home or-site" style="padding: 1.25rem var(--page-gutter, 1rem); max-width: 44rem">
    <h1 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.5rem; color: var(--text)">开发枢纽</h1>
    <p style="color: var(--muted); font-size: 0.875rem; line-height: 1.55; margin: 0 0 1rem">
      单端口聚合各 <code>apps/*</code> 预览路由；生产构建仍以各 app 的 <code>npm run build -w …</code> 为准。
    </p>
    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; line-height: 1.75; color: var(--text)">
      <li><strong>设计</strong>：设计色板、设计规范（与独立 <code>trinity-design</code> 路由一致）</li>
      <li><strong>骨架</strong>：Trinity AI、AI Cloud、GEO、Admin</li>
    </ul>

    <h2 style="font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: var(--text)">运营后台 · 登录 / 登出</h2>
    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; line-height: 1.75; color: var(--text)">
      <li>
        <a href="/trinity-ai-admin/login" style="color: var(--el-color-primary)">登录页</a>
        — 演示账号 <code>zhang.san</code>
      </li>
      <li>
        <a href="/trinity-ai-admin/logout" style="color: var(--el-color-primary)">登出页</a>
        — 需先登录；壳内菜单「退出登录」亦进入此页
      </li>
    </ul>

    <h2 style="font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: var(--text)">运营后台样板</h2>
    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; line-height: 1.75; color: var(--text)">
      <li>
        <a href="/trinity-ai-admin/example" style="color: var(--el-color-primary)">
          列表页模板示例
        </a>
        — 搜索、筛选、表格、操作按钮的规范实现
      </li>
      <li>
        <a href="/trinity-ai-admin/reports/preset" style="color: var(--el-color-primary)">
          报表中心
        </a>
        — 按新规范重构的列表页参考
      </li>
    </ul>
  </main>
</template>
