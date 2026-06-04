# Trinity · Cursor Skills 总览

## 混合模式（推荐）

| 层级 | 文件 | 你怎么用 |
|------|------|----------|
| **总机（自动）** | [`SKILL.md`](./SKILL.md) `name: trinity-project` | 日常 **直接说任务**；或 Cursor **Custom Agent「Trinity」**（见 [`../AGENTS.md`](../AGENTS.md)） |
| **子 Skill（封发 READ）** | 下表各目录 `SKILL.md` | 一般 **不必每次 @**；要强制时用 `@trinity-product-handbook` 等 |
| **本 README** | 给人查表 | Agent 不依赖本文件 |

子 Skill 均 `disable-model-invocation: true`，避免与总机同时自动加载冲突。

---

## 按场景选 Skill（封发目标）

| 场景 | 子 Skill | 不要混用 |
|------|----------|----------|
| 产品手册、roadmap、周计划、汇报 | [trinity-product-handbook](./trinity-product-handbook/SKILL.md) | trinity-docs、擅自改 apps 代码 |
| 对外开发者文档 `trinity-docs` | [trinity-docs](./trinity-docs/SKILL.md) | 产品手册、业务 Vue 实现 |
| 新建/评审 Skill | [trinity-skill-authoring](./trinity-skill-authoring/SKILL.md) | — |
| Vue Monorepo、五件套、apps 工程 | [trinity-vue-prototype-monorepo](./trinity-vue-prototype-monorepo/SKILL.md) | — |
| 色板、design-spec | [trinity-design-tokens](./trinity-design-tokens/SKILL.md) | — |
| AI 云 / ToB 营销页 | [trinity-tob-marketing-site](./trinity-tob-marketing-site/SKILL.md) | user-console |
| 用户控制台 | [trinity-user-console](./trinity-user-console/SKILL.md) | admin-ruoyi-list |
| 运营后台列表 | [trinity-admin-ruoyi-list](./trinity-admin-ruoyi-list/SKILL.md) | user-console |

---

## 目录体量

| 目录 | 说明 |
|------|------|
| **`SKILL.md`（根）** | 总机 · 封发 · 双仓 / 开发枢纽指针 |
| `trinity-docs/` | 对外 API 文档站（OR + 工程师契约） |
| `trinity-product-handbook/` | 手册双规范 + templates |
| `trinity-skill-authoring/` | 写 Skill 约定 |
| `trinity-vue-prototype-monorepo/` | 工程方案 + 五件套 |
| `trinity-design-tokens/` | token / design-spec / 01 版式 |
| `trinity-tob-marketing-site/` | 营销页 |
| `trinity-user-console/` | 控制台 |
| `trinity-admin-ruoyi-list/` | 后台列表（`docs/02` 真源） |

---

## Rules

- `.cursor/rules/trinity-workspace.mdc` — 本仓派活先走总机（兜底）
- `.cursor/rules/trinity-design-spec-first.mdc` — 全局 UI token

手册文档真源：`apps/trinity-product/docs/产品手册文档规范.md` · `产品手册更新规范.md` · 预览 `npm run dev:trinity-product`
