# OpenRouter Chat 页面 1:1 复刻 — 给设计与前端的实现提示词

> **文档状态**：归档（前期方案对比，非交付口径；不默认随现网迭代）  
> **文档类型**：AI 生成提示词  
> **与实现对齐**：实现落点以 `TrinityAI/app/chat/index.html`、`TrinityAI/app/chat/chat-openrouter.css`、`TrinityAI/app/chat/chat-openrouter.js`、`TrinityAI/static/trinity-ai-app-shell.js` 及 `assets/trinity-base.css` 为准；本稿为复刻说明，细节以现网为准。

**目标 URL：** https://openrouter.ai/chat  
**输出物：** 静态 HTML/CSS（可带少量 JS 做折叠、Tab、无真实请求），路径建议：`TrinityAI/app/chat/index.html`，样式可独立为 `TrinityAI/app/chat/chat-openrouter.css` 或写入页面 `<style>`，需与现有 `assets/trinity-base.css` / `TrinityAI/static/trinity-ai-app-shell.js` 顶栏兼容或替换为与 OpenRouter 一致的顶栏。

**参考标题（页面 meta）：**「AI Chat Playground - Compare AI Models Side by Side | OpenRouter」类语义。

**范围说明：** 除主 Chat 壳（侧栏 + 主区 + Composer）外，下列 **浮层 / 弹窗** 均属同一 Chat 产品流程，须在同一 `app/chat/index.html`（或同 bundle）内可打开、可关闭、样式一致，见 **§14–§15**。

---

## 1. 角色与交付标准

你是资深前端，负责把 **OpenRouter `/chat` 浅色界面** 在单页内 **像素级接近** 地复刻出来（允许文案用 Trinity 品牌占位，但 **布局、层级、间距节奏、圆角、边框、字重、图标位置** 须与 OpenRouter 一致）。先完成 **桌面端 ≥1280px**；再补 **平板 / 手机**（侧栏可抽屉化、底栏 composer 全宽）。

---

## 2. 整体信息架构（IA）

页面为 **全高应用壳**（`min-height: 100vh`，主区 `flex: 1`，避免整页滚动条出现在错误层级）：

1. **顶栏（Global Header）** — 固定或 sticky，高度约 **52–60px**，底边 **1px 浅灰分割线**；背景 **白 / 近白 + 轻微 blur**（与 openrouter 一致）。
2. **主体三栏**（桌面）：
   - **左侧栏**：会话列表 + 搜索，背景比主区 **略灰一档**（如 `#fafafa` / `#f4f4f5`），与中间白底形成对比。
   - **中间主区**：当前会话内容区（空状态或消息流），背景 **纯白**。
   - **无右侧栏**（截图无则不做）。

**注意：** 若项目已用 `TrinityAI/static/trinity-ai-app-shell.js` 注入顶栏，则 **Chat 页顶栏** 须与 OpenRouter 一致：左 Logo + **中间搜索框（带 `/` 快捷键提示）** + 右 **Home / Fusion / Models / Chat(active) / Rankings / Apps / Docs** + 用户头像；`Chat` 为当前页高亮。

---

## 3. 顶栏（Header）逐元素

| 区域 | 内容 | 交互/样式 |
|------|------|-----------|
| 左 | 品牌字标「OpenRouter」或 Trinity 占位 | 链接回首页 |
| 中 | **搜索框**：圆角输入条，内置 **放大镜图标**，右侧 **键盘 `/` 提示**（小灰胶囊或 kbd 样式） | `placeholder` 类似站点搜索；静态可不请求 |
| 右 | 导航链接一排 + **圆形用户头像** | 当前页 `Chat` 下划线或字色强调；链接 hover 状态 |

顶栏与下方聊天壳 **无双重厚边框**；整体 **轻、扁**。

---

## 4. 左侧栏（Chat Sidebar）

**宽度：** 桌面约 **260–300px**（以视觉为准，可微调）。

**自上而下：**

1. **第一行工具条**
   - **侧栏折叠图标**（三条竖线 / panel 图标），`aria-label` 可访问性。
   - **「New Chat」按钮**：主按钮样式，左侧 **铅笔/编辑** 图标，文案 `New Chat`。
2. **搜索框**
   - `placeholder`: `Search rooms...`
   - 全宽、圆角、浅边框、与顶栏搜索区分（略小一号）。
3. **会话列表 — 分组标题**
   - 全大写小标签：**TODAY**、**YESTERDAY**、**PREVIOUS 30 DAYS**（字重 600–700，字色 `#71717a` 类）。
   - 每组下 **列表项**：单行标题截断，hover 背景浅灰；可含占位如 `Untitled Chat`、`sss`、长句截断 + `...`。
4. **底部**（若官网有则补）：可省略或仅占位 **Settings / 用户区** — 以实站为准。

**侧栏与主区之间：** **1px 竖线** 或仅靠背景差分隔，不要粗阴影。

---

## 5. 中间主区 — 空状态（New Chat）

当无消息时，主区为 **垂直居中偏上** 的「启动台」布局（非整页垂直居中到底，留出底部 composer 空间）。

### 5.1 顶部 Tab 行

- 当前会话 Tab：**「New Chat」**（可关闭样式的小 × 或省略）。
- 右侧按钮：**「+ Add Model」** — outline 或弱主色，用于多模型并排（静态可只做 UI）。

### 5.2 模型分类大卡（2×2 网格）

四张 **等大圆角白卡片**（`border-radius` 约 **12–16px**），浅边框或极轻 shadow，**网格 gap** 均匀（约 **16–24px**）。

| 卡片标题（英文） |
|------------------|
| Flagship models |
| Best roleplay models |
| Best coding models |
| Reasoning models |

每张卡 **右下角一簇小圆形/圆角品牌图标**（OpenAI、Anthropic、Google、Meta 等占位 SVG 或 sprite），**图标尺寸一致**，成簇右下对齐。

### 5.3 提示词建议横条（Prompt chips）

在大卡 **下方** 一行 **可横向滚动** 的小卡（或 flex wrap），每张：

- 浅色底 + 圆角 + 细边框；
- 示例文案（与 OpenRouter 风格一致，可略缩短）：
  - `Car Wash Test: Should you walk or drive?`
  - `9.9 vs 9.11: Which one is larger?`
  - `Strawberry Test: How many r's are in the w...`
  - `Poem Riddle: Compose a 12-line poem`

**点击**：静态页可 `textarea` 填入该文案或仅 `console.log`。

---

## 6. 底部 Composer（输入区）— 重点

主区 **底部固定或 sticky 在视口底部上方**（与侧栏底对齐），**最大宽度** 与中间内容区一致或略窄，**水平居中**。

**外层：** 大白圆角容器（**大圆角**，如 **16–20px**），**轻 shadow** + 浅边框，内边距充足。

**内部结构：**

1. **多行文本框**
   - `placeholder`: `Start a new message...`（以实站为准）。
   - 无边框或仅底部分隔，**最小高度** 约 **80–120px**，可垂直 resize（按实站）。

2. **上方一行（在 textarea 之上或内嵌第一行）**
   - 左侧 **Checkbox** + 文案 **`Create Artifact...`**（灰色标签感）。

3. **下方工具条（toolbar）**
   - **左侧：**
     - **回形针**（附件）图标按钮；
     - **对话气泡 + 数字徽章（如 8）+ 下拉箭头** — 表示模型/上下文条数，整块可点击（静态下拉可空）；
     - **蓝色开关型图标 + 数字角标（如 1）** — 占位「某功能开关」。
   - **右侧：**
     - **麦克风** 图标；
     - **圆形主色发送按钮**（上箭头或纸飞机），尺寸明显大于旁图标。

**图标：** 线宽一致（约 **1.75–2px** stroke），hover 圆形浅灰底。

---

## 6A. Chat 关联浮层一：模型选择器（双栏面板）

**触发：** Composer 工具条上「模型 / 气泡 + 数字 + chevron」或顶栏模型入口等（与实站一致）。  
**形态：** 单个 **大浮层**（或居中 modal），**白底、大圆角、轻阴影**，视觉上为 **左右两栏** 一体组件。

### 左栏 — 列表与筛选

1. **搜索**  
   - 顶部 **Search models** 输入框，左侧放大镜图标，`placeholder`: `Search models`。
2. **筛选按钮行**（横向）  
   - **Input**、**Output**、**Free**：白底、灰边框、圆角小按钮。  
   - **Hide Unavailable**：**紫色实心高亮**（active），表示当前筛选生效。  
   - **Clear**：纯文本按钮，弱样式。
3. **模型列表**（可滚动，右侧 **细灰滚动条**）  
   - **分组标题**：如 `Pinned`、`五月 2026`（或英文月份，以实站为准）。  
   - **每一行**：左侧 **小圆提供商图标** + 模型名 + 可选 **星标收藏**。  
   - **选中行**：整行 **浅灰背景高亮**（如 `Recraft V3`）。  
   - 列表项 hover：略浅背景。

### 右栏 — 当前模型详情

与左栏 **同高** 或自适应，**1px 竖线** 与左栏分隔。

1. **标题区**：提供商图标 + **粗体模型名**（与左栏选中项一致）。  
2. **描述段落**：多行说明文案（静态可占位 Lorem 或真实 Recraft 描述缩略）。  
3. **参数表**（键值对，行间 **浅灰横线**）  
   - **Weekly Tokens:** 数值（如 `51K`）  
   - **Context:** 数值（如 `65,536`）  
   - **Input:** `$0 / M tokens` 类格式  
   - **Output:** 同上  
   - **Uptime:** 右侧 **小柱状 / 图表图标** 表示可用性（占位 SVG 即可）。

**交互（静态 MVP）：** 点击左栏项 → 更新右栏内容与选中态；搜索框可前端 `filter` 列表；筛选按钮切换 active 样式即可。

---

## 6B. Chat 关联浮层二：模型配置（Settings Modal）

**触发：** 与实站一致（如模型行旁齿轮、或某入口）；**关闭**：右上角 **×**。

**容器：** 居中 **白底 modal**，圆角约 **12–16px**，**轻阴影**，内边距统一；背景 **半透明遮罩** `rgba(15,23,42,0.35)` 类。

### 自上而下区块

1. **名称行**  
   - 文本输入，左侧 **用户/人像图标**；右侧 **紫色 Toggle**（开/关态与截图一致）。
2. **Model**  
   - 下拉，当前项如 `Recraft V4 Pro`，左侧小图标。  
3. **Preset**  
   - 下拉，`placeholder`: `Select Preset...`。
4. **Provider + Sort By**  
   - **Provider** 下拉：`Auto` + 小图标。  
   - **Sort By** 为 **较窄** 的次级下拉，与 Provider **同一行** 左右排列（右对齐或 flex space-between）。
5. **File Parser Engine**  
   - 区标题带 **文件图标**；下拉 `Select Engine`。
6. **System prompt**  
   - 说明文案：`Use OpenRouter's default system prompt or choose custom.`  
   - **Default | Custom** 两个并排切换（**Default** 选中时浅灰底）。  
   - 下方 **大文本域**：展示完整 system 文案（可含日期、Formatting Rules 等占位）。  
   - 文本域 **右下** 小字：`~173 tokens` 类 token 估算。
7. **Sampling Parameters**  
   - 一行可 **折叠区块**：左侧标题 + 右侧 **`>`** 表示 expandable（静态可先只做折叠动画或占位）。
8. **底部按钮组（右对齐）**  
   - **Apply to All**、**Reset**：浅灰底、深字。  
   - **Remove**：**红底白字** danger 主按钮。

**交互（静态 MVP）：** Toggle、下拉、折叠仅改 class；不提交后端；`Escape` 关闭 modal。

---

## 7. 有消息状态（可选第二阶段）

- 主区中部：**用户气泡右对齐 / 助手气泡左对齐**；最大宽度约 **70–85%**；助手区浅灰底。
- Composer 逻辑同空状态；顶部 Tab 可显示会话标题。

---

## 8. 视觉规范（Design Tokens）

| Token | 建议值（可微调对齐截图） |
|--------|---------------------------|
| 背景主 | `#ffffff` |
| 侧栏底 | `#fafafa` ~ `#f4f4f5` |
| 边框 | `#e4e4e7` ~ `#e5e7eb` |
| 主文 | `#09090b` ~ `#111827` |
| 次文 | `#52525b` ~ `#6b7280` |
| 三级灰 | `#71717a` ~ `#9ca3af` |
| 主按钮蓝 | 接近 Tailwind `blue-600` |
| 强调紫（筛选 on / toggle on） | 与 OpenRouter 紫一致，勿与主蓝混用 |
| Danger 红（Remove） | 标准 danger，白字 |
| 圆角 | 卡片 12–16px；按钮 8–10px；pill 9999px |
| 字族 | `Inter` 优先，系统 sans 回退 |
| 阴影 | composer 与分类卡 **极轻** `0 4px 24px rgba(15,23,42,0.06)` 量级 |

---

## 9. 布局与间距（Layout）

- 使用 **CSS Grid**：`grid-template-columns: var(--sidebar-w) 1fr`。
- 主区内：**空状态块** 用 `flex` 列，`flex: 1` 占满，`composer` **margin-top: auto** 或独立 grid 行贴底。
- **左右页边距**：若全站 `--page-gutter: 50px`，则 **chat 主内容区** 仍须在 **50px 内** 完成侧栏+主区分配（侧栏可贴左 gutter，主区从 gutter 内起始）。

---

## 10. 响应式

- **&lt;900px：** 侧栏默认隐藏，**汉堡 / 面板按钮** 打开抽屉；主区全宽；composer 全宽贴底。
- **键盘：** `Escape` 关闭抽屉；`/` 聚焦搜索（若实现）。

---

## 11. 静态 MVP 范围（明确不做）

- 不连接真实 OpenRouter API；发送按钮仅 UI 反馈（disabled 或 toast）。
- 不实现真实多模型并行流；「+ Add Model」仅 UI。
- 会话列表数据可 **写死 JSON** 或 HTML 重复项。
- 模型选择器 / 配置弹窗：**不接真实模型目录 API**；列表与右栏详情为静态数据即可。

---

## 12. 验收清单（Checklist）

- [ ] 顶栏：搜索 + `/` + 导航 + Chat active + 头像  
- [ ] 侧栏：折叠、New Chat、Search rooms、三组日期、列表 hover  
- [ ] 主区：Tab + Add Model、2×2 四卡、图标簇、四 chip  
- [ ] Composer：大圆角容器、placeholder、Artifact 勾选、底栏左三右二图标+发送  
- [ ] **模型选择器**：双栏、搜索、筛选行（含 Hide Unavailable 紫态）、分组列表、选中行、右栏详情表  
- [ ] **配置 Modal**：名称+toggle、Model/Preset、Provider+Sort、File Parser、System Default/Custom、token 提示、Sampling 折叠行、Apply/Reset/Remove、× 与遮罩关闭  
- [ ] 全高无错位滚动；侧栏与主区色差与 1px 分隔  
- [ ] 与 `TrinityAI/static/trinity-ai-app-shell.js` 主题（light/dark）若共存，至少 light 与截图一致  

---

## 13. 给实现者的一句话 Prompt（英文精简版，可复制）

```
Rebuild https://openrouter.ai/chat as a static responsive page: sticky top header with centered search (magnifying glass + "/" hint), nav links with Chat active, user avatar; left sidebar (~280px) with collapse icon, "New Chat" button, "Search rooms..." field, chat history grouped under TODAY / YESTERDAY / PREVIOUS 30 DAYS; main column empty state with session tab + "+ Add Model", a 2x2 grid of white rounded cards (Flagship / Roleplay / Coding / Reasoning models) each with small provider logo cluster bottom-right, a horizontal row of prompt suggestion chips, and a large bottom composer (rounded, light shadow) with textarea placeholder "Start a new message...", a "Create Artifact..." checkbox row, and a bottom toolbar: left attachment, chat bubble with "8" badge + chevron, blue toggle with "1" badge; right microphone and circular blue send. Also implement: (1) a two-pane model picker popover—left: Search models, filter chips (Input/Output/Free/Hide Unavailable purple active/Clear), grouped scrollable list with provider icons and row selection highlight; right: selected model title, description, key-value stats (Weekly Tokens, Context, Input/Output pricing, Uptime with mini chart). (2) a centered settings modal: name field + purple toggle, Model and Preset dropdowns, Provider Auto + Sort By, File Parser Engine, system prompt Default/Custom tabs with textarea and "~N tokens", expandable "Sampling Parameters", footer buttons Apply to All / Reset / Remove (red). Light theme, Inter, subtle borders. No backend.
```

---

**文档版本：** 1.1  
**依据：** 用户提供的 OpenRouter Chat 截图说明（主界面 + **模型选择双栏** + **模型配置 Modal**）+ 公开页 [openrouter.ai/chat](https://openrouter.ai/chat)。实现前建议再打开实站核对 **文案拼写、间距像素、暗色模式**。
