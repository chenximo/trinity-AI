# Chat 模块 · 原型 / 交互摘要（AI 聚合平台）

> **文档状态**：**归档**（2026-05-20）。原为静态 `TrinityAI/app/chat/` 时期的产品/交互备忘，**非**交付规范真源。  
> **现网工程真源**：[`apps/trinity-ai/src/views/chat/README.md`](../../apps/trinity-ai/src/views/chat/README.md) + [`01/Trinity原型模块目录与交付规范.md`](../01-原型与交付规范/Trinity原型模块目录与交付规范.md)。  
> **迁移计划**（历史）：[`03/Trinity对话页Vue迁移计划.md`](../04-工程与迁移/Trinity对话页Vue迁移计划.md)。

---

> 下文保留归档时的正文（评审入口、路径以静态页为主；阅读时请以 Vue 五件套为准）。

> 本文档按 [`原型设计统一.skill.md`](../01-原型与交付规范/原型设计统一.skill.md) 约定维护，与 **当前静态实现** 对齐；对接真实 API 后的差异应在 PRD 与本文档中同步修订。  
> **评审入口**：`TrinityAI/app/chat/index.html`（本地打开或静态托管路径）。  
> **目录说明**：`TrinityAI/README.md`（`app/` 按模块分子目录，对话在 **`app/chat/`**；`account/`、`static/`、`refs/` 分工）。  
> **归档生成提示词**（OpenRouter 复刻稿）：[Trinity对话页OpenRouter复刻生成提示词（归档）.md](./Trinity对话页OpenRouter复刻生成提示词（归档）.md)。  
> **全局视觉与版式**：[Trinity版式与视觉规范.md](../01-原型与交付规范/Trinity版式与视觉规范.md)（含 **§1.4 字号阶梯**）。

---

## 1. 设计思路

### 1.1 定位与场景

- **产品定位**：Trinity AI **聚合对话**原型——用户在单一对话界面中选用或对比多个底层模型(数据为静态 `MODELS` 列表），体现「一层产品、多模型供给」的聚合价值，而非单模型官网聊天室。
- **目标用户**：已了解「可按任务选模型」的进阶用户；需要快速切换模型、发起**多模型对比**、管理**角色（Preset）**与会话历史的用户。
- **要解决的核心问题**  
  - 降低「选错模型再重来」的成本：侧栏浏览 + 弹层精读参数 + 收藏排序。  
  - 支持**同题多答**的可读布局：失败模型与成功回答分区展示，并辅以「综合总结」示意。  
  - 与 **控制台 / 模型列表** 叙事一致：角色管理入口链到 `account/console.html#preset`，模型能力在对话内可再次确认。

### 1.2 关键取舍

| 取舍 | 说明 |
|------|------|
| **静态优先** | 发送、重生成、负反馈等多为占位；仅复制用户消息、记忆滑块、收藏模型、筛选与弹层交互为可运行逻辑，便于评审布局与信息架构。 |
| **集合对比与单模型** | 单模型时走常规顶栏 + 底栏；进入「模型集合」后侧栏为多选对比行，底栏展示「对比 · N 个模型」；避免在无集合时仍占多栏对比区。 |
| **弹层确认 vs 即时写入** | 模型选择器：**完成** 才应用多选，**取消** 丢弃草稿；**点击遮罩与 Esc 不关闭弹层**（须显式点取消或完成）；与侧栏点选即时切换当前模型形成互补（见 §2）。 |

### 1.3 与其他模块的关系

- **`app/models.html`**：模型市场/能力发现；Chat 侧栏与弹层复用同一套筛选语义与列表分组逻辑（收藏优先、再按分组）。  
- **`account/console.html`**：角色（Preset）权威配置；Chat 顶栏仅展示芯片与「更多 → 自定义角色」跳转。  
- **`TrinityCloud/home.html` / `TrinityAI/index.html`**：云落地与 AI 产品首页；能力卡片与 Chat 空态「场景卡片」共用 **模型集合** 键（如 `flagship`），保证从落地页到对话的体验连贯。

---

## 2. 产品交互

### 2.1 信息架构（区域）

| 区域 | 职责 |
|------|------|
| **左侧 Icon Rail** | 全局入口占位（新建对话、对话当前页、展开侧栏、多模态入口、账户等）。 |
| **侧栏 · 模型** | 搜索 + 筛选芯片；可选 **模型集合** 工具条（标题、`+ 选择`、全部模型、关闭集合）；模型列表（当前发送模型 `is-active`；**对比模式**下已选模型均在右侧显示 ✓，行样式与常规模型列表一致、无左侧色条；收藏星标；悬停详情 tooltip）。 |
| **侧栏 · 会话历史** | 分组列表、会话卡片、更多菜单（置顶 / 重命名 / 复制 / 删除，原型级 UI）。 |
| **主列顶栏** | 角色管理芯片（含「更多」：<strong>自定义角色</strong>、<strong>打开模型设置（暂不支持）</strong>、<strong>添加角色</strong> 打开<strong>角色选择弹窗</strong> <code>#orc-role-picker-overlay</code>，示例数据与三芯片 / 设置下拉同源）、`+ 选择模型`。 |
| **主列滚动区** | **空态**：场景卡片网格、快捷提示词芯片（右上角 **ⓘ** 说明）；**有会话**：用户气泡与工具栏、助手消息、多模型对比区、综合总结（可折叠）；各区块 **ⓘ** 与底栏共用同一说明气泡组件。 |
| **底栏 Composer** | 输入框、底栏图标行（附件 / 记忆 / 多模型对比 / 联网与工具等）、语音与发送；输入区与图标行<strong>无中缝线</strong>、图标行<strong>无单独灰底</strong>。<strong>ⓘ 底栏说明</strong>：<code>#orc-composer-help-btn</code> → <code>#orc-help-tip-popover</code> + <code>orc-help-tpl-composer</code>（长说明、<code>data-orc-prototype-annotation</code> 可剥离）；输入行为见模板首段；a11y：<code>label.visually-hidden</code> + <code>aria-labelledby</code>。 |
| **浮层** | 模型选择器、模型设置、对话记忆滑块、会话菜单、侧栏 tooltip、**全页说明气泡**（`bindOrcHelpTips`）。（**Compare to** 直接打开同一模型选择器，无独立小浮层。） |

### 2.2 主路径与分支

1. **空态 → 发首条**  
   - 用户输入或点快捷芯片 → **Enter**（**Shift+Enter** 换行）或点发送。  
   - **输入校验**：若文本框去空白后为空，逻辑会填入默认提示「请介绍下西安天气与出行建议。」（真实产品应改为明确提示或禁止发送，需在 PRD 中二选一）。  
   - 发送后：`#orc-empty` 隐藏，`#orc-thread` 展示；用户气泡写入内容；助手区展示占位文案；若处于集合对比模式则刷新对比区标题与多列示意 HTML。

2. **单模型切换**  
   - 侧栏点击某模型行：若模型选择器已打开，先同步弹层多选为该行再关闭并应用；否则直接 `setActiveModel`。  
   - 底栏「模型名」或「+ 选择模型」→ 打开选择器 → 多选行点选切换勾选（至少保留一个）→ **完成** 应用 / **取消** 丢弃。

3. **进入多模型对比**  
   - 来源：空态卡片、`多模型对比` 按钮、选择器内「进入多模型对比…」、底栏「多模型对比」、助手区 **Compare to**（打开选择模型弹窗，**完成** 后写入侧栏）。  
   - 行为：`enterCompareModeWithKey` 加载 `MODEL_COLLECTIONS` 预设 id；窄屏可自动展开侧栏抽屉；侧栏出现集合工具条，列表行为切换为对比多选。

4. **集合内发送**  
   - 若 `activeCollectionKey` 存在且 `selectedCompareIds` 为空：拦截发送，`alert`「请至少勾选一个参与对比的模型。」（正式版应替换为非阻塞 Toast + 侧栏高亮）。  
   - 否则与单发相同入口，但对比 UI 使用 `updateCompareUIFromSelection` 注入用户问题摘要与参与模型名。

5. **Compare to**  
   - 点击后打开与顶栏相同的 **`orc-picker-overlay` 选择模型弹窗**（`openPickerFromCompareTo`）；初始勾选与 `initCompareToDraftFromState` 一致。  
   - **完成**：经 `applyPickerSelectionToApp` — 多选时 `applyMessageComparePick`，侧栏标题「消息内对比」；窄屏可展开模型侧栏。**取消**：丢弃弹层内草稿。  

6. **模型设置**  
   - 在选择器内点设置图标 → 关闭选择器并打开设置遮罩（避免双层弹层）。

### 2.3 状态机（原型已实现 / 待接 API）

| 状态 | 表现 | 备注 |
|------|------|------|
| **空会话** | 展示场景卡片、对比入口、快捷芯片；隐藏线程区。 | `setConversationActive(false)` |
| **有会话（单模型）** | 展示线程；对比区为默认静态示意或恢复默认文案。 | 无 `activeCollectionKey` 或仅单选 |
| **有会话（对比集合）** | 底栏模型名为「对比 · N 个模型」；对比区副标题带用户问题截断与模型列表。 | |
| **模型选择器打开** | 草稿多选与 `pickerPreviewId` 驱动右侧参数预览。 | 仅 **取消** 丢弃草稿；遮罩与 Esc 不关闭弹层 |
| **记忆滑块** | `1–64`，实时更新徽章与说明文案。 | 未接 API |
| **收藏模型** | 读写 `localStorage` key `trinity_orc_fav_models`。 | 与弹层/侧栏列表同步 |
| **加载 / 流式** | 未实现；助手为一次性占位文本。 | API 阶段需补骨架屏或打字指示 |
| **错误** | 对比左栏「未响应」为静态示例；发送无网络错误态。 | 需 PRD 定义错误码与重试 |

### 2.4 表单与校验（当前与建议）

| 控件 | 当前行为 | 正式产品建议 |
|------|-----------|----------------|
| 消息 textarea | 空内容发送时使用默认问题 | 禁用发送或行内「请输入消息」 |
| 对比集合下 0 选 | `alert` | Toast + 侧栏勾选引导 |
| 复制 | `navigator.clipboard`，失败则 `execCommand` 兜底，再失败 `alert` | 保留兜底；可记录埋点 |

### 2.5 响应式与可访问性（与实现对齐）

- **断点**：`TrinityAI/app/chat/chat-openrouter.css` 中与 `@media (max-width: 899px)`、`720px` 等配合：`orc-mobile-drawer-open`、侧栏折叠、选择器单列等；模块文档以代码为准迭代。  
- **键盘**：选择器打开时 **`Escape` 不处理**（须点取消/完成）；选择器未打开时 `Escape` 关闭设置、记忆、会话菜单等（见 `TrinityAI/app/chat/chat-openrouter.js`）；已无独立 Compare to 浮层，`closeCompareToPopover` 仅复位触发条 `aria-expanded`。  
- **a11y**：主要按钮与 `role="dialog"` / `aria-modal` / `aria-expanded` / `aria-controls` 已在关键浮层使用；后续 PRD 可规定焦点陷阱与 `return` 焦点顺序。

### 2.6 原型说明剥离（统一标记）

- **约定**：凡需从交付物中一键去掉的 ⓘ 按钮、说明气泡容器、`<template id="orc-help-tpl-*">`、帮助用 SVG sprite、以及「采样参数」里指向 ⓘ 的提示句等，均在 **opening tag** 上使用同一布尔属性：**`data-orc-prototype-annotation`**（无属性值，与 HTML5 布尔写法一致）。
- **脚本**：`scripts/strip-orc-prototype-annotations.mjs` 按该属性整段移除元素（含子节点），不依赖额外 npm 包。
- **用法**：`npm run strip-prototype-annotations -- TrinityAI/app/chat/index.html --out <输出路径>`；确认后再用 **`--write`** 覆盖源文件。剥离后若页面中已无 `#orc-help-tip-popover`，`TrinityAI/app/chat/chat-openrouter.js` 中 `bindOrcHelpTips` 会直接返回，其余逻辑不受影响。

---

## 3. 产品参考

| 参考对象 | 借鉴点 | 不借鉴 / 差异 |
|----------|--------|----------------|
| **OpenRouter / 聚合模型站** | 按能力/价格浏览模型、多供给商标识、对话前选型。 | 本页不实现真实路由计费；模型数据为前端写死。 |
| **ChatGPT / Claude 网页端** | 左侧会话历史、空态快捷建议、主列对话流、底栏合成器。 | 无官方「多列同屏对比」布局；本产品在单线程内做对比与总结示意。 |
| **Cursor / IDE Chat** | 窄屏抽屉、顶栏次要操作、紧凑图标栏。 | 无代码 Diff 绑定；Icon Rail 为产品级占位。 |

**多模态说明**：若后续投喂竞品截图迭代本页，默认采用 **结构优先**（见 skill）：提取分区与交互顺序，样式回落到 `Trinity/assets/trinity-base.css` + `TrinityAI/app/chat/chat-openrouter.css` 的变量与 §1.4 字号阶梯；不逐像素复刻第三方主色与圆角。

---

## 4. 实现索引（便于开发对照）

| 类型 | 路径 |
|------|------|
| 页面骨架 | `TrinityAI/app/chat/index.html` |
| 交互逻辑 | `TrinityAI/app/chat/chat-openrouter.js` |
| 样式 | `TrinityAI/app/chat/chat-openrouter.css`、`Trinity/assets/trinity-base.css` |
| 顶栏注入 | `data-or-page="chat"` 与 `trinity-base.css` 导航约定 |
| 去掉 ⓘ 原型标注 | `scripts/strip-orc-prototype-annotations.mjs`（`npm run strip-prototype-annotations`） |
| **Vue 五件套（现网）** | `apps/trinity-ai/src/views/chat/` |

---

*归档前版本：与静态 Chat 原型同步；现网以 `views/chat/README.md` 为准。*
