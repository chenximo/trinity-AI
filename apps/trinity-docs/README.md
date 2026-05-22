# Trinity AI 文档站（VitePress）

> 架构与分期说明：[docs/04-工程与迁移/Trinity文档站方案-VitePress与运营后台.md](../../docs/04-工程与迁移/Trinity文档站方案-VitePress与运营后台.md)

## 一句话

对外 API 文档静态站：内容真源为 **`docs/**/*.md`**；展示由 VitePress 构建；视觉 token 来自 **`@trinity/tokens`**。

## 本地开发

在仓库根目录：

```bash
npm install
npm run dev:trinity-docs
```

默认开发地址：`http://localhost:5205/docs/`（`vitepress dev --port 5205`，与 portal `:5173`、GEO `:5203` 错开）。**开发枢纽** FAB / 首页、`trinity-ai` 顶栏链到该地址（`VITE_TRINITY_DOCS_URL` / `VITE_TRINITY_DOCS_DEV_PORT` 可覆盖）。

### 开发环境 · 页内分栏编辑（仅 DEV）

任意文档页右下角 **「编辑本页」**：**左侧** Markdown 源文、**右侧** 当前 VitePress 页面（同页热更新，不用 iframe，避免 dev 下模块 MIME 报错）；保存写入 `docs/**/*.md`。仅 `127.0.0.1` / `localhost` 可用，生产构建不包含此功能。

## 构建与预览

```bash
npm run build:trinity-docs
npm run preview -w @trinity/app-trinity-docs
```

产物目录：`apps/trinity-docs/.vitepress/dist`。

### 部署 base 路径

| 场景 | 做法 |
|------|------|
| 主站子路径 `/docs/` | 默认，无需改环境变量 |
| 独立子域（根路径 `/`） | 构建前设置 `VITEPRESS_BASE=/` |

## 目录约定

```text
apps/trinity-docs/
├── docs/                 # Markdown 真源（一期 Git；二期由后台发布写入构建目录）
├── .vitepress/
│   ├── config.ts         # 侧栏、搜索、base
│   └── theme/
│       ├── index.ts
│       └── trinity-docs.css   # --vp-* 映射 Trinity token，禁止业务页魔法色
└── README.md
```

`slug` 与文件路径一致，例如 `quickstart` → `docs/quickstart.md`。

## 设计规范

- Token：`@trinity/tokens/core.css`（与 `assets/trinity-base.css` 同源）
- 主色 / 链接：`var(--blue)`；渐变 CTA：`.tdocs-cta` 使用 `var(--grad)`
- 细则：`.cursor/skills/trinity-design-tokens/SKILL.md`
- **OpenRouter 版式对齐清单（布局 + 代码片段图 2 + 托管决策）**：[docs/04-工程与迁移/Trinity文档站-OpenRouter版式对齐规范.md](../../docs/04-工程与迁移/Trinity文档站-OpenRouter版式对齐规范.md)

## 一期 / 二期边界

| 阶段 | 内容维护 | 用户站 |
|------|----------|--------|
| 一期 | 本目录 Git 内 `.md` | 本 VitePress 构建部署 |
| 二期 | `trinity-ai-admin` · `admin-docs` 上传/发布 md → CI build | 同上，不在 `trinity-ai/views/docs` 写正文 |

## 相关

- 用户站过渡模块：`apps/trinity-ai/src/views/docs/`
- 运营后台文档中心：`apps/trinity-ai-admin/src/views/admin-docs/`
- 静态对照：`TrinityAI/app/docs.html`
