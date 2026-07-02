# Trinity · Cursor Skills 总览

## 混合模式（推荐）

| 层级 | 文件 | 你怎么用 |
|------|------|----------|
| **总机（自动）** | [`SKILL.md`](./SKILL.md) `name: trinity-project` | 日常 **直接说任务**；或 Cursor **Custom Agent「Trinity」**（见 [`../AGENTS.md`](../AGENTS.md)） |
| **子 Skill（封发 READ）** | 下表各目录 `SKILL.md` | 一般 **不必每次 @**；要强制时用 `@trinity-api-acceptance` 等 |
| **本 README** | 给人查表 | Agent 不依赖本文件 |

子 Skill 均 `disable-model-invocation: true`，避免与总机同时自动加载冲突。

---

## 按场景选 Skill（封发目标）

| 场景 | 子 Skill | 不要混用 |
|------|----------|----------|
| 价目、官方价、原厂价、pricing/suppliers/official | [trinity-official-pricing](./trinity-official-pricing/SKILL.md) | api-acceptance 验收、handbook 叙事 |
| 产品手册、roadmap、周计划、汇报 | [trinity-product-handbook](./trinity-product-handbook/SKILL.md) | api-acceptance、trinity-docs、擅自改 apps 代码 |
| API 验收、生文验收台、Chat API Test | [trinity-api-acceptance](./trinity-api-acceptance/SKILL.md) | handbook 叙事、trinity-docs 对外正文 |
| 对外开发者文档 `trinity-docs` | [trinity-docs](./trinity-docs/SKILL.md) | 产品手册、验收 JSON、业务 Vue 实现 |
| 新建/评审 Skill | [trinity-skill-authoring](./trinity-skill-authoring/SKILL.md) | — |
| Vue Monorepo、五件套、apps 工程 | [trinity-vue-prototype-monorepo](./trinity-vue-prototype-monorepo/SKILL.md) | — |
| 色板、design-spec | [trinity-design-tokens](./trinity-design-tokens/SKILL.md) | — |
| AI 云 / ToB 营销页 | [trinity-tob-marketing-site](./trinity-tob-marketing-site/SKILL.md) | user-console |
| 用户控制台 | [trinity-user-console](./trinity-user-console/SKILL.md) | admin-ruoyi-list |
| 运营后台列表 | [trinity-admin-ruoyi-list](./trinity-admin-ruoyi-list/SKILL.md) | user-console |

歧义时见总机 [`SKILL.md`](./SKILL.md) §歧义消解表。

---

## 目录体量

| 目录 | 档位 | 说明 |
|------|------|------|
| **`SKILL.md`（根）** | L0 | 总机 · 封发 · 歧义消解 |
| `trinity-api-acceptance/` | 大 | 验收台 · 用例 · 报告 · runner |
| `trinity-product-handbook/` | 大 | 手册双规范 + templates + workflows |
| `trinity-vue-prototype-monorepo/` | 大 | 工程方案 + 五件套 |
| `trinity-docs/` | 中 | 对外 API 文档站 |
| `trinity-official-pricing/` | 中 | 模型原厂官方价 · 三方对比 |
| `trinity-user-console/` | 中 | 控制台规范 |
| `trinity-tob-marketing-site/` | 中 | 营销页 |
| `trinity-skill-authoring/` | 大 | 写 Skill 约定 |
| `trinity-design-tokens/` | 小 | token / design-spec |
| `trinity-admin-ruoyi-list/` | 小 | 后台列表 |

各 Skill 边界真源：`<skill>/DOMAIN.md`。

---

## Rules

- `.cursor/rules/trinity-workspace.mdc` — 本仓派活先走总机（兜底）
- `.cursor/rules/trinity-design-spec-first.mdc` — 全局 UI token

手册文档真源：`apps/trinity-product/docs/产品手册文档规范.md` · `产品手册更新规范.md` · 预览 `npm run dev:trinity-product`

产品手册内 Skill 全景（给人）：`apps/trinity-product/docs/cursor-skills-全景图.md` → `/product/cursor-skills-全景图`

验收台预览：`npm run dev -w @trinity/app-trinity-product` → `/product/ai-api-platform/api-test/chat-completions`
