---
name: trinity-tob-marketing-site
description: >-
  Trinity ToB 官网 / 营销落地页（Vue 高保真）统一协作：色板与 trinity-base token、
  版式（50px 顶栏 / 15% 正文）、字阶、按钮与表单、顶栏壳层、方案矩阵导览区配图、
  Hero/咨询/页脚等模块边界与部署 base。在改 apps/ai-cloud、apps/trinity-ai 营销首页、
  ToB 落地页、方案矩阵 Tab 配图、COS 子路径部署，或用户说「ToB 官网原型」「AI实现Tob官网」
  「遵循营销页规范」「方案矩阵配图」时使用。与 trinity-design-tokens、
  trinity-vue-prototype-monorepo 叠加；控制台列表页用 trinity-user-console，后台用
  trinity-admin-ruoyi-list。
---

# Trinity · ToB 官网营销页（统一 Skill）

## 定位

**一个 Skill 管一类页面**：企业 ToB **营销首页 / 解决方案长页**（非控制台表格、非运营后台 CRUD）。

| 用本 Skill | 改用其它 Skill |
|------------|----------------|
| `apps/ai-cloud` 首页、`apps/trinity-ai` home | `trinity-user-console`（`account/console`） |
| 方案矩阵导览区 + 左侧场景 mockup | `trinity-admin-ruoyi-list`（`apps/*-admin` 列表） |
| Hero、能力栅格、咨询表单、页脚 | 仅改 `packages/ui` 原子 → 先 `design-spec` + 本 Skill |

**Agent 执行顺序（必读）**

1. 本 Skill（范围 + 检查清单 + 模块规则 ID）
2. `.cursor/skills/trinity-design-tokens/SKILL.md`（色板、按钮、弹窗、禁止魔法色）
3. `.cursor/skills/trinity-vue-prototype-monorepo/SKILL.md`（Monorepo、app 结构、Mock）
4. 专题：`docs/08-方法论与汇报/AI实现Tob官网原型方法论/`（方案矩阵配图附录与参考图）

**视觉验收（浏览器）**

- `/design-tokens`、`/design-spec`（`apps/trinity-design` 或门户同源）
- 目标 app：`/ai-cloud` 或 `/trinity-ai`（门户 `apps/trinity-portal`）

---

## 单一事实来源（MUST）

| 维度 | 真源 | 禁止 |
|------|------|------|
| 色 / 主题 | `assets/trinity-base.css` `var(--*)`；色板页 `TrinityAI/design-tokens.html` | 业务 CSS 硬编码 hex（除 token 定义处） |
| 控件类名 | `TrinityAI/design-spec.html`；`@trinity/ui` 已有原子 | 自造第二套按钮/筛选类名 |
| 全站版式 | `docs/01-原型与交付规范/Trinity版式与视觉规范.md` | 单页另起 50px / 15% 魔法数 |
| 营销页模块 | 现网样例 `apps/ai-cloud/src/views/home/HomePage.vue`（AI 云最全） | 无参照的大范围重设计 |
| 方案矩阵配图 | `AI实现Tob官网原型方法论/ToB官网-方案矩阵导览区配图协作方法论.md` + `方案矩阵配图-参考图/ref-01-*` | 无附图的「好看」「架构图」 |

---

## 规范维度清单（除色板、字体外还要统一什么）

### A. 设计 token 与主题

- **TOB-MKT-TOK-01**：页面已引 `trinity-base.css`；暗色用 `html[data-theme]` 约定，不单独写死深色 hex 墙。
- **TOB-MKT-TOK-02**：主色 `var(--blue)`、渐变 `var(--grad)` / `.btn-gradient`、选中描边 `var(--blue-ring)`。
- **TOB-MKT-TOK-03**：表面层级 `--bg` / `--surface` / `--surface-2` / `--border` / `--muted*`。

### B. 字体与字阶

- **TOB-MKT-TYP-01**：字体栈 `Inter`, `Noto Sans SC`（与 `trinity-base` 一致）。
- **TOB-MKT-TYP-02**：营销首页优先 **px 字阶变量**（AI 云：`--home-font-display` … `--home-font-micro`），窄屏仅允许规定 breakpoint 降级（见该页 README）。
- **TOB-MKT-TYP-03**：字重：标题 600–700，正文 400–500；勿混用 rem 与 px 同一区块。

### C. 版式与留白

- **TOB-MKT-LAY-01**：顶栏 / 页脚左右 **`--page-gutter`（50px）**。
- **TOB-MKT-LAY-02**：`main` 内营销区块 **`padding-inline: 15%`**；内层 `home-shell` **不再**叠 50px。
- **TOB-MKT-LAY-03**：区块纵向节奏用现有 section 类（`home-section` 等），改间距先改 CSS 变量而非散落 margin。
- **TOB-MKT-LAY-04**：内容最大宽度与栅格跟样例页（如 bento `--home-bento-*`），新块先对齐 AI 云再抄到其它产品线。

### D. 组件与交互（营销页常用）

- **TOB-MKT-CMP-01**：主 CTA `.btn.btn-gradient`；次按钮线框/幽灵与 `design-spec` 一致。
- **TOB-MKT-CMP-02**：顶栏：`header.or-inject` + `data-or-page`；导航 pill/下划线态与现网 AI 云一致。
- **TOB-MKT-CMP-03**：云厂商 **Tab**：`role="tablist"` + 面板 `role="tabpanel"`；hash 与 Tab 联动（见 AI 云 `HOME_CLOUD_NAV_VENDORS`）。
- **TOB-MKT-CMP-04**：咨询表单：原生字段 + 页内校验；**无**真实发信 API（原型 `alert` 或占位）。
- **TOB-MKT-CMP-05**：登录弹窗用 `@trinity/ui` `TrinityAuthModal`，不另起 modal DOM。
- **TOB-MKT-CMP-06**：形式 2 筛选若出现，必须用 `or-app-filter-dd-*` + `adm-form2-dd.js`（营销页少见，以规范为准）。

### E. 页面模块（AI 云首页 = 模块字典）

改「某一区块」时 **只动该区块** + 对应样式，并在派活里写模块名：

| 模块 id / 锚点 | 内容 |
|----------------|------|
| 首屏 `home-banner` | Hero、CTA、统计、pills、轨道动效 |
| `home-overlap` | 四宫格快速入口 |
| `#cloud-solutions` | **方案矩阵导览区**（Tab + 左图右文 + scene tag） |
| `#why` | 降本 / 零承诺 / 核心赋能 / bento |
| `#benefits` | 三栏对比 |
| `#process` | 五步流程 |
| `#consult` | 咨询表单 |
| `home-footer` | 页脚（对齐 trinity-ai 字号分割线） |

### F. 方案矩阵导览区 · 分区叙事配图（子流程）

触发配图任务时 **必读** `AI实现Tob官网原型方法论/ToB官网-方案矩阵导览区配图协作方法论.md`：

- **附图**：`方案矩阵配图-参考图/ref-01-叠卡UI-协作场景-主参考.png`（视觉语言）
- **公式**：参考图 + 场景名词 + 禁止项 + 落点 + 矩阵等高
- **默认实现**：每导览项 `*CloudSceneVisual.vue`（Vue 叠卡 mockup），非整屏 AI 生图
- **TOB-MKT-VIS-01**：矩阵内 **同风格、不同场景**；禁止六套信息图画风分裂
- **TOB-MKT-VIS-02**：绘图区高度与样例项一致（AI 云 `--home-uc-art-h` / lrbt 规则）

### G. 工程与部署

- **TOB-MKT-ENG-01**：代码在 `apps/<product>/src/views/home/`，样式同文件或 `home.css`；引入 `@repo/assets/trinity-base.css`。
- **TOB-MKT-ENG-02**：子路径部署：`vite.config` `base`（如 `/trinityai-demo/`），`createWebHistory(import.meta.env.BASE_URL)`。
- **TOB-MKT-ENG-03**：门户演示：`apps/trinity-portal` 路由 `/ai-cloud`、`/trinity-ai`；外链套件首页默认 `/ai-cloud`（见 `TrinityAiShellLayout` `suiteHomeHref`）。
- **TOB-MKT-ENG-04**：构建 `npm run build -w @trinity/app-ai-cloud`；COS/Nginx 需 **SPA 回退** `index.html`。

### H. 原型边界（NEVER）

- **TOB-MKT-NO-01**：不接真实邮件/CRM API，除非用户明确要求后端。
- **TOB-MKT-NO-02**：不为「顺手对齐」整页重设计；未要求不改其它 Tab 文案与其它产品线。
- **TOB-MKT-NO-03**：方案矩阵配图禁止设备外框、拓扑主视觉、无附图的抽象 SVG 占位（除非用户要示意图）。

---

## 用户一句话触发（推荐）

任务中写清其一即可自动套用本 Skill：

-「按 **ToB 官网 / 营销页** 规范」
-「遵循 **trinity-tob-marketing-site**」
-「按 **AI实现Tob官网** 方法论 + **ref-01** 参考图」
-「只改 **#cloud-solutions** 某云 Tab 左侧图」

---

## 派活模板（复制）

```text
【Skill】trinity-tob-marketing-site + trinity-design-tokens
【产品/页面】apps/ai-cloud 首页 #cloud-solutions · 导览项「{云厂商}」
【规范】色板 trinity-base；版式 50px 顶栏 + 15% 正文；字阶同 AI 云 --home-font-*
【模块】方案矩阵导览区 · 分区叙事配图 only
【参考图】AI实现Tob官网原型方法论/方案矩阵配图-参考图/ref-01-叠卡UI-协作场景-主参考.png
【场景】{3～5 个业务名词}
【禁止】拓扑主视觉、设备框、魔法色、改动右侧文案与其它 Tab
【验收】切换六 Tab 配图等高；门户 /ai-cloud 预览
```

---

## 交稿前检查清单

- [ ] 色/字/间距来自 `var(--*)` 或 `--home-*` token，无新增孤立 hex
- [ ] 顶栏 50px、正文 15% 未双层 gutter
- [ ] 按钮/弹窗类名与 `design-spec` 一致
- [ ] 若改方案矩阵区：符合附录 B + ref-01 视觉 DNA，六 Tab 等高
- [ ] 若改部署 base：已 rebuild，`index.html` 资源路径带 base 前缀
- [ ] 未改用户控制台 / 运营后台列表（除非任务明确）

---

## 文档索引（人读 · Agent 按需深读）

| 路径 | 用途 |
|------|------|
| `docs/08-方法论与汇报/AI实现Tob官网原型方法论/README.md` | 本专题目录 |
| `docs/08-方法论与汇报/AI实现Tob官网原型方法论/ToB官网-统一规范与Skill索引.md` | 维度说明 + Skill 关系图 |
| `docs/08-方法论与汇报/Vue原型生成最佳实践-Skill规范页与验收.md` | 为何用 Skill + 规范页三层 |
| `apps/ai-cloud/src/views/home/README.md` | AI 云首页锚点与部署 |

**维护**：营销页新模块定型 → 先补 `design-spec` 或 AI 云样例 → 再增本 Skill 一条规则 ID；方案矩阵配图变更 → 同步 `ToB官网-方案矩阵导览区配图协作方法论.md` 附录。
