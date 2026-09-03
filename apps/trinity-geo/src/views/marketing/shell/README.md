# 营销站顶栏（可复用壳层）

## 1. 一句话

从 `marketing/index.html` 拆出的 **GEO 营销顶栏**；套件链接与主导航数据在 `marketingHeaderMock.ts`，便于后续与 AI 云 / Trinity AI 顶栏对齐。

## 2. 组件

| 文件 | 职责 |
|------|------|
| `MarketingSiteHeader.vue` | 顶栏 UI |
| `MarketingSiteFooter.vue` | 页脚（同原型） |
| `MarketingSiteLayout.vue` | skip + header + `RouterView` + footer |
| `marketingHeaderMock.ts` | 导航项、套件链接 |
| `marketingSiteInteractions.ts` | 滚动阴影、nav active |
| `marketing-site-shell.css` | RouterLink 桥接 |

## 3. 工作台入口

「登录」「开始试用」→ `geo-dashboard`（`/console`）。

## 4. 对照

`trinity-geo-prototype/marketing/index.html` L24–56（header）

## 5. 后续

- 与 `apps/ai-cloud` / `apps/trinity-ai` 顶栏统一时，只改 `marketingHeaderMock.ts` 或抽 `@trinity/marketing-shell` 包
- `product` / `pricing` 子页复用 `MarketingSiteLayout`
