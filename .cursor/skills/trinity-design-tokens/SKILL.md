---
name: trinity-design-tokens
description: >-
  Trinity 静态站点的设计 token、色板页与视觉规范：单一事实来源、语义变量命名、
  选中描边与合成浅色卡公式；控制台 account 页「标题行 + 与 API 密钥同源的筛选框」。
  在改色、加 UI、对齐 TrinityAI/TrinityCloud、评审色板或避免硬编码 hex 时使用；
  与 assets/trinity-base.css、TrinityAI/design-tokens.html、TrinityAI/design-spec.html（筛选下拉统一形式 2 与页头约定）、
  docs/01-原型与交付规范/Trinity版式与视觉规范.md、account/console 列表页头相关时优先遵循。
  定稿前：组件样式以规范页迭代为准，不扩散改业务页（见 skill 内「规范先行」与 .cursor/rules/trinity-design-spec-first.mdc）。
disable-model-invocation: true
---

# Trinity 设计色板与规范

边界：[`./DOMAIN.md`](./DOMAIN.md) · Workflows：[`update-token`](./workflows/update-token.md)、[`audit-page-style`](./workflows/audit-page-style.md) · 确认：[`./confirmation.md`](./confirmation.md)

## 单一事实来源

- **全局 token**：`assets/trinity-base.css` 的 `:root` 与 `html[data-theme="dark"]` / `html[data-theme="system"]`（及 `prefers-color-scheme: dark`）覆盖。Trinity AI / Cloud 页面经相对路径引用该文件。
- **可视化色板**（可切换主题、读计算色与渐变原文）：`TrinityAI/design-tokens.html`。
- **设计规范**（筛选形式 2、**按钮原子**、**弹窗** `or-modal-head` / 底栏纯文字、类名速查）：`TrinityAI/design-spec.html`（顶栏「规范·参考」入口并列色板）。
- **版式与产品目录约定**：`docs/01-原型与交付规范/Trinity版式与视觉规范.md`（含主色 `#2563eb`、圆角 `--radius` / `--radius-lg`、与 Admin 对齐说明）。
- **设计枢纽落地**：`docs/01-原型与交付规范/Trinity设计枢纽（色板+规范）落地计划.md`（`/design-tokens`、`/design-spec`、`packages/tokens`）。

业务样式里**优先 `var(--*)`**，避免与色板漂移；新增语义色应在 `trinity-base.css` 定义变量后再引用。

## 规范先行（定稿前不改业务页）

现在我们只写规范页面的组件样式，其他地方都不改，等把规范确定好了，最后再更新项目中的原子。

- **迭代范围**：视觉与交互以 **`TrinityAI/design-spec.html`**（及必要时 **`design-tokens.html`** 色板说明）上的示意为准；可配合 **`assets/trinity-base.css`** 中**与规范画板直接对应、且为可复用原子**的增补。
- **暂缓**：在规范未定稿前，**不要**为对齐规范去改 `console.html`、`index.html`、chat、Admin 等业务页面中的同类控件（除非用户明确说「同步到某页」）。
- **定稿后**：再开一轮「把规范里已冻结的类名与样式同步到项目原子」（`trinity-base.css` 与各业务 HTML 一致化）。

项目级持久提醒：`.cursor/rules/trinity-design-spec-first.mdc`（`alwaysApply: true`）。其中已写入：**新页面与 UI 须对齐色板 / design-spec / trinity-base**；业务页仅在用户明确要求对齐或实现功能时再改，避免无关大改。

## 核心品牌与交互 token（简表）

| Token | 典型用途 |
|-------|----------|
| `--blue` | 主色、链接、滑块 thumb、`a.acard:focus-visible` 的 `outline`、大量描边与字色 |
| `--purple` | `.text-link:hover`、链接悬停强调 |
| `--grad` / `--grad-hover` | 主按钮 `.btn-gradient`、发送类控件、场景卡顶条 `::before` 等 |
| `--pill-text` | 选中/眉条**字色**（与 `--blue-soft` 底、`--blue-ring` 边成套） |
| `--blue-soft` | 浅蓝底、悬停/选中面 |
| `--blue-ring` | **选中与弱强调描边**、焦点环（与子导航、表单 ring 一致）；芯片/卡片选中态的 `border-color` 用 `--blue-ring`，**不用** `--blue` 作选中细描边 |
| `--bg` / `--surface` / `--surface-2` | 页面与卡片层级 |
| `--text` / `--muted` / `--muted-2` / `--border` / `--border-strong` | 字阶与描边 |

已移除 **`--accent`**：与 `--blue` 同色时统一写 `var(--blue)`。

## 浅色「整卡合成底」（可复用到其它主色）

用于大块浅色面 + 轻微品牌色气（如对话空状态 **场景卡**），**不必**再定义单独合成 hex。

1. **渐变三停**：`linear-gradient(约 165deg, rgba(主色RGB, α₀) 0%, rgba(中性浅面, 0.88–0.95) 约 38%–42%, var(--bg) 100%)`；α₀ 约 **0.06–0.12**，多卡并列可递减；末停**必须** `var(--bg)` 与页底融合。
2. **卡片边框**：`rgba(主色RGB, β)`，β 约 **0.10–0.14**，通常略大于 α₀。
3. **顶条与整底分离**：条带用 `var(--grad)`（或模块专用渐变），勿与整卡底色揉成一条 `linear-gradient`。

落地变量：`--orc-scene-card-bg-1`～`4`、`--orc-scene-card-border-1`～`4`（`trinity-base.css`）；对话页 `.orc-cards-grid .orc-cat-card` 见 `TrinityAI/app/chat/chat-openrouter.css`。细节与可复制原文见 `design-tokens.html` 章节「对话场景卡合成底」。

## 控制台页头与筛选（account / console）

适用于 `TrinityAI/account/console.html` 及同源控制台列表页（用量 `#logs`、活动 `#activity` 等）。

1. **标题与右上角工具同一行**  
   - 使用 `header.or-log-pagehead`（或结构等价的 pagehead）。  
   - 第一行：`div.or-log-title-row` 内左侧 `h1.or-page-title.or-log-page-title`，右侧 `div.or-log-toolbar-end` 内依次：刷新（`or-icon-btn`）、筛选、日期范围（`or-btn-outline`，如 `or-log-daterange`）、更多（`or-icon-btn`）。  
   - 副文案用 `p.or-lead.or-log-lead`，放在标题行**下方**，勿与工具栏混在同一行。

2. **筛选与 API 密钥页搜索框同源**  
   - 使用 `label.or-keys-search.or-keys-search--toolbar`（筛选时再加 `or-keys-search--filter`），内联 `svg.or-keys-search-icon`（漏斗）+ `input.or-input.or-keys-search-input`，占位如「筛选…」。  
   - 与密钥页 `div.or-keys-toolbar` 内「按名称搜索」同一套圆角、左内边距与图标位，保证视觉一致。  
   - 表格上方的灰色说明条：沿用 `div.or-keys-toolbar` + 说明文案类（如 `or-log-toolbar-caption-txt`），**不要**再把筛选/日期塞进该行。

3. **实现参考**  
   - 样式：`assets/trinity-base.css`（`or-log-pagehead`、`or-log-toolbar-end`、`or-keys-search--toolbar` 等）。  
   - 可视化说明：`TrinityAI/design-tokens.html` →「控制台 · 页头与筛选」。  
   - 与 **`design-spec.html` 中形式 2**（药丸触发 + `listbox` 面板 + 选项右侧 ✓）对照。

## 筛选控件（下拉统一形式 2）

- **形式 2（规范图 2）**：`or-app-filter-dd-wrap`、`button.or-app-filter-dd-trigger.or-select--app`、`div.or-app-filter-more-panel[role="listbox"]`、`button.or-app-filter-dd-item`（选中态 `is-checked` + `span[aria-hidden]` ✓）。交互脚本：`assets/adm-form2-dd.js`（页尾 `<script src="...">`）。样式见 `trinity-base.css` 中 `or-app-filter-*`。
- **应用**（门户、控制台、产品内页）：`or-app-filter-row`、上述形式 2；少量场景仍可用 `or-keys-seg` 等芯片分段，见 `design-spec.html`。
- **后台**（`TrinityAI_Admin`、`account/console` 等管理向筛选）：**同样 DOM**；页面先链 `../assets/trinity-base.css` 再 `admin.css`，`body.adm-app` 将门户 `--text` / `--blue` 等桥接到 `--adm-*`；行容器可用 `adm-filter-row`；二元/三元筛选用 `adm-seg`；参考 `api-keys.html`。

## 对话 / 应用专有样式

- **`TrinityAI/app/chat/chat-openrouter.css`**：对话模块；与全局 token 叠加时保持语义一致（选中边 `--blue-ring`、链接 `--blue` 等）。
- **管理侧**：`TrinityAI_Admin/admin.css` 中 `--adm-blue` 等与门户 **同色相**（见原型规范 §1.2）。

## 代理执行清单

改 UI 颜色时：

1. 查 `trinity-base.css` 是否已有变量；若有则只改一处定义。
2. 对照 `design-tokens.html` 同主题下的观感与「核心 token 用法」样例。
3. 选中/芯片/弱边框：默认 **`border-color: var(--blue-ring)`**，不要用 `--blue` 顶替 ring 语义。
4. 大面浅色品牌底：按上节合成公式或复用 `--orc-scene-card-*`，避免魔法数字散落。
5. **新增/调整筛选、按钮、下拉等原子控件时**：先在 **`design-spec.html`**（及 token 文档）把形态与类名定稿；**定稿前不要**顺带改 `account/console.html` 等业务页。定稿后再按「规范先行」一节做项目级同步。

## 延伸阅读（按需打开）

- `docs/01-原型与交付规范/Trinity版式与视觉规范.md`：跨产品路径、字号阶梯、布局边距。
- `docs/01-原型与交付规范/Trinity设计枢纽（色板+规范）落地计划.md`：色板/规范 Vue 迁移与 Monorepo 关系。
- `TrinityAI/design-tokens.html` 内联脚本：主题切换、`readCssVar`、渐变/场景变量原文展示逻辑。
