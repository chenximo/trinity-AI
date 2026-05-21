# Trinity 设计枢纽（色板 + 规范）落地计划

> **文档类型**：设计基础设施落地计划（`apps/trinity-design` + `packages/tokens` + `packages/ui`）。  
> **首期范围**：在 **`apps/trinity-design`** 落地 **`/design-tokens`** 与 **`/design-spec`**；其余产品线静态页后续按模块迁移。  
> **日常操作**：[`../00-协作与工作流/Trinity开发枢纽与AI协作流程.md`](../00-协作与工作流/Trinity开发枢纽与AI协作流程.md) §4 · **工程基座**：[`../04-工程与迁移/Trinity前端Vue与Monorepo工程方案.md`](../04-工程与迁移/Trinity前端Vue与Monorepo工程方案.md) §4.2

---

## 1. 总体策略（全量替换 HTML 的最终形态）

| 阶段 | 做什么 | 产出 |
|------|--------|------|
| **A. 参考与基础设施先迁** | 设计色板、设计规范、（后续）静态壳组件演示 | 独立或小应用内路由；`packages/tokens` 与规范 **对齐** |
| **B. 产品线按 app 迁移** | `TrinityAI`、`TrinityCloud`、`Trinity GEO`、各 Admin | 对应 `apps/*` 内路由 + Mock；旧 HTML **保留至对等**后下线或 302 |
| **C. 收口** | 删除或仅保留跳转页；`assets/trinity-base.css` 瘦身或迁入 `tokens` | 单一技术栈构建与部署 |

**原则**：**不对等不删旧页**；书签与外链可在一段时间内通过 **静态页 `<meta refresh>` 或说明条** 指向新地址。

---

## 2. 首期为什么先做「色板 + 规范」

1. **单一事实来源**：后续所有 Vue 页面与 `packages/ui` 都依赖 **token 与规范**；先迁这两页，后面产品页 **少返工**。  
2. **依赖清晰**：色板页主要绑 **`trinity-base.css` + 页内 `.dt-*`**；规范页额外绑 **`admin.css`、`chat-openrouter.css`**（画板示意），首期计划里要把 **样式依赖边界** 写死。  
3. **交互相对可控**：以展示 + 主题切换 + 少量画板交互为主，**业务接口少**，适合验证 **Vue + Uno + tokens 包** 的串联。

---

## 3. 首期落地形态（建议）

### 3.1 新建一个小型应用（推荐）

- **目录**：`apps/trinity-design`（**已建骨架**，端口 **5210**；若曾考虑 `design-reference` 则不再使用）。  
- **包名**：`@trinity/app-trinity-design`。  
- **路由**（示例）：  
  - `/` → 重定向到 `/design-tokens` 或做索引页（两页入口）。  
  - `/design-tokens` → 设计色板。  
  - `/design-spec` → 设计规范。  
- **端口**：与现有 5201–5204 错开，例如 **5210**（在 `apps/README.md` 与根 `package.json` scripts 登记）。

**理由**：色板/规范是 **套件级参考**，不宜塞进 `trinity-ai` 产品路由里混排；单独 app 构建产物也可 **单独部署**「只给评审看」的静态站。

### 3.1.1 开发枢纽（与独立 `trinity-design` 并存）

- **`apps/trinity-portal`**（`@trinity/app-portal`，默认 **5173**）：根目录 **`npm run dev`** 单进程内通过路由 **懒加载** 同一套 `DesignTokens.vue` / `DesignSpec.vue` 及各产品骨架页；路径与独立设计站一致（`/design-tokens`、`/design-spec`），便于评审与 AI 对照。  
- **操作与扩展清单**：见 [**Trinity开发枢纽与AI协作流程.md**](../00-协作与工作流/Trinity开发枢纽与AI协作流程.md)。独立 **`npm run dev:trinity-design`**（5210）仍保留，用于只调设计站或对比 Vite 行为。

### 3.2 与旧静态设计页的关系

- **仓库已移除** `TrinityAI` 根目录下的 **`design-tokens.html` / `design-spec.html`**；色板与规范 **仅在 Vue 应用内**迭代（`apps/trinity-design`）。  
- 外链或书签若仍指向旧路径，由产品侧用 **部署说明或跳转** 自行处理（本仓库不再保留同名静态文件）。

---

## 4. 设计枢纽、对外展示、Figma 与「app → 组件库 → 规范」回流

本节落实与产品达成一致的 **职责分工**：总览给谁看、库里有什么、和 Figma 怎么接、组件如何从产品沉淀回规范。

### 4.1 角色分工（避免双轨）

| 层级 | 职责 | 说明 |
|------|------|------|
| **`apps/trinity-design`** | **对外总览**：色板 / 规范 **成品站点**（路由 `/design-tokens`、`/design-spec`）；可单独部署 URL，给评审、对外演示。 | **不**再定义一套与 `packages/tokens` 冲突的色值；总览页 **消费** tokens 与 ui。 |
| **`packages/tokens`** | **token 定义的唯一实现**（CSS 变量等），全仓库产品与设计枢纽 **共用**。 | 色板页是 **展示与说明这些变量**，不是第二份数据源。 |
| **`packages/ui`** | **可复用原子 / 组件**的实现；各 **产品 app** 与 **设计枢纽** 都 **import** 使用。 | 实现只维护在 **ui**，总览里只写示例与链接。 |

### 4.2 对外展示与 Figma（分期即可）

- **对外**：`trinity-design` **build 后静态托管**（与产品站分域名或子路径均可）。  
- **Figma · Token**：从 **`packages/tokens`** 导出 **设计 token JSON**（如 W3C Design Tokens / Style Dictionary 等团队选定格式），经 **Variables / Token 插件** 进入 Figma；总览 HTML 侧重 **人类阅读 + 锚点导航**。  
- **Figma · 组件**：以 **`packages/ui` 文档站**（Histoire / Storybook / VitePress 等，后续择一）提供 **组件列表与状态**；Figma 侧 **对照链接** 维护即可；若日后需要强同步再评估专用插件或工作流。

### 4.3 从各 app 抽取组件 → 丰富组件库与设计规范（固定四步）

1. **在产品 app 内**将交互与 props **稳定**（避免把业务草稿直接进库）。  
2. **迁入 `packages/ui`**：剥离 Mock、路由、产品专有文案；保留 **通用视觉与无障碍行为**。  
3. **更新设计枢纽**：在 **规范 / 色板** 相应章节 **增加或调整示例**（或链至 `ui` 文档站新章节），使 **「规范文字 ↔ 真实组件」** 一致。  
4. **若缺 token**：仅在 **`packages/tokens`** 增补语义变量；**不在** `trinity-design` 内写死重复的 hex。

---

## 5. 设计色板路由（`/design-tokens`）迁移计划

### 5.1 资产盘点（1 次性）

- [ ] 统计 **章节结构**（侧栏导航、各 `dt-section` / 大区块）。  
- [ ] 列出 **仅用 `trinity-base.css` 变量** 与 **页内 `.dt-*`** 的分工；标出 **与产品页重复的样式** 是否应上收到 `packages/tokens` 或 `packages/ui`（仅文档用样式可留在 app 内 `scoped` / `*.css`）。  
- [ ] 记录 **主题切换** 行为（与 **`trinity-ai-app-shell`** 的 `data-theme` / `localStorage` 键名 **保持一致**，键名 **`trinity_or_theme`**）。

### 5.2 技术实现顺序

1. **壳**：`apps/trinity-design` 引入 `@trinity/tokens/theme.css` + 仍 **全局引入 `assets/trinity-base.css`**（首期可保留，减少一次性搬运 CSS 量；二阶段再把 **仅色板需要** 的规则迁入 tokens 或 app 私有样式）。  
2. **布局**：用 Vue 拆 **顶栏 / 侧栏 / 主列**（可与现 HTML 结构 **DOM 平行迁移**，便于 diff）。  
3. **内容块**：按章节拆 **子组件**（如 `DtSectionPrimitives.vue`），**先像素与语义对齐**，再考虑用 Uno 替换部分 `.dt-*`（避免首周双轨大改）。  
4. **路由**：`/design-tokens`；重要 **锚点 id** 与现页 **尽量一致**，便于文档互链。  
5. **验收**：浅色 / 深色 / system 三态下 **抽样对照**（主色、surface、表格、代码块）；窄屏断点抽查。

### 5.3 风险与缓解

- **风险**：内联样式量大，一次改写易漏块。  
- **缓解**：按 **侧栏目录顺序** 逐段迁移 + 每段合并前 **截图或 checklist**。

---

## 6. 设计规范路由（`/design-spec`）迁移计划

### 6.1 依赖说明（必须写进实现 README）

现页 **额外** 引入：

- `../TrinityAI_Admin/admin.css`  
- `app/chat/chat-openrouter.css`  

用于 **画板内** 与 Admin / Chat **同源的控件示意**（筛选、弹窗、侧栏列表等）。

### 6.2 技术实现顺序

1. **样式策略（二选一，首期定一种）**  
   - **方案 A（推荐首期）**：在 **`trinity-design`** 的 **`DesignSpec.vue`** 内 **`import`** `admin.css` 与 `chat-openrouter.css`（及页内 `design-spec-page.css`），保证画板 **最快对齐现页**，且 **不**在仅打开色板时全量加载这两份 CSS。（以仓库 **当前实现** 为准，亦见 [开发枢纽](../00-协作与工作流/Trinity开发枢纽与AI协作流程.md) §4.3。）  
   - **方案 B（二期）**：把画板用到的类 **抽成 `packages/ui` 文档专用样式** 或 **Uno shortcuts**，再逐步去掉对 `admin.css` / `chat-openrouter.css` 的全量依赖（减耦合、减体积）。  
2. **脚本**：现页底部 **内联/外链脚本**（如画板下拉、弹窗示意）→ 拆为 **`composables/` 或小组件内 `setup`**，避免再堆 `<script>` 在 `index.html`。  
3. **布局**：`ds-main`、`ds-board` 等与现结构对应；**交互画板** 与 `design-spec` 文档 **§ 编号** 对齐，便于评审对照。  
4. **路由**：`/design-spec`；**章节 id**（如 `#ds-modal`）尽量保留。  
5. **验收**：与色板页 **交叉链接**、与 `design-tokens` 页 **互链**；画板内 **形式 1 / 2 / 3** 与弹窗示意 **可操作**。

### 6.3 风险与缓解

- **风险**：`design-spec` 依赖 **多份全局 CSS**，易产生顺序/特异性问题。  
- **缓解**：首期 **方案 A** 原样引入；在 app 内 **单一 `design-spec.css` 入口文件** 里 `@import` 顺序与现 HTML **一致**，并注释来源。

---

## 7. 与 `packages/tokens`、`packages/ui` 的协同

| 事项 | 首期建议 |
|------|----------|
| **tokens** | 色板迁移过程中，把 **「文档页专用、且应全局统一」** 的变量 **回填** `packages/tokens/src/theme.css`（或拆 `tokens/palette.css`），并在 `design-tokens` Vue 页 **优先使用变量**。 |
| **ui** | 规范画板里 **可复用的原子**（按钮、药丸触发器壳）**逐步**迁入 `packages/ui`；**首期允许**画板仍用全局 class，避免阻塞整页上线。 |

---

## 8. 验收清单（首期两页共用）

- [ ] 两路由在 **`npm run dev`** 下可访问，**`npm run build`** 产物可静态部署。  
- [ ] 主题切换与现逻辑 **键名、三态表现** 一致或已文档说明差异。  
- [ ] 与 **`DesignTokens.vue` / `DesignSpec.vue`** 及 **`src/assets` 中画板片段** **主要区块无缺失**（允许文案微调，但需记录在 MR）。  
- [ ] （可选）在 `` 增补设计枢纽摘要，或仅在 `trinity-design` 模块 README 写参考来源与路由。

---

## 9. 首期之后（预告，不执行）

- 各产品静态页 → 对应 `apps/*`（见总工程方案）。  
- `trinity-base.css` **收敛**：仅保留 reset / 真正全局；其余进 tokens 或各 app。  
- 考虑 **删除 `uno-demo/`** 或并入 `trinity-design` 的 demo 路由。

---

## 10. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-11 | 新增 §4：设计枢纽职责、对外部署、Figma（token JSON + `ui` 文档站）、app→ui→规范 四步回流；顺延后续章节编号；§3.1 固定为 `apps/trinity-design` 并已建 Vite 骨架。 |
| 2026-05-11 | `trinity-design` 已迁入 `design-tokens` / `design-spec` 正文与页内样式（`src/assets/*.html?raw` + `*.css`）；`trinity-base.css` 与 Vite 构建兼容处修复一处多余 `}`。 |
| 2026-05-13 | 初稿：全量迁移总览 + 首期色板/规范拆分与依赖策略。 |
| 2026-05-13 | 补充 §3.1.1：`trinity-portal` 单端口聚合与独立设计站并存；§6.2 方案 A 落点改为 **`DesignSpec.vue` 内 import**（与实现一致）；交叉引用开发枢纽文档。 |
| 2026-05-20 | 更名并迁入 `01-原型与交付规范/`（原 `02/Trinity设计规范与设计色板Vue迁移计划.md`）。 |
