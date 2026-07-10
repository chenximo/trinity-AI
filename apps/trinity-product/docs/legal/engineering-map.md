---
title: 挂网维护与工程映射
description: Trinity 法律页在代码中的真源、路由、静态 HTML 与本地预览方式。
---

# 挂网维护与工程映射

> 产品/法务改 **文案**；研发改 **路由与构建**。正文不写在产品手册 Markdown 里。

---

## 真源仓库与路径

| 用途 | 路径 |
|------|------|
| **主站挂网真源**（trinitydesk.ai） | `TrinityAI-web/packages/ui/src/legal/` |
| 正文（中/英） | `content/*.zh.ts` · `content/*.en.ts` |
| 页面组件 | `Trinity*Page.vue` |
| 路由注册 | `routes.ts` → `getTrinityLegalChildRoutes()` |
| 静态 HTML 渲染 | `renderStaticLegalPage.ts` |
| Web 构建插件 | `TrinityAI-web/apps/web/vite-plugins/legalStaticHtmlPlugin.ts` |
| 套件副本（门户 embed） | `trinity-AI/packages/ui/src/legal/`（须与主站定期同步） |

---

## 对外路由

| 路径 | route name | 组件 |
|------|------------|------|
| `/legal/privacy` | `trinity-legal-privacy` | `TrinityPrivacyPolicyPage` |
| `/legal/terms` | `trinity-legal-terms` | `TrinityTermsOfServicePage` |
| `/legal/acceptable-use` | `trinity-legal-acceptable-use` | `TrinityAcceptableUsePolicyPage` |
| `/legal/model-terms` | — | 301 重定向至 `/legal/terms` |
| `/contact` | 应用内 Contact 页 | `ContactView.vue` |

应用在 shell `children` 中合并：

```ts
import { getTrinityLegalChildRoutes } from "@trinity/ui";
// ...getTrinityLegalChildRoutes()
```

---

## 页脚与注册

| 位置 | 文件 |
|------|------|
| 页脚 Legal 链接 | `TrinityAI-web/apps/web/src/components/AppFooter.vue` |
| 页脚文案 | `apps/web/src/locales/core/{zh,en}.ts` |
| 注册协议勾选 | `@trinity/ui` → `TrinityAuthTermsAgree.vue` |
| Contact 页 | `apps/web/src/views/ContactView.vue` |

---

## 静态 HTML（支付审核）

构建时写入 `apps/web/dist/`：

```
dist/legal/privacy/index.html
dist/legal/terms/index.html
dist/legal/acceptable-use/index.html
dist/contact/index.html
```

验证：

```bash
cd TrinityAI-web
pnpm --filter web build
# 检查 dist/legal/acceptable-use/index.html 是否含正文
```

冒烟脚本：`apps/web/scripts/smoke_audit_static_pages.py`

---

## 本地预览

| 方式 | 命令 / 地址 |
|------|-------------|
| 主站 dev | `TrinityAI-web` 根目录 `pnpm --filter web dev` |
| 法律页 | `http://127.0.0.1:<port>/legal/terms` 等 |
| 产品手册（本规范） | `npm run dev:trinity-product` → [http://127.0.0.1:5206/product/legal/](http://127.0.0.1:5206/product/legal/) |

---

## 修改流程

1. 编辑 `TrinityAI-web/packages/ui/src/legal/content/<page>.{zh,en}.ts`
2. 若新增页面：补 `routes.ts`、`types.ts`、`Trinity*Page.vue`、`renderStaticLegalPage.ts`、`legalStaticHtmlPlugin.ts`、页脚链
3. `pnpm --filter web build`
4. 部署生产
5. 更新 [Antom 补充材料](../ai-api-platform/commercial-billing/antom-merchant-supplementary-materials) 中的 URL（如有变）

---

## Cloud 站（trinitydesk.com）

`TrinityAI-web/apps/trinity-ai-cloud` 使用 **独立** Cloud 法律正文（`src/legal/content/`），路由 name 为 `aic-legal-*`。  
与主站 trinitydesk.ai **不自动同步**；若 Cloud 对外运营，须单独维护清单。

---

详细组件说明见 `TrinityAI-web/packages/ui/src/legal/README.md`。
