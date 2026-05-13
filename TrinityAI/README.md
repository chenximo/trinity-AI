# Trinity AI（用户侧静态原型）

本目录为 **Trinity AI** 产品静态 HTML 原型：营销首页、应用内页、账户控制台及共享脚本样式。全局设计 token 见仓库根目录 `assets/trinity-base.css`，版式约定见 `docs/Trinity原型版式与视觉规范.md`。

## 目录结构

| 路径 | 说明 |
|------|------|
| **`index.html`** | 产品营销首页（入口页）；顶栏链至 `../TrinityCloud/home.html` 等 |
| **`app/`** | 应用内页：`models.html`、`docs.html` 等；**按模块分子目录**（如 **`app/chat/`** 对话：`index.html` + `chat-openrouter.js` / `chat-openrouter.css`） |
| **`account/`** | 账户与控制台：`console.html`（控制台主体）、`register.html`、`login.html`（跳转首页锚点）、`keys.html` / `billing.html`（锚点别名至 console） |
| **`static/`** | 跨模块共享脚本：`trinity-ai-app-shell.js`（顶栏注入等）、`ui-lang-toggle.js`（顶栏中 / 英标签切换，需在壳脚本之后加载）；`app/`、`account/` 下页面按深度以 `../static/…` 或 `../../static/…` 引用 |
| **`refs/`** | 设计参考截图等非代码资产（如首页视觉参考 PNG），不参与页面构建 |

## 与文档的对应关系

- 对话页交互与模块说明：`docs/Trinity对话页原型说明.md`
- OpenRouter Chat 复刻用生成提示词（归档）：`docs/Trinity对话页OpenRouter复刻生成提示词（归档）.md`

## 命名说明

- **`app/`、`account/`** 保持简短英文路径，便于本地预览与外链稳定。
- **`static/`** 集中存放可被多页引用的 `.js` / `.css`，避免散落在仓库根级难以辨认职责。
- `chat-openrouter.*` 仅服务 **对话模块**（`app/chat/`）；重命名或搬迁需同步 `app/chat/index.html` 与 `docs/` 内引用。
