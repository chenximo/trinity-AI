# 07 - IDE 路径表 + slash command 规约

> install / IDE 路径疑问时由 dispatcher `read_file`。

## 7.1 IDE 路径表

| IDE | 项目级路径 | skill 文件名 | 加载形态 |
|---|---|---|---|
| Claude Code | `.claude/skills/chat/` | `SKILL.md` | 目录式 |
| Codex Desktop | `.agents/skills/chat/` | `SKILL.md` | 目录式 |
| Cursor | `.cursor/skills/chat/` | `SKILL.md` | 目录式 |
| CodeBuddy | `.codebuddy/skills/chat/` | `SKILL.md` | 目录式 |

> 全部只有 `local`，不支持 `--global`（参见 DESIGN § 2.5）。

## 7.2 install 后的目录布局（以 cursor 为例）

> knowledge-base 在**用户级 `~/.trtc-chat/`**，多项目共享一份；项目级 `.trtc-chat/` 只剩 `state.json` / `config.json`，且通过"找根算法"绑定到**项目根**而不是 `process.cwd()`（详见 `08-state-config.md` § 8.1.1，monorepo 子目录跑 AI 时 dispatcher / install.js 都会回到仓库根写同一份）。

### 7.2.1 项目级（每个项目都有一份）

```
用户项目根/                              # = <projectRoot>，由 08-state-config.md § 8.1.1 找根算法决定
├── .gitignore                          # install.js 自动追加 /.trtc-chat/
├── .cursor/
│   └── skills/
│       ├── SKILL.md                    # dispatcher 主骨架（根级，无子目录）
│       ├── references/                 # 所有 reference 文件
│       │   ├── 01-detect-project.md
│       │   ├── 02-path-a-script.md
│       │   └── ...
│       └── vue3/
│           └── SKILL.md               # vue3 平台 pattern
└── .trtc-chat/                         # 项目级隐藏目录（点开头），仅运行时数据
    ├── config.json                     # platform / integration_mode / SDKAppID 引用（运行时由 dispatcher 写）
    └── state.json                      # 已完成 slice / 改动文件清单（运行时由 dispatcher 写）
```

### 7.2.2 用户级（全机一份，多项目共享）

```
$HOME/.trtc-chat/                       # 用户级隐藏目录
├── knowledge-base@<pkg-version>/      # 按 npx 包版本隔离的真实快照（如 knowledge-base@0.2.0/）
│   ├── README.md
│   ├── slice-spec.md
│   ├── index.yaml
│   ├── slices/vue3/
│   │   ├── _base/
│   │   ├── _starter/
│   │   └── features/
│   └── _shared/
│       ├── auth/
│       └── errcode/
└── knowledge-base                     # → knowledge-base@<pkg-version>（symlink；Windows 无权限时为副本）
```

dispatcher 内的 `read_file` 路径表述**统一用** `<HOME>/.trtc-chat/knowledge-base/...`（即上面 `knowledge-base` 软链/副本入口），让 monorepo 子目录里跑 AI 也不会因 cwd 漂移失联。

### 7.2.4 read_file 路径速查（实际调用时用这里的路径）

| 文件 | 正确路径 | ❌ 常见错误路径 |
|---|---|---|
| index.yaml | `~/.trtc-chat/knowledge-base/index.yaml` | `.codebuddy/skills/knowledge-base/index.yaml` |
| gen-usersig.md | `~/.trtc-chat/knowledge-base/gen-usersig.md` | `knowledge-base/gen-usersig.md` |
| slice-spec.md | `~/.trtc-chat/knowledge-base/slice-spec.md` | — |
| _base/detect-style.md | `~/.trtc-chat/knowledge-base/slices/vue3/_base/detect-style.md` | — |
| _starter/login-auth.md | `~/.trtc-chat/knowledge-base/slices/vue3/_starter/login-auth.md` | — |
| _starter/conversation-list.md | `~/.trtc-chat/knowledge-base/slices/vue3/_starter/conversation-list.md` | — |
| _starter/message-list.md | `~/.trtc-chat/knowledge-base/slices/vue3/_starter/message-list.md` | — |
| _starter/message-input.md | `~/.trtc-chat/knowledge-base/slices/vue3/_starter/message-input.md` | — |
| _starter/direct-chat-entry.md | `~/.trtc-chat/knowledge-base/slices/vue3/_starter/direct-chat-entry.md` | — |
| features/send-custom-message.md | `~/.trtc-chat/knowledge-base/slices/vue3/features/send-custom-message.md` | — |
| references/11-what-to-do-next-template.md | `./references/11-what-to-do-next-template.md`（相对 skill 目录） | `~/.trtc-chat/knowledge-base/11-what-to-do-next-template.md` |
| references/12-page-composition.md | `./references/12-page-composition.md`（相对 skill 目录） | `~/.trtc-chat/knowledge-base/12-page-composition.md` |

❗ **knowledge-base 在用户级 `~/.trtc-chat/`，不在项目目录里，不在 `.codebuddy/` 或 `.cursor/` 下**。搜不到时先检查路径是否用了错误的前缀。

### 7.2.3 为什么这样切

| 关注点 | 答案 |
|---|---|
| monorepo 子目录开 AI，cwd ≠ install 时的 cwd | KB 走 `$HOME` 绝对路径，与 cwd 无关，永不漂移 |
| 多项目共享 KB | 用户级 `knowledge-base/` 是软链/副本，多项目复用一份，无重复拷贝 |
| KB 版本错乱 | `knowledge-base@<version>/` 按包版本切目录；新版 install 只换软链指针，旧版本快照保留 |
| state/config 项目隔离 | 仍在 `<projectRoot>/.trtc-chat/`，A 项目动 SDKAppID 不影响 B 项目；`<projectRoot>` 由"找根算法"锁定到仓库根（详见 `08-state-config.md` § 8.1.1），monorepo 子目录跑 AI 不会写出第二份 |
| `~/` 不可写（极少见） | install 直接报错；不做 fallback |

## 7.3 Codex Desktop 目录式说明

Codex Desktop 读项目 `.agents/skills/chat/` 目录，与其他 IDE 一致，采用目录式安装。MCP 配置写入 `~/.codex/config.toml`（TOML 格式，`[mcp_servers.xxx]` 节）。

## 7.4 slash command

| IDE | 触发命令 |
|---|---|
| Claude Code | `/trtc-chat` |
| Cursor | `/trtc-chat` |
| Codex Desktop | `/trtc-chat`（或通过 Skills 面板触发） |
| CodeBuddy | `/trtc-chat` |

> slash command 加 `trtc-` 前缀，避免与其他 IM 工具撞名。

## 7.5 install 命令速查

```bash
# 默认（claude，全 platform）
npx @tencent-rtc/chat-skills add

# 指定 platform（仅 vue3）
npx @tencent-rtc/chat-skills add --platform vue3

# 指定 IDE
npx @tencent-rtc/chat-skills add --ide cursor
npx @tencent-rtc/chat-skills add --ide codex
npx @tencent-rtc/chat-skills add --ide codebuddy
npx @tencent-rtc/chat-skills add --ide all      # 一次装 4 个

# 清理后重装
npx @tencent-rtc/chat-skills add --clean

# 列出本包技能
npx @tencent-rtc/chat-skills add --list

# 帮助
npx @tencent-rtc/chat-skills add --help
```

## 7.6 报错对照

| 报错 | 原因 | 处理 |
|---|---|---|
| `本工具仅支持项目级安装` | 用户加了 `--global` | 去掉 `--global`，cd 到目标项目重跑 |
| `Unsupported platform: xxx` | 传了非 vue3 的 platform | 仅 vue3，等后续版本 |
| `Unknown IDE: xxx` | --ide 值不在白名单 | 用 claude / codex / cursor / codebuddy / all |
| `未检测到 git 仓库，跳过 .gitignore 自动配置` | 项目不是 git 仓库 | 不影响功能；如已 `git init`，重跑或手动追加 |
