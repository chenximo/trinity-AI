# 产品经理 · AI 派活 Prompt 执行文档

> **两种用法**（二选一）：  
> **A · 短提示语（推荐）** — 在 Cursor 输入 §0 里一行，Agent 自动展开为完整派活并执行（见 `.cursor/rules/trinity-pm-dispatch.mdc`）。  
> **B · 复制长模板** — 展开 §2～§6 代码块，粘贴到任务。  
> **原则**：Agent **先读 Skill（规则 ID）**，规范页 **只做验收**；未写明的工程改动默认不做。

---

## 0. 短提示语（输入一行即可，不必复制 §2）

在对话里写 **`派活：`** 或 **`uc:`** 开头 + 下表右侧句式；Agent 会读本表与 §2～§6，复述范围后开干。

### 0.1 句式模板

```text
派活：<类型> | <产品> | <面板/功能名> | <操作几个> | [落地工程]
```

- **类型**：`列表` / `规范` / `页头` / `落地` / `运营列表`  
- **产品**：`AI云` / `Trinity` / `design`（仅改规范页）  
- **操作几个**：`1按钮` `3按钮` `⋮` `4+`（列表必填；规范类可省略）  
- **落地工程**：句末加 `落地` 或 `可改trinity-base` 才允许改全局 CSS / 全仓 ConsolePage  

### 0.2 示例（直接复制一行到 Cursor）

| 你输入这一句 | Agent 展开为 |
|--------------|--------------|
| `派活：列表 \| AI云 \| 账号管理 #accounts \| 1按钮` | §2 · AI 云 #accounts · UC-TBL-OPS-01 · 验收 `#spec-sample-table-actions-buttons` · 勿改工程 |
| `派活：列表 \| Trinity \| 角色管理 #preset \| 3按钮` | §2 · preset 表 · 横排三按钮 · 同上验收锚点 |
| `派活：列表 \| Trinity \| API密钥 #keys \| ⋮` | §2 · keys 表 · UC-TBL-OPS-02 · 验收 `#spec-sample-table-keys` |
| `派活：规范 \| design \| 表格左对齐+操作横排` | §4 · 同步 Skill + `/user-console-spec` §3 · 勿改产品工程 |
| `派活：页头 \| AI云 \| 费用 #billing` | §3 · 只改页头/面包屑 · `#spec-2-main` |
| `派活：落地 \| Trinity \| #preset 表格` | §5 · 允许 trinity-base + ConsolePage preset 段 |
| `派活：运营列表 \| trinity-admin \| 密钥审核页` | §6 · `trinity-admin-ruoyi-list` |

### 0.3 极简关键词（懒写法）

| 输入 | 含义 |
|------|------|
| `uc: AI云 账号表` | = 列表 · AI云 · #accounts · 默认 1～2 个操作 · 不落地 |
| `uc: Trinity preset 三按钮` | = 列表 · preset · 3 按钮 |
| `uc: 只改规范 表格` | = §4 规范迭代 |
| `uc: 落地 keys` | = §5 · Trinity #keys 工程对齐 |

信息缺一时 Agent 应只问：**操作几个按钮？** 或 **改哪个 app 路径？**

---

## 1. 派活前 30 秒（复制长模板时用）

- [ ] 已确定轨道：**用户控制台系统**（非运营后台 `trinity-ai-admin`）
- [ ] 已选模板（下文 §2～§6）
- [ ] 验收锚点写进任务（`/user-console-spec#…`）
- [ ] 是否允许改工程：默认 **否**（不写则禁止动 `trinity-base`、全仓 `ConsolePage`）

---

## 2. 用户控制台系统 · 新建/改列表页 Vue（最常用）

**适用**：AI 云账号表、新 hash 面板、Trinity AI 控制台新列表区等。

**复制以下内容**，把 `××` 换成具体需求：

```text
按 trinity-user-console 用户控制台系统规范，实现「××」列表 Vue 原型。

【范围】
- 产品/应用：（例：AI 云 / Trinity AI account）
- 路径：（例：apps/ai-cloud/src/views/account/ 下 #×× 面板）
- 行内操作数量：（例：2 个线框按钮 → UC-TBL-OPS-01；若 ≥4 则 UC-TBL-OPS-02 ⋮）

【Agent 必读】
1. .cursor/skills/trinity-user-console/SKILL.md（规则 ID + §5 检查清单）
2. 母版：apps/trinity-ai/src/views/account/ConsolePage.vue、account.css
3. 控件：trinity-design-tokens（形式 2 筛选、btn-gradient）

【验收】
- 做完对照 /user-console-spec#spec-sample-table-actions-buttons（操作 <4 横排）
- 表头/对齐对照 #spec-sample-table-keys、主列对照 #spec-2-main

- 勿引入 Element Plus 运营后台列表壳
```

**操作 &lt;4 个按钮时**，验收锚点用：

`/user-console-spec#spec-sample-table-actions-buttons`

**操作 ≥4 或密钥式 ⋮ 时**，再加：

`/user-console-spec#spec-sample-table-keys` · `#spec-sample-table-actions-menu`

---

## 3. 用户控制台系统 · 只改某一屏/区块（非整表）

```text
按 trinity-user-console，只改「××」面板的（页头 / 表格 / 面包屑）Vue，其余不动。

必读 Skill 规则 ID：UC-MAIN-02（页头）、UC-TBL-*（表格，按需）。
验收：/user-console-spec#spec-2-main（页头）或 #spec-3-table（表格）。
勿改 trinity-base；勿改未提及的 hash 面板。
```

---

## 4. 迭代规范 + 样例（不改产品工程）

**适用**：对齐表头、操作列横排、补 §3 样例、调整 ⓘ 位置等。**每次只改规范页**，不要顺带改全仓产品。

```text
按 trinity-user-console 与 /user-console-spec，迭代用户控制台系统规范（仅规范页）：

【变更】
- （例：全表左对齐 UC-TBL-ALIGN-01；<4 操作横排 UC-TBL-OPS-01）
- （例：ⓘ 放在说明行小标题「仅在创建时展示一次」之后，见 #spec-sample-main）

【仅允许改动的路径】
1. apps/trinity-design/src/views/user-admin-system/UserConsoleSpecHub.vue
2. apps/trinity-design/src/views/user-admin-system/console-sample/*
3. apps/trinity-design/src/views/user-admin-system/user-console-spec-guide.css
4. .cursor/skills/trinity-user-console/SKILL.md
5. docs/03/用户控制台系统-布局与样式规范.md（按需）

【须同步】
- Skill 规则 ID + 附录 B 锚点 ↔ 规范页样例 DOM 一致

【禁止 · 未要求落地工程】
- 勿改 apps/trinity-ai、apps/ai-cloud 的 ConsolePage.vue
- 勿改 TrinityAI/account/console.html
- 勿改 assets/trinity-base.css
- 勿为对齐规范而「顺手」改其它 hash 面板或 AI 云
```

---

## 5. 明确允许「落地工程」

**仅当你已评审 `/user-console-spec` 样例并确认定稿后**使用：

```text
用户控制台系统规范已定稿。按 trinity-user-console 规则 ID，落地工程对齐：

【范围】
- trinity-base.css（表格扁平表头、左对齐、操作列）
- （例：apps/trinity-ai/src/views/account/ConsolePage.vue #preset 表格）
- （可选：TrinityAI/account/console.html 同源段落）

【验收】
- 与 /user-console-spec 对应样例块一致
- Skill §5 检查清单全部满足

【说明】
本次允许改全局 CSS 与产品页；改前列出将改文件清单。
```

---

## 6. 运营后台（勿用用户控制台系统 Skill）

```text
按 trinity-admin-ruoyi-list 运营后台若依列表规范，实现「××」列表页。
应用：apps/trinity-ai-admin（或指定 admin 应用）。
勿使用 trinity-user-console / or-keys-table。
验收：/admin-ops-spec
```

---

## 7. 不建议的派活写法

| 不推荐 | 原因 | 改为 |
|--------|------|------|
| 「参考控制台做一下」 | Agent 不知读哪份规范 | 「按 **trinity-user-console**」 |
| 只发 `/user-console-spec` 链接 | 可能不读 Skill、漏检查清单 | 点名 Skill + 验收锚点 |
| 「和 OpenRouter 一样」 | 不可判定 | 写规则 ID 或「见 #spec-2-main 样例」 |
| 「顺便把 trinity-base 也统一了」 | 范围爆炸 | 单独开 §5「落地工程」任务 |
| 「用 Element 表格就行」 | 分轨错误 | 运营后台用 §6 模板 |

---

## 8. 验收锚点速查（用户控制台系统）

| 验收什么 | 打开 |
|----------|------|
| 壳层左栏 + 主列 | `/user-console-spec#spec-1-layout` · `#spec-2-main` |
| 表头扁平、全表左对齐 | `#spec-sample-table-keys` |
| 操作 &lt;4 线框横排 | `#spec-sample-table-actions-buttons` |
| 操作 ≥4 ⋮ | `#spec-sample-table-actions-menu` |
| 完整可点原型 | `/trinity-ai/account/console#keys` 或 `#preset` |

设计枢纽本地：`npm run dev -w @trinity/app-trinity-design` → 打开上表路径（门户挂载时前缀按项目为准）。

---

## 9. 规则 ID 速查（派活时可点名）

| ID | 一句话 |
|----|--------|
| UC-SHELL-01 | 顶栏在壳外；`or-shell` + 侧栏 + 主列 |
| UC-MAIN-01～05 | 面包屑 → 页头 → 搜索(可选) → 表 → 摘要(可选) |
| UC-TBL-HEAD-01 | 扁平表头，禁止渐变表头 |
| UC-TBL-ALIGN-01 / 02 | 全表左对齐；禁止 center 类 |
| UC-TBL-OPS-01 / 03 | &lt;4 横排线框；禁止窄列类 |
| UC-TBL-OPS-02 / 04 | ≥4 ⋮；禁止与线框混用 |

全文：`.cursor/skills/trinity-user-console/SKILL.md`

---

## 10. 你评审通过后（可选一句）

```text
规范样例已确认，可进入工程落地阶段。（若尚未允许，Agent 仍勿改 trinity-base / 全仓 ConsolePage。）
```

---

## 11. 相关链接

| 文档 | 路径 |
|------|------|
| Agent Skill | `.cursor/skills/trinity-user-console/SKILL.md` |
| 规范验收页 | `/user-console-spec` |
| 用户控制台系统文档 | `docs/03-用户控制台系统/` |
| 方法论 | `docs/08-方法论与汇报/Vue原型生成最佳实践-Skill规范页与验收.md` |
| 五件套总则 | `docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md` |

---

## 12. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-21 | 初稿：用户控制台系统列表 Vue 派活模板、规范迭代、落地工程、运营分轨、锚点与规则 ID 速查。 |
| 2026-05-21 | §0 短提示语 + `trinity-pm-dispatch` 规则：输入一行由 Agent 展开，无需复制长模板。 |
