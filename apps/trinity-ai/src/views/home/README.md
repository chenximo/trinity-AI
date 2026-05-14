# 营销首页模块（原型）

> 目录与交付约定见仓库根文档：`docs/Trinity原型模块目录与交付规范.md`。

## 1. 一句话

营销落地页：正文大块 HTML 在 **`HomePage.vue`** 单文件模板；供应商胶囊等列表数据在 **`mock.ts`**；路由跳转与 `window.TrinityOR` 演示在 **`homeInteractions.ts`**；样式为全局 **`home.css`**（非 CSS Modules）。与 `npm run gen:marketing` 从静态 `TrinityAI/index.html` 再生成时应对齐本目录路径。

## 2. 五件套（本目录仅五个文件）

| 文件 | 职责 |
|------|------|
| `HomePage.vue` | 路由入口 `tai-home`：整页模板（hero / 区块 / 页脚） |
| `home.css` | 首页布局与局部样式（`trinity-base` 为 token 真源） |
| `homeInteractions.ts` | `useHomeNavigation`：控制台 / 文档路由、OAuth 演示打开登录壳 |
| `mock.ts` | `HOME_HERO_PROVIDERS` 等纯数据 |
| `README.md` | 本说明 |

## 3. 路由

| 路径（独立 `trinity-ai`） | 路由 name | 说明 |
|---------------------------|-----------|------|
| `/` | `tai-home` | **同步**引入 `HomePage.vue`，见 `src/trinityAiRoutes.ts` |

## 4. 再生成正文

根目录 `TrinityAI/index.html` 变更后执行：

`npm run gen:marketing -w @trinity/app-trinity-ai`

脚本写入 **`HomePage.vue`**，并保留 TButton、RouterLink、`HOME_HERO_PROVIDERS` 与 `useHomeNavigation` 约定。

## 5. 接 API / 正式开发

1. 正文可逐步改为数据驱动子块；列表与文案优先迁出到 `mock.ts` 或 CMS。  
2. `openDemoAuth` 在接真实 OAuth 后改为调用鉴权模块。

## 6. 参考

- `docs/TrinityAI用户站Vue还原计划.md` 阶段 B  
- 静态源：`TrinityAI/index.html`
