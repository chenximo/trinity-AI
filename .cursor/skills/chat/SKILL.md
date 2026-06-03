---
name: trtc-chat
description: TRTC Chat IM 集成 skill。帮助开发者在项目中集成即时通讯（IM）功能，包括聊天、消息、会话列表、自定义消息等。支持 0→1 新建集成和已有项目增量集成。关键词：IM、即时通讯、聊天、Chat、消息、会话、tuikit-atomicx-vue3、腾讯云IM、TRTC、聊天集成、Chat集成、IM集成、消息列表、自定义消息。
trigger: /trtc-chat
version: 0.1.0
---

# TRTC Chat Skills — Dispatcher (Strict Mode)

> 这是 `@tencent-rtc/chat-skills` 入口。所有细节实现、话术与反例均在 `references/`。
> 本文件只定义必须遵守的执行契约与分流顺序。

## 0. Cross-IDE 执行契约（最高优先级）

### 0.0 执行纪律（每轮执行前逐条核对，不可跳过）

> ⛔ 本节是所有规则中优先级最高的行为锚，违反视为执行错误。

0. **skill 强约束无条件优先于 AI 默认执行倾向**："尽快交付可运行结果"是 AI 的通用默认倾向，不是本 skill 授权的优先级。当它与 skill 的 gate / phase / 上报约束冲突时，**必须无条件服从 skill——跳过任何强约束节点都会导致交付物不可用或数据永久缺失**，不得以"提升效率"/"先跑起来再说"为由绕过。

   典型违规及后果：
   - ❌ 跳过凭证收集直接写代码 → 生成代码里 SDKAppID 是占位符，用户拿到后无法运行，需要完全返工
   - ❌ 跳过模式选择（Full/Direct）直接进 A.3 → 生成的登录/路由逻辑和用户实际场景不匹配，Full Chat 和 Direct Chat 代码混用，核心流程报错
   - ❌ 漏发 `skill_start` / `feature_requested` 上报 → 本次用户行为数据丢失，功能使用情况无法分析，上报链断裂
   - ❌ A.5 后套用 A.3.x 扩展轮处理新需求 → 路径 B 完整上报链（`feature_requested` / `feature_done`）被跳过，数据永久缺失
1. **先行动后说话**：本轮需要 tool call（落盘 / 写文件 / 读文件）吗？→ 先执行全部 tool call 并拿到 tool result，再写面向用户的文字。
2. **先验证后推进**：本轮有 phase gate 吗？→ 必须有 tool result 证明 gate 条件已满足，才可推进到下一步。仅"AI 自我声明已完成"不构成证据。
3. **面向用户的话术输出永远是本轮最后一步**，不是第一步。
4. **config.json / state.json 任何写入后，必须紧跟 READ 验证关键字段可读回**（详见 `08-state-config.md` § 8.1.3）。
5. **上报 tool call 是 phase postcondition 的一部分**：每完成一个标注「上报」的节点，在推进下一步之前，先自查——"本节点要求的 `skill_analysis` tool call 是否已在本轮 tool results 中出现？"。未出现 → 视为该节点未完成，禁止推进。具体 method/text 参数以当前路径脚本（`02`/`03`）为准。

### 0.1 统一操作语义（不要绑定具体工具名）

- `READ <path>`：读取文件内容
- `WRITE <path>`：写入或覆盖文件
- `APPEND <path>`：追加内容
- `EXISTS <path>`：判断路径是否存在
- `RUN <command>`：执行命令
- `MKDIR <path>`：创建目录
- `JSON_GET <path> <jsonpath>`：读取 JSON 字段
- `JSON_SET <path> <jsonpath> <value>`：写入 JSON 字段

> 各 IDE 将这些语义映射到各自工具（read_file/cat/edit/shell 等）。
> 禁止在规则中硬编码某个 IDE 独有工具名作为唯一依赖。

### 0.2 证据规则（Evidence Rule）

每个步骤都必须满足：
1. 执行了规定动作。
2. 有可验证证据（tool result / 文件实际存在 / 字段可读）。
3. 证据缺失视为未执行。

### 0.3 失败即阻断（Fail-Closed）

若任一步骤 `postcondition` 不满足，必须立即停止后续流程，仅输出一行阻断码：

- `BLOCKED: project_root_unresolved`
- `BLOCKED: session_not_initialized`
- `BLOCKED: phase_gate_not_satisfied`
- `BLOCKED: credential_missing`
- `BLOCKED: unsupported_platform`
- `BLOCKED: required_reference_missing`

禁止在 `BLOCKED:*` 后继续提问、生成方案或写代码。

### 0.4 禁止默认替用户决策

未获得用户明确输入前，禁止默认：
- chatMode（full/direct）
- 凭证（SDKAppID/SecretKey）

唯一例外：用户明确说“按默认/随你”时，theme 可写 `light`。

## 1. Phase 状态机（强门禁）

`workflow.phase` 是唯一真相，读取/写入于 `<projectRoot>/.trtc-chat/config.json`。

| phase | 允许动作 | 必须满足的 gate（postcondition） | 不满足时 |
|---|---|---|---|
| `detect` | 探测项目 + 初始化 session + A.1 概况 + T.2 第一问 | `config.sessionId` + `config.projectRoot` + `config.workflow.phase="detect"` | `BLOCKED: session_not_initialized` |
| `collect_credentials` | 只收集凭证并落盘 | `config.sdkappid` 已写入 | `BLOCKED: credential_missing` |
| `collect_mode` | 只问 A/B 并落盘 | `config.chatMode in {full,direct}` | `BLOCKED: phase_gate_not_satisfied` |
| `scaffold` | 路径 A 脚手架与依赖安装 | `package.json` 存在，依赖满足 | `BLOCKED: phase_gate_not_satisfied` |
| `slices` | 按 slice 单轮闭环写代码 | 每轮 `read -> plan -> write -> self-check` 完成 | `BLOCKED: phase_gate_not_satisfied` |
| `done` | A.4/A.5 收尾与指引；收到新功能请求 → 立即切换到路径 B；收到维护/排查/追问 → 立即切换到路径 C | `state.json` 与 `WHAT-TO-DO-NEXT.md` 写入成功 | `BLOCKED: phase_gate_not_satisfied` |

规则：
- 禁止跳 phase。
- 每次只处理当前 phase 对应输入。
- ❗ **禁止合并多问**：A.2 的凭证 / 模式逐步询问，每问等用户回答后再问下一个，不可一次性合并输出。
- ❗ **`phase=done` 收到用户请求时，先判断意图方向**：
  - 新功能（加法）→ `READ ./references/03-path-b-script.md` → 路径 B（B.2）
  - 维护/排查/追问（减法/质疑/报错/样式调整）→ `READ ./references/04-path-c-script.md` → 路径 C（C.1）
  - ❌ 禁止套用路径 A 的任何步骤

## 2. 执行顺序（不可重排）

### Step 1: 项目探测

先 `READ ./references/01-detect-project.md` 与 `READ ./references/08-state-config.md`。

必须完成：
1. 依据 `08-state-config.md §8.1.1` 找到 `<projectRoot>`。
2. 探测依赖中是否有 `tuikit-atomicx-vue3`。
3. 探测 platform（仅 vue3 支持）。
4. 探测 CSS 方案与命名约定。

若 platform 非 vue3：输出支持边界并停止：`BLOCKED: unsupported_platform`。

### Step 1.5: Session 初始化（ATOMIC — 不可与其他步骤合并输出）

> ⛔ 本步骤完成前，禁止输出任何面向用户的文字（包括 A.1 概况、T.2 提问）。

**INPUT**：`projectRoot`（来自 Step 1 找根算法）

**ACTION**：
1. READ `<projectRoot>/.trtc-chat/config.json`（若存在）
2. **判断**：
   - 若文件**不存在**或 `sessionId` 为空 → MKDIR + WRITE 初始化，写入：
     - `sessionId`（`sess_{6位随机字母数字}_{timestamp_ms}`）
     - `sessionStartedAt`（当前时间戳 ms）
     - `projectRoot`
     - `workflow.phase = "detect"`
   - 若文件**已存在**且 `sessionId` 有效 → **保留原有所有字段**，仅更新 `sessionStartedAt`；**禁止覆盖 `workflow.phase`**

**VERIFY**：READ `<projectRoot>/.trtc-chat/config.json` → 确认 `sessionId` 字段存在且值有效。

**POSTCONDITION**：tool result 中存在 READ 验证返回，`sessionId` 可读。

**BLOCKED**：若 WRITE 失败或 READ 验证不通过 → `BLOCKED: session_not_initialized`。禁止继续。

### Step 2: 路径分流

❗ **先判断分流条件，再读取对应路径脚本。禁止预读两个路径脚本再判断。**

**分流条件**（按优先级顺序，命中第一条即停止）：

1. 用户意图为**减法/维护/排查/追问**（去掉/移除/隐藏/报错/样式调整/质疑已有结果等）→ **路径 C**（无论 phase 是什么）
2. `workflow.phase = "done"` →
   - `package.json` **存在** 且已依赖 `tuikit-atomicx-vue3` → **路径 B**
   - 否则 → 清空 `.trtc-chat/config.json` 和 `state.json`，重置 `workflow.phase = "detect"`，**路径 A**
3. 已依赖 `tuikit-atomicx-vue3` → **路径 B**
4. 未依赖 / 空目录 / 新项目 → **路径 A**

**命中后立即读取**（不提前、不并行读另一个）：
- 路径 A：`READ ./references/02-path-a-script.md`
- 路径 B：`READ ./references/03-path-b-script.md`
- 路径 C：`READ ./references/04-path-c-script.md`

同时读取：`READ ./vue3/SKILL.md`

## 3. 路径 A/B 强约束

### 3.1 路径 A（0→1）

必须遵守 `references/02-path-a-script.md`：
- A.1 概况后，紧接 T.2 第一问（凭证）。
- A.2 顺序不可变：凭证 -> 模式 -> 风格（条件触发）。
- 未完成 A.2 禁止进入 scaffold/slices。
- A.3 多 slice 必须逐轮闭环，禁止预读下一轮。
- A.4 必须实际写 `state.json` 和 `.trtc-chat/WHAT-TO-DO-NEXT.md`。

### 3.2 路径 B（增量）

必须遵守 `references/03-path-b-script.md`：
- 先读后改（patch 前必须 READ 目标文件）。
- 不改用户已有 SDK 初始化/登录链路（除非用户明确同意）。
- Plan 必须写明“不会改哪些内容”。

## 4. Hard Rules（摘要）

完整版以 `READ ./references/06-hard-rules.md` 为准。

- SDK API 以 slice 文档为唯一真理，禁止凭记忆猜。
- 自定义消息 payload 必须 `JSON.stringify`。
- businessID 必须业务语义化（如 `order`/`coupon`/`rating`）。
- 发送消息前必须等待登录完成。
- 必须复用项目已有 UI 库/CSS 方案/命名约定。

## 5. 关键文件与最小落盘要求

- `<projectRoot>/.trtc-chat/config.json`
  - 至少含：`sessionId`, `sessionStartedAt`, `projectRoot`, `workflow.phase`
- `<projectRoot>/.trtc-chat/state.json`
  - 至少含：`baseSlicesApplied`, `extensionSlicesApplied`, `changes`
- `<projectRoot>/.trtc-chat/WHAT-TO-DO-NEXT.md`

任一关键文件未落盘成功：`BLOCKED: phase_gate_not_satisfied`。

## 6. 规则冲突优先级

1. 本文件 `0/1/2` 的强门禁
2. 路径脚本（`02`/`03`）
3. Hard rules（`06`）
4. 其他参考文档

冲突时按高优先级执行，禁止“为了流畅体验”绕过 gate。

## 7. References 索引（按需加载）

| 时机 | 读取 |
|---|---|
| Step 1 探测开始 | `./references/01-detect-project.md` |
| 读写 state/config 前 | `./references/08-state-config.md` |
| 判断为路径 A | `./references/02-path-a-script.md` |
| 判断为路径 B | `./references/03-path-b-script.md` |
| 判断为路径 C | `./references/04-path-c-script.md` |
| Slice 命中/兜底 | `./references/05-slice-loading.md` |
| 写代码/自检前 | `./references/06-hard-rules.md` |
| 用户卡住排查 | `./references/09-troubleshoot.md` |
| 收尾写集成指引 | `./references/11-what-to-do-next-template.md` |
| 组合父组件胶水层 | `./references/12-page-composition.md` |

## 8. 兼容性说明（跨 IDE）

- 本 skill 仅依赖“操作语义”，不依赖具体工具名。
- 若 IDE 无 JSON 工具，允许 `READ + WRITE` 方式更新 JSON，但必须保留有效 JSON。
- 若 IDE 不支持并行读取，可串行读取，但必须保证两个文件都已读取。
