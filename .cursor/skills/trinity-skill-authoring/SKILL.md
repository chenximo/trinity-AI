---
name: trinity-skill-authoring
description: >-
  Trinity 仓库内编写与评审 Cursor Agent Skill 的约定：目录结构、dispatcher/references
  分流、description 触发词、真源文档指针、门禁粒度。在新建/改 .cursor/skills/、
  问「怎么写 skill」「skill 规范」、或写 product-handbook 等子 skill 前先读本文件。
  通用 Cursor 机制见用户级 create-skill；本 skill 只收 Trinity 增量规则。
disable-model-invocation: true
---

# Trinity · 如何写 Skill

## 分层（别重复造轮子）

| 层级 | 放什么 | 路径 |
|------|--------|------|
| **Cursor 通用** | frontmatter、description 写法、简洁原则 | 用户级 `create-skill`（勿抄进 repo） |
| **Trinity 约定** | 本文件：结构、真源、分流、禁止项 | `.cursor/skills/trinity-skill-authoring/` |
| **领域 Skill** | 可执行步骤 + 链仓库真源 | 如 `trinity-user-console`、`trinity-product-handbook` |
| **持久规则** | 全仓库 alwaysApply 的短约束 | `.cursor/rules/*.mdc` |

**MUST**：领域知识以 **repo 内 Markdown / 规范页** 为真源；Skill 只写 **何时读、读哪、禁止什么**，不把长规范全文贴进 `SKILL.md`。

---

## 何时写 Skill vs Rule vs 文档

| 形态 | 适用 |
|------|------|
| **`.cursor/rules/*.mdc`** | 少量硬约束、每次对话都要遵守（如 design-spec-first） |
| **Skill** | 有流程、有分流、有检查清单；用户或 Agent **按任务加载** |
| **`docs/` 或 `apps/*/docs/`** | 给人看的产品/工程叙事；Skill **链过去** |

---

## 目录结构（推荐）

```
.cursor/skills/<skill-name>/
├── SKILL.md              # 必填：dispatcher + 必读真源 + 硬规则摘要
├── references/           # 可选：长脚本、模板、分路径（chat 型）
│   ├── 01-….md
│   └── template-….md
└── <platform>/SKILL.md   # 可选：探测后附加（如 chat/vue3）
```

| 体量 | 模式 | 示例 |
|------|------|------|
| **小** | 单文件 + 链 1～2 个 repo md | `trinity-vue-prototype-monorepo`、`trinity-admin-ruoyi-list` |
| **中** | 单文件 + `references/` 模板 | 未来的 `trinity-product-handbook` |
| **大** | dispatcher + phase/路径 + 多 reference | `chat`（集成类、要上报/MCP 时） |

**默认选小或中**；只有 **强门禁 + 多路径 + 可验证状态文件** 才用 chat 级大 skill。

---

## `SKILL.md` 必填块

```yaml
---
name: kebab-case-id          # 与目录名一致
description: >-              # 第三人称；WHAT + WHEN；中文触发词
  …Use when… / 触发词：…
disable-model-invocation: true   # 默认 true；仅当需 ambient 自动加载时省略
---
```

正文建议顺序：

1. **真源指针**（1 段）：权威 md / 规范页路径  
2. **触发词**（列表）：与 `description` 不矛盾  
3. **与邻近 skill 边界**（1 表）：勿混用（如 user-console vs admin-ruoyi）  
4. **执行顺序 / 分流**（简表或「先 READ A 再 B」）  
5. **Hard rules / 禁止项**（≤10 条）  
6. **检查清单**（收尾自检）  
7. **References 索引**（若有 `references/`）：何时 `READ` 哪文件  

---

## Dispatcher 写法（可选）

适合：多场景（0→1 / 增量 / 只读规范）、或必须先探测项目。

```markdown
## 分流（先判断再 READ）

| 条件 | READ |
|------|------|
| … | `./references/02-….md` |

禁止：未判断前并行读完所有 reference。
```

**文档类 skill** 通常只需：

- 新建页 → READ 文档规范 §x  
- 改表/周会 → READ 更新规范 §y  

不必 phase 状态机，除非有 `config.json` 类真源。

---

## 门禁粒度

| 级别 | 用法 |
|------|------|
| **清单** | 文档、UI 规范、手册维护（默认） |
| **READ 后改** | 改文件前必须 READ 目标路径 |
| **BLOCKED + phase** | 仅集成/凭证/上报链（chat 级） |

禁止为「写 Markdown」上 chat 级 `BLOCKED:*` 与 MCP 上报。

---

## Description 模板（Trinity）

```
{一句话 WHAT}。{2～4 个具体能力}。
在 {路径/场景} 时使用；触发词：{中文词1}、{英文 id}、{文件名片段}。
须/read {真源相对路径}；勿与 {邻近 skill} 混用。
```

---

## 评审新 Skill 的检查清单

1. `name` / 目录名一致；`description` 含 **WHEN + 触发词**  
2. 真源在 repo，Skill 无大段重复 PRD/规范全文  
3. 与已有 skill / rule 边界写清  
4. 默认 `disable-model-invocation: true` 有理由才关  
5. 体量：单文件建议 **200 行以内**；更长则拆 `references/`  
6. 跨项目复用需求 → 个人 `~/.cursor/skills/` + 项目内 `handbook.config` 类配置，Trinity 路径写 **分支** 不写死  

---

## `@chat`：借鉴什么、不搬什么

**可借鉴**（文档 / 原型 / 后台类 skill 常用）：

- `SKILL.md` 瘦身 + 细节进 `references/`
- 分流：先判断场景，再 `READ` 对应脚本（禁止预读全部 reference）
- `references/` 索引表（何时读哪份）
- 子 skill 按平台/产品线附加（如 `vue3/SKILL.md`）
- 「先 READ 真源再改」「证据 / READ 验证」的轻量写法

**不要照搬**（仅 `chat` 集成类保留）：

- `workflow.phase` 状态机、逐 phase 门禁
- `BLOCKED:*` 阻断码体系
- MCP `skill_analysis` 上报链
- `.trtc-chat/config.json` session 落盘
- A.2 多轮强制问答模板（凭证/模式）

> Trinity 默认 skill = **trinity-user-console / vue-monorepo 档位**；`chat` 是特例，不是模板默认值。

## 本仓库其它范式

| Skill | 借鉴点 |
|-------|--------|
| `trinity-vue-prototype-monorepo` | 链 `docs/…工程方案.md`，正文只收束硬规则 |
| `trinity-user-console` | 规则 ID、触发词、与 PM/规范页分工 |
| `trinity-design-tokens` | 单一事实来源表、规范先行 |
| `trinity-admin-ruoyi-list` | 后台列表小 skill、边界清晰 |

---

## 下一步

**产品手册**：`trinity-product-handbook/`。总机（混合模式）：`.cursor/skills/SKILL.md` `name: trinity-project`。其它子 skill 按实际再建。
