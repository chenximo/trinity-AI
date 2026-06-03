---
name: trinity-project
description: >-
  Trinity 单仓总入口（混合总机）：接到派活先读本 Skill 封发，再 READ 子 Skill 与 repo 真源。
  产品手册见 apps/trinity-product/docs/产品手册文档规范.md、产品手册更新规范.md，执行
  trinity-product-handbook；Vue Monorepo/高保真见 docs/Trinity前端Vue与Monorepo工程方案.md，执行
  trinity-vue-prototype-monorepo；色板/design-spec/trinity-base 执行 trinity-design-tokens；
  AI 云营销页执行 trinity-tob-marketing-site；用户控制台 account/console 执行
  trinity-user-console；运营后台若依列表 trinity-ai-admin 执行 trinity-admin-ruoyi-list；
  TRTC Chat/IM 执行 chat。新建或评审 .cursor/skills 执行 trinity-skill-authoring。
  手册任务默认不改 apps 业务代码除非用户明确落地工程。索引见 .cursor/skills/README.md。
  触发词：Trinity、派活、产品手册、roadmap、week-progress、控制台、运营后台、营销页、Monorepo。
---

# Trinity · 项目总机（先分流，再 READ 子 Skill）

> **混合模式**：本文件在 `.cursor/skills/SKILL.md`（**不设** `disable-model-invocation`，便于自动匹配）。
> 子 Skill 仍为 `disable-model-invocation: true`，由总机 **READ** 拉起，避免多 Skill 同时自动加载。
> 人类索引：[`./README.md`](./README.md) · Custom Agent 文案：[`../AGENTS.md`](../AGENTS.md)

## 每轮派活（必须）

1. **读意图**：路径、新建/修改/排查、是否「落地工程」。
2. **封发**：从下表选 **一个主 Skill**（见 `description` 摘要）。
3. **READ**：`.cursor/skills/<主 Skill>/SKILL.md` + 该 Skill 指名的 **repo 真源 md**。
4. **执行**：按子 Skill；禁止未 READ 凭记忆写手册/UI/IM。
5. **收尾**：新建子 Skill 时更新 `./README.md` 一行。

## 封发表

| 路径 / 关键词 | 主 Skill | 真源（READ） |
|---------------|----------|----------------|
| `apps/trinity-product/docs/**`、手册、roadmap、week-progress | `trinity-product-handbook` | `apps/trinity-product/docs/产品手册文档规范.md` · `产品手册更新规范.md` |
| `apps/*`、`packages/*`、pnpm、Mock、高保真 | `trinity-vue-prototype-monorepo` | `docs/Trinity前端Vue与Monorepo工程方案.md` |
| 色板、design-spec、trinity-base、形式 2 | `trinity-design-tokens` | `assets/trinity-base.css` · `TrinityAI/design-spec.html` |
| `apps/ai-cloud`、营销首页、ToB | `trinity-tob-marketing-site` | skill 内模块索引 |
| `account/console`、user-console-spec | `trinity-user-console` | skill + `/user-console-spec` |
| `trinity-ai-admin`、admin-ep-table | `trinity-admin-ruoyi-list` | skill |
| IM、Chat、tuikit、TRTC | `chat` | `.cursor/skills/chat/SKILL.md` |
| 新建/评审 `.cursor/skills/**` | `trinity-skill-authoring` | 本目录约定 |

**手册边界**：默认只改 `apps/trinity-product/docs` 与相关 yml；改 `apps/trinity-ai` 等须用户明确「落地工程」并封发 `trinity-vue-prototype-monorepo` 等。

## 给用户（可选一行）

`已封发 → <skill-name>：<一句将做什么>`

## 禁止

- 总机代写长文/大段代码而不 READ 子 Skill
- 手册任务混改后台列表样式或 IM phase 门禁
- 复制 PRD/飞书全文进手册（handbook 禁止项）
