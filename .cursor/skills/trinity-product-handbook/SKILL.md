---
name: trinity-product-handbook
description: >-
  生成或维护 Trinity 产品手册（VitePress apps/trinity-product/docs）：站点总览、
  产品总览、子总览、叶子页、roadmap.yml、week-progress.yml。须先读仓库内文档规范
  与更新规范；符号与周会顺序以更新规范为准。触发词：产品手册、trinity-product、
  管理闭环、产品地图、产品总览、子总览、roadmap.yml、week-progress、手册规范。
  勿与 trinity-docs 对外 API 文档、trinity-vue-prototype-monorepo 工程脚手架混用。
disable-model-invocation: true
---

# Trinity 产品手册 · Agent Skill

## 真源（MUST READ，禁止凭记忆写）

| 任务 | 必读 |
|------|------|
| 结构、四页样板、新建/改版 | `apps/trinity-product/docs/产品手册文档规范.md`（§〇 冻结样板一览） |
| 符号、锁节点、`roadmap.yml` / `week-progress.yml`、周会顺序 | `apps/trinity-product/docs/产品手册更新规范.md` |
| 站点首页现状 | `apps/trinity-product/docs/index.md` |
| 产品总览样板 | `apps/trinity-product/docs/ai-api-platform/index.md` |
| 标准叶子样板 | `apps/trinity-product/docs/ai-api-platform/user/models/list.md` + `user/models/roadmap.yml` |
| 侧栏 | `apps/trinity-product/.vitepress/config.ts` |

细则以两份规范为准；本 skill 只给 **分流 + 模板路径 + 硬规则摘要**。

本地预览：`npm run dev:trinity-product` → http://127.0.0.1:5206/product/

---

## 触发词

`产品手册` · `trinity-product` · `手册规范` · `管理闭环` · `产品地图` · `产品总览` · `子总览` · `子能力` · `roadmap.yml` · `week-progress` · `ProductRoadmap` · `ProductWeekProgress`

---

## 与其它 Skill 边界

| 场景 | 用 |
|------|-----|
| 写/改 `apps/trinity-product/docs/**` | **本 skill** |
| 对外 API 文档 `trinity-docs` | 不是产品手册 |
| Vue 工程、Monorepo、高保真实现 | `trinity-vue-prototype-monorepo` |
| 用户控制台 UI 规则 | `trinity-user-console` |
| 运营后台列表 | `trinity-admin-ruoyi-list` |

---

## 分流（先判断再写）

| 用户意图 | 页面类型 | 模板 |
|----------|----------|------|
| 改手册首页 / 介绍手册能力 | 站点总览 | `./references/template-site-index.md` |
| 改某业务线全景、周计划看板 | 产品总览 | `./references/template-product-overview.md` |
| 改用户侧/平台侧/运营侧模块表 | 子总览 | `./references/template-sub-overview.md` |
| 新建/改单个模块说明与子能力 | 标准叶子页 | 先 READ `docs/ai-api-platform/user/models/list.md` + `./references/template-leaf.md` |
| 长需求 / PRD 正文 | — | 写 `docs/05-产品与PRD/`；叶子附录链出，**不**新建手册页型 |
| 只改进度符号 / 周会 / 锁节点 | — | 只 READ **更新规范**，改 `roadmap.yml` 或 `week-progress.yml` |
| 只改侧栏导航 | — | `.vitepress/config.ts` + 父级子总览表加一行 |

禁止未 READ 对应模板与规范就生成整页。

---

## 硬规则摘要

1. **命名**：对外写 **AI API 聚合产品**（不写「聚合平台」）；标题 `AI API 聚合产品 · 总览`。
2. **站点总览**：仅前言 + 阅读 tip + `>` 管理闭环 + 能力矩阵 + 业务线；**不要**本阶段简表、子模块全文、规范重复表。
3. **体验/在线四行**：只在 **产品总览**；子总览/叶子只链上去。
4. **周计划**：全站仅 `week-progress.yml`，挂在聚合 **产品总览**；`focus` 从 **标准叶子页** 多选（`weekProgressFocusLeaves.ts`），看板可点叶子；细则写在 `plan` / `acceptance`（更新规范 §四）。
5. **子能力 vs 周会**：`roadmap.yml` = 子清单累积；**不**每周改子能力每一行；周会只动 `week-progress.yml`。
6. **PRD / 原型**：附录链 `docs/05-产品与PRD/…`，不贴全文（能力矩阵称 **PRD / 原型索引** ≈ 闭环 · 实施）。
7. **新建模块**：走文档规范 §五检查清单 + 侧栏 + 子总览一行。
8. **标准叶子页（唯一叶型）**：五件套 = 说明 · 工程 · 体验/online · **`{slug}.roadmap.yml` + `<ProductRoadmap rel="…" />`**（与 `models/list` 同，localhost 可编辑；禁止 Markdown 子能力表）· 附录；禁止需求型叶、tip、手册 checklist。

---

## 组件（仅 trinity-product 站）

```markdown
<ProductRoadmap />
<ProductRoadmap rel="ai-cloud/roadmap.yml" prefix="营销首页" />
<ProductWeekProgress rel="ai-api-platform/week-progress.yml" />
```

- `roadmap.yml`：与叶子同目录，或 `rel` 共用
- localhost 可编辑表格/YAML；静态 build 只读

---

## 维护顺序（周会）

见更新规范 §七：`roadmap.yml`（有交付）→ `week-progress.yml` → 子总览表对齐。

---

## References

| 文件 | 用途 |
|------|------|
| `template-site-index.md` | 站点总览骨架 |
| `template-product-overview.md` | 产品总览骨架（多分层业务线） |
| `template-sub-overview.md` | 子总览骨架 |
| `template-leaf.md` | 标准叶子四段（真源 `user/models/list.md` + `roadmap.yml`） |
改模板前先对齐 `index.md` 与 `ai-api-platform/index.md` 真源，避免模板与站点漂移。
