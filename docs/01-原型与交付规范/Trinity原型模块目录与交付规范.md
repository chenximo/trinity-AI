# Trinity 原型模块 · 目录与交付规范

> **定位**：Trinity 仓库内 **Vue 原型交付的唯一规范真源**（目录、五件套、README、视觉摘要、双仓交接）。其它文档仅补充：[`00-协作与工作流/`](../00-协作与工作流/)（门户命令、双仓操作细节）、[`Trinity版式与视觉规范.md`](./Trinity版式与视觉规范.md)（颜色字号边距全文）、[`02-后台运营管理系统设计/`](../02-后台运营管理系统设计/)（运营后台列表）、[`03-用户后台管理系统/`](../03-用户后台管理系统/)（租户控制台）、[`08-方法论与汇报/`](../08-方法论与汇报/)（为何五件套，可选读）。  
> **适用范围**：以 `apps/trinity-ai`、`apps/trinity-ai-admin` 等为主；其它 app 可引用本文件并在一句话内写明差异。  
> **真源策略**：新模块只在 **`apps/*/src/views/<模块>/` 五件套** 维护；`TrinityAI/` 等静态目录仅作迁移对照或归档，不与之双轨长期同步。

---

## 1. 总则

| 原则 | 说明 |
|------|------|
| **入口唯一** | 每个模块对外暴露**一个路由级入口 Vue**（或同目录 `index.vue`），路由表只指向该入口，避免「主文件」歧义。 |
| **设计对齐** | 见 **§12**（Token、`/design-spec`、`@trinity/ui`）；枢纽落地见 [`Trinity设计枢纽（色板+规范）落地计划.md`](./Trinity设计枢纽（色板+规范）落地计划.md)；新增组件见 [开发枢纽](../00-协作与工作流/Trinity开发枢纽与AI协作流程.md) §4.1.5。 |
| **不拆子组件** | 原型阶段**不在** `views/<模块>/` 下再拆多枚子 `.vue`；页面结构集中在**该入口单文件**的 `<template>` 中，复杂区段用 **HTML 注释分区**；可复用逻辑优先抽到同目录 `*Interactions.ts` / `mock.ts`。跨模块共用 UI 仍放 `packages/ui` 等公共位置，**不**算本模块内拆分。 |
| **职责分离** | 结构（Vue 模板）、样式（CSS）、交互（TS）、假数据（mock）、说明（MD）边界清晰；接 API 时优先替换 **mock**，再收敛 **交互**。 |
| **体量分级** | 复杂模块用「五件套」；简单模块允许合并，**禁止**为小页机械堆五个空文件。 |
| **真源写清** | 凡依赖**全局样式、外链设计稿或归档静态页**，必须在模块 `README.md` 写明路径或 URL；**工程实现真源**为五件套目录本身，避免口头约定。 |

**运营后台列表页**（各管理端 app，参考 `trinity-ai-admin`）：检索 + 表格 + 分页另遵 **[《运营后台-若依式列表规范》](../02-后台运营管理系统设计/运营后台-若依式列表规范.md)**（参考 `admin-keys/KeysPage.vue`），与本文五件套并行不冲突。

---

## 2. 推荐目录结构（以 `views/chat`、`views/models`、`views/shell`、`views/home` 为例）

在 `src/views/` 下为每个模块建**同名文件夹**，与路由、产品语言对齐。

```text
src/views/chat/            # Chat 已收敛为「五件套」（仅下列五个文件）
├── ChatPage.vue           # 路由入口 + 整页模板
├── chat.css
├── chatInteractions.ts    # 交互与壳层 composable（含原 patch / help / shell）
├── mock.ts                # 数据与 paintMock*（无内嵌整页 HTML）
└── README.md
```

```text
src/views/models/          # 模型目录「五件套」
├── ModelsPage.vue         # 路由入口 + 整页模板
├── models.css             # 须用非 *.module.css 的全局表（与 Chat 同理，避免类名哈希）
├── modelsInteractions.ts  # 如 body 类名、抽屉与 document 的同步
├── mock.ts                # CATALOG_MODELS、筛选/排序用纯函数等
└── README.md
```

```text
src/views/shell/            # 站点壳（父级布局 + 登录弹层）「五件套」
├── TrinityAiShellLayout.vue  # 根路由 component：顶栏、抽屉、RouterView、登录/注册弹层（单文件）
├── shell.css                # 壳层增量占位；or-* 真源见 README
├── shellInteractions.ts     # window.TrinityOR；useTrinityOrSession / Theme / UiLang（原 app composables）
├── mock.ts                  # 主导航项、各 localStorage 键名常量
└── README.md
```

```text
src/views/home/            # 营销首页「五件套」
├── HomePage.vue           # 路由入口（tai-home）+ 整页模板
├── home.css               # 全局表（非 *.module.css）
├── homeInteractions.ts    # useHomeNavigation 等
├── mock.ts                # HOME_HERO_PROVIDERS 等
└── README.md
```

**命名约定**

| 类型 | 建议 | 说明 |
|------|------|------|
| 入口 Vue | `XxxPage.vue` 或与路由一致的 `XxxView.vue` | 与 `trinityAiRoutes` 中 `component` 名称一致为佳。 |
| 样式 | `chat.css`、`models.css` 或 `*.page.css` | Chat / 模型页须用**非** `*.module.css` 的全局表，否则 Vite 会把 `orc-*` 等类名哈希化导致布局失效；避免与全局 `chat-openrouter.css` 等重名。 |
| 交互 | `chatInteractions.ts`、`useChatPrototype.ts` | 使用 **TypeScript**（`.ts`），不在规范中写「.js」以免与仓库不一致。 |
| Mock | `mock.ts` | 仅数据与纯函数；文件名保持简短。 |
| 说明 | `README.md` | 同目录优先，便于在 IDE 与 Git 中一眼看到。 |

---

## 3. 各文件职责（规范表）

| 文件 | 应包含 | 不应包含 |
|------|--------|----------|
| **入口 `.vue`** | **整页** `<template>` 与页面级逻辑；必要时 `import` 本目录 CSS / 交互绑定函数；用注释划分侧栏/主列/弹层等区块 | 在 `views/<模块>/` 下再拆多个子 `.vue`；大块假数据与冗长 DOM 脚本（应下沉到 `mock` / `*Interactions.ts`） |
| **`.css`** | 本模块专用布局与皮肤补丁；CSS 变量引用（与设计 token 对齐时） | 若样式已在全局大表中维护，此处只写**增量与例外**，并在 README 说明依赖的全局表路径 |
| **`*Interactions.ts`** | 事件委托、`document`/`window` 监听、与原型演示相关的临时行为 | 业务真源数据结构定义（放 mock 或未来的 `types` / API 层） |
| **`mock.ts`** | 列表/枚举等假数据、过滤/分组等**无 DOM** 的纯函数 | `querySelector`、`localStorage`、路由跳转 |
| **`README.md`** | 见 §6 清单 | 长篇设计论述（可链到域说明或设计稿） |

---

## 4. Mock 与交互的边界

| 维度 | Mock | 交互（`*Interactions.ts` / composable） |
|------|------|----------------------------------------|
| **数据** | 静态列表、枚举、本地持久化键名常量 | 读取 mock 或 API 结果后再驱动 UI |
| **DOM** | 禁止 | 允许 |
| **副作用** | 仅允许与「假数据演示」相关的纯计算 | 路由、弹层开关、`localStorage`、剪贴板等 |
| **接 API 后** | 通常整文件替换或改为薄封装调用 SDK | 逐段删除或改为调用 store / composable |

---

## 5. 不拆子组件时的组织方式

| 手段 | 说明 |
|------|------|
| **模板分区** | 在入口 `.vue` 的 `<template>` 内用 `<!-- 侧栏 -->`、`<!-- 主列 -->` 等注释标界，便于评审与合并冲突处理。 |
| **逻辑外置** | 列表过滤、弹层开关状态机等放入 `*Interactions.ts` 或 composable，入口只保留绑定与调用。 |
| **样式外置** | 大块样式进 `*.module.css`；与设计 spec 对齐的变量仍优先用全局 token。 |
| **历史过渡** | 若尚未收敛为「单 `ChatPage.vue` 大模板」，在模块 `README.md` 写明当前有哪些辅助 `.vue` / `raw` 及计划收敛方式。 |

### 5.1 域级长文（可选，多数模块不需要）

原「域模块说明模板」已废止。仅当**整块域**需要长文（功能范围、与相邻模块边界、设计取舍）时，**二选一**，且不与模块 README 重复抄同一段：

| 放哪 | 适合写什么 |
|------|------------|
| **`apps/<app>/doc/`** | 该 app 业务文档（与 `views/*/README` 配合） |
| **`docs/05-产品与PRD/`** | PRD、详设、批次交付计划 |

**默认**：只写 `views/<模块>/README.md`（§6 清单 + `## 工程对齐` / `## 功能说明`）即可，不必再建 `docs/modules/` 类文件。

---

## 6. 模块 `README.md` 建议目录（交付清单）

复制下面小节标题到各模块 `README.md`，按实填写；空项写「无」即可。

1. **一句话**：本页原型演示什么、与正式版的差距。  
2. **路由**：路径、`trinityAiRoutes`（或等价）中的名称、懒加载与否。  
3. **入口文件**：主 Vue 文件名。  
4. **依赖样式**：全局或模块内 CSS 路径（如 `src/views/chat/chat-openrouter.css`）、本模块 `*.module.css` 负责范围。  
5. **数据与交互**：`mock.ts` / `*Interactions.ts` 是否存在、各自职责。  
6. **结构约定**：写明「单入口、不拆子组件」；若存在过渡期的其它路径组件，列出与计划。  
7. **接 API / 正式开发时要动哪些文件**：按文件列清单。  
8. **已知缺口与风险**：未做无障碍、未接错误态、硬编码等。  
9. **参考**：设计稿或静态原型 URL/路径；域级长文见 §5.1。  
10. **二次开发补充（若有）**：见 **§6.1**；在 README 用清单表登记，避免仅依赖代码长注释。

---

## 6.1 二次开发补充功能流程（面向交付与 AI 协作）

在首版五件套交付之后，**迭代补充的原型能力**（新区块、新筛选、新弹层等）建议按下列流程记录与实现，便于人类开发者与 **AI 助手**稳定理解上下文、减少误改。

### 6.1.1 原则

| 原则 | 说明 |
|------|------|
| **README 为主、代码注释为锚** | 补充功能的**范围、涉及文件、数据/交互边界**优先写在模块 **`README.md`**（推荐用**表格清单**）；代码内只用**短注释**标区块或指针（如 `<!-- 二次开发：场景卡 -->`、`// 见 README「二次开发」`），避免大段说明与实现双轨漂移。 |
| **逻辑下沉** | 新数据、枚举、纯计算放 **`mock.ts`**；`document` / `window` / 路由跳转等放 **`*Interactions.ts`**；入口 `.vue` 保持绑定与编排，见 §4。 |
| **可检索** | 模板内用统一前缀注释（如 `<!-- 二次开发：… -->`），便于 `grep` 与 Code Review。 |
| **可对齐** | 每条补充注明 **对齐日期** 或 **PR / issue 编号**；设计稿有变更时在 README 更新链接与「已知与稿差异」。 |
| **安全** | 密钥、内网地址、客户数据**不进**注释与 mock；用占位符并在 README 写「接环境变量 / 配置中心」。 |

### 6.1.2 推荐在 README 中增加的表格（示例结构）

复制下表到各模块 `README.md` 的 **「二次开发补充」** 小节，按行增删；无补充则整节写「无」。

| 补充项 | 路由 / 入口 | 涉及文件（五件套内） | 数据（mock）/ 交互（Interactions） | 对齐日期 / 备注 |
|--------|-------------|----------------------|--------------------------------------|-----------------|
| （示例）侧栏场景卡 | `tai-chat` | `ChatPage.vue` 模板区块；`mock.ts` | `MOCK_*`；无 | YYYY-MM-DD |

### 6.1.3 代码与类型上的补充

- **导出函数 / composable**：对跨文件调用的函数加 **一行 JSDoc**（用途、副作用、与接 API 后的替代关系即可）。  
- **大模板**：沿用 §5「模板分区」；二次开发独占区块用 **HTML 注释标题** 标出，长说明仍放 README。  
- **接 API 时**：在 README 二次开发表中更新状态（已接 / 已删除 mock）；避免只删代码不删注释。

### 6.1.4 与仓库级协作的衔接（可选）

- **`.cursor/rules` / Skill**：写明「模块说明以 `views/<模块>/README.md` 为准」，并链到本文件 §6。  
- 设计输入以 README **外链 + 日期** 收口；交给工程师见 **§6.3**。

---

## 6.2 README 固定节（交付与工程师对齐）

在 §6 清单之外，交给工程师前建议在 `README.md` 文末维护下列节（与 §6.1 二次开发表可并存）。

### 工程对齐（每次交付必填）

```markdown
## 工程对齐

- **路由**：/trinity-ai/xxx（或门户嵌套路径）
- **映射**：`apps/web/...` 或「未落地」
- **原型路径**：`apps/trinity-ai/src/views/<模块>/`（同步后 `apps_ui` 同路径）
```

### 功能说明（可选）

条目式写交互关联、业务规则（如「勾选 A 展示 B」）；**不必**写进 `.vue` 长注释。

```markdown
## 功能说明

1. …
2. …
```

### 本次变更（仅迭代本批交付时）

```markdown
## 本次变更

- **摘要**：一两句话
```

`TrinityAI-web/apps_ui/CHANGELOG.md` **可选**；首次 0→1 可不写。

---

## 6.3 交给工程师（双仓摘要）

| 角色 | 改哪里 |
|------|--------|
| 产品经理 | `Trinity/apps/`、`packages/` |
| 工程师 | `TrinityAI-web/apps/` only；`apps_ui/` **只读** |
| 提交 | 工程仓**禁止**同一 commit 含 `apps/` 与 `apps_ui/` |

**PM 步骤**：五件套 + §6.2 → 同步 `apps/` → `apps_ui/` → `git add apps_ui/` → push。  
**平时**不必每次同步；**要交付时**才走一遍。

细节与路径表：[`工程师/双仓协作与原型交付.md`](../00-协作与工作流/工程师/双仓协作与原型交付.md)。工程师消费：[`工程师/如何消费原型.md`](../00-协作与工作流/工程师/如何消费原型.md)。

---

## 7. 体量分级：何时用「五件套」

| 模块复杂度 | 建议文件组合 |
|------------|----------------|
| **高**（多子区、多弹层、多交互分支，如对话 Chat） | `入口.vue`（单文件大模板 + 注释分区）+ `module.css` + `*Interactions.ts` + `mock.ts` + `README.md` |
| **中** | `入口.vue` + `README.md`；样式用 `<style scoped>` 或单文件 `module.css`；mock 与交互按是否存在拆分 |
| **低**（单屏、少状态） | `入口.vue` + 简短 `README.md`（数段即可）；不强制独立 mock / 交互文件 |

### 7.1 子域多页（如 `views/account/`）：精简五件套契约

个人中心、账单等 **同一产品域下多路由、多整页** 时，推荐落在 **`src/views/account/`**（与 `views/chat` 同级，**不与** `views` 目录本身平级），采用下面 **「精简契约」**——在完整五件套与「只有 Vue」之间取平衡，仍便于 AI 与接手者定位。

| 约定 | 说明 |
|------|------|
| **路由真源** | 在 **`README.md` 最前** 用表格列出：`path`、`name`（如 `tai-*`）、**对应 `*.vue` 文件名**、静态真源 `TrinityAI/account/*.html`（若有）。避免「同目录多个路由入口却不知改哪个文件」——这与 §9「多平级主 Vue 且无说明」反例的界限在于 **README 是否显式列路由表**。 |
| **整页仍不拆子组件** | 每个路由仍对应 **一枚路由级 `*Page.vue`**，整页模板 + 注释分区；**不在** `views/account/components/` 再堆原型子 `.vue`（与 §1、§9 一致）。 |
| **样式** | **一份域级** `account.css`（或 `account.page.css`）被各页 `import`；若某屏样式极大再拆 `billing.css` 等，须在 README 写明依赖关系。**不用** `*.module.css` 承载须稳定的 `or-*` / `orc-*` 类名（与 Chat / 模型一致）。 |
| **布局与视觉（按需）** | 若产品要求 **顶栏 + 侧栏 + 主列**、去线框/去页脚等，须在 **`README.md` 专节**写清 DOM 分工与与全站 `main#main` 的例外；实现真源放在域级 CSS。当前控制台示例：`apps/trinity-ai/src/views/account/README.md` **§4**。 |
| **mock** | **能共享则一个** `mock.ts`（或 `accountMock.ts`）；各页数据完全无关时可拆 `billingMock.ts` 等，但 README 要列「哪页 import 哪个 mock」。**mock 不写 DOM**（§4）。 |
| **交互** | **能共享则一个** `accountInteractions.ts`（壳内 tab、hash 同步等）；仅单页用到的可写在对应 `*Page.vue` 内，复杂再抽到页旁 `billingInteractions.ts`，README 一句话指过去。 |
| **二次开发** | 仍遵守 **§6.1**：在总 README 的「二次开发补充」表中写清**哪条路由 / 哪个文件**。 |
| **升格** | 某一子屏复杂度达到 **§7「高」**，可升为 **`views/account/billing/`** 子目录，做 **完整五件套**（独立 `README.md` + `mock.ts` + …），并在父级 `views/account/README.md` 中链过去。 |

**最小可行（极低体量占位页）**：`XxxPage.vue` + 在 **`views/account/README.md`** 用一小节描述（不必为占位页单独建空 `mock.ts`），样式可暂时只依赖域级 `account.css` 或全局表。

---

## 8. 可选补充（按需增加，不强制）

| 文件 | 用途 |
|------|------|
| `types.ts` | 与后端契约稳定后补充；原型阶段可省略，在 README 标注「类型待接口定义」 |
| `routes.ts` 或片段 | 子路由较多时，从主路由文件 re-export，便于模块自包含 |
| 测试 | 正式开发阶段再纳入；原型阶段可在 README 标明「无测试」 |

---

## 9. 反例（不建议）

| 反例 | 原因 |
|------|------|
| 在 `mock.ts` 里写大量 `document.querySelector` | 破坏 §4 边界，接 API 时难以拆分 |
| 多个路由入口指向同模块内多个「平级主 Vue」且 **README 未列路由表 / 静态映射** | 接手者不知道改哪个文件；多入口本身在 **§7.1** 下允许，但必须写清 |
| README 仅写「见代码」 | 失去交付物意义；至少保留 §6 中的路由与依赖样式 |
| 为小表单页强行建空 `mock.ts`、空 `*Interactions.ts` | 增加噪音，违背 §7 |
| 在 `views/<模块>/components/` 下为原型再拆多枚 `.vue` | 违背 §1「不拆子组件」；正式开发若需组件化，再在 `packages/ui` 或 app 级 `features` 中立项拆分 |

---

## 10. 与当前 `trinity-ai` 实现的关系（说明性）

- **对话**：已全部收拢至 **`apps/trinity-ai/src/views/chat/`**（五件套）；与规范「单入口大模板」的差距若存在过渡资产，见该目录 `README.md`。
- **模型目录**：已收拢至 **`apps/trinity-ai/src/views/models/`**（五件套），路由 `tai-models` 懒加载 `ModelsPage.vue`。
- **站点壳**：`apps/trinity-ai/src/views/shell/`（五件套）；`apps/trinity-portal` 通过 `@trinity-ai/views/shell/TrinityAiShellLayout.vue` 复用。
- **营销首页**：已收拢至 **`apps/trinity-ai/src/views/home/`**（五件套），路由 `tai-home` **同步**引入 `HomePage.vue`。

---

## 12. 视觉、版式与组件（摘要）

> 颜色、字号、栏外距全文：[`Trinity版式与视觉规范.md`](./Trinity版式与视觉规范.md)。本节只列与**五件套模块**强相关的硬约束。

| 层级 | 真源 |
|------|------|
| Token / 全局样式 | `packages/tokens`、`assets/trinity-base.css` |
| 色板 / 规范页 | `apps/trinity-design` → `/design-tokens`、`/design-spec` |
| 原子组件 | `@trinity/ui`（`packages/ui`）；缺件先实现包再引用 |
| 运营后台列表 | [`运营后台-若依式列表规范`](../02-后台运营管理系统设计/运营后台-若依式列表规范.md) · [`后台原型总览`](../02-后台运营管理系统设计/后台原型总览.md) |
| 静态 HTML（`TrinityAI/` 等） | **仅对照**；新能力写在五件套，README 写静态路径 |

**硬约束**

- 模块 CSS 用 **变量**承接 Token；禁止单页堆新的主色蓝、字体栈（`#2563eb` 经 `var(--blue)` 等已有变量）。
- 间距新增优先 **4 的倍数**；无变量时再补，并考虑回写 Token 或版式规范。
- 字体：**Inter + Noto Sans SC**；字号阶梯以版式规范 **§1.4（L1–L6）** 为准。
- 已形式化控件（筛选、弹窗、Tab 等）**从 `@trinity/ui` 引入**，禁止在 `views/<模块>/` 复制规范 DOM 假装对齐。
- Chat / 模型 / account 等须稳定的 `orc-*`、`or-*` 类名：用**非** `*.module.css` 的全局表（§2 命名表）。
- 下拉菜单行：**图标 + 标题** 结构；与主按钮同列时 hover 用 `var(--grad)` 等与现有 Chat 模式一致（详见静态 `TrinityAI/app/chat/` 或 Vue 等价实现）。

**多模态参考图**：默认 **结构 / 布局参考**（用本项目组件重建）；仅当明确要求才做高保真，且色值仍映射到变量。

**改动后自检（模块级）**

- [ ] 未引入与全局 token 冲突的主色/字体；新增字号落在 §1.4 区间
- [ ] 空/加载/错误/成功在界面或 README 有说明或占位
- [ ] 模块 README 已更新（§6、§6.2）；域级长文见 §5.1 则不重复抄功能范围
- [ ] 若改全局变量，已同步 [版式与视觉规范](./Trinity版式与视觉规范.md)

---

## 13. 仓库内文档约定

> 总原则见 [`docs/README.md`](../README.md) **§文档怎么放**：**规范**在 `docs/`；**一次性生成**在 `06/`；**方案对比 / 方法论**在 `08/`；**具体业务**在 `apps/<app>/doc/` 与 `views/<模块>/README.md`。

| 类型 | 放哪 |
|------|------|
| **本规范（五件套）** | `docs/01-原型与交付规范/`（本文件） |
| **协作 / 门户命令** | `docs/00-协作与工作流/` |
| **版式全文** | `docs/01-原型与交付规范/Trinity版式与视觉规范.md` |
| **运营后台 UI 规范** | `docs/02-后台运营管理系统设计/`（跨运营类 app 共用） |
| **用户后台规范索引** | `docs/03-用户后台管理系统/` |
| **平台级 PRD** | `docs/05-产品与PRD/`（能力地图、详设；实现细节不双轨抄进 PRD 正文） |
| **单 app 业务** | `apps/<app>/doc/`（IA 对照、后端清单、批次等） |
| **单模块交付** | `apps/<app>/src/views/<模块>/README.md`（§6、路由、接 API） |
| **一次性生成 / 旧稿** | `docs/06-归档与提示词/` |
| **方案对比、学习汇报** | `docs/08-方法论与汇报/` |
| **Cursor Skill** | `docs/01-…/*.skill.md` 或 `.cursor/skills/`；正文应 **引用本文件 §** |

§5.1 域说明优先写模块 README 或 app `doc/`，勿在 `docs/` 另建与模块 README 重复的长文。

文件名：**中文 + 读名知义**；Trinity 主题文档建议 `Trinity` 前缀。

---

## 14. 文档维护

| 项 | 说明 |
|----|------|
| **维护人** | 各模块 `README.md` 由模块编辑者更新；**本文件**由产品/前端对接人统一修订。 |
| **变更** | 调整命名、五件套或 §6.2 模板时，改本文件并在受影响模块 README 记「对齐日期」。 |
| **相关阅读** | 设计枢纽：`Trinity设计枢纽（色板+规范）落地计划.md`；门户操作：`00/Trinity开发枢纽…` §4.1.5；用户站迁移：`03/TrinityAI用户站Vue还原计划.md` |

---

*文档版本：v1.12（并入交付 README 模板、双仓摘要、视觉 §12、文档约定 §13）；以团队评审结论为准。*
