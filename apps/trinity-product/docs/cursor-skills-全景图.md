---
title: Cursor Skills 全景图
---

# Cursor Skills 全景图

> 本页说明 Trinity 单仓内 **AI Agent 协作 Skill 体系** 的目录结构与分工，供产品、研发在派活或 @ Skill 时查表。  
> 仓库真源：`.cursor/skills/` · 人类速查：`.cursor/skills/README.md` · 总机封发：`.cursor/skills/SKILL.md`（`trinity-project`）。

## 混合模式（怎么用）

| 层级 | 文件 | 你怎么用 |
|------|------|----------|
| **L0 总机（自动）** | `.cursor/skills/SKILL.md` | 日常 **直接说任务**；总机识别意图后 **READ** 一个主 Skill 再执行 |
| **L1 子 Skill** | 各目录 `SKILL.md` + `DOMAIN.md` | 封发 READ |
| **L2 能力清单** | 命令密集 Skill 的 `tools.yaml` | 执行 CLI 前 READ |
| **Workflow** | `workflows/*.md` | 按任务 READ |
| **Confirmation** | `common/confirmation.md` + 各 Skill | 改真源 / 推送前 |

子 Skill 均 `disable-model-invocation: true`，避免与总机同时自动加载冲突。

---

## 目录全景

```text
.cursor/skills/
  README.md
    # 给人查表：有哪些 Skill、什么场景用哪个

  SKILL.md
    # L0 总机：识别意图、选择主 Skill、禁止越界

  trinity-product-handbook/
    SKILL.md
      # 产品手册入口：产品页、roadmap、week-progress、侧栏
    DOMAIN.md
      # 定义产品手册边界：不管 API 验收、不管对外 docs
    references/
      # 手册模板和规范真源
    workflows/
      # 更新产品页、更新周进展、加侧栏
    confirmation.md
      # 提交、删除页面、改进度真源等确认规则

  trinity-api-acceptance/
    SKILL.md
      # API 验收入口：模型测试、Chat API Test、生文验收台
    DOMAIN.md
    tools.yaml
      # L2 原子能力：dev、跑测、导出、改用例/模型
    references/
    workflows/
    tools/
      # 预览 URL、导出格式长文（链 tools.yaml）
    confirmation.md

  trinity-official-pricing/
    SKILL.md
      # 模型原厂官方价、三方对比、价目 gate
    DOMAIN.md
    tools.yaml
      # L2：official fetch、validate、compare、gate
    workflows/
    confirmation.md
    references/

  trinity-vue-prototype-monorepo/
    SKILL.md
      # Vue Monorepo 与原型工程入口
    DOMAIN.md
    tools.yaml
      # L2：dev/build/sync、改 views/packages
    workflows/
    confirmation.md

  common/
    confirmation.md
      # 各 Skill 通用确认规则

  docs/
    SKILL-ARCHITECTURE-DESIGN.md
      # 五层架构与 tools.yaml 规范

  trinity-docs/
    SKILL.md
      # 对外开发者文档入口
    DOMAIN.md
    workflows/
    confirmation.md

  trinity-design-tokens/
    SKILL.md
      # 设计 token / 视觉规范入口
    DOMAIN.md
      # 视觉规范边界
    references/
      # token、CSS、design-spec 真源
    workflows/
      # 更新 token、审计页面视觉、应用基础样式
    confirmation.md
      # 全局 token 变更确认

  trinity-user-console/
    SKILL.md
      # 用户控制台入口
    DOMAIN.md
      # 用户侧控制台边界
    references/
      # 控制台 spec、页面结构
    workflows/
      # 新增控制台页面、调整账户流程
    confirmation.md
      # 用户关键流程变更确认

  trinity-admin-ruoyi-list/
    SKILL.md
      # 运营后台列表入口
    DOMAIN.md
      # 后台列表边界
    references/
      # 若依式列表规范
    workflows/
      # 新增列表页、更新表格、维护表单
    confirmation.md
      # 删除、批量操作、权限相关确认

  trinity-tob-marketing-site/
    SKILL.md
      # ToB 营销站入口
    DOMAIN.md
      # 营销内容边界
    references/
      # 营销页模块、卖点表达、视觉规范
    workflows/
      # 更新首页、解决方案页、价格模块
    confirmation.md
      # 对外宣传口径、价格、发布确认

  trinity-skill-authoring/
    SKILL.md
      # Skill 编写入口
    DOMAIN.md
      # Skill 规范边界
    references/
      # Skill 模板、检查清单
    workflows/
      # 新建 Skill、评审 Skill、迁移文档为 Skill
    confirmation.md
      # 修改总机、删除 Skill、合并 Skill 确认
```

---

## 按场景选 Skill

| 场景 | 子 Skill | 不要混用 |
|------|----------|----------|
| 产品手册、roadmap、周计划、汇报 | `trinity-product-handbook` | `trinity-api-acceptance`、`trinity-docs`、擅自改 `apps/*` 业务代码 |
| API 验收、生文验收台、Chat API Test | `trinity-api-acceptance` | 手册叙事、`trinity-docs` 对外正文 |
| 对外开发者文档 `trinity-docs` | `trinity-docs` | 产品手册、验收 JSON、业务 Vue 实现 |
| Vue Monorepo、五件套、`apps` 工程 | `trinity-vue-prototype-monorepo` | — |
| 色板、design-spec、`trinity-base` | `trinity-design-tokens` | — |
| AI 云 / ToB 营销页 | `trinity-tob-marketing-site` | `trinity-user-console` |
| 用户控制台 `account/console` | `trinity-user-console` | `trinity-admin-ruoyi-list` |
| 运营后台若依式列表 | `trinity-admin-ruoyi-list` | `trinity-user-console` |
| 价目、官方价、pricing gate | `trinity-official-pricing` | api-acceptance、handbook |
| 新建 / 评审 `.cursor/skills/` | `trinity-skill-authoring` | — |

歧义时见总机 `.cursor/skills/SKILL.md` **§歧义消解表**（例如「加模型」：验收台 vs 手册能力描述）。

---

## 与本产品手册的关系

| 对象 | 分工 |
|------|------|
| **本产品手册**（`apps/trinity-product/docs`） | 产品地图、阶段进度、子能力、PRD/原型索引；由 `trinity-product-handbook` 维护 |
| **对外开发者文档**（`apps/trinity-docs`） | 客户-facing API 说明；由 `trinity-docs` 维护 |
| **API 验收资料**（`api-test/`、用例 JSON） | 内测验收与报告；由 `trinity-api-acceptance` 维护 |

手册任务默认 **只改** `apps/trinity-product/docs` 与相关 yml/侧栏；改 `apps/trinity-ai` 等工程代码须明确「落地工程」并封发 `trinity-vue-prototype-monorepo` 等。

---

## 相关链接

| 说明 | 路径 |
|------|------|
| 手册文档规范 | [产品手册文档规范](./产品手册文档规范) |
| 手册更新规范 | [产品手册更新规范](./产品手册更新规范) |
| 开发枢纽与协作流程 | `docs/00-协作与工作流/Trinity开发枢纽与AI协作流程.md` |
| Skill 架构设计 | `.cursor/skills/docs/SKILL-ARCHITECTURE-DESIGN.md` |
| tools.yaml 校验 | `npm run skill:lint:tools` |
