# 08 - state.json 与 config.json 字段说明

> dispatcher 读写 `<projectRoot>/.trtc-chat/state.json` / `config.json` 前主动 `read_file` 本文件。

## 8.1 整体约定

- 两个文件都在**项目根** `<projectRoot>/.trtc-chat/`（不是 `<process.cwd()>/.trtc-chat/`，也不是用户级 `~/.trtc-chat/`；后者只放 `knowledge-base/`）
- `<projectRoot>` ≠ `process.cwd()`：dispatcher / install.js **必须**先跑 § 8.1.1 "找根算法"再读写这两个文件，否则在 monorepo 子目录里会产生多份互相冲突的 state
- 两者都**不进 git**（由 install.js 自动加 `/.trtc-chat/` 到 `.gitignore`）
- 不存在则 dispatcher 在第一次写入时创建（install.js 已在找到的项目根下确保 `.trtc-chat/` 目录存在，避免 first-write ENOENT）
- 损坏 / 格式错误时 dispatcher 不要硬解析，提示用户"是否重置"

### 8.1.1 找项目根算法（在任何 read/write `state.json` / `config.json` 之前必跑一次）

从 `process.cwd()` 起，沿目录树**向上**逐级查找强信号（P1/P2/P3）；若全部失败，再**仅在 cwd 自身**检查 P4，最后 P5 兜底。

| 优先级 | 标识 | 行为 | 含义 |
|---|---|---|---|
| 1 | `pnpm-workspace.yaml` / `lerna.json` / `turbo.json` 之一 | **walk-up** 命中即停 | monorepo manifest，仓库根 |
| 2 | `package.json` 含顶层 `workspaces` 字段（数组或 `{ packages: [...] }`） | **walk-up** 命中即停 | npm/yarn/pnpm workspace 根 |
| 3 | `.git/` 目录 | **walk-up** 命中即停 | git 仓库根（兜住绝大多数普通项目 + monorepo） |
| 4 | 普通 `package.json`（无 `workspaces`） | **仅在 cwd 自身**查，不 walk-up | 单 package 项目根 |
| 5 | P1~P4 全部失败 | 退回 `process.cwd()`，**不打 warning** | 0→1 空目录起手式（路径 A 入口的合法场景） |

> 规则细节：
> - **强信号（P1/P2/P3）才 walk-up**：因为它们具备"仓库根"语义，monorepo 子包里运行也应锚到仓库根
> - **弱信号（P4 plain `package.json`）不 walk-up，只查 cwd 自身**：plain `package.json` 没有"仓库根"语义，walk-up 反而会**翻越**用户真实工作目录、被上层（甚至 `$HOME` 里残留的 `package.json`）截停。典型反例：用户在 `~/workspace/my-new-app/` 这种空目录里跑路径 A 起手式，但 `$HOME` 下有 `npm i -g` 留下的 `~/package.json`——若 P4 walk-up，将把 `$HOME` 误判为项目根，把所有 skill 文件装到 `~/.claude/skills/` 等位置
> - 优先级 3 命中：如果同一目录还同时含 `package.json`，**直接采用该目录**（git 根 == 单 repo 项目根的常见情况）
> - 优先级 4 触发场景：用户在没初始化 git 的"裸 `package.json`"项目里跑 AI；少见但仍要兜住
> - 优先级 5 触发场景：用户在**完全空的目录**里跑 0→1 起手式（路径 A 的合法入口）。此时 cwd == projectRoot 是正确答案，dispatcher 会从这里开始 scaffold；**不打 warning，不报错**
> - dispatcher 在每次会话**首次**触达 `<projectRoot>` 时跑一次，结果可在当前会话内缓存；不要每次 read/write 都重跑
> - install.js 也跑同一套算法：用户 `npx ... add` 时不论 cwd 在哪个子目录，都把 `.trtc-chat/` 建在算法找到的项目根下，并把 `.gitignore` 段写到该根的 `.gitignore`

### 8.1.2 算法伪码（参考实现）

```ts
function findProjectRoot(startCwd: string): { root: string } {
  const start = path.resolve(startCwd);
  let dir = start;

  // First pass: walk UP looking for strong signals (P1/P2/P3).
  while (true) {
    // P1: monorepo manifests
    if (
      fs.existsSync(path.join(dir, 'pnpm-workspace.yaml')) ||
      fs.existsSync(path.join(dir, 'lerna.json')) ||
      fs.existsSync(path.join(dir, 'turbo.json'))
    ) return { root: dir };

    // P2: package.json with workspaces
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.workspaces) return { root: dir };
      } catch { /* swallow, fall through */ }
    }

    // P3: .git directory (also covers single-repo with package.json colocated)
    if (fs.existsSync(path.join(dir, '.git'))) return { root: dir };

    const parent = path.dirname(dir);
    if (parent === dir) break;   // reached FS root
    dir = parent;
  }

  // Second pass (P4): cwd-local only — DO NOT walk up. plain package.json
  // has no "repo root" semantics; walking up risks landing on $HOME's stray
  // package.json (e.g. left by `npm i -g`) instead of the user's actual
  // working directory.
  if (fs.existsSync(path.join(start, 'package.json'))) {
    return { root: start };
  }

  // P5: nothing matched — empty 0→1 directory is the legitimate path A
  // entry point. cwd IS the project root; dispatcher will scaffold from
  // here. No warning needed.
  return { root: start };
}
```

> dispatcher 不强制要求 IDE 端真跑这段代码——把上述**优先级表 + 命中即停 + P4 cwd-local + P5 静默兜底**的语义内化为决策逻辑即可。install.js 必须按此精确实现（已在 `bin/install.js` 落地）。

### 8.1.3 写后验证（Write-then-Verify）

> ⛔ 本规则对 config.json 和 state.json 的所有写入操作强制生效。

**规则**：任何对 `config.json` / `state.json` 的 WRITE 操作，必须在同一轮内紧跟一次 READ 验证关键字段可读回。

**执行方式**：
1. WRITE 文件（拿到 tool result 确认写入成功）
2. READ 同一文件（拿到 tool result 确认内容正确）
3. 校验关键字段：
   - `config.json`：至少校验 `sessionId`、`workflow.phase`
   - `state.json`：至少校验 `baseSlicesApplied` 数组非空

**违反后果**：
- READ 验证的 tool result 不存在 → 该写入视为未执行
- READ 结果与预期不符 → 立即重试写入，最多 2 次；仍失败则 `BLOCKED: phase_gate_not_satisfied`

**设计意图**：防止 AI "声称已写入但实际未执行 tool call" 的幻觉行为。只有 tool result 中同时存在 WRITE 返回和 READ 返回，才构成"写入成功"的完整证据链。

## 8.2 `config.json` —— 项目静态配置

由 dispatcher 在路径 A 的 A.2 凭据收集结束时初始化。

```jsonc
{
  "version": "0.1.0",
  "platform": "vue3",
  "integration_mode": "state-api",         // 固定值
  "sdk_version": "^6.0.0",                 // 探测到的 tuikit-atomicx-vue3 实际版本
  "css_scheme": "tailwind",                // tailwind | unocss | css-modules | scoped | plain
  "ui_library": "element-plus",            // element-plus | naive-ui | vant | ant-design-vue | vuetify | null
  "naming": "PascalCase",
  "script_style": "setup-script",

  // ── 上报相关字段 ────────────────────────────────────────────────────────────
  "sessionId": "sess_xxxx_xxxxxxxxxxxx",  // Step 1 探测完成后生成
  "sessionStartedAt": 1748000000000,                     // session 创建时间戳（ms）
  "projectRoot": "/path/to/project",                     // 用于 session 复用判断
  "sdkappid": 1400000000,                                // A.2 凭证收集后写入
  "chatMode": "full",                     // full | direct

  // ── 状态机 ──────────────────────────────────────────────────────────────────
  "workflow": {
    "phase": "detect"                     // detect | collect_credentials | collect_mode | scaffold | slices | done
  },

  // ── 凭证相关 ────────────────────────────────────────────────────────────────
  "credentials": {
    "usersig_source": "debug",           // debug = 本地 public/debug/ 生成；endpoint = 后端签发
    "debug_file": "public/debug/GenerateTestUserSig.js",
    "token_endpoint_location": "src/im/login.ts#TOKEN_ENDPOINT"
  },

  "reusable_components": [
    "src/components/ui/card.vue",
    "src/components/ui/dialog.vue"
  ]
}
```

> ⚠️ `config.json` **绝不写明文凭据**，只记录 sdkappid（数字 ID，非密钥）。SDKAppID + SecretKey 本体在 `public/debug/GenerateTestUserSig.js`（已加入 .gitignore）。

## 8.3 `state.json` —— 会话状态

记录已完成的 slice 和改动清单，供 项目概况反馈 复述 + 后续命中排序 + 路径 A.5 / 路径 B 引导菜单的 📋 分组渲染。

```jsonc
{
  "version": "0.2.0",
  "last_updated": "2026-05-20T16:43:00+08:00",

  // 路径 A.3 装的基础 4 件套（写死，固定四项）
  "baseSlicesApplied": [
    "_starter/login-auth",
    "_starter/conversation-list",
    "_starter/message-list",
    "_starter/message-input"
  ],

  // 路径 A.3.x 命中并写完的扩展 slice（A.1.5 解析的产物）
  // 路径 B 二次增量后续 append（B.5 自检通过时追加）
  "extensionSlicesApplied": [
    "features/send-custom-message"
  ],

  // 用户提到但本次未实现的能力（A.1.5 / B.2 解析失败的产物）
  // A.5 / 路径 B 引导菜单的 📋 分组直接读这个字段
  // 多次会话累积；用户在路径 B 命中后从这里移除对应条目
  "unsupportedIntents": [
    {
      "raw": "把消息翻译成英文",                   // 用户原话
      "intent": "message-translation",              // dispatcher 抽取的意图标签
      "askedAt": "2026-05-20T16:30:00+08:00",
      "lastShownInGuideMenu": "2026-05-20T16:43:00+08:00"  // A.5 / B 渲染过 📋 后回填，避免反复刷屏
    }
  ],

  // 改动文件清单（按 slice 分组）
  "changes": [
    {
      "slice": "features/send-custom-message",
      "business_type": "订单",
      "businessID": "order",
      "files": [
        "src/components/chat/OrderCardBubble.vue",
        "src/components/chat/SendOrderButton.vue",
        "src/im/messages/order.ts"
      ],
      "timestamp": "2026-05-20T16:43:00+08:00"
    }
  ]
}
```

## 8.4 写入时机

| 时机 | 操作 |
|---|---|
| 路径 A 跑通 A.4（基础 4 件套 + A.3.x 扩展轮全部完成）| **一次性**写入 `baseSlicesApplied`（固定 4 项）+ `extensionSlicesApplied`（A.3.x 实际写完的 slice）+ `unsupportedIntents`（A.1.5 解析未命中的）+ `changes`（4+N 轮所有改动）|
| A.5 引导菜单渲染 📋 分组后 | 把渲染过的 `unsupportedIntents[i].lastShownInGuideMenu` 回填当前时间戳（避免反复刷屏；下一次进 dispatcher 若距离上次 > 24h 才再渲染）|
| 路径 B B.5 自检通过 | 追加新 slice 到 `extensionSlicesApplied` + 追加 `changes` 条目；如本次命中的 slice 对应了某条 `unsupportedIntents`，**从数组里移除该条**（已实现） |
| 路径 B B.2 解析新意图但未命中 | append 到 `unsupportedIntents`（去重：`intent` 字段相同则更新 `askedAt`，不重复 push） |
| 用户主动说"重置" | 询问后清空 `state.json`（保留 `config.json`） |

> ❗ **不写额外 `.md` 文件**：A.4 收尾的 ✅ / ⚠️ 信息只在 agent 回复里说一次 + 落盘到本文件的 `unsupportedIntents`。**不生成** `gap-report.md` 或类似产物。

## 8.5 读取时机

| 时机 | 用途 |
|---|---|
| Step 1 探测 | 复述上次记忆，避免重复询问 |
| 路径 A.1.5 解析后 | 校验 `extensionSlices` 与已有 `baseSlicesApplied` / `extensionSlicesApplied` 去重，避免重复装 |
| 路径 B B.2 命中 slice | 检查 `prerequisites` 是否满足（如 `send-custom-message` 要求已完成 `message-input`）|
| 路径 A.5 / 路径 B 引导菜单 | 渲染 📋 "之前提到但暂未支持"分组（数据来自 `unsupportedIntents`）|
| 多候选排序 | `prerequisites` 满足度作为排序因子 |

## 8.6 不入库的理由（提醒）

| 文件 | 为什么不入库 |
|---|---|
| `config.json` | 含 SDKAppID 引用 + 项目敏感信息，不同开发者本地探测即可重建 |
| `state.json` | 个人开发会话状态，无需团队共享 |
| ~~`knowledge-base/`~~ | v0.2 起已迁到用户级 `~/.trtc-chat/knowledge-base/`，不再放进项目里 |

需要团队共享的内容（统一的 SDKAppID、UserSig 后端 URL）应放在用户项目的 `.env.example` / 配置中心。
