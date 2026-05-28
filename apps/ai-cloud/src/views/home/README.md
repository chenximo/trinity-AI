# AI 云 · 营销首页

> **唯一维护入口**：[`HomePage.vue`](./HomePage.vue)（模板 + 样式 + 交互；登录用 `@trinity/ui` `TrinityAuthModal`）

本应用为 Vue 单文件实现，静态 HTML 已迁移完毕，**请直接改 `HomePage.vue`**，勿再通过生成脚本从 HTML 覆盖。

## 页面模块

| 锚点 | 内容 |
|------|------|
| 首屏 | 一站式多云采购与管理、渠道优惠与专属支持、集采降本叙事 |
| `#cloud-solutions` | 六云 Tab + 左侧场景 mockup（见派活说明） |
| `#why` | 顶部降本条 / 三大零承诺 / 四大核心赋能 / 合作价值六点 |
| `#benefits` | 专属福利三栏对比（服务项目 / Trinity / 厂商直销） |
| `#process` | 优惠购买五步流程 |
| `#consult` | 咨询表单（邮箱 + 联系电话 + 需求规模）；按钮「提交申请并联系商务」经 FormSubmit 发送至 `starsea@trinitydesk.com`（失败则 `mailto:` 草稿）；副本写入 `localStorage`（`trinity-aic-consult-leads`）。可选 `VITE_AIC_CONSULT_MAIL_ENDPOINT` 覆盖投递地址 |

## 字阶（px，`:root` in `HomePage.vue`）

| Token | px | 用途 |
|-------|-----|------|
| `--home-font-display` | 52 | 首屏 h1 |
| `--home-font-highlight` | 44 | 20%–40% 强调数字 |
| `--home-font-step` | 36 | 流程序号 |
| `--home-font-title` | 32 | 区块 h2 |
| `--home-font-module` | 24 | why 区三大模块标题（零承诺 / 核心赋能 / 合作价值） |
| `--home-font-subtitle` | 18 | 卡片内小标题、首屏副标题、案例 h3 |
| `--home-font-body` | 16 | 正文、按钮（页内覆盖） |
| `--home-font-body-sm` | 14 | 导航、列表、导语 |
| `--home-font-caption` | 12 | 标签、脚注；窄屏单行导语 |
| `--home-font-micro` | 11 | 图例、免责 |

无 `rem` / `clamp` / `vw` 字号。窄屏（`max-width: 899px`）在 `HomePage.vue` 内降级字阶与边距（`15%` → `1rem`）；`max-width: 1100px` 将 why 区单行导语降为 16px 并可换行。

## 路由

| path | name |
|------|------|
| 门户 ``（`/ai-cloud`） | `aic-home` |
| 独立部署 ``（`/trinityai-demo/`） | 同上（见下方 COS） |

登录 / OAuth 演示提交后进入 `aic-account-console#accounts`。

## 部署到 `http://{host}/trinityai-demo/`（COS / Nginx）

1. 构建：`npm run build:trinityai-demo -w @trinity/app-ai-cloud`（或默认 `npm run build`，`vite.config` 默认 `base` 为 `/trinityai-demo/`）
2. 将 **`apps/ai-cloud/dist/` 内全部文件** 上传到桶或服务器目录 **`trinityai-demo/`**（与 URL 路径一致）
3. 静态站 / Nginx：**索引** `index.html`；**404 / 错误文档** 也指向 `trinityai-demo/index.html`（History 路由）
4. 访问：`http://43.159.57.43/trinityai-demo/`（末尾建议带 `/`）

本地预览：`npm run preview -w @trinity/app-ai-cloud` → `http://localhost:5202/trinityai-demo/`

门户开发（`/ai-cloud`）构建请设：`VITE_APP_BASE=/ai-cloud/ npm run build -w @trinity/app-ai-cloud`

## 云介绍左侧配图（场景 mockup）

- **组件**：`apps/ai-cloud/src/components/*CloudSceneVisual.vue`（六家云各一）
- **ToB 官网 Agent Skill**：[`trinity-tob-marketing-site`](../../../../.cursor/skills/trinity-tob-marketing-site/SKILL.md)（色板/版式/模块/配图统一入口）
- **配图方法论**：[ToB官网-方案矩阵导览区配图协作方法论.md](../../../../docs/08-方法论与汇报/AI实现Tob官网原型方法论/ToB官网-方案矩阵导览区配图协作方法论.md)
- **参考图**：[方案矩阵配图-参考图/](../../../../docs/08-方法论与汇报/AI实现Tob官网原型方法论/方案矩阵配图-参考图/)
- **本模块案例**：[AI云-云介绍左侧配图-派活说明.md](../../../../docs/08-方法论与汇报/AI云-云介绍左侧配图-派活说明.md)
