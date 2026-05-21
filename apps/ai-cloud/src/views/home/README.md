# AI 云 · 营销首页

> **真源**：`TrinityCloud/home.html`（静态已改为跳转 `/ai-cloud`）  
> **Vue 单文件**：[`HomePage.vue`](./HomePage.vue)（1:1 迁入样式 + 正文 + 交互）

## 再生成

```bash
npm run gen:home -w @trinity/app-ai-cloud
```

从 `TrinityCloud/home.html` 覆盖 `HomePage.vue`；生成后检查站内链与登录跳转。

## 路由

| path | name |
|------|------|
| ``（`/ai-cloud`） | `aic-home` |

登录 / OAuth 演示提交后进入 `aic-account-console#accounts`。
