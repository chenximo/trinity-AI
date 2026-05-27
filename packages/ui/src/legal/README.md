# 协议页（`@trinity/ui/legal`）

对外法律文本以 **Vue 页面** 为真源（非 Markdown 手册），供各产品应用注册路由后在浏览器直接访问。

## 路由

在应用 shell 的 `children` 中合并：

```ts
import { getTrinityLegalChildRoutes } from "@trinity/ui";

export function getXxxChildRoutes() {
  return [
    // …业务路由
    ...getTrinityLegalChildRoutes(),
  ];
}
```

| 路径 | route name | 组件 |
|------|------------|------|
| `/legal/privacy` | `trinity-legal-privacy` | `TrinityPrivacyPolicyPage` |
| `/legal/terms` | `trinity-legal-terms` | `TrinityTermsOfServicePage` |
| `/legal/model-terms` | `trinity-legal-model-terms` | `TrinityModelTermsPage` |

嵌入门户时示例：`/trinity-ai/legal/privacy`。

## 样式

在 **Uno 预检之后** 引入（门户 hub 与独立 app 通用）：

```ts
import "virtual:uno.css";
import "@trinity/ui/styles/trinity-shell-chrome.css";
```

`trinity-shell-chrome.css` 含 `legal.css`、登录注册弹窗样式。须已引入 `trinity-base.css` 或 tokens。

> 若用根目录 `npm run dev`（`@trinity/app-portal`），须在 `apps/trinity-portal/src/main.ts` 引入上述文件；仅 `dev:trinity-ai` 时由 `apps/trinity-ai/src/main.ts` 引入。

## 登录 / 注册

`TrinityAuthSignupPanel` 内协议链为 `RouterLink`，默认**当前页跳转**并关闭 `TrinityAuthModal`。若需新标签：

```vue
<TrinityAuthModal legal-open-in-new-tab />
```

## 正文维护

- 隐私政策：`content/privacy-policy.zh.ts`
- 服务条款 / 模型条款：占位见 `content/terms-stub.zh.ts`、`content/model-terms-stub.zh.ts`

定稿后替换「待运营确认」块（`TrinityLegalTbdBlock`）。
